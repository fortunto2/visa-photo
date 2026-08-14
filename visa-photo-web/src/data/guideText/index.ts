import type { ActiveLang } from "../locales";
import en from "./en";
import ru from "./ru";
import hi from "./hi";
import zh from "./zh";
import ar from "./ar";
import es from "./es";
import tr from "./tr";
import pt from "./pt";
import fr from "./fr";

/**
 * Guide prose, kept out of the locale dictionaries on purpose.
 *
 * A Dict is a contract every language has to satisfy, which is right for interface strings and
 * wrong for articles: adding a guide would then break the build for eight languages that had
 * not written it yet. Here a language simply has the guides it has, and the route is generated
 * only where the text exists.
 *
 * Which guide goes into which language is a product decision, not a completeness exercise.
 * The USCIS change is in all nine, because US immigration paperwork is filed in every one of
 * them. The PSK guide is in Hindi and English, the receipt-code guide in Chinese and English,
 * because those concern the citizens of those countries and a Turkish page about an Indian
 * passport centre would be a page nobody wants. Russia's three routes stay in Russian.
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

const TEXT: Partial<Record<ActiveLang, Record<string, GuideText>>> = {
  en, ru, hi, zh, ar, es, tr, pt, fr,
};

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
