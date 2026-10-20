import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Fails the build when two built pages share a <title>.
 *
 * Titles in most languages are generated from the country and the document's kind, so two
 * documents of one kind for one country come out word for word the same. That shipped: in
 * seven languages the DV lottery page carried the US visa title, Google kept only one of each
 * pair ("Duplicate, Google chose different canonical"), and the DV pages vanished in exactly
 * the languages DV entrants read. A locale fixes a clash by writing its own docShort/pageTitle.
 */

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");

function* pages(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* pages(full);
    else if (name === "index.html") yield full;
  }
}

const byTitle = new Map();
for (const file of pages(dist)) {
  const title = /<title>([^<]*)<\/title>/.exec(readFileSync(file, "utf8"))?.[1];
  if (!title) continue;
  const list = byTitle.get(title) ?? [];
  list.push("/" + relative(dist, dirname(file)));
  byTitle.set(title, list);
}

const clashes = [...byTitle].filter(([, list]) => list.length > 1);
if (clashes.length > 0) {
  console.error(`${clashes.length} title(s) shared by more than one page:`);
  for (const [title, list] of clashes) console.error(`  ${list.join("  ")}\n    ${title}`);
  process.exit(1);
}
console.log(`check-titles: ${byTitle.size} pages, every title unique`);
