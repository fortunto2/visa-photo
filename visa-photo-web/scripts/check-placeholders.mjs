import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Catches a translator dropping something the code puts back at runtime.
 *
 * Two kinds of hole exist in these strings. `${...}` is interpolated by JavaScript, so losing
 * one is a compile error and TypeScript already guards it. `{mb}`, `{colour}` and `{n}` are
 * replaced by `String.replace` at the call site, and losing one of those compiles perfectly
 * and ships a page that literally reads "{n} of the checks did not pass". That is what this
 * checks: every locale must carry the same literal tokens, in the same keys, as English.
 *
 * English is the reference because it is the file every translation was made from.
 */

const here = dirname(fileURLToPath(import.meta.url));
const localeDir = join(here, "..", "src/data/locales");

/**
 * key → the {tokens} that appear under it.
 *
 * The key is found by walking back to the nearest preceding `name:` line rather than parsed
 * from the token's own line: these strings wrap, and a token often sits on a continuation line
 * that carries no key at all. The first attempt at this attributed half the file to whichever
 * nested block happened to be open.
 */
function tokensByKey(source) {
  const lines = source.split("\n");
  const found = new Map();
  for (let i = 0; i < lines.length; i++) {
    const tokens = lines[i].match(/\{(?:mb|colour|n)\}/g);
    if (!tokens) continue;
    let key = "?";
    for (let j = i; j >= 0; j--) {
      const m = lines[j].match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/);
      if (m) { key = m[1]; break; }
    }
    found.set(key, [...(found.get(key) ?? []), ...tokens].sort());
  }
  return found;
}

const reference = tokensByKey(readFileSync(join(localeDir, "en.ts"), "utf8"));
const problems = [];

for (const file of readdirSync(localeDir)) {
  if (!file.endsWith(".ts") || file === "index.ts" || file === "en.ts") continue;
  const lang = file.replace(".ts", "");
  const mine = tokensByKey(readFileSync(join(localeDir, file), "utf8"));

  for (const [key, expected] of reference) {
    const got = mine.get(key);
    if (!got) {
      problems.push(`${lang}: ${key} lost ${expected.join(" ")}`);
    } else if (got.join(" ") !== expected.join(" ")) {
      problems.push(`${lang}: ${key} has ${got.join(" ")}, English has ${expected.join(" ")}`);
    }
  }
  for (const key of mine.keys()) {
    if (!reference.has(key)) problems.push(`${lang}: ${key} has a token English does not`);
  }
}

if (problems.length) {
  console.error("placeholder tokens differ from English:");
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log("check-placeholders: every locale carries the same {tokens} as English");
