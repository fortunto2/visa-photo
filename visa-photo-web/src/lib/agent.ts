/**
 * What the kit generates for visayes.app: agents.txt, the A2A-shaped card and the ARD manifest
 * (superduper-site-kit/agent). The MCP server itself (functions/mcp.ts), its card and the API
 * catalogue are this site's own and stay hand-written beside them.
 *
 * What is published: four read-only tools over the open photo specifications. What is not: lead
 * submission, the visa-help chat, uploads, accounts, OAuth. People submit requests on the site
 * themselves; `ask_link` only builds a URL and sends nothing, and no personal data passes through
 * MCP in either direction.
 */
import { a2aSkill, agentCard as kitCard, agentPolicyText as kitPolicy, ardCoreEntries, ardManifest as kitArd } from "superduper-site-kit/agent";
import { COMPANY } from "superduper-site-kit/company";
import { SITE, absolute } from "./site";

export const DOMAIN = new URL(SITE.origin).hostname;

export const URLS = {
  llms: absolute("/llms.txt"),
  llmsFull: absolute("/llms-full.txt"),
  sitemap: absolute("/sitemap.xml"),
  specs: absolute("/specs.json"),
  mcp: absolute("/mcp"),
  mcpCard: absolute("/.well-known/mcp/server-card.json"),
  agentCard: absolute("/.well-known/agent-card.json"),
  apiCatalog: absolute("/.well-known/api-catalog"),
  ard: absolute("/.well-known/ard.json"),
  skills: absolute("/.well-known/agent-skills/index.json"),
} as const;

export const MCP_TOOLS = [
  {
    id: "get_photo_spec",
    name: "Photo specification for a document",
    description:
      "The published photo specification for one country's visa, passport or residence permit: print size, pixels, DPI, background, head height " +
      "and eye line, file format and size limit, with the official source and the date it was checked. Read-only.",
    tags: ["visa", "passport", "photo", "specification"],
    examples: ["US visa photo size", "Schengen visa photo background"],
    out: "application/json",
  },
  {
    id: "search",
    name: "Find documents",
    description: "Which documents have a photo specification here, matched on a few words (country, document, kind). Read-only.",
    tags: ["search", "visa", "passport"],
    examples: ["uk passport", "india e-visa"],
    out: "text/markdown",
  },
  {
    id: "read",
    name: "Read a page as markdown",
    description: "Any page of the site as markdown, the same text Accept: text/markdown returns. Read-only.",
    tags: ["read", "markdown"],
    examples: ["/en/schengen/visa/"],
    out: "text/markdown",
  },
  {
    id: "ask_link",
    name: "Link to the visa-help chat",
    description:
      "Builds a link that opens the visa-help chat on a document page with a question typed in. It sends nothing and stores nothing: the person " +
      "reads it and decides whether to send, because a request carries their contact.",
    tags: ["link", "help"],
    examples: ["can I wear glasses in a Canada visa photo"],
    out: "text/plain",
  },
] as const;

export function agentPolicyText(): string {
  return kitPolicy({
    domain: DOMAIN,
    about: [
      "visayes: photo specifications for visa, passport and residence-permit applications, each with its",
      "official source and check date, and a tool that crops a photo to the spec in the visitor's browser.",
      "Nothing here needs an account. robots.txt carries the same policy as a Content-Signal;",
      "this file says it in words.",
    ],
    may: [
      "read, index and link to every page                      (search=yes)",
      "quote it when answering someone, with a link to the page (ai-input=yes)",
      `call the MCP server at ${URLS.mcp}, no key needed (tools: get_photo_spec, search, read,\nask_link); read-only`,
      `fetch every specification as JSON from ${URLS.specs}`,
    ],
    mustNot: ["fold the content into a training corpus                  (ai-train=no)"],
    notOffered: [
      `accounts, sign-in or OAuth: nothing on ${DOMAIN} is protected`,
      "submitting a request or lead through MCP or any agent interface: people do that on the site themselves",
      "photo uploads: the cropping tool runs in the visitor's browser and nothing is uploaded",
      "payments through this site, or write access of any kind",
    ],
    start: [
      ["Site map for models", URLS.llms],
      ["Every document, one file", URLS.llmsFull],
      ["Sitemap", URLS.sitemap],
      ["Specifications (JSON)", URLS.specs],
      ["MCP server", URLS.mcp],
      ["MCP server card", URLS.mcpCard],
      ["Agent card", URLS.agentCard],
      ["Resource catalogue", URLS.ard],
      ["API catalogue", URLS.apiCatalog],
      ["Markdown", "send \"Accept: text/markdown\" to any document page, or append .md"],
    ],
    contact: COMPANY.email,
  });
}

export function agentCard() {
  return kitCard({
    domain: DOMAIN,
    description:
      "visayes: photo specifications for visa, passport and residence-permit applications with official sources, and a browser tool that crops to the spec. " +
      "Read-only: look up a specification, search documents, read pages. It takes no requests, leads or personal data. Not a conversational agent and no A2A task endpoint: " +
      `the callable interface is an MCP server (streamable HTTP, stateless, no authentication), described at ${URLS.mcpCard}.`,
    mcpUrl: URLS.mcp,
    provider: { organization: COMPANY.us.name, url: SITE.origin },
    iconUrl: absolute("/icon-512.png"),
    documentationUrl: URLS.llms,
    skills: MCP_TOOLS.map((t) => a2aSkill({ id: t.id, name: t.name, description: t.description, tags: [...t.tags], examples: [...t.examples], out: t.out })),
  });
}

export function ardManifest() {
  return kitArd(DOMAIN, [
    ...ardCoreEntries({
      domain: DOMAIN, mcpCardUrl: URLS.mcpCard, agentCardUrl: URLS.agentCard,
      mcpDescription: "Look up the official photo specification for a visa, passport or residence permit, search documents and read pages. Streamable HTTP, no authentication, read-only.",
      mcpQueries: ["US visa photo size in pixels", "Schengen visa photo requirements", "UK passport photo background colour"],
      capabilities: ["search", "read"], tags: ["mcp", "visa", "read-only"],
      cardDescription: "What an agent can get here and through which interface (MCP; there is no A2A task endpoint).",
      cardQueries: ["what can an agent do on visayes.app"],
    }),
  ]);
}
