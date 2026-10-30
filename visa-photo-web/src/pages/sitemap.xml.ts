import type { APIRoute } from "astro";
import { CATALOG, countryGroups } from "../data/catalog";
import { absolute, alternates, path } from "../lib/site";
import { langsFor } from "../data/locales";
import { guideSlugs, guideLangs } from "../data/guideText";
import { GUIDES } from "../data/guides";

/**
 * Written by hand rather than via @astrojs/sitemap because every URL needs its full
 * xhtml:link alternate set. A multilingual site without those is a set of pages competing
 * with each other instead of one page served in nine languages.
 */
export const GET: APIRoute = () => {
  const groups: string[][] = [
    [], // hub: /{lang}/
    ["models"],
    ["skills"],
    ["photo-checker"],
    ["custom"],
    ["background"],
    ["privacy"],
    ["compress"],
    ["compress-pdf"],
    ["scans-to-pdf"],
    ["signature"],
    ["photo-rejected"],
    // Guides exist per language rather than everywhere, so they are enumerated from the text
    // that exists rather than from the registry.
    ...guideLangs().flatMap((lang) => [
      ["guides"],
      ...guideSlugs(lang).map((slug) => ["guides", slug]),
    ]),
    ...countryGroups().map((g) => [g.slug]), // /{lang}/{country}/
    ...CATALOG.map((e) => [e.country, e.doc]),
    // the checker has its own address, and its own search
    ...CATALOG.map((e) => [e.country, e.doc, "check"]),
  ];

  /**
   * The date the facts on a page were last checked against their source, where there is one:
   * a document's `checked`, the latest of a country's documents, a guide's own date. Pages with
   * no such date get no lastmod rather than the build date, which would claim a change that
   * did not happen.
   */
  const checkedOf = (segments: string[]): string | undefined => {
    const [a, b] = segments;
    if (a === "guides") return GUIDES.find((g) => g.slug === b)?.checked;
    const docs = CATALOG.filter((e) => e.country === a && (b === undefined || e.doc === b));
    return docs.map((e) => e.checked).sort().at(-1);
  };

  const urls = groups.flatMap((segments) =>
    // A language that has not translated the models or skills page simply has no such URL.
    langsFor(segments).map((lang) => {
      const loc = absolute(path(lang, ...segments));
      const alts = alternates(segments).map(
        (alt) =>
          `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}"/>`,
      );
      return [
        "  <url>",
        `    <loc>${loc}</loc>`,
        ...(checkedOf(segments) ? [`    <lastmod>${checkedOf(segments)}</lastmod>`] : []),
        ...alts,
        `    <changefreq>monthly</changefreq>`,
        `    <priority>${segments.length ? "0.8" : "1.0"}</priority>`,
        "  </url>",
      ].join("\n");
    }),
  );

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");

  return new Response(xml, {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
};
