import type { APIRoute } from "astro";
import { CATALOG, presetOf, sizeLabels, countryGroups, idOf } from "../../data/catalog";
import { toolsFor } from "../../data/tools";
import { guideSlugs } from "../../data/guideText";
import { guideText } from "../../data/guideText";
import { LANGS, dict, type ActiveLang } from "../../data/locales";
import { SITE, absolute, path } from "../../lib/site";

/**
 * The hub as markdown.
 *
 * This is the page an agent lands on first and the one it had no twin for, which made the
 * whole negotiation look unimplemented from the outside — a scanner asks the root, gets HTML,
 * and concludes correctly that the site does not do this.
 *
 * It is written as an index rather than a copy of the page: what the site is, what each tool
 * does, and every document with its size, because a list of 25 sizes is the single most useful
 * thing a machine can be handed here. specs.json carries the same facts in a stricter form and
 * is linked for anything that would rather parse than read.
 */
export function getStaticPaths() {
  return LANGS.map((lang) => ({ params: { lang } }));
}

export function render(lang: ActiveLang): string {
  const t = dict(lang);
  const out: string[] = [];

  out.push(`# ${t.hub.h1}`);
  out.push("");
  out.push(t.hub.lead);
  out.push("");
  out.push(t.trust.why);
  out.push("");

  out.push(`## ${t.nav.tools}`);
  out.push("");
  for (const tool of toolsFor(lang, t)) {
    out.push(`- **${tool.name}** — ${tool.blurb}`);
    out.push(`  ${absolute(tool.href)}`);
  }
  out.push("");

  const slugs = guideSlugs(lang);
  if (slugs.length) {
    out.push(`## ${t.guides.h1}`);
    out.push("");
    out.push(t.guides.scope);
    out.push("");
    for (const slug of slugs) {
      const g = guideText(lang, slug)!;
      out.push(`- **${g.h1}** — ${g.lead}`);
      out.push(`  ${absolute(path(lang, "guides", slug))}`);
    }
    out.push("");
  }

  out.push(`## ${t.nav.countries}`);
  out.push("");
  for (const group of countryGroups()) {
    out.push(`### ${t.country[group.nameKey]}`);
    for (const entry of group.entries) {
      const p = presetOf(entry);
      const { headline } = sizeLabels(p, entry, t.unit);
      out.push(`- ${t.docShort[idOf(entry)]} — ${headline}, ` +
        `${p.digital_width} × ${p.digital_height} ${t.unit.px}, ` +
        `${p.format.toUpperCase()} ≤ ${p.max_file_size_kb} ${t.unit.kb}`);
      out.push(`  ${absolute(path(lang, entry.country, entry.doc))}`);
    }
    out.push("");
  }

  out.push("## Machine-readable");
  out.push("");
  out.push(`- Every specification as JSON: ${absolute("/specs.json")}`);
  out.push(`- ${absolute("/llms.txt")}`);
  out.push(`- Source: ${SITE.repo}`);
  out.push("");
  out.push("---");
  out.push(t.seo.disclaimerShort);
  out.push("");

  return out.join("\n");
}

export const GET: APIRoute = ({ params }) =>
  new Response(render(params.lang as ActiveLang), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
