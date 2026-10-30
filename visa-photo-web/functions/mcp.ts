/**
 * A remote MCP server for visayes.app, at POST /mcp. Same shape as rustman.org's (functions/mcp.ts
 * there): stateless Streamable HTTP answering application/json, no auth, no session.
 *
 * Four tools, each backed by something the site already publishes, not invented for a checklist:
 *   get_photo_spec — one document's specification, from /specs.json
 *   search         — which documents match a few words (country, document, kind)
 *   read           — any page's Markdown twin, the same file Accept: text/markdown returns
 *   ask_link       — a link that opens the visa-help chat on a document page with the person's
 *                    question typed in. It sends nothing: the person reads it and presses send,
 *                    because a request carries their contact and their consent.
 *
 * Specifications change; every answer names its official source and the date it was checked.
 */

const SUPPORTED_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26"];
const LATEST = SUPPORTED_VERSIONS[0];
const SERVER = { name: "visayes.app", title: "visayes — visa and passport photo specifications", version: "1.0.0" };
const LANGS = ["en", "ru", "es", "fr", "pt", "tr", "ar", "hi", "zh"];

/** What people type for a country, mapped to the catalogue's slug. */
const ALIASES: Record<string, string> = {
  usa: "united-states", us: "united-states", america: "united-states", "united states": "united-states",
  uk: "united-kingdom", britain: "united-kingdom", "great britain": "united-kingdom", england: "united-kingdom",
  uae: "united-arab-emirates", emirates: "united-arab-emirates", dubai: "united-arab-emirates",
  korea: "south-korea", "south korea": "south-korea", ksa: "saudi-arabia", saudi: "saudi-arabia",
  "new zealand": "new-zealand", nz: "new-zealand", eu: "schengen", europe: "schengen",
  "green card": "united-states", dv: "united-states",
};

type Doc = {
  id: string;
  country: string;
  document: string;
  kind: string;
  url: string;
  print_mm?: { width: number; height: number } | null;
  digital_px: { width: number; height: number };
  dpi?: number | null;
  background: string;
  face: { head_height_percent: number; top_margin_percent: number; eye_line_from_bottom_percent: number };
  file: { format: string; max_size_kb: number };
  photos_per_sheet: number;
  notes?: string;
  official_source: { label: string; url: string };
  spec_checked: string;
};

type JsonRpc = { jsonrpc: string; id?: unknown; method?: string; params?: Record<string, unknown> };
/** The one binding used; spelled out because astro check has no Workers types here (see _middleware.ts). */
type Env = { ASSETS: { fetch: (request: Request) => Promise<Response> } };

const TOOLS = [
  {
    name: "get_photo_spec",
    title: "Photo specification for a document",
    description:
      "The published photo specification for one country's visa, passport or residence permit: print " +
      "size, pixels, DPI, background, head height and eye line, file format and size limit, with the " +
      "official source and the date it was checked. Omit `document` to list what exists for a country.",
    inputSchema: {
      type: "object",
      properties: {
        country: { type: "string", description: "Country or zone, e.g. schengen, canada, united-states, uk, uae." },
        document: { type: "string", description: "Optional: visa, passport, dv-lottery, residence-permit, evisa…" },
      },
      required: ["country"],
    },
  },
  {
    name: "search",
    title: "Find documents",
    description: "Which of the site's documents match a few words, e.g. \"green card lottery\" or \"japan passport\".",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", description: "Words to match against country, document and notes." } },
      required: ["query"],
    },
  },
  {
    name: "read",
    title: "Read a page as markdown",
    description:
      "Fetch a visayes.app page as markdown rather than HTML: a URL from another tool or a path such as " +
      "/en/canada/visa/. The home page returns llms.txt.",
    inputSchema: {
      type: "object",
      properties: { url: { type: "string", description: "A visayes.app page URL or path." } },
      required: ["url"],
    },
  },
  {
    name: "ask_link",
    title: "Link to ask about a visa case",
    description:
      "A link that opens the visa-help chat on a document's page with the person's question already typed. " +
      "Give it to the person; it sends nothing. An AI assistant answers there, and if they leave an e-mail, " +
      "phone or Telegram, a visa consultant follows up (consultants are paid). Use it when someone needs " +
      "help beyond the photo: the application, an appointment, a refusal.",
    inputSchema: {
      type: "object",
      properties: {
        question: { type: "string", description: "The person's question in their own words." },
        country: { type: "string", description: "Destination country or zone." },
        document: { type: "string", description: "Optional: visa, dv-lottery, passport… Defaults to the country's visa." },
        lang: { type: "string", enum: LANGS, description: "Page language, default en." },
      },
      required: ["question", "country"],
    },
  },
];

