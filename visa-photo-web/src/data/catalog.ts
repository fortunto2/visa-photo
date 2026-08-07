import { PRESETS, dpiOf, type Preset } from "../lib/presets";
import { ltr } from "../lib/bidi";

export { dpiOf };

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
  /**
   * Key for this entry's text, when several entries share one specification.
   *
   * The Schengen countries are all 35x45 mm because one EU decision says so, so they share a
   * preset — duplicating the numbers would put them out of step the first time one changed.
   * They still need their own names and titles, and those hang off this instead.
   */
  id?: string;
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
  form?: {
    name: string;
    online: boolean;
    /**
     * Where the form actually lives. Absent for paper forms, and for the two US routes whose
     * portal is reached through a chooser rather than a stable URL.
     */
    url?: string;
  };

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
  warnings?: ("no-editing" | "no-home-print" | "studio-only")[];

  /**
   * This authority wants a signed note explaining a religious head covering. Every jurisdiction
   * here accepts the covering itself; only the US attaches paperwork to it, and someone who is
   * going to be asked for a letter should learn that before the appointment rather than at it.
   */
  coveringStatement?: true;

  /**
   * Date this preset's output was accepted by the authority's own online checker.
   * Only a handful of countries publish one; where they do, it beats reading the spec.
   */
  checkerVerified?: string;
}

/**
 * ISO 3166 codes, so a country's name in any language comes from ICU rather than from a
 * translator. `Intl.DisplayNames` knows all nine planned locales, which turns eighteen strings
 * per language into a handful of overrides — and the ones that stay are search decisions, not
 * translation ones: people type "США", not "Соединенные Штаты", and "Turkey", not "Türkiye".
 *
 * Null where no country exists to name.
 */
export const REGION: Record<string, string | null> = {
  turkey: "TR",
  schengen: null,
  "united-states": "US",
  "united-kingdom": "GB",
  canada: "CA",
  china: "CN",
  india: "IN",
  japan: "JP",
  "south-korea": "KR",
  "new-zealand": "NZ",
  ireland: "IE",
  spain: "ES",
  thailand: "TH",
  vietnam: "VN",
  france: "FR",
  germany: "DE",
  italy: "IT",
  greece: "GR",
  "united-arab-emirates": "AE",
  "saudi-arabia": "SA",
  australia: "AU",
  russia: "RU",
};

/** Which sprite symbol stands for a document kind. Was copy-pasted into four page templates. */
export const KIND_ICON: Record<DocKind, string> = {
  visa: "ic-visa",
  passport: "ic-passport",
  permit: "ic-permit",
};

/** The key a locale looks text up by: its own id where it has one, else the preset. */
export function idOf(entry: CatalogEntry): string {
  return entry.id ?? entry.preset;
}

