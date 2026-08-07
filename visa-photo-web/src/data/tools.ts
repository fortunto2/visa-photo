import { hasSection, type ActiveLang } from "./locales";
import type { Dict } from "./i18n";
import { path } from "../lib/site";

/**
 * The tools that are not a country page.
 *
 * They were reachable only by typing the URL — the any-size page had been in the sitemap and
 * linked from nothing since it was built. Listing them in one place is what keeps the header,
 * the footer and the hub from drifting apart, and it means a locale that has not translated a
 * tool simply does not show it rather than linking to a page that does not exist.
 *
 * Each entry borrows the tool's own heading and lead rather than restating them, so there is
 * one description per tool in each language, not two that can disagree.
 */
export interface ToolLink {
  /** URL segment, and the key `hasSection` uses to know whether this locale has it */
  segment: string;
  href: string;
  name: string;
  blurb: string;
  icon: string;
}

export function toolsFor(lang: ActiveLang, t: Dict): ToolLink[] {
  const all: (ToolLink | null)[] = [
    {
      segment: "photo-checker",
      href: path(lang, "photo-checker"),
      name: t.check.title,
      blurb: t.check.lead,
      icon: "ic-check",
    },
    t.bgPage
      ? {
          segment: "background",
          href: path(lang, "background"),
          name: t.bgPage.h1,
          blurb: t.bgPage.lead,
          icon: "ic-layers",
        }
      : null,
    t.kbPage
      ? {
          segment: "compress",
          href: path(lang, "compress"),
          name: t.kbPage.h1,
          blurb: t.kbPage.lead,
          icon: "ic-file",
        }
      : null,
    t.scansPage
      ? {
          segment: "scans-to-pdf",
          href: path(lang, "scans-to-pdf"),
          name: t.scansPage.h1,
          blurb: t.scansPage.lead,
          icon: "ic-layers",
        }
      : null,
    t.pdfPage
      ? {
          segment: "compress-pdf",
          href: path(lang, "compress-pdf"),
          name: t.pdfPage.h1,
          blurb: t.pdfPage.lead,
          icon: "ic-copies",
        }
      : null,
    t.sigPage
      ? {
          segment: "signature",
          href: path(lang, "signature"),
          name: t.sigPage.h1,
          blurb: t.sigPage.lead,
          icon: "ic-file",
        }
      : null,
    t.customPage
      ? {
          segment: "custom",
          href: path(lang, "custom"),
          name: t.customPage.h1,
          blurb: t.customPage.lead,
          icon: "ic-ruler",
        }
      : null,
    t.modelsPage
      ? {
          segment: "models",
          href: path(lang, "models"),
          name: t.nav.models,
          blurb: t.modelsPage.lead,
          icon: "ic-spark",
        }
      : null,
  ];

  return all.filter((x): x is ToolLink => x !== null && hasSection(lang, x.segment));
}
