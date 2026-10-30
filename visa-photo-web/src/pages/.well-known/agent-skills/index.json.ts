import type { APIRoute } from "astro";
import { createHash } from "node:crypto";
import { SITE, absolute } from "../../../lib/site";
import { skillFile } from "../../../data/skillFile";

/**
 * Agent Skills Discovery index (https://github.com/cloudflare/agent-skills-discovery-rfc), in the
 * same shape rustman.org publishes: one entry per real skill, with a digest over the exact text
 * served, so it changes exactly when the skill does.
 */
export const GET: APIRoute = () => {
  const body = {
    $schema: "https://agentskills.io/schemas/discovery/v0.2.0.json",
    version: "0.2.0",
    publisher: { name: SITE.name, url: absolute("/") },
    skills: [
      {
        name: "visa-photo",
        type: "skill",
        description:
          "Photo specifications for visa, passport and residence-permit applications: size in mm and " +
          "pixels, background, head height, eye line, file limits, and where to ask about the rest.",
        url: absolute("/skills/visa-photo.md"),
        sha256: createHash("sha256").update(skillFile()).digest("hex"),
        source: `${SITE.repo}/blob/master/visa-photo-web/src/data/skillFile.ts`,
      },
    ],
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" },
  });
};