const json = (body: unknown, status = 200, version = LATEST): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "MCP-Protocol-Version": version,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type, mcp-protocol-version, mcp-session-id",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });

const rpcError = (id: unknown, code: number, message: string, version = LATEST): Response =>
  json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, 200, version);

const toolText = (id: unknown, text: string, version: string, isError = false): Response =>
  json({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text }], isError } }, 200, version);

async function loadDocs(env: Env, origin: string): Promise<Doc[]> {
  const response = await env.ASSETS.fetch(new Request(`${origin}/specs.json`));
  if (!response.ok) return [];
  return ((await response.json()) as { documents?: Doc[] }).documents ?? [];
}

const slug = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
const countryOf = (input: string) => {
  const s = slug(input);
  return ALIASES[s] ?? s.replace(/ /g, "-");
};

function describe(d: Doc): string {
  const print = d.print_mm ? `${d.print_mm.width} × ${d.print_mm.height} mm` : "no print size published";
  return [
    `## ${d.country} — ${d.document} (${d.kind})`,
    `- Print: ${print}${d.dpi ? ` at ${d.dpi} dpi` : ""}`,
    `- Digital: ${d.digital_px.width} × ${d.digital_px.height} px`,
    `- Background: ${d.background}`,
    `- Head height: ${d.face.head_height_percent}% of the photo; top margin ${d.face.top_margin_percent}%; eye line ${d.face.eye_line_from_bottom_percent}% from the bottom`,
    `- File: ${d.file.format.toUpperCase()}, max ${d.file.max_size_kb} KB; ${d.photos_per_sheet} per A4 sheet`,
    d.notes ? `- Notes: ${d.notes}` : "",
    `- Source: ${d.official_source.label} (${d.official_source.url}), checked ${d.spec_checked}`,
    `- Make or check a photo, free, in the browser: ${d.url} · ${d.url}check/`,
  ].filter(Boolean).join("\n");
}

