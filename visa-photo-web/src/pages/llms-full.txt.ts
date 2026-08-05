import type { APIRoute } from "astro";
import { CATALOG } from "../data/catalog";
import { docView } from "../data/docView";
import { SITE, absolute, path } from "../lib/site";
import { DEFAULT_LANG, dict } from "../data/locales";

/**
 * Every document in full: the spec, the requirements and all of the questions.
 *
 * /llms.txt is the index — enough to answer "what size". This is the version that answers the
 * follow-ups ("can I wear glasses", "why is my upload rejected") without an assistant fetching
 * twelve pages. Same content as the pages, from the same derivation, so the two cannot drift.
 */
export const GET: APIRoute = () => {
  const t = dict(DEFAULT_LANG);
  const out: string[] = [];

  out.push(`# ${SITE.name} — full reference`);
  out.push("");
  out.push("Biometric photo specifications for visas, passports and residence permits.");
  out.push("Independent site, not a government body. Every entry names the official source it");
  out.push("was checked against; verify there before applying. The tool promises a photo that");
  out.push("matches the published specification, never that an application will be approved.");
  out.push("");
  out.push(`Machine-readable index: ${absolute("/specs.json")}`);
  out.push(`Source code: ${SITE.repo}`);
  out.push("");

  for (const entry of CATALOG) {
    const v = docView(entry, t);
    out.push(`## ${v.title}`);
    out.push("");
    out.push(absolute(path(DEFAULT_LANG, entry.country, entry.doc)));
    out.push("");
    out.push(v.answer);
    out.push("");
    out.push(`- Print size: ${v.headlineSize} (${v.altUnits})`);
    out.push(`- Digital size: ${v.conv.px} px at ${v.dpi} dpi`);
    out.push(`- Background: ${v.background}`);
    out.push(`- File: ${v.format}, max ${v.maxKb} KB`);
    out.push(`- Photos per A4 sheet: ${v.perSheet}`);
    out.push(`- Notes: ${v.notes}`);
    if (entry.form) {
      out.push(`- Filed with: ${entry.form.name}${entry.form.online ? " (uploaded)" : " (on paper)"}`);
    }
    out.push(`- Source: ${entry.source.label}, ${entry.source.url} (checked ${entry.checked})`);
    out.push("");
    out.push("### Questions");
    out.push("");
    for (const item of v.faq) {
      out.push(`**${item.q}**`);
      out.push("");
      out.push(item.a);
      out.push("");
    }
  }

  return new Response(out.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
};
