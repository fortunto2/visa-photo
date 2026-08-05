import type { Dict, Lang } from "../i18n";
import en from "./en";
import ru from "./ru";

/**
 * The registry decides which locales exist. Adding a language means adding one import here;
 * routes, hreflang, the sitemap and the language switcher all follow from it.
 *
 * Deliberately no fallback to English for missing locales: a page served in English under
 * an /hi/ URL is a duplicate competing with the real English page, and hreflang pointing at
 * it tells Google we translated something we did not.
 */
export const DICTS = { en, ru } satisfies Partial<Record<Lang, Dict>>;

export type ActiveLang = keyof typeof DICTS;

export const LANGS = Object.keys(DICTS) as ActiveLang[];

/** Must be a locale that ships, which is why it lives here and not beside the planned list. */
export const DEFAULT_LANG: ActiveLang = "en";

export function dict(lang: ActiveLang): Dict {
  return DICTS[lang];
}
