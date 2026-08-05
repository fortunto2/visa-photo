import type { APIRoute } from "astro";
import { skillFile } from "../../data/skillFile";

/** The skill as a plain file, so an agent can fetch it without a browser. */
export const GET: APIRoute = () =>
  new Response(skillFile(), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
