import type { Dict, Lang } from "../i18n";
import { docText } from "../docText";
import en from "./en";
import ru from "./ru";
import hi from "./hi";
import zh from "./zh";
import ar from "./ar";

/**
 * The registry decides which locales exist. Adding a language means adding one import here;
 * routes, hreflang, the sitemap and the language switcher all follow from it.
 *
 * Deliberately no fallback to English for missing locales: a page served in English under
 * an /hi/ URL is a duplicate competing with the real English page, and hreflang pointing at
 * it tells Google we translated something we did not.
 */
export const DICTS = { en, hi, zh, ar, ru } satisfies Partial<Record<Lang, Dict>>;

export type ActiveLang = keyof typeof DICTS;

export const LANGS = Object.keys(DICTS) as ActiveLang[];

/** Must be a locale that ships, which is why it lives here and not beside the planned list. */
export const DEFAULT_LANG: ActiveLang = "en";

/**
 * Built once per locale, not per call: every page asks for this, and the merge walks the whole
 * catalogue.
 */
const RESOLVED = new Map<ActiveLang, Dict>();

/**
 * The locale as pages see it: what the file says, with anything it left out generated from the
 * catalogue and presets.toml.
 *
 * Doing the merge here rather than at each call site is what keeps this cheap — no page knows
 * or cares which of the five per-document strings were written and which were derived, so a
 * new language can ship with none of them and add them later without touching a template.
 */
export function dict(lang: ActiveLang): Dict {
  const cached = RESOLVED.get(lang);
  if (cached) return cached;

  const raw = DICTS[lang];
  const merged: Dict = { ...raw, ...docText(lang, raw) };
  RESOLVED.set(lang, merged);
  return merged;
}

/**
 * Pages that a locale may skip, keyed by the URL segment they live at.
 */
const OPTIONAL: Record<string, "modelsPage" | "customPage" | "skills"> = {
  models: "modelsPage",
  custom: "customPage",
  skills: "skills",
};

/** Whether this locale has translated the section a URL segment belongs to. */
export function hasSection(lang: ActiveLang, segment: string): boolean {
  const block = OPTIONAL[segment];
  return !block || DICTS[lang][block] !== undefined;
}

/**
 * Which languages a given page exists in. Everything except the optional sections exists
 * everywhere, so this is the one place routes, hreflang and the sitemap agree on.
 */
export function langsFor(segments: string[]): ActiveLang[] {
  const first = segments[0];
  if (!first || !OPTIONAL[first]) return LANGS;
  return LANGS.filter((lang) => hasSection(lang, first));
}