export const onRequest = async ({ request, env }: { request: Request; env: Env }): Promise<Response> => {
  if (request.method === "OPTIONS") return json({}, 204);
  if (request.method !== "POST") {
    return json({ error: "This MCP endpoint is POST-only; it is stateless and opens no stream." }, 405);
  }

  const asked = request.headers.get("mcp-protocol-version");
  const version = asked === null ? "2025-03-26" : asked;
  if (!SUPPORTED_VERSIONS.includes(version)) return json({ error: `Unsupported MCP-Protocol-Version: ${version}` }, 400);

  let message: JsonRpc;
  try {
    message = (await request.json()) as JsonRpc;
  } catch {
    return rpcError(null, -32700, "Parse error", version);
  }
  const { id, method, params } = message;
  if (id === undefined) return new Response(null, { status: 202 });
  const origin = new URL(request.url).origin;

  switch (method) {
    case "initialize":
      return json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: SUPPORTED_VERSIONS.includes(String(params?.protocolVersion)) ? String(params?.protocolVersion) : LATEST,
          capabilities: { tools: { listChanged: false } },
          serverInfo: SERVER,
          instructions:
            "Photo specifications for visa, passport and residence-permit applications in 22 countries, each " +
            "with its official source and check date. Independent site, not a government body; nobody can " +
            "promise a visa. For questions beyond the photo, give the person an ask_link.",
        },
      }, 200, version);

    case "ping":
      return json({ jsonrpc: "2.0", id, result: {} }, 200, version);

    case "tools/list":
      return json({ jsonrpc: "2.0", id, result: { tools: TOOLS } }, 200, version);

    case "tools/call": {
      const name = String(params?.name ?? "");
      const args = (params?.arguments ?? {}) as Record<string, unknown>;

      if (name === "get_photo_spec" || name === "ask_link") {
        const docs = await loadDocs(env, origin);
        const country = countryOf(String(args.country ?? ""));
        const ofCountry = docs.filter((d) => d.country === country);
        if (!ofCountry.length) {
          const all = [...new Set(docs.map((d) => d.country))].join(", ");
          return toolText(id, `No documents for "${String(args.country ?? "")}". Countries covered: ${all}.`, version, true);
        }
        const wanted = args.document ? slug(String(args.document)).replace(/ /g, "-") : null;

        if (name === "get_photo_spec") {
          if (!wanted) {
            return toolText(id, `${country} has: ${ofCountry.map((d) => d.document).join(", ")}.\n\n${ofCountry.map(describe).join("\n\n")}`, version);
          }
          const doc = ofCountry.find((d) => d.document === wanted);
          if (!doc) return toolText(id, `${country} has no "${wanted}". It has: ${ofCountry.map((d) => d.document).join(", ")}.`, version, true);
          return toolText(id, describe(doc), version);
        }

        // ask_link: the document page, chat open, question typed in. Sends nothing.
        const question = String(args.question ?? "").trim().slice(0, 600);
        if (!question) return toolText(id, "Give me the person's question.", version, true);
        const doc = ofCountry.find((d) => d.document === (wanted ?? "visa")) ?? ofCountry[0];
        const lang = LANGS.includes(String(args.lang)) ? String(args.lang) : "en";
        const page = doc.url.replace("/en/", `/${lang}/`);
        const q = new URLSearchParams({ ask: question, utm_medium: "agent", utm_campaign: "ask-mcp" });
        return toolText(
          id,
          `${page}?${q}#consult\n\nOpen this link to ask. It opens the chat on the ${doc.country} ${doc.document} ` +
            "page with the question typed in; nothing is sent until you press send. An AI assistant answers, and " +
            "if you leave an e-mail, phone or Telegram, a visa consultant follows up. Consultants are paid; no one " +
            "can guarantee a visa.",
          version,
        );
      }

      if (name === "search") {
        const terms = slug(String(args.query ?? "")).split(" ").filter(Boolean);
        if (!terms.length) return toolText(id, "Give me something to search for.", version, true);
        const docs = await loadDocs(env, origin);
        const expanded = terms.flatMap((t) => [t, ALIASES[t] ?? t]);
        const hits = docs
          .map((d) => {
            const hay = `${d.country} ${d.document} ${d.kind} ${d.notes ?? ""}`.toLowerCase();
            return { d, score: expanded.filter((t) => hay.includes(t)).length + (expanded.includes(d.country) ? 3 : 0) };
          })
          .filter((h) => h.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 8);
        if (!hits.length) return toolText(id, `Nothing matched "${String(args.query)}". The site covers ${docs.length} documents.`, version);
        return toolText(
          id,
          hits.map(({ d }) => `- ${d.country} / ${d.document} (${d.kind}): ${d.url} · checked ${d.spec_checked}`).join("\n") +
            "\n\nUse get_photo_spec with a country and document for the full specification.",
          version,
        );
      }

      if (name === "read") {
        const raw = String(args.url ?? "").trim();
        if (!raw) return toolText(id, "Give me a URL or a path to read.", version, true);
        let path: string;
        try {
          const url = raw.startsWith("http") ? new URL(raw) : null;
          if (url && url.hostname !== new URL(origin).hostname && url.hostname !== "visayes.app") {
            return toolText(id, `I only read visayes.app pages, not ${url.hostname}.`, version, true);
          }
          path = url ? url.pathname : raw.startsWith("/") ? raw : `/${raw}`;
        } catch {
          return toolText(id, `Not a URL I can read: ${raw}`, version, true);
        }
        const trimmed = path.replace(/\/+$/, "");
        const target = trimmed === "" ? "/llms.txt" : path.endsWith(".md") ? path : `${trimmed}.md`;
        const response = await env.ASSETS.fetch(new Request(`${origin}${target}`));
        // The asset server answers unknown paths with an HTML page; that is not a twin.
        if (!response.ok || (response.headers.get("content-type") ?? "").includes("text/html")) {
          return toolText(id, `No markdown version of ${path}. Document pages have one; everything is at ${origin}/llms-full.txt.`, version, true);
        }
        return toolText(id, await response.text(), version);
      }

      return rpcError(id, -32602, `Unknown tool: ${name}`, version);
    }

    default:
      return rpcError(id, -32601, `Method not found: ${String(method)}`, version);
  }
};
