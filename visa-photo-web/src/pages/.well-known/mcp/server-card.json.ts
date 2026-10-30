import type { APIRoute } from "astro";
import { SITE, absolute } from "../../../lib/site";

/** MCP server card for functions/mcp.ts, in the same shape rustman.org publishes. */
export const GET: APIRoute = () => {
  const card = {
    $schema: "https://modelcontextprotocol.io/schemas/2025-11-25/server-card.json",
    serverInfo: {
      name: "visayes.app",
      title: "visayes — visa and passport photo specifications",
      version: "1.0.0",
      description:
        "Photo specifications for visa, passport and residence-permit applications, each with its official " +
        "source and check date, and a link that opens the site's visa-help chat with a question typed in.",
      websiteUrl: absolute("/"),
    },
    remotes: [{ type: "streamable-http", url: absolute("/mcp") }],
    capabilities: { tools: { listChanged: false } },
    tools: [
      { name: "get_photo_spec", description: "One document's photo specification, with source and date." },
      { name: "search", description: "Which documents match a few words." },
      { name: "read", description: "Any page as markdown." },
      { name: "ask_link", description: "A link to the visa-help chat with the question typed in; sends nothing." },
    ],
    authentication: { type: "none" },
    repository: SITE.repo,
  };
  return new Response(JSON.stringify(card, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" },
  });
};
