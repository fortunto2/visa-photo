import type { APIRoute } from "astro";
import { GUIDES } from "../../../data/guides";
import { guideText, guideSlugs, guideLangs } from "../../../data/guideText";
import { dict, type ActiveLang } from "../../../data/locales";
import { absolute, path } from "../../../lib/site";

/**
 * The markdown twin of a guide.
 *
 * These are the pages worth having one for. A document page is mostly numbers, and an agent can
 * read those from specs.json; a guide is prose, and prose is exactly what gets lost when a
 * machine has to scrape a layout. Built from the same text the HTML page renders, so the two
 * cannot drift.
 */
export function getStaticPaths() {
  return guideLangs().flatMap((lang) =>
    guideSlugs(lang).map((slug) => ({ params: { lang, slug } })));
}

export const GET: APIRoute = ({ params }) => {
  const lang = params.lang as ActiveLang;
  const slug = params.slug as string;
  const t = dict(lang);
  const guide = GUIDES.find((g) => g.slug === slug)!;
  const text = guideText(lang, slug)!;

  const out: string[] = [];
  out.push(`# ${text.h1}`);
  out.push("");
  out.push(text.lead);
  out.push("");
  // The date is the claim's warranty; a guide about what an office does now is worth what its
  // date is worth, so it goes near the top rather than in a footer.
  out.push(`> ${t.verified({ date: guide.checked, source: guide.source.label })}`);
  out.push(`> ${guide.source.url}`);
  out.push("");
  for (const paragraph of text.body) {
    out.push(paragraph);
    out.push("");
  }
  out.push(`**${text.takeaway}**`);
  out.push("");

  if (guide.docs.length) {
    out.push(`## ${t.guides.forDocs}`);
    out.push("");
    for (const d of guide.docs) {
      out.push(`- ${absolute(path(lang, d.country, d.doc))}`);
    }
    out.push("");
  }

  out.push(`---`);
  out.push(t.seo.disclaimerShort);
  out.push("");

  return new Response(out.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
