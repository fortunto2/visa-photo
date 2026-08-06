import type { APIRoute } from "astro";
import { plain } from "../lib/bidi";
import { CATALOG, presetOf, dpiOf } from "../data/catalog";
import { SITE, absolute, path } from "../lib/site";
import { LANG_LABEL } from "../data/i18n";
import { DEFAULT_LANG, LANGS, dict } from "../data/locales";

/**
 * A map of the site written for language models.
 *
 * The specs table is inlined rather than linked: an assistant asked for a photo size should be
 * able to answer from this one file, and cite the page it came from. Anything it still needs
 * is one fetch away at /specs.json.
 */
export const GET: APIRoute = () => {
  const defaults = dict(DEFAULT_LANG);
  const lines: string[] = [];

  lines.push(`# ${SITE.name}`);
  lines.push("");
  lines.push("> Biometric photo specifications for visas, passports and residence permits,");
  lines.push("> plus a free browser tool that crops a photo to any of them.");
  lines.push("");
  lines.push("Independent site. Not a government body, and not affiliated with any consulate.");
  lines.push("Requirements change; every page names the official source it was checked against.");
  lines.push("The tool promises a photo matching the published specification. It does not");
  lines.push("promise that an application will be approved.");
  lines.push("");
  lines.push("Photos are processed in the visitor's browser using WebAssembly. Nothing is");
  lines.push(`uploaded to any server. The source code is public: ${SITE.repo}`);
  lines.push("");

  lines.push("## Machine-readable");
  lines.push("");
  lines.push(`- [All specifications as JSON](${absolute("/specs.json")}) — every document below, one fetch`);
  lines.push(`- [Full reference](${absolute("/llms-full.txt")}) — every document with all of its questions`);
  lines.push(`- [Installable skill](${absolute("/skills/visa-photo.md")}) — the specifications as an agent skill`);
  lines.push("- Any page is also served as Markdown: send `Accept: text/markdown`");
  lines.push(`- [API catalog](${absolute("/.well-known/api-catalog")})`);
  lines.push("");

  lines.push("## Languages");
  lines.push("");
  lines.push(
    LANGS.map((l) => `${LANG_LABEL[l]} (\`/${l}/\`)`).join(", ") +
      ". Every document page exists in each.",
  );
  lines.push("");

  lines.push("## Specifications");
  lines.push("");
  lines.push("| Document | Print | Digital | DPI | Background | Max file | Per sheet | Page |");
  lines.push("|---|---|---|---|---|---|---|---|");
  for (const entry of CATALOG) {
    const p = presetOf(entry);
    const title = defaults.docTitle[entry.preset] ?? entry.preset;
    const url = absolute(path(DEFAULT_LANG, entry.country, entry.doc));
    lines.push(
      `| ${title} | ${p.print_width_mm ? `${p.print_width_mm}×${p.print_height_mm} mm` : "not published"} | ` +
        `${p.digital_width}×${p.digital_height} px | ${dpiOf(p) ?? "not published"} | ${p.background} | ` +
        `${p.max_file_size_kb} KB | ${p.photo_count} | ${url} |`,
    );
  }
  lines.push("");

  lines.push("## Face geometry");
  lines.push("");
  lines.push("Head height and eye line are the two rules applications are rejected over.");
  lines.push("Percentages are of the full photo height.");
  lines.push("");
  lines.push("| Document | Head height | Top margin | Eye line from bottom |");
  lines.push("|---|---|---|---|");
  for (const entry of CATALOG) {
    const p = presetOf(entry);
    const title = defaults.docTitle[entry.preset] ?? entry.preset;
    lines.push(
      `| ${title} | ${p.face_height_percent} % | ${p.face_top_margin_percent} % | ` +
        `${p.eye_line_from_bottom_percent} % |`,
    );
  }
  lines.push("");

  lines.push("## Sources");
  lines.push("");
  for (const entry of CATALOG) {
    const title = defaults.docTitle[entry.preset] ?? entry.preset;
    lines.push(`- ${title}: ${entry.source.label}, ${entry.source.url} (checked ${entry.checked})`);
  }
  lines.push("");

  return new Response(plain(lines.join("\n")), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
};
