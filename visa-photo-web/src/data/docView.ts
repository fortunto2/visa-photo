import type { Dict } from "./i18n";
import { conversionsOf, dpiOf, presetOf, sizeLabels, type CatalogEntry , idOf } from "./catalog";

/**
 * Everything a document page states, derived once.
 *
 * This lived inline in the page template, which meant llms.txt and specs.json — the two files
 * written for machines — could not publish the generated FAQ, the very content most likely to
 * be quoted back by an assistant.
 */
export interface DocView {
  title: string;
  country: string;
  short: string;
  notes: string;
  headlineSize: string;
  altUnits: string;
  conv: ReturnType<typeof conversionsOf>;
  /** null where no print size is published, so no resolution can be derived */
  dpi: number | null;
  background: string;
  format: string;
  maxKb: number;
  perSheet: number;
  faceHeightPercent: number;
  eyeLinePercent: number;
  answer: string;
  faq: { q: string; a: string }[];
}

export function docView(entry: CatalogEntry, t: Dict): DocView {
  const p = presetOf(entry);
  const key = idOf(entry);
  const conv = conversionsOf(p, entry);
  const { headline, alt } = sizeLabels(p, entry, t.unit);
  const bg = p.background;
  const format = p.format.toUpperCase();
  const title = t.docTitle[key];

  /**
   * Written answers first, then the ones derived from the spec. The derived set exists because
   * the same follow-ups repeat for every country in the search data: size in cm, size in
   * inches, size in pixels, background, file size, how many per sheet.
   */
  const dpi = dpiOf(p);
  const generated = [
    // "What is it in cm and inches" and "how many per sheet" both assume a printed photo.
    // Where the authority publishes none, asking them invents the answer.
    ...(conv.mm && conv.cm && conv.inch
      ? [{ q: t.autoFaq.size({ doc: title }), a: t.autoFaq.sizeA({ mm: conv.mm, cm: conv.cm, inch: conv.inch }) }]
      : []),
    ...(dpi === null
      ? []
      : [{ q: t.autoFaq.pixels({ doc: title }), a: t.autoFaq.pixelsA({ px: conv.px, dpi }) }]),
    {
      q: t.autoFaq.background({ doc: title }),
      a: t.autoFaq.backgroundA({ bg: t.backgroundName[bg] }),
    },
    {
      q: t.autoFaq.fileSize({ doc: title }),
      a: t.autoFaq.fileSizeA({ format, kb: p.max_file_size_kb }),
    },
    ...(conv.mm
      ? [{
          q: t.autoFaq.perSheet({ doc: title }),
          a: t.autoFaq.perSheetA({ n: p.photo_count, size: `${conv.mm} ${t.unit.mm}` }),
        }]
      : []),
    /**
     * Straight from the catalogue. These are the questions the numbers cannot answer — how the
     * photo reaches the application, whether this authority takes an edited one, whether its
     * own checker has passed what this page produces — and every one of them is a field we
     * already keep, so all nine languages get them from one template each.
     */
    {
      q: t.autoFaq.howFiled({ doc: title }),
      a: t.autoFaq.howFiledA({
        route: t.submission[entry.submission],
        form: entry.form ? `. ${entry.form.name}.` : ".",
      }),
    },
    ...(entry.warnings?.includes("no-editing")
      ? [{ q: t.autoFaq.editing({ doc: title }), a: t.warn.noEditing }]
      : []),
    ...(entry.warnings?.includes("studio-only")
      ? [{ q: t.autoFaq.editing({ doc: title }), a: t.warn.studioOnly }]
      : []),
    ...(entry.checkerVerified
      ? [{
          q: t.autoFaq.checked({ doc: title }),
          a: t.checkerVerified({
            date: new Intl.DateTimeFormat(t.dateLocale, { day: "numeric", month: "long", year: "numeric" })
              .format(new Date(entry.checkerVerified)),
          }),
        }]
      : []),
    /**
     * Asked of every document, because the rule does not vary by country: the six authorities
     * whose wording was read all permit a religious covering and all forbid an everyday hat.
     * The US adds a signed note, which is the only part that is per-entry.
     */
    {
      q: t.autoFaq.covering({ doc: title }),
      a: entry.coveringStatement
        ? `${t.autoFaq.coveringA()} ${t.autoFaq.coveringStatement}`
        : t.autoFaq.coveringA(),
    },
    // Only forms that actually accept an upload: DS-11 is filed on paper, and inventing an
    // upload rule for it would be publishing a requirement that does not exist.
    ...(entry.form?.online
      ? [
          {
            q: t.autoFaq.uploadFails({ form: entry.form.name }),
            a: t.autoFaq.uploadFailsA({
              form: entry.form.name,
              format,
              kb: p.max_file_size_kb,
              px: conv.px,
            }),
          },
        ]
      : []),
  ];

  const written = t.faq[key] ?? [];

  return {
    title,
    country: t.country[key],
    short: t.docShort[key],
    notes: t.docNotes[key],
    headlineSize: headline,
    altUnits: alt,
    conv,
    dpi,
    background: t.backgroundName[bg],
    format,
    maxKb: p.max_file_size_kb,
    perSheet: p.photo_count,
    faceHeightPercent: p.face_height_percent,
    eyeLinePercent: p.eye_line_from_bottom_percent,
    answer: t.answer({
      w: p.digital_width,
      h: p.digital_height,
      kb: p.max_file_size_kb,
      format,
      bg: t.backgroundIn[bg],
    }),
    faq: [...written, ...generated.filter((g) => !written.some((w) => w.q === g.q))],
  };
}
