import { PRESETS, type Preset } from "../lib/presets";

/**
 * The catalog turns presets.toml into pages: which country, which document,
 * what the URL looks like, which flag and icon to draw.
 *
 * presets.toml stays the single source of dimensions — nothing is duplicated here.
 * A new preset becomes a live page by adding one entry below.
 */

export type DocKind = "visa" | "passport" | "permit";

export interface CatalogEntry {
  /** key in presets.toml */
  preset: string;
  /** URL segment for the country, stable across languages */
  country: string;
  /** URL segment for the document, stable across languages */
  doc: string;
  kind: DocKind;
  /** ISO-ish code used to pick the flag sprite */
  flag: string;
  /** official source the requirements were checked against */
  source: { label: string; url: string };
  /** date the spec was last verified against the source, ISO */
  checked: string;
  /**
   * The size as the country itself states it, when that is not millimetres. Americans do not
   * search in mm — every real query is "2x2 photo size". Stored as numbers plus a unit rather
   * than a formatted string, so the unit word can be localised and so the figure stays exact:
   * presets.toml rounds the US photo to 51 mm, which converts back to a nonsensical 2.01 in.
   */
  native?: { w: number; h: number; unit: "in" };
  /**
   * The form this photo is filed with. `online` says whether it is uploaded — DS-11 is filed
   * on paper in person, so generating "why does DS-11 reject your upload" invented a rule that
   * does not exist and published it as FAQ structured data.
   */
  form?: { name: string; online: boolean };

  /**
   * How the photo reaches the application. Worth stating before anything else: for a UK visa
   * the photo is taken at the visa centre during biometrics and never uploaded at all, so
   * someone can spend an evening preparing a file nobody will ask for.
   *
   *   upload    — a file is submitted through a form
   *   print     — a printed photo is handed over or posted
   *   captured  — taken for you at an appointment; no file needed
   */
  submission: "upload" | "print" | "captured";

  /** Rules that contradict what this tool does, stated on the page rather than buried. */
  warnings?: ("no-editing" | "no-home-print")[];
}

/** Which sprite symbol stands for a document kind. Was copy-pasted into four page templates. */
export const KIND_ICON: Record<DocKind, string> = {
  visa: "ic-visa",
  passport: "ic-passport",
  permit: "ic-permit",
};

export const CATALOG: CatalogEntry[] = [
  {
    preset: "turkey",
    submission: "upload",
    country: "turkey",
    doc: "residence-permit",
    kind: "permit",
    flag: "tr",
    form: { name: "e-ikamet", online: true },
    source: { label: "Göç İdaresi", url: "https://www.goc.gov.tr/" },
    checked: "2026-08-05",
  },
  {
    preset: "eu_schengen",
    submission: "print",
    country: "schengen",
    doc: "visa",
    kind: "visa",
    flag: "eu",
    source: { label: "EU Council 2004/512/EC", url: "https://home-affairs.ec.europa.eu/" },
    checked: "2026-08-05",
  },
  {
    preset: "us_visa",
    submission: "upload",
    country: "united-states",
    doc: "visa",
    kind: "visa",
    flag: "us",
    native: { w: 2, h: 2, unit: "in" },
    form: { name: "DS-160", online: true },
    source: { label: "U.S. Department of State", url: "https://travel.state.gov/" },
    checked: "2026-08-05",
  },
  {
    preset: "us_passport",
    submission: "print",
    country: "united-states",
    doc: "passport",
    kind: "passport",
    flag: "us",
    native: { w: 2, h: 2, unit: "in" },
    form: { name: "DS-11", online: false },
    source: { label: "U.S. Department of State", url: "https://travel.state.gov/" },
    checked: "2026-08-05",
  },
  {
    preset: "uk_passport",
    submission: "upload",
    country: "united-kingdom",
    doc: "passport",
    kind: "passport",
    flag: "uk",
    source: { label: "GOV.UK", url: "https://www.gov.uk/photos-for-passports" },
    checked: "2026-08-05",
  },
  {
    preset: "ca_passport",
    submission: "print",
    warnings: ["no-editing", "no-home-print"],
    country: "canada",
    doc: "passport",
    kind: "passport",
    flag: "ca",
    source: { label: "Government of Canada", url: "https://www.canada.ca/" },
    checked: "2026-08-05",
  },
  {
    preset: "cn_passport",
    submission: "print",
    country: "china",
    doc: "passport",
    kind: "passport",
    flag: "cn",
    source: { label: "National Immigration Administration", url: "https://en.nia.gov.cn/" },
    checked: "2026-08-05",
  },
  {
    preset: "us_dv",
    submission: "upload",
    country: "united-states",
    doc: "dv-lottery",
    kind: "visa",
    flag: "us",
    native: { w: 2, h: 2, unit: "in" },
    form: { name: "DV Entry Form", online: true },
    source: { label: "U.S. Department of State — DV programme", url: "https://travel.state.gov/content/travel/en/us-visas/immigrate/diversity-visa-program-entry.html" },
    checked: "2026-08-05",
  },
  {
    preset: "in_visa",
    submission: "upload",
    country: "india",
    doc: "visa",
    kind: "visa",
    flag: "in",
    native: { w: 2, h: 2, unit: "in" },
    form: { name: "indianvisaonline.gov.in", online: true },
    source: { label: "Indian Visa Online", url: "https://indianvisaonline.gov.in/" },
    checked: "2026-08-05",
  },
  {
    preset: "in_passport",
    submission: "upload",
    country: "india",
    doc: "passport",
    kind: "passport",
    flag: "in",
    source: { label: "Passport Seva", url: "https://www.passportindia.gov.in/" },
    checked: "2026-08-05",
  },
  {
    preset: "jp_passport",
    submission: "print",
    country: "japan",
    doc: "passport",
    kind: "passport",
    flag: "jp",
    source: { label: "MOFA Japan", url: "https://www.mofa.go.jp/" },
    checked: "2026-08-05",
  },
  {
    preset: "kr_passport",
    submission: "print",
    country: "south-korea",
    doc: "passport",
    kind: "passport",
    flag: "kr",
    source: { label: "Korean MOFA", url: "https://www.passport.go.kr/" },
    checked: "2026-08-05",
  },
  {
    preset: "au_passport",
    submission: "print",
    country: "australia",
    doc: "passport",
    kind: "passport",
    flag: "au",
    source: { label: "Australian Passport Office", url: "https://www.passports.gov.au/" },
    checked: "2026-08-05",
  },
  {
    preset: "ru_passport",
    submission: "print",
    country: "russia",
    doc: "passport",
    kind: "passport",
    flag: "ru",
    source: { label: "МВД России", url: "https://мвд.рф/" },
    checked: "2026-08-05",
  },
];

