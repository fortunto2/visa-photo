import type { APIRoute } from "astro";
import { absolute } from "../../lib/site";

/**
 * RFC 9727 API catalog: a linkset naming what a machine can fetch here.
 *
 * Published because it is true — /specs.json is a real, stable, documented endpoint, and
 * /mcp answers. The OAuth resource is deliberately absent: there is no auth, and advertising
 * a protection that does not exist is the failure mode the audit is meant to catch.
 */
export const GET: APIRoute = () => {
  const body = {
    linkset: [
      {
        anchor: absolute("/"),
        "service-desc": [
          {
            href: absolute("/specs.json"),
            type: "application/json",
            title: "Photo specifications for every supported document",
          },
          {
            href: absolute("/.well-known/agent-skills/index.json"),
            type: "application/json",
            title: "Agent skills",
          },
          {
            href: absolute("/.well-known/mcp/server-card.json"),
            type: "application/json",
            title: "MCP server (POST /mcp, no auth)",
          },
          {
            href: absolute("/.well-known/agent-card.json"),
            type: "application/json",
            title: "Agent card",
          },
          {
            href: absolute("/.well-known/ard.json"),
            type: "application/json",
            title: "Agentic resource catalogue",
          },
        ],
        "service-doc": [
          {
            href: absolute("/llms.txt"),
            type: "text/plain",
            title: "Plain-text site map with the full specification table",
          },
          {
            href: absolute("/agents.txt"),
            type: "text/plain",
            title: "What an agent may do here",
          },
        ],
      },
    ],
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "content-type": "application/linkset+json",
      "cache-control": "public, max-age=3600",
    },
  });
};
