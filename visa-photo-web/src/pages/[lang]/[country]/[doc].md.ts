import type { APIRoute } from "astro";
import { CATALOG, type CatalogEntry } from "../../../data/catalog";
import { docView } from "../../../data/docView";
import { absolute, path } from "../../../lib/site";
import { LANGS, dict, type ActiveLang } from "../../../data/locales";

/**
 * The markdown twin of every document page, at the same path plus `.md`.
 *
 * An agent asking "what size is a Schengen visa photo" wants six numbers, and today it pays for
 * them by parsing a page built for a person — tool, tabs, checker and all. This is the same
 * facts, from the same `docView`, with nothing to strip.
 *
 * Two audiences, one derivation: the page and this file both render `docView(entry, t)`, so a
 * corrected specification cannot reach one and miss the other. `/llms-full.txt` is the whole
 * catalogue in one response; this is one document, addressable, and what content negotiation in
 * `functions/_middleware.ts` serves when a client asks for `text/markdown`.
 */
export function getStaticPaths() {
  return LANGS.flatMap((lang) =>
    CATALOG.map((entry) => ({
      params: { lang, country: entry.country, doc: entry.doc },
      props: { entry },
    })),
  );
}

export const GET: APIRoute = ({ params, props }) => {
  const lang = (params as { lang: ActiveLang }).lang;
  const { entry } = props as { entry: CatalogEntry };
  const t = dict(lang);
  const v = docView(entry, t);
  const here = absolute(path(lang, entry.country, entry.doc));

  const out: string[] = [];
  out.push(`# ${v.title}`);
  out.push("");
  out.push(v.answer);
  out.push("");
  out.push("| | |");
  out.push("|---|---|");
  out.push(`| Print size | ${v.headlineSize} (${v.altUnits}) |`);
  out.push(`| Digital size | ${v.conv.px} px at ${v.dpi} dpi |`);
  out.push(`| Background | ${v.background} |`);
  out.push(`| File | ${v.format}, max ${v.maxKb} KB |`);
  out.push(`| Photos per A4 sheet | ${v.perSheet} |`);
  out.push("");
  out.push(v.notes);
  out.push("");

  if (entry.form) {
    const how = entry.form.online ? "uploaded" : "on paper";
    out.push(`Filed with ${entry.form.name} (${how}).`);
    out.push("");
  }

  if (v.faq.length) {
    out.push("## Questions");
    out.push("");
    for (const item of v.faq) {
      out.push(`### ${item.q}`);
      out.push("");
      out.push(item.a);
      out.push("");
    }
  }

  // The source and the date outrank everything above them: a specification without the authority
  // it came from is a number someone on the internet said, and requirements do change.
  out.push("## Source");
  out.push("");
  out.push(`[${entry.source.label}](${entry.source.url}) — checked ${entry.checked}.`);
  out.push("");
  out.push(
    "Independent site, not a government body and not affiliated with any consulate. Verify at " +
      "the source before applying. The tool promises a photo matching the published " +
      "specification; it does not promise that an application will be approved.",
  );
  out.push("");
  out.push(`Page: ${here}`);
  out.push("");

  return new Response(out.join("\n"), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
};
