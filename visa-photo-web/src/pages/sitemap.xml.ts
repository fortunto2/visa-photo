import type { APIRoute } from "astro";
import { CATALOG, countryGroups } from "../data/catalog";
import { absolute, alternates, path } from "../lib/site";
import { langsFor } from "../data/locales";

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
    ...countryGroups().map((g) => [g.slug]), // /{lang}/{country}/
    ...CATALOG.map((e) => [e.country, e.doc]),
    // the checker has its own address, and its own search
    ...CATALOG.map((e) => [e.country, e.doc, "check"]),
  ];

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
