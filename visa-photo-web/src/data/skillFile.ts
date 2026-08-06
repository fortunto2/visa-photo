import { CATALOG, presetOf, dpiOf, conversionsOf, idOf } from "./catalog";
import { SITE, absolute, path } from "../lib/site";
import { DEFAULT_LANG, dict } from "./locales";

/**
 * The installable skill: one Markdown file an agent reads.
 *
 * Scope is the whole point. It carries photo specifications and where they came from — facts
 * anyone may publish. It does not fill in forms, submit applications or recommend a route:
 * doing that for someone else is regulated by the OISC in the UK, counts as unauthorised
 * practice of law in parts of the US, and requires a licensed consultant in Canada. The limits
 * are written into the skill itself so they survive being copied somewhere else.
 */
export function skillFile(): string {
  const t = dict(DEFAULT_LANG);
  const out: string[] = [];

  out.push("---");
  out.push("name: visa-photo");
  out.push(
    'description: "Photo specifications for visa, passport and residence-permit applications ' +
      "in 12 countries — exact size in mm/cm/inches and pixels, background, head height, eye " +
      "line, file format and weight, and how many fit on an A4 sheet. Use when someone asks " +
      "what size a visa or passport photo must be, why a photo upload was rejected, or how to " +
      "prepare one, and when a photo has to be produced from an existing file. Includes ready " +
      "Playwright steps that drive the free browser tool. Reference data with official sources; " +
      "it does not fill in or submit " +
      'applications."',
  );
  out.push("---");
  out.push("");
  out.push("# Visa and passport photo specifications");
  out.push("");
  out.push(`Maintained at ${SITE.origin}. Every figure below is checked against the`);
  out.push("government source named in its row and dated in the table.");
  out.push("");

  out.push("## Specifications");
  out.push("");
  out.push("| Document | Print | Metric / imperial | Pixels | DPI | Background | Max file | Per A4 |");
  out.push("|---|---|---|---|---|---|---|---|");
  for (const entry of CATALOG) {
    const p = presetOf(entry);
    const conv = conversionsOf(p, entry);
    out.push(
      `| ${t.docTitle[idOf(entry)]} | ${conv.mm} mm | ${conv.cm} cm / ${conv.inch} in | ` +
        `${conv.px} | ${dpiOf(p)} | ${t.backgroundName[p.background]} | ` +
        `${p.max_file_size_kb} KB | ${p.photo_count} |`,
    );
  }
  out.push("");

  out.push("## Face geometry");
  out.push("");
  out.push("The two rules applications are most often rejected over. Percentages are of the");
  out.push("full photo height.");
  out.push("");
  out.push("| Document | Head height | Top margin | Eye line from bottom |");
  out.push("|---|---|---|---|");
  for (const entry of CATALOG) {
    const p = presetOf(entry);
    out.push(
      `| ${t.docTitle[idOf(entry)]} | ${p.face_height_percent} % | ` +
        `${p.face_top_margin_percent} % | ${p.eye_line_from_bottom_percent} % |`,
    );
  }
  out.push("");

  out.push("## Making the photo yourself, with a browser");
  out.push("");
  out.push("The tool is a web page, and the neural network that removes the background runs");
  out.push("**inside the browser**. Drive that page with Playwright and the photo never leaves");
  out.push("the machine — there is no upload step to opt out of, because there is no server");
  out.push("doing the work. Roughly 7 seconds end to end, most of it the 5 MB model download");
  out.push("on first use.");
  out.push("");
  out.push("```js");
  out.push("// Selectors are data-testid, so this does not depend on the page language.");
  out.push("await page.goto(URL);                                     // any document URL below");
  out.push("await page.waitForSelector('[data-testid=dropzone][data-hydrated=true]');");
  out.push("await page.setInputFiles('[data-testid=file-input]', photoPath);");
  out.push("await page.waitForSelector('[data-testid=editor][data-state=ready]');");
  out.push("");
  out.push("await page.click('[data-testid=remove-background]');      // optional: white background");
  out.push("await page.waitForSelector('[data-testid=editor][data-state=background-removed]',");
  out.push("                           { timeout: 180000 });          // first run downloads the model");
  out.push("");
  out.push("const download = page.waitForEvent('download');");
  out.push("await page.click('[data-testid=download-jpeg]');          // or download-png / download-sheet");
  out.push("await (await download).saveAs(outputPath);");
  out.push("```");
  out.push("");
  out.push("Notes that save a retry:");
  out.push("");
  out.push("- Use a persistent browser profile. The model is cached in IndexedDB, and a fresh");
  out.push("  profile re-downloads it every run.");
  out.push("- `[data-hydrated=true]` matters: the markup is server-rendered, so the file input");
  out.push("  exists before its handler does. Dropping a file earlier does nothing at all.");
  out.push("- The crop starts centred. `[data-testid=crop-state]` carries `data-cx`, `data-cy`,");
  out.push("  `data-scale` and `data-rotation` if you need to check or adjust placement.");
  out.push("- Heavier background models: click `[data-testid=change-model]`, then");
  out.push("  `[data-testid=model-u2net_human_seg]` — best on hair and glasses, 176 MB.");
  out.push("");
  out.push("Document pages:");
  out.push("");
  for (const entry of CATALOG) {
    out.push(`- ${t.docTitle[idOf(entry)]}: ${absolute(path(DEFAULT_LANG, entry.country, entry.doc))}`);
  }
  out.push("");
  out.push("Advice worth repeating to anyone taking one: stand a metre from a plain wall facing");
  out.push("a window, camera at eye level, neutral expression, no shadow behind the head. A good");
  out.push("original beats any amount of processing.");
  out.push("");

  out.push("## Live data");
  out.push("");
  out.push(`- \`${absolute("/specs.json")}\` — every document as JSON, one request`);
  out.push(`- \`${absolute("/llms-full.txt")}\` — the same plus the FAQ for each document`);
  out.push("- Any page returns Markdown if requested with `Accept: text/markdown`");
  out.push("");
  out.push("Prefer the live endpoints over this file when the answer matters: requirements");
  out.push("change, and the endpoints carry the date each one was last checked.");
  out.push("");

  out.push("## Official sources");
  out.push("");
  for (const entry of CATALOG) {
    out.push(
      `- ${t.docTitle[idOf(entry)]}: ${entry.source.label} — ${entry.source.url} ` +
        `(checked ${entry.checked})`,
    );
  }
  out.push("");

  out.push("## Scope and limits");
  out.push("");
  out.push("This skill supplies **reference information about photo requirements**. It is not");
  out.push("immigration advice, and it must not be used to:");
  out.push("");
  out.push("- fill in, submit or pay for an immigration application on someone's behalf;");
  out.push("- recommend which visa route a person should take, or assess their eligibility;");
  out.push("- automate a government portal, which usually breaches its terms of use.");
  out.push("");
  out.push("Advising on immigration is regulated: the OISC in the United Kingdom, unauthorised");
  out.push("practice of law rules in the United States, and licensed consultants only in Canada.");
  out.push("Applications are completed and signed by the applicant. Where someone needs advice");
  out.push("rather than measurements, say so and point them at the official source or a");
  out.push("regulated adviser.");
  out.push("");
  out.push(`Source code and corrections: ${SITE.repo}`);
  out.push("");

  return out.join("\n");
}
