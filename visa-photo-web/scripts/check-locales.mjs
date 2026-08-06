import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Catches numbers in translated prose that no longer match the data.
 *
 * The failure this exists for is quiet. A locale writes "35 × 45 mm" into a sentence, the
 * preset later changes, and the page now states two different sizes — one in the spec table
 * from presets.toml, one in the paragraph above it. With two languages someone might notice.
 * With nine, nobody is proofreading Hindi against Portuguese, and the wrong number is the one
 * a reader will act on.
 *
 * So: every number written into a per-document string has to be one the preset can produce.
 * Anything else is either a typo or a fact that moved, and both should stop the build rather
 * than ship. Numbers that are derived rather than stored — centimetres, inches, dpi, the head
 * in millimetres — count as produced, because they are the same fact in other units.
 */

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

/** Small integers are counts and calendar words ("2 photos", "6 months"), not measurements. */
const SMALL = 12;

function parsePresets(toml) {
  const presets = {};
  let current = null;
  for (const line of toml.split("\n")) {
    const header = line.match(/^\[([a-z_0-9]+)\]/);
    if (header) {
      current = {};
      presets[header[1]] = current;
      continue;
    }
    const pair = line.match(/^([a-z_]+)\s*=\s*([0-9.]+)\s*$/);
    if (pair && current) current[pair[1]] = Number(pair[2]);
    const note = line.match(/^notes\s*=\s*"(.*)"\s*$/);
    if (note && current) current.__notes = note[1];
  }
  return presets;
}

/** Every number this preset can legitimately put on a page, in any unit. */
function allowedNumbers(p) {
  const out = new Set();
  const add = (n) => {
    if (!Number.isFinite(n)) return;
    out.add(Math.round(n));
    out.add(Math.round(n * 10) / 10);
    out.add(Math.round(n * 100) / 100);
  };
  for (const v of Object.values(p)) if (typeof v === "number") add(v);

  /**
   * The published ranges — "head 31-36 mm", "50-69 % of the height" — are not stored as
   * fields, only as prose in the preset's own note. That note is English and there is exactly
   * one of it, so treating its numbers as canonical is what ties nine translations to a single
   * source: a locale may restate 31-36, and may not invent 31-38.
   */
  for (const raw of (p.__notes ?? "").match(/\d+(?:\.\d+)?/g) ?? []) add(Number(raw));

  add(p.print_width_mm / 10);              // cm
  add(p.print_height_mm / 10);
  add(p.print_width_mm / 25.4);            // inches
  add(p.print_height_mm / 25.4);
  add((p.digital_width / p.print_width_mm) * 25.4); // dpi
  add((p.face_height_percent / 100) * p.print_height_mm); // head, mm
  add(p.max_file_size_kb / 1024);          // MB
  if (p.min_file_size_kb) add(p.min_file_size_kb / 1024);

  // The same measurement in the other unit system still refers to the same fact: a note
  // reading "head 1 to 1.375 inch" and a translation reading "25-35 mm" do not disagree.
  for (const n of [...out]) {
    add(n * 25.4);
    add(n / 25.4);
  }
  return out;
}

const presets = parsePresets(readFileSync(join(root, "..", "presets.toml"), "utf8"));

/** Form numbers (DS-160, DS-11) are names, and they live in the catalogue. */
const catalog = readFileSync(join(root, "src/data/catalog.ts"), "utf8");
const formNumbers = new Set(
  (catalog.match(/name: "[^"]*"/g) ?? []).flatMap((m) => m.match(/\d+/g) ?? []).map(Number),
);
const BLOCKS = ["docNotes", "pageTitle", "docTitle", "docShort", "country"];

const problems = [];
for (const file of readdirSync(join(root, "src/data/locales"))) {
  if (!file.endsWith(".ts") || file === "index.ts") continue;
  const lang = file.replace(".ts", "");
  const src = readFileSync(join(root, "src/data/locales", file), "utf8");

  let block = null;
  for (const line of src.split("\n")) {
    const head = line.match(/^  ([a-zA-Z]+): \{/);
    if (head) {
      block = BLOCKS.includes(head[1]) ? head[1] : null;
      continue;
    }
    if (/^  \},/.test(line)) block = null;
    if (!block) continue;

    const entry = line.match(/^\s{4}([a-z_0-9]+):\s*"(.*)",?\s*$/);
    if (!entry) continue;
    const [, key, text] = entry;
    const preset = presets[key];
    if (!preset) continue;

    const allowed = allowedNumbers(preset);
    for (const raw of text.match(/\d+(?:[.,]\d+)?/g) ?? []) {
      const n = Number(raw.replace(",", "."));
      if (n <= SMALL || allowed.has(n) || allowed.has(Math.round(n)) || formNumbers.has(n)) continue;
      problems.push(`${lang}.${block}.${key}: "${raw}" is not a number ${key} can produce`);
    }
  }
}

if (problems.length) {
  console.error("locale facts drifted from presets.toml:");
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log(`check-locales: numbers in every locale still match presets.toml`);
