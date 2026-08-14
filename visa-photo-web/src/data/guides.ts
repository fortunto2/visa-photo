/**
 * Guides: how the photograph actually reaches the authority.
 *
 * Deliberately not visa rules. Who needs a visa, on what grounds, for how long and at what cost
 * changes constantly, varies by nationality, and is checked here by nothing — the harness in
 * this repository verifies numbers in presets.toml, not prose about eligibility. Getting a size
 * wrong costs a reshoot; getting an entitlement wrong costs a trip.
 *
 * What these cover instead is the question the audit turned up and nobody else publishes: for a
 * given document, does anyone want a file from you at all. India photographs applicants at the
 * centre. China wants a receipt code no file can carry. Japan's online route is a different
 * shape from its paper one. USCIS stopped accepting self-submitted photographs entirely. Each
 * of those was read out of the authority's own words while auditing the catalogue, and each one
 * saves somebody work they were about to waste.
 *
 * Every guide names the documents it concerns, so the link between a guide and a document page
 * is declared once and drawn in both directions.
 */
export interface Guide {
  slug: string;
  /** catalogue entries this guide is about — used for cross-links both ways */
  docs: { country: string; doc: string }[];
  source: { label: string; url: string };
  /** when the claims in it were last checked against that source */
  checked: string;
}

export const GUIDES: Guide[] = [
  {
    slug: "india-photo-taken-at-psk",
    docs: [
      { country: "india", doc: "passport" },
      { country: "india", doc: "visa" },
    ],
    source: { label: "Passport Seva", url: "https://www.passportindia.gov.in/" },
    checked: "2026-08-07",
  },
  {
    slug: "uscis-stopped-accepting-your-photo",
    docs: [
      { country: "united-states", doc: "visa" },
      { country: "united-states", doc: "passport" },
      { country: "united-states", doc: "dv-lottery" },
    ],
    source: {
      label: "USCIS policy alert, 12 December 2025",
      url: "https://www.uscis.gov/newsroom/alerts/new-photo-policy-helps-prevent-immigration-fraud-through-enhanced-identity-verification",
    },
    checked: "2026-08-06",
  },
  {
    slug: "japan-online-photo-is-a-different-shape",
    docs: [
      { country: "japan", doc: "passport-online" },
      { country: "japan", doc: "passport" },
    ],
    source: { label: "マイナポータル FAQ / 外務省", url: "https://faq.myna.go.jp/faq/show/8043" },
    checked: "2026-08-07",
  },
  {
    slug: "china-photo-receipt-code",
    docs: [
      { country: "china", doc: "passport" },
      { country: "china", doc: "visa" },
    ],
    source: { label: "国家移民管理局", url: "https://cs.mfa.gov.cn/zggmcg/hz/sbhz/" },
    checked: "2026-08-07",
  },
  {
    slug: "russia-three-routes",
    docs: [{ country: "russia", doc: "passport" }],
    source: { label: "МВД России · Госуслуги", url: "https://xn--b1aew.xn--p1ai/" },
    checked: "2026-08-07",
  },
];

/** The guide that concerns a given document, if any. Drawn on the document page. */
export function guideForDoc(country: string, doc: string): Guide | undefined {
  return GUIDES.find((g) => g.docs.some((d) => d.country === country && d.doc === doc));
}
