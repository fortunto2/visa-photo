import type { APIRoute } from "astro";
import { CATALOG, presetOf, dpiOf } from "../data/catalog";
import { SITE, absolute, path } from "../lib/site";
import { DEFAULT_LANG, LANGS } from "../data/locales";

/**
 * The whole catalogue as one JSON document.
 *
 * This exists because of what people actually ask assistants: "what size is a US visa photo".
 * An agent answering that should not have to parse twelve HTML pages — it fetches this once.
 * Every number here comes from presets.toml, so the JSON and the pages can never disagree.
 */
export const GET: APIRoute = () => {
  const documents = CATALOG.map((entry) => {
    const p = presetOf(entry);
    return {
      id: entry.preset,
      country: entry.country,
      document: entry.doc,
      kind: entry.kind,
      url: absolute(path(DEFAULT_LANG, entry.country, entry.doc)),
      print_mm: { width: p.print_width_mm, height: p.print_height_mm },
      digital_px: { width: p.digital_width, height: p.digital_height },
      dpi: dpiOf(p),
      background: p.background,
      face: {
        head_height_percent: p.face_height_percent,
        top_margin_percent: p.face_top_margin_percent,
        eye_line_from_bottom_percent: p.eye_line_from_bottom_percent,
      },
      file: { format: p.format, max_size_kb: p.max_file_size_kb },
      photos_per_sheet: p.photo_count,
      notes: p.notes,
      official_source: entry.source,
      spec_checked: entry.checked,
    };
  });

  const body = {
    name: `${SITE.name} photo specifications`,
    description:
      "Biometric photo specifications for visa, passport and residence permit applications. " +
      "Independent reference, not a government source. Verify against the official source before applying.",
    license: "Facts are not copyrightable; attribution appreciated.",
    source_code: SITE.repo,
    languages: LANGS,
    processing: "All photo processing happens in the visitor's browser. No image is uploaded.",
    count: documents.length,
    documents,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
};