export const CATALOG: CatalogEntry[] = [
  {
    preset: "turkey",
    submission: "upload",
    country: "turkey",
    doc: "residence-permit",
    kind: "permit",
    flag: "tr",
    form: { name: "e-ikamet", online: true, url: "https://e-ikamet.goc.gov.tr/" },
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
    coveringStatement: true,
    submission: "upload",
    country: "united-states",
    doc: "visa",
    kind: "visa",
    flag: "us",
    native: { w: 2, h: 2, unit: "in" },
    form: { name: "DS-160", online: true, url: "https://ceac.state.gov/genniv/" },
    source: { label: "U.S. Department of State", url: "https://travel.state.gov/" },
    checked: "2026-08-05",
  },
  {
    preset: "us_passport",
    coveringStatement: true,
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
    // Not a printing rule: Canada requires the photo to be *taken* in a commercial studio,
    // whose name, address and the date go on the back of one copy. Someone who made a file
    // here and had it printed professionally would still be turned away.
    warnings: ["no-editing", "studio-only"],
    country: "canada",
    doc: "passport",
    kind: "passport",
    flag: "ca",
    source: {
      label: "Government of Canada",
      url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-passports/photos.html",
    },
    checked: "2026-08-06",
  },
  {
    preset: "ca_visa",
    submission: "upload",
    warnings: ["no-editing"],
    country: "canada",
    doc: "visa",
    kind: "visa",
    flag: "ca",
    source: {
      label: "Immigration, Refugees and Citizenship Canada",
      url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/temporary-resident-visa-application-photograph-specifications.html",
    },
    checked: "2026-08-06",
  },
  {
    preset: "cn_passport",
    // The exit-entry hall photographs applicants free of charge. A self-supplied photo is also
    // accepted, but only with a 照片回执 — a receipt code issued by an approved studio — which
    // no file made here can carry.
    submission: "captured",
    country: "china",
    doc: "passport",
    kind: "passport",
    flag: "cn",
    source: { label: "National Immigration Administration", url: "https://en.nia.gov.cn/" },
    checked: "2026-08-05",
  },
  {
    preset: "us_dv",
    coveringStatement: true,
    submission: "upload",
    country: "united-states",
    doc: "dv-lottery",
    kind: "visa",
    flag: "us",
    native: { w: 2, h: 2, unit: "in" },
    form: { name: "DV Entry Form", online: true, url: "https://dvprogram.state.gov/" },
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
    form: { name: "indianvisaonline.gov.in", online: true, url: "https://indianvisaonline.gov.in/" },
    source: { label: "Indian Visa Online", url: "https://indianvisaonline.gov.in/" },
    checked: "2026-08-05",
  },
  {
    preset: "in_passport",
    // Passport Seva photographs the applicant at the centre, free, and states "Photograph is
    // not required" for the visit. A file is needed only in the exceptions: a child under
    // four, and applications made at an Indian mission abroad.
    submission: "captured",
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
    // Korea forbids retouching by name — AI correction and reshaping included — and will not
    // take a photo printed on ordinary paper rather than photographic paper. Both rules
    // contradict what a tool like this does, so both are stated on the page.
    warnings: ["no-editing", "no-home-print"],
    submission: "print",
    country: "south-korea",
    doc: "passport",
    kind: "passport",
    flag: "kr",
    source: { label: "Korean MOFA", url: "https://www.passport.go.kr/" },
    checked: "2026-08-05",
  },
  {
    preset: "jp_passport_online",
    submission: "upload",
    country: "japan",
    doc: "passport-online",
    kind: "passport",
    flag: "jp",
    form: { name: "Mynaportal", online: true, url: "https://myna.go.jp/" },
    source: {
      label: "外務省 / マイナポータル",
      url: "https://faq.myna.go.jp/faq/show/8043",
    },
    checked: "2026-08-07",
  },
  {
    preset: "nz_passport",
    submission: "upload",
    checkerVerified: "2026-08-06",
    country: "new-zealand",
    doc: "passport",
    kind: "passport",
    flag: "nz",
    source: { label: "New Zealand Passports", url: "https://www.passports.govt.nz/passport-photos/check-your-photo-meets-the-technical-requirements" },
    checked: "2026-08-06",
  },
  {
    preset: "ie_passport",
    submission: "upload",
    country: "ireland",
    doc: "passport",
    kind: "passport",
    flag: "ie",
    source: { label: "Department of Foreign Affairs", url: "https://www.ireland.ie/en/dfa/passports/photo-guidelines/" },
    checked: "2026-08-06",
  },
  {
    preset: "es_tie",
    submission: "print",
    warnings: ["no-home-print"],
    country: "spain",
    doc: "residence-card",
    kind: "permit",
    flag: "es",
    // The TIE rules do not restate the photo spec; they point at the one for the national ID
    // card, which is where 26x32 mm and the 70-80 % head come from.
    source: { label: "Policía Nacional", url: "https://www.policia.es/_es/extranjeria_portada.php" },
    checked: "2026-08-06",
  },
  {
    preset: "th_evisa",
    submission: "upload",
    country: "thailand",
    doc: "evisa",
    kind: "visa",
    flag: "th",
    form: { name: "thaievisa.go.th", online: true, url: "https://www.thaievisa.go.th/" },
    source: { label: "Thai e-Visa portal", url: "https://www.thaievisa.go.th/" },
    checked: "2026-08-06",
  },
  {
    preset: "sa_evisa",
    submission: "upload",
    country: "saudi-arabia",
    doc: "evisa",
    kind: "visa",
    flag: "sa",
    form: { name: "visa.visitsaudi.com", online: true, url: "https://visa.visitsaudi.com/" },
    source: { label: "Saudi tourist e-visa portal", url: "https://visa.visitsaudi.com/Home/PhotoSpecifications" },
    checked: "2026-08-06",
  },
  {
    preset: "vn_evisa",
    submission: "upload",
    country: "vietnam",
    doc: "evisa",
    kind: "visa",
    flag: "vn",
    form: { name: "evisa.gov.vn", online: true, url: "https://evisa.gov.vn/" },
    source: { label: "Vietnam National E-Visa portal", url: "https://evisa.gov.vn/instruction" },
    checked: "2026-08-06",
  },
  {
    preset: "jp_visa",
    submission: "print",
    country: "japan",
    doc: "visa",
    kind: "visa",
    flag: "jp",
    source: { label: "MOFA Japan", url: "https://www.mofa.go.jp/j_info/visit/visa/index.html" },
    checked: "2026-08-06",
  },
  {
    preset: "eu_schengen",
    id: "fr_schengen",
    submission: "print",
    country: "france",
    doc: "visa",
    kind: "visa",
    flag: "fr",
    form: { name: "France-Visas", online: true, url: "https://france-visas.gouv.fr/" },
    source: { label: "France-Visas", url: "https://france-visas.gouv.fr/" },
    checked: "2026-08-07",
  },
  {
    preset: "eu_schengen",
    id: "de_schengen",
    submission: "print",
    country: "germany",
    doc: "visa",
    kind: "visa",
    flag: "de",
    form: { name: "VIDEX", online: true, url: "https://videx.diplo.de/" },
    source: { label: "Auswärtiges Amt", url: "https://www.auswaertiges-amt.de/en/visa-service" },
    checked: "2026-08-07",
  },
  {
    preset: "eu_schengen",
    id: "it_schengen",
    submission: "print",
    country: "italy",
    doc: "visa",
    kind: "visa",
    flag: "it",
    form: { name: "Prenot@Mi", online: true, url: "https://prenotami.esteri.it/" },
    source: { label: "Ministero degli Affari Esteri", url: "https://vistoperitalia.esteri.it/" },
    checked: "2026-08-07",
  },
  {
    preset: "eu_schengen",
    id: "es_schengen",
    submission: "print",
    country: "spain",
    doc: "visa",
    kind: "visa",
    flag: "es",
    source: { label: "Ministerio de Asuntos Exteriores", url: "https://www.exteriores.gob.es/" },
    checked: "2026-08-07",
  },
  {
    preset: "eu_schengen",
    id: "gr_schengen",
    submission: "print",
    country: "greece",
    doc: "visa",
    kind: "visa",
    flag: "gr",
    source: { label: "Hellenic Ministry of Foreign Affairs", url: "https://www.mfa.gr/en/visas/" },
    checked: "2026-08-07",
  },
  {
    preset: "cn_visa",
    submission: "upload",
    country: "china",
    doc: "visa",
    kind: "visa",
    flag: "cn",
    form: { name: "COVA", online: true, url: "https://cova.mfa.gov.cn/" },
    source: {
      label: "MFA Consular Affairs — photo requirements",
      url: "https://us.china-embassy.gov.cn/eng/lsfw/zj/qz2021/201612/t20161206_4410998.htm",
    },
    checked: "2026-08-07",
  },
  {
    preset: "ae_visa",
    submission: "upload",
    country: "united-arab-emirates",
    doc: "visa",
    kind: "visa",
    flag: "ae",
    form: { name: "ICP Smart Services", online: true, url: "https://smartservices.icp.gov.ae/" },
    source: { label: "ICP personal photo specifications", url: "https://icp.gov.ae/wp-content/uploads/2021/11/icao_english.pdf" },
    checked: "2026-08-07",
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
    // Three routes under one name. The biometric passport is photographed on the spot, at the
    // ministry or in an MFC booth, and paper photos are not accepted for it; the old-style
    // five-year passport still takes printed ones; and the Gosuslugi application form wants an
    // uploaded photo that is not the one printed in the document. "Captured" is the honest
    // answer for the route most people take.
    submission: "captured",
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
        nameKey: idOf(entry),
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
  /** null where the authority publishes no physical size; the pixels are then the whole spec. */
  mm: string | null;
  cm: string | null;
  inch: string | null;
  px: string;
}

function trimZeros(value: number, digits: number): string {
  return value.toFixed(digits).replace(/\.?0+$/, "");
}

export function conversionsOf(preset: Preset, entry?: CatalogEntry): SizeConversions {
  const { print_width_mm: w, print_height_mm: h } = preset;
  const native = entry?.native;
  // No physical size published — the pixel count is the whole specification.
  if (!w || !h) {
    return { mm: null, cm: null, inch: null, px: ltr(`${preset.digital_width} × ${preset.digital_height}`) };
  }
  return {
    mm: ltr(`${w} × ${h}`),
    cm: ltr(`${trimZeros(w / 10, 1)} × ${trimZeros(h / 10, 1)}`),
    // Prefer the country's own figure: converting the rounded millimetres back gives 2.01 in
    // for a photo every US form calls 2 × 2.
    inch: ltr(
      native
        ? `${trimZeros(native.w, 2)} × ${trimZeros(native.h, 2)}`
        : `${trimZeros(w / 25.4, 2)} × ${trimZeros(h / 25.4, 2)}`,
    ),
    px: ltr(`${preset.digital_width} × ${preset.digital_height}`),
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
  unit: { mm: string; cm: string; in: string; px: string },
): { headline: string; alt: string } {
  const conv = conversionsOf(preset, entry);
  // Where no millimetres exist, the pixels are the headline and there is no second line.
  if (!conv.mm) return { headline: `${conv.px} ${unit.px}`, alt: "" };
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