export function presetOf(entry: CatalogEntry): Preset {
  const preset = PRESETS[entry.preset];
  if (!preset) throw new Error(`catalog references missing preset "${entry.preset}"`);
  return preset;
}

/** Same print format — used to build "related documents" without hand-written links. */
export function sameFormat(entry: CatalogEntry): CatalogEntry[] {
  const p = presetOf(entry);
  return CATALOG.filter((other) => {
    if (other === entry) return false;
    const q = presetOf(other);
    return q.print_width_mm === p.print_width_mm && q.print_height_mm === p.print_height_mm;
  });
}

/** Other documents of the same country. */
export function sameCountry(entry: CatalogEntry): CatalogEntry[] {
  return CATALOG.filter((e) => e !== entry && e.country === entry.country);
}

export interface CountryGroup {
  /** URL segment, stable across languages */
  slug: string;
  flag: string;
  /** the preset whose localised name stands for the whole country */
  nameKey: string;
  entries: CatalogEntry[];
}

/**
 * The catalogue grouped by country, in catalogue order.
 *
 * A flat list of twelve documents makes someone read every card to find their country;
 * grouping turns it into one glance at a flag. It also gives each country a page of its own,
 * which answers the broader search ("photo requirements for Turkey") that no single
 * document page can.
 */
export function countryGroups(): CountryGroup[] {
  const groups = new Map<string, CountryGroup>();
  for (const entry of CATALOG) {
    const existing = groups.get(entry.country);
    if (existing) {
      existing.entries.push(entry);
    } else {
      groups.set(entry.country, {
        slug: entry.country,
        flag: entry.flag,
        nameKey: entry.preset,
        entries: [entry],
      });
    }
  }
  return [...groups.values()];
}

/**
 * The same size in every unit people search for.
 *
 * "size in cm" and "size in inches" sit in the top ten autocomplete suggestions for every
 * country checked — Schengen, UK, Canada, China, India, Japan, Korea, Australia. The numbers
 * are already in presets.toml; not printing them was leaving the most common follow-up
 * question unanswered.
 */
export interface SizeConversions {
  mm: string;
  cm: string;
  inch: string;
  px: string;
}

function trimZeros(value: number, digits: number): string {
  return value.toFixed(digits).replace(/\.?0+$/, "");
}

export function conversionsOf(preset: Preset, entry?: CatalogEntry): SizeConversions {
  const { print_width_mm: w, print_height_mm: h } = preset;
  const native = entry?.native;
  return {
    mm: `${w} × ${h}`,
    cm: `${trimZeros(w / 10, 1)} × ${trimZeros(h / 10, 1)}`,
    // Prefer the country's own figure: converting the rounded millimetres back gives 2.01 in
    // for a photo every US form calls 2 × 2.
    inch: native
      ? `${trimZeros(native.w, 2)} × ${trimZeros(native.h, 2)}`
      : `${trimZeros(w / 25.4, 2)} × ${trimZeros(h / 25.4, 2)}`,
    px: `${preset.digital_width} × ${preset.digital_height}`,
  };
}

/**
 * The headline size and the other units, in the right order for this document.
 *
 * The two have to be decided together: a US page leads in inches, so repeating inches in the
 * secondary line says the same thing twice, while millimetres — the unit it converted from —
 * go missing. Shared so the catalogue cards and the document page cannot disagree, which they
 * did: cards said "51 × 51 mm" under a heading that said "2 × 2 in".
 */
export function sizeLabels(
  preset: Preset,
  entry: CatalogEntry,
  unit: { mm: string; cm: string; in: string },
): { headline: string; alt: string } {
  const conv = conversionsOf(preset, entry);
  return entry.native
    ? {
        headline: `${conv.inch} ${unit.in}`,
        alt: `${conv.mm} ${unit.mm} · ${conv.cm} ${unit.cm}`,
      }
    : {
        headline: `${conv.mm} ${unit.mm}`,
        alt: `${conv.cm} ${unit.cm} · ${conv.inch} ${unit.in}`,
      };
}

/**
 * The DPI a preset implies.
 *
 * Snapped to the nearest standard value when it is within 2 %, because presets store whole
 * millimetres: a US 2×2 photo is 50.8 mm, rounded to 51 in presets.toml, and dividing by that
 * yields "299 dpi" for a file that is plainly 300. Printing at a made-up number is worse than
 * printing at the real one.
 */
export function dpiOf(preset: Preset): number {
  const exact = (preset.digital_width / preset.print_width_mm) * 25.4;
  for (const standard of [72, 150, 300, 600]) {
    if (Math.abs(exact - standard) / standard < 0.02) return standard;
  }
  return Math.round(exact);
}
