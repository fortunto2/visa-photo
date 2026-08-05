/**
 * Content negotiation: serve the markdown twin when the client asks for markdown.
 *
 * Every document page is built twice — `/en/schengen/visa/` for people and
 * `/en/schengen/visa.md` for machines, from one `docView` so they cannot drift. The `.md` file
 * is addressable on its own; this only means an agent that asks for `text/markdown` at the
 * ordinary URL gets it without having to know the convention.
 *
 * The site is otherwise static, and this is the only Function. It must stay cheap: one header
 * parse per request, and a second fetch only for requests that actually asked for markdown.
 */

/**
 * The q-value this Accept header gives a media type, or -1 if it does not name it.
 *
 * Exact matches only — `*​/*` deliberately does not count. Browsers send
 * `text/html,...,*​/*;q=0.8`, and treating that wildcard as consent would hand markdown to
 * every visitor whose browser was merely being polite.
 */
function quality(accept: string, type: string): number {
  let best = -1;
  for (const part of accept.split(",")) {
    const [raw, ...params] = part.split(";");
    if (raw.trim().toLowerCase() !== type) continue;
    let q = 1;
    for (const p of params) {
      const token = p.trim().toLowerCase();
      if (token.startsWith("q=")) {
        const parsed = Number.parseFloat(token.slice(2));
        q = Number.isFinite(parsed) ? parsed : 0;
      }
    }
    if (q > best) best = q;
  }
  return best;
}

/** `/en/schengen/visa/` and `/en/schengen/visa` both twin to `/en/schengen/visa.md`. */
function markdownPath(pathname: string): string | null {
  if (pathname.includes(".")) return null;
  const trimmed = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  if (!trimmed) return null;
  return `${trimmed}.md`;
}

/**
 * Any response whose body depends on Accept must say so, or a shared cache will hand one
 * visitor's representation to the next. This applies to the HTML too — that is the response
 * being varied away from.
 */
function withVary(response: Response): Response {
  const out = new Response(response.body, response);
  out.headers.set("vary", "Accept");
  return out;
}

/**
 * Declared here rather than pulled from `@cloudflare/workers-types`: this is the only Function
 * in the project, and it uses two fields. A dependency for two fields is a dependency to keep
 * updated forever.
 */
type PagesContext = {
  request: Request;
  next: (input?: Request) => Promise<Response>;
};

export const onRequest = async ({ request, next }: PagesContext): Promise<Response> => {
  if (request.method !== "GET" && request.method !== "HEAD") return next();

  const url = new URL(request.url);

  // A direct hit on the twin. Same facts as the page, at a second address — exactly the shape of
  // a duplicate, so keep it out of the index and let the page it mirrors do the ranking. The
  // header is the only way to say this: a `.md` file has nowhere to put a robots meta tag.
  //
  // Deliberately NOT applied to the negotiated response further down. That one is served at the
  // page's own canonical URL, and marking it noindex would deindex the page for anyone whose
  // crawler happened to ask for markdown.
  if (url.pathname.endsWith(".md")) {
    const direct = await next();
    const marked = new Response(direct.body, direct);
    marked.headers.set("x-robots-tag", "noindex");
    return marked;
  }

  const twin = markdownPath(url.pathname);
  // Assets — wasm, js, css, images — can never have a twin, so they pass through untouched and
  // keep one cache entry each. Marking them `Vary: Accept` would split the 24 MB model file into
  // a separate cached copy per distinct Accept string.
  if (!twin) return next();

  const accept = request.headers.get("accept") ?? "";
  const markdownQ = quality(accept, "text/markdown");
  const wantsMarkdown = markdownQ > 0 && markdownQ >= quality(accept, "text/html");

  if (wantsMarkdown) {
    const twinUrl = new URL(url);
    twinUrl.pathname = twin;
    const markdown = await next(new Request(twinUrl.toString(), request));
    if (markdown.status === 200) return withVary(markdown);
    // No twin for this path — index pages, the app, anything that is not a document. Falling
    // back to HTML is the honest answer: a 404 would claim the page does not exist, which is
    // not what happened.
  }

  // `Vary` goes on the HTML too, and this is the half that is easy to forget. Without it a
  // shared cache stores this response under the bare URL and then hands it to the next client
  // that asked for markdown — which is every agent, and the whole point of the file.
  return withVary(await next());
};
