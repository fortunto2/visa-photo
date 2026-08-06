import { LANG_TAG } from "../data/i18n";
import { DEFAULT_LANG, LANGS, langsFor, type ActiveLang } from "../data/locales";

/**
 * One place for anything that changes when the domain is decided.
 * Nothing else in the codebase hardcodes the host.
 */
export const SITE = {
  /**
   * Wherever the site is actually served from. canonical, hreflang, the sitemap and the
   * absolute URLs in llms.txt/specs.json all derive from this, so pointing it at a domain
   * that does not resolve tells Google the real pages are duplicates of nothing.
   * Change here and nowhere else when the new domain is live.
   */
  origin: "https://visayes.app",
  name: "visayes",
  /** Rendered as two halves so the second can carry the accent colour. */
  brand: { head: "visa", tail: "yes" },
  /**
   * Sits under the wordmark everywhere. The name reads like a promise about the outcome of an
   * application, and that promise is one we must not make: the tool guarantees a photo that
   * matches a published specification and nothing beyond it.
   */
  tagline: "photos that match the spec",
  repo: "https://github.com/fortunto2/visa-photo",
  analytics: { src: "https://analytics.superduperai.co/sda.js", source: "visaphoto" },
} as const;

/**
 * /<lang>/... everywhere, with one exception: the default language's home page is the domain
 * root.
 *
 * That exception is the whole point. Links from elsewhere land on `visayes.app`, not on
 * `visayes.app/en/`, so the root should be the page rather than a signpost pointing at one —
 * a signpost either carries noindex, which contradicts its own canonical, or spends a redirect
 * hop. Inner pages keep the prefix, because moving those to the root would put country slugs
 * in the same namespace as /app, /print and /skills.
 *
 * Always ends in a slash. Astro writes each page as `<path>/index.html`, and Cloudflare Pages
 * answers the slashless form with a 308. Without the slash here, canonical, hreflang and every
 * sitemap entry would point at a redirect instead of at the page.
 */
export function path(lang: ActiveLang, ...segments: string[]): string {
  const tail = segments.filter(Boolean).join("/");
  if (!tail) return lang === DEFAULT_LANG ? "/" : `/${lang}/`;
  return `/${lang}/${tail}/`;
}

export function absolute(p: string): string {
  return new URL(p, SITE.origin).href;
}

/**
 * The hreflang set for a page that exists in every locale, x-default included.
 *
 * One implementation, because the same loop was written out three times — in the layout, in
 * the root signpost and in the sitemap — while this helper sat unused.
 */
export function alternates(segments: string[] = []): { hreflang: string; href: string }[] {
  // Only the languages the page actually exists in: claiming a Hindi models page that was
  // never translated points Google at a 404 and, worse, says we translated something we did
  // not. x-default stays on the default language, which always has every section.
  const langs = langsFor(segments);
  return [
    ...langs.map((lang) => ({ hreflang: LANG_TAG[lang], href: absolute(path(lang, ...segments)) })),
    { hreflang: "x-default", href: absolute(path(DEFAULT_LANG, ...segments)) },
  ];
}
