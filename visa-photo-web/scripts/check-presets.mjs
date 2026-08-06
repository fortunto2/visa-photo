import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Catches a preset that disagrees with itself.
 *
 * A preset states a pixel size and, usually, a physical one. If those two describe different
 * shapes, the file we hand someone cannot be both: printed at the stated millimetres it is
 * stretched or cropped, and the page shows two sizes that are not the same photo.
 *
 * This is not hypothetical. Raising the 35x45 family to 600x750 to clear the UK's published
 * minimum quietly gave five other countries a 4:5 file for a 7:9 print, and nothing said so
 * for weeks. The registry is the single source of truth, so it has to be checked against
 * itself rather than trusted.
 *
 * Where an authority genuinely publishes both — a digital minimum for the upload and a
 * different print size for the paper route — the answer is to drop the print size and say so
 * in the note, not to pretend one file serves both.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const toml = readFileSync(join(root, "..", "presets.toml"), "utf8");

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
}

/** Under a percent is rounding; above it is two different shapes. */
const TOLERANCE = 1;

const problems = [];
for (const [key, p] of Object.entries(presets)) {
  if (!p.digital_width || !p.digital_height) continue;

  if (p.print_width_mm || p.print_height_mm) {
    if (!p.print_width_mm || !p.print_height_mm) {
      problems.push(`${key}: has one print dimension without the other`);
      continue;
    }
    const digital = p.digital_width / p.digital_height;
    const print = p.print_width_mm / p.print_height_mm;
    const off = (Math.abs(digital - print) / print) * 100;
    if (off > TOLERANCE) {
      problems.push(
        `${key}: ${p.digital_width}x${p.digital_height} is ${digital.toFixed(3)}, ` +
          `but ${p.print_width_mm}x${p.print_height_mm} mm is ${print.toFixed(3)} — ${off.toFixed(1)} % apart`,
      );
    }
  }

  if (p.min_file_size_kb && p.max_file_size_kb && p.min_file_size_kb > p.max_file_size_kb) {
    problems.push(`${key}: minimum file size is above the maximum`);
  }
  if (p.face_height_percent && p.face_top_margin_percent) {
    const chin = p.face_top_margin_percent + p.face_height_percent;
    if (chin > 100) problems.push(`${key}: head starts at ${p.face_top_margin_percent} % and is ${p.face_height_percent} % tall, which puts the chin past the bottom edge`);
  }
}

if (problems.length) {
  console.error("presets.toml disagrees with itself:");
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log("check-presets: every preset's pixel size and print size describe the same shape");
