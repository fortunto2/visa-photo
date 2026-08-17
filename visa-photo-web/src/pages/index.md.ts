import type { APIRoute } from "astro";
import { render } from "./[lang]/index.md";
import { DEFAULT_LANG } from "../data/locales";

/**
 * The root twin. The default language's hub lives at `/` rather than `/en/`, so its markdown
 * has to live at `/index.md` too — and this is the address every agent and every scanner tries
 * first. Without it the whole negotiation reads as unimplemented from the outside.
 */
export const GET: APIRoute = () =>
  new Response(render(DEFAULT_LANG), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
