import type { APIRoute } from "astro";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { CATALOG, presetOf, type CatalogEntry } from "../../../../data/catalog";
import { docView } from "../../../../data/docView";
import { DEFAULT_LANG, LANGS, dict, type ActiveLang } from "../../../../data/locales";

/**
 * The link preview of a document page: its own title, size and a drawing of the photo in the
 * document's proportions, instead of one picture for all 855 pages. Shared in a messenger, the
 * card says what the page is before anyone opens it.
 *
 * Rendered at build time with resvg from macOS system fonts (Arial, Geeza Pro, Hiragino Sans GB).
 * resvg does not shape Devanagari correctly with any font tried, so Hindi pages get the English
 * card; numbers and drawing are the same. Where the fonts are missing (a build off macOS) every
 * card falls back to the site-wide /og.png rather than failing the build.
 */
const FONTS = [
  "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
  "/System/Library/Fonts/Supplemental/Arial.ttf",
  "/System/Library/Fonts/GeezaPro.ttc",
  "/System/Library/Fonts/Hiragino Sans GB.ttc",
];
const HAVE_FONTS = FONTS.every((f) => existsSync(f));

export function getStaticPaths() {
  return LANGS.flatMap((lang) =>
    CATALOG.map((entry) => ({ params: { lang, country: entry.country, doc: entry.doc }, props: { entry } })),
  );
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Lines that fit `width` at `size`, by a per-script width estimate; resvg does not wrap. */
function lines(text: string, size: number, width: number): string[] {
  const cjk = /[　-鿿]/.test(text);
  const per = cjk ? size : size * 0.56;
  const max = Math.floor(width / per);
  const words = cjk ? [...text] : text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? (cjk ? line + w : `${line} ${w}`) : w;
    if (next.length > max && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Two lines at most: a long title first gets a smaller size, and is cut only if that is not enough. */
function fit(text: string, width: number): { size: number; lines: string[] } {
  for (const size of [54, 46, 40]) {
    const l = lines(text, size, width);
    if (l.length <= 2) return { size, lines: l };
  }
  const l = lines(text, 40, width);
  return { size: 40, lines: [l[0], `${l[1]}…`] };
}

function card(entry: CatalogEntry, lang: ActiveLang): string {
  const textLang = lang === "hi" ? DEFAULT_LANG : lang;
  const v = docView(entry, dict(textLang));
  const p = presetOf(entry);
  const rtl = textLang === "ar";
  const family = textLang === "ar" ? "Geeza Pro" : textLang === "zh" ? "Hiragino Sans GB" : "Arial";

  // The photo, in the document's own proportions, on the side opposite the text.
  const ratio = p.print_width_mm && p.print_height_mm ? p.print_width_mm / p.print_height_mm : p.digital_width / p.digital_height;
  const fh = 420;
  const fw = Math.round(fh * ratio);
  const fx = rtl ? 120 : 1080 - fw;
  const fy = 140;
  const headTop = fy + (fh * p.face_top_margin_percent) / 100;
  const headH = (fh * p.face_height_percent) / 100;
  const chin = headTop + headH;
  const cx = fx + fw / 2;
  const eye = fy + fh - (fh * p.eye_line_from_bottom_percent) / 100;
  const fill = p.background === "white" ? "#FFFFFF" : "#E4E9EB";

  const tx = rtl ? 1120 : 80;
  const anchor = rtl ? "end" : "start";
  const textWidth = 1200 - 80 - 80 - fw - 60;
  const title = fit(v.title, textWidth);
  const lh = Math.round(title.size * 1.18);
  const t = (y: number, size: number, weight: number, color: string, s: string) =>
    `<text x="${tx}" y="${y}" font-family="${family}" font-weight="${weight}" font-size="${size}" fill="${color}" text-anchor="${anchor}"${rtl ? ' direction="rtl"' : ""}>${esc(s)}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#F1F5F5"/>
  <rect width="1200" height="10" fill="#0D7A88"/>
  <g transform="translate(${rtl ? 1120 - 260 : 80},58)">
    <rect width="48" height="48" rx="12" fill="#0D7A88"/>
    <rect x="12" y="14" width="24" height="20" rx="4" fill="none" stroke="#fff" stroke-width="2.4"/>
    <circle cx="26" cy="24" r="4.6" fill="none" stroke="#fff" stroke-width="2.4"/>
    <text x="64" y="36" font-family="Arial" font-weight="700" font-size="34" fill="#12303A">visa<tspan fill="#0D7A88">yes</tspan></text>
  </g>
  ${title.lines.map((line, i) => t(200 + i * lh, title.size, 700, "#12303A", line)).join("\n  ")}
  ${t(200 + title.lines.length * lh + 70, 92, 700, "#0D7A88", v.headlineSize)}
  ${t(200 + title.lines.length * lh + 128, 32, 400, "#4A5D64", `${v.conv.px} px · ${v.background}`)}
  ${t(570, 28, 700, "#0D7A88", "visayes.app")}
  <rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="6" fill="${fill}" stroke="#B9C7CC" stroke-width="2"/>
  <ellipse cx="${cx}" cy="${headTop + headH * 0.47}" rx="${headH * 0.36}" ry="${headH * 0.5}" fill="#9DB1B8"/>
  <path d="M ${fx + fw * 0.08} ${fy + fh} C ${fx + fw * 0.12} ${chin + 40}, ${cx - headH * 0.3} ${chin + 10}, ${cx} ${chin + 8} C ${cx + headH * 0.3} ${chin + 10}, ${fx + fw * 0.88} ${chin + 40}, ${fx + fw * 0.92} ${fy + fh} Z" fill="#9DB1B8"/>
  <line x1="${fx - 14}" y1="${headTop}" x2="${fx + fw + 14}" y2="${headTop}" stroke="#D97706" stroke-width="3" stroke-dasharray="10 7"/>
  <line x1="${fx - 14}" y1="${chin}" x2="${fx + fw + 14}" y2="${chin}" stroke="#D97706" stroke-width="3" stroke-dasharray="10 7"/>
  <line x1="${fx - 14}" y1="${eye}" x2="${fx + fw + 14}" y2="${eye}" stroke="#16A34A" stroke-width="3" stroke-dasharray="4 6"/>
</svg>`;
}

export const GET: APIRoute = ({ params, props }) => {
  const lang = (params as { lang: ActiveLang }).lang;
  const { entry } = props as { entry: CatalogEntry };
  if (!HAVE_FONTS) {
    // The build runs from the project root; the bundled module does not sit next to public/.
    return new Response(new Uint8Array(readFileSync(`${process.cwd()}/public/og.png`)), { headers: { "content-type": "image/png" } });
  }
  const { Resvg } = createRequire(import.meta.url)("@resvg/resvg-js") as typeof import("@resvg/resvg-js");
  const png = new Resvg(card(entry, lang), { font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: "Arial" } })
    .render()
    .asPng();
  return new Response(new Uint8Array(png), { headers: { "content-type": "image/png" } });
};
