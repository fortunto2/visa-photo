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

export const onRequest: PagesFunction = async ({ request, next }) => {
  if (request.method !== "GET" && request.method !== "HEAD") return next();

  const accept = request.headers.get("accept") ?? "";
  const wantsMarkdown =
    quality(accept, "text/markdown") > 0 &&
    quality(accept, "text/markdown") >= quality(accept, "text/html");
  if (!wantsMarkdown) return next();

  const url = new URL(request.url);
  const twin = markdownPath(url.pathname);
  if (!twin) return withVary(await next());

  url.pathname = twin;
  const markdown = await next(new Request(url.toString(), request));
  // No twin for this path — index pages, the app, anything not a document. Falling back to HTML
  // is the honest answer: a 404 would claim the page does not exist, which is not what happened.
  if (markdown.status !== 200) return withVary(await next());
  return withVary(markdown);
};
