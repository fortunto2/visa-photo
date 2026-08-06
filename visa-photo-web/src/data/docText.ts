import { CATALOG, REGION, idOf, presetOf, sizeLabels, type CatalogEntry } from "./catalog";
import type { Dict, Lang } from "./i18n";
import { ltr } from "../lib/bidi";

/**
 * Fills in the per-document text a locale did not write, from data it already has.
 *
 * Every language used to need five strings for each of eighteen documents — the country's
 * name, two titles, a short label and a note — which is ninety strings before a word of the
 * interface is translated. Almost all of it is derivable: the country name from ICU, the label
 * from the document's kind, the titles and the note from the numbers in presets.toml.
 *
 * Two things matter about how this is done. Generation is the floor, never the ceiling: a
 * locale that writes its own string keeps it, so the English titles tuned against real search
 * queries survive untouched. And composition goes through per-language functions rather than
 * string concatenation, because a template that reads well in English produces "Фон: белом" in
 * Russian — that exact bug shipped once.
 *
 * The other half of the point is that facts cannot drift. A number that lives in presets.toml
 * and is formatted at render time is the same number in nine languages by construction; a
 * number retyped into nine translations is nine chances to be wrong, and nobody proofreads
 * Hindi against Portuguese.
 */

type TextMap = Record<string, string>;

function countryName(lang: Lang, entry: CatalogEntry, override: TextMap): string {
  const written = override[idOf(entry)];
  if (written) return written;

  const region = REGION[entry.country];
  if (region) {
    try {
      const name = new Intl.DisplayNames([lang], { type: "region" }).of(region);
      if (name && name !== region) return name;
    } catch {
      /* an unknown locale falls through to the slug */
    }
  }
  // Last resort: the URL segment, which is at least never wrong, only untranslated.
  return entry.country.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Builds the five per-document maps for one locale, generated values first and the locale's
 * own strings on top.
 */
export function docText(lang: Lang, raw: Dict): Pick<
  Dict,
  "country" | "docShort" | "docTitle" | "docNotes" | "pageTitle"
> {
  const country: TextMap = {};
  const docShort: TextMap = {};
  const docTitle: TextMap = {};
  const docNotes: TextMap = {};
  const pageTitle: TextMap = {};

  for (const entry of CATALOG) {
    const key = idOf(entry);
    const preset = presetOf(entry);
    const name = countryName(lang, entry, raw.country);

    const short = raw.docShort[key] ?? raw.kindName[entry.kind];
    const sizes = sizeLabels(preset, entry, raw.unit);

    country[key] = name;
    docShort[key] = short;
    docTitle[key] = raw.docTitle[key] ?? raw.gen.docTitle({ country: name, doc: short, kind: entry.kind });
    pageTitle[key] =
      raw.pageTitle[key] ??
      raw.gen.pageTitle({
        country: name,
        doc: short,
        kind: entry.kind,
        size: sizes.headline,
        px: `${ltr(`${preset.digital_width} × ${preset.digital_height}`)} ${raw.unit.px}`,
      });
    // With no print size there are no millimetres to quote, so the generated note would be
    // making one up. A locale can still write its own; otherwise the page simply has no note.
    docNotes[key] =
      raw.docNotes[key] ??
      (preset.print_height_mm === undefined
        ? ""
        : raw.gen.docNotes({
            background: raw.backgroundIn[preset.background],
            size: sizes.headline,
            // Derived rather than restated: the preset holds a share of the frame, and the
            // millimetres follow from the print height. No second place to keep in step.
            headMm: Math.round((preset.face_height_percent / 100) * preset.print_height_mm),
            mm: raw.unit.mm,
          }));
  }

  return { country, docShort, docTitle, docNotes, pageTitle };
}
