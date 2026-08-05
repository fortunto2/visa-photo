import type { APIRoute } from "astro";
import { absolute } from "../../lib/site";

/**
 * RFC 9727 API catalog: a linkset naming what a machine can fetch here.
 *
 * Published because it is true — /specs.json is a real, stable, documented endpoint. The
 * neighbouring well-known files an audit also asks for (MCP server card, A2A agent card,
 * OAuth resource) are deliberately absent: this site runs no MCP server, no agent and no
 * auth, and advertising capabilities that do not exist is the failure mode the audit is
 * meant to catch, not a box to tick.
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
        ],
        "service-doc": [
          {
            href: absolute("/llms.txt"),
            type: "text/plain",
            title: "Plain-text site map with the full specification table",
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
