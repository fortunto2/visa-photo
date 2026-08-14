import type { ActiveLang } from "../locales";
import en from "./en";
import ru from "./ru";

/**
 * Guide prose, kept out of the locale dictionaries on purpose.
 *
 * A Dict is a contract every language has to satisfy, which is right for interface strings and
 * wrong for articles: adding a guide would then break the build for eight languages that had
 * not written it yet. Here a language simply has the guides it has, and the route is generated
 * only where the text exists.
 *
 * English and Russian to begin with. These are specific factual claims about what an authority
 * does — a rough translation of one is worse than not publishing it, and the wording for the
 * other seven should come from the same autocomplete work the titles came from.
 */
export interface GuideText {
  title: string;
  h1: string;
  lead: string;
  /** paragraphs, in order */
  body: string[];
  /** the one line worth leaving with */
  takeaway: string;
}

const TEXT: Partial<Record<ActiveLang, Record<string, GuideText>>> = { en, ru };

export function guideText(lang: ActiveLang, slug: string): GuideText | undefined {
  return TEXT[lang]?.[slug];
}

/** Which guides exist in this language, in registry order. */
export function guideSlugs(lang: ActiveLang): string[] {
  return Object.keys(TEXT[lang] ?? {});
}

/** Which languages have any guide at all — what the route and the sitemap agree on. */
export function guideLangs(): ActiveLang[] {
  return (Object.keys(TEXT) as ActiveLang[]).filter((l) => guideSlugs(l).length > 0);
}
