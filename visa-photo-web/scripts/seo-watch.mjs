#!/usr/bin/env node
/**
 * Daily Search Console watch.
 *
 * Two jobs, and the second is the reason it exists.
 *
 * First, it keeps a history. `seo monitor` overwrites one file with the latest fetch, so it can
 * tell you about yesterday and nothing else; this archives a dated copy per run, which is what
 * makes a month-over-month question answerable at all.
 *
 * Second, it stays quiet. At four clicks a week, a daily report of every wobble is noise that
 * trains you to ignore it. Nothing is printed unless a row crosses a floor that makes it worth
 * a human decision, and the floors are set where an *action* exists rather than where a number
 * merely changed.
 *
 *   node scripts/seo-watch.mjs [--site VisaYes] [--quiet]
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const HISTORY = join(HERE, "..", "..", "docs", "seo", "history");
const SNAPSHOT = join(homedir(), ".config", "seo-cli", "data", "monitor.json");
const SEO_CLI = join(homedir(), "startups", "shared", "seo-cli");

const args = process.argv.slice(2);
const SITE = args.includes("--site") ? args[args.indexOf("--site") + 1] : "VisaYes";
const QUIET = args.includes("--quiet");

/**
 * Floors, chosen so that anything reported has something to do about it.
 *
 * A query seen four times tells you nothing about its click-through rate; the position
 * attached to it is an average over too few samples to be a position at all.
 */
const MIN_IMPRESSIONS = 10;   // below this, a zero-click row is not evidence of anything
const NEARLY_THERE = [11, 25]; // ranked, but on a page nobody reaches
const REACHABLE = 20;          // "ranked and not clicked" only matters where clicking was likely

const today = new Date().toISOString().slice(0, 10);

function refresh() {
  // seo-cli owns the credentials and the fetch; this only borrows the file it leaves behind.
  execFileSync("uv", ["run", "seo", "monitor"], { cwd: SEO_CLI, stdio: "ignore" });
}

function currentQueries() {
  const all = JSON.parse(readFileSync(SNAPSHOT, "utf8"));
  return all.sites?.[SITE]?.queries ?? {};
}

function archive(queries) {
  mkdirSync(HISTORY, { recursive: true });
  const path = join(HISTORY, `${today}.json`);
  writeFileSync(path, JSON.stringify({ date: today, site: SITE, queries }, null, 2) + "\n");
  return path;
}

/** The most recent archive that is not today's, so a re-run does not compare with itself. */
function previous() {
  if (!existsSync(HISTORY)) return null;
  const files = readdirSync(HISTORY).filter((f) => f.endsWith(".json") && f !== `${today}.json`).sort();
  if (!files.length) return null;
  const prev = JSON.parse(readFileSync(join(HISTORY, files[files.length - 1]), "utf8"));
  return { date: prev.date, queries: prev.queries ?? {} };
}

/**
 * Membership rules — "new" and "lost" — only mean something when both snapshots are the whole
 * population. seo-cli used to fetch a hard 25 rows, so a young site with five hundred queries
 * returned an arbitrary twenty-five of them and a different twenty-five next time; the watcher
 * duly reported queries appearing and vanishing that had never moved in Google. If the two
 * sides are not the same order of size, one of them was truncated and only per-query
 * comparisons survive.
 */
function comparable(now, prev) {
  if (!prev) return false;
  const a = Object.keys(now).length;
  const b = Object.keys(prev.queries).length;
  if (a === 0 || b === 0) return false;
  return Math.max(a, b) / Math.min(a, b) < 2;
}

function findings(now, prev) {
  const out = [];
  const membership = comparable(now, prev);

  for (const [query, cur] of Object.entries(now)) {
    const before = prev?.queries?.[query];

    /**
     * The most useful signal this can produce: we rank where people look and they do not
     * click. That is a title or description that does not answer the query, and it is fixable
     * by editing words rather than by waiting.
     */
    if (cur.impressions >= MIN_IMPRESSIONS && cur.clicks === 0 && cur.position <= REACHABLE) {
      out.push({
        kind: "ranked-not-clicked",
        query,
        detail: `position ${cur.position}, ${cur.impressions} impressions, no clicks`,
        act: "the page ranks and the title is not earning the click — check which page it is and what the query actually asks",
      });
    }

    // Ranked, but on a page people do not reach. Worth knowing what would move it.
    if (cur.impressions >= MIN_IMPRESSIONS
      && cur.position >= NEARLY_THERE[0] && cur.position <= NEARLY_THERE[1]) {
      out.push({
        kind: "nearly-there",
        query,
        detail: `position ${cur.position}, ${cur.impressions} impressions`,
        act: "one page short — see whether any page names this query directly",
      });
    }

    // Something new that is already visible. Check the landing page matches the intent.
    if (membership && !before && cur.impressions >= MIN_IMPRESSIONS) {
      out.push({
        kind: "new",
        query,
        detail: `appeared at position ${cur.position} with ${cur.impressions} impressions`,
        act: "new query — confirm the page it lands on is the one that answers it",
      });
    }

    // A real move, not a wobble: five places, on a query with enough volume to mean it.
    if (before && cur.impressions >= MIN_IMPRESSIONS) {
      const delta = before.position - cur.position;
      if (Math.abs(delta) >= 5) {
        out.push({
          kind: delta > 0 ? "rose" : "fell",
          query,
          detail: `${before.position} → ${cur.position} since ${prev.date}`,
          act: delta > 0 ? "rising — worth seeing what else that page could answer"
                         : "falling — check the page still exists and still says what it said",
        });
      }
    }
  }

  // Anything that was being clicked and now is not — only where absence means absence.
  for (const [query, before] of (membership ? Object.entries(prev.queries) : [])) {
    if (!now[query] && before.clicks > 0) {
      out.push({
        kind: "lost",
        query,
        detail: `was position ${before.position} with ${before.clicks} clicks, now absent`,
        act: "dropped out — check indexing on the page that held it",
      });
    }
  }

  return out;
}

refresh();
const now = currentQueries();
const prev = previous();
const path = archive(now);

const totals = Object.values(now).reduce(
  (a, q) => ({ clicks: a.clicks + q.clicks, impressions: a.impressions + q.impressions }),
  { clicks: 0, impressions: 0 },
);

const items = findings(now, prev);
const skipped = prev && !comparable(now, prev);

if (!items.length) {
  if (!QUIET) {
    console.log(`seo-watch ${today}: ${Object.keys(now).length} queries, ` +
      `${totals.clicks} clicks, ${totals.impressions} impressions. Nothing over the floor.` +
      (skipped ? " (new/lost suppressed: snapshot sizes differ)" : ""));
    console.log(`archived ${path}`);
  }
  process.exit(0);
}

console.log(`seo-watch ${today} — ${SITE}`);
console.log(`${Object.keys(now).length} queries · ${totals.clicks} clicks · ${totals.impressions} impressions` +
  (prev ? ` · compared with ${prev.date}` : " · no earlier snapshot"));
if (skipped) {
  console.log("new/lost suppressed: the two snapshots are different sizes, so one was truncated");
}
console.log("");
for (const f of items) {
  console.log(`[${f.kind}] ${f.query}`);
  console.log(`    ${f.detail}`);
  console.log(`    → ${f.act}`);
}
console.log("");
console.log(`archived ${path}`);
