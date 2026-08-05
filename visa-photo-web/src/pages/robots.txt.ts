import type { APIRoute } from "astro";
import { absolute } from "../lib/site";

/**
 * Naming AI crawlers is a decision either way. Staying silent means the crawler's author
 * decides for us, so every notable one is listed explicitly.
 *
 * Content-Signal says what may be done with the text: index it and cite it, but do not
 * train on it. https://contentsignals.org/
 */
export const GET: APIRoute = () => {
  const allowed = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-User",
    "Claude-SearchBot",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Applebot-Extended",
    "Bingbot",
  ];

  const body = [
    "# Photo specifications for visa and passport applications.",
    "# Facts about document sizes are meant to be quoted — that is the point of the site.",
    "#   search=yes    index and link",
    "#   ai-input=yes  quote when answering a question, with a link to the source",
    "#   ai-train=no   do not add to a training corpus",
    "User-agent: *",
    "Content-Signal: search=yes, ai-input=yes, ai-train=no",
    "Allow: /",
    "",
    "# Named explicitly, because silence here is a decision made by someone else.",
    ...allowed.flatMap((agent) => [`User-agent: ${agent}`, "Allow: /", ""]),
    "# Entry points for agents:",
    "#   /llms.txt     site map with the full specification table",
    "#   /llms-full.txt every document in full, including its FAQ",
    "#   /specs.json   every document as JSON, one fetch",
    "#   Accept: text/markdown on any page returns Markdown instead of HTML",
    "",
    `Sitemap: ${absolute("/sitemap.xml")}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
};
