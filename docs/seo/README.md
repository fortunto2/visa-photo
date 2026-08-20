# SEO watch

`visa-photo-web/scripts/seo-watch.mjs`, run daily.

It does two things, and the second is the point.

**It keeps a history.** `seo monitor` overwrites one file with the latest fetch, so it can answer
"what changed since yesterday" and nothing else. This archives a dated copy per run into
`history/`, which is what makes a month-over-month question answerable at all. The files are
tiny — one line per query — and they are committed on purpose: the series is the asset.

**It stays quiet.** At four clicks a week, a daily report of every wobble is noise that trains
you to ignore the report. Nothing prints unless a row crosses a floor, and the floors are set
where an action exists rather than where a number moved:

| Signal | Condition | Why it is actionable |
|---|---|---|
| `ranked-not-clicked` | position ≤ 20, ≥ 10 impressions, 0 clicks | We rank where people look and they do not click — that is a title, and words can be edited today |
| `nearly-there` | position 11–25, ≥ 10 impressions | One page short; worth checking whether any page names the query directly |
| `new` | unseen before, ≥ 10 impressions | We started ranking for something — confirm the landing page answers it |
| `rose` / `fell` | position moved ≥ 5 places | A move rather than a wobble |
| `lost` | had clicks, now absent | Check indexing on the page that held it |

Ten impressions is the floor because a query seen four times says nothing about its
click-through rate, and the position attached to it is an average over too few samples to be a
position.

## The trap that already caught it

The first week of snapshots each held exactly 25 queries, and between two days a week apart only
2 of them were the same. That is not churn, it is a row limit: `seo-cli` fetched a hard 25 rows,
so a site with five hundred queries returned an arbitrary twenty-five and a different twenty-five
next time. The watcher duly reported queries as "lost" that had never moved in Google, and the
totals — 25 queries, 33 impressions — were a fifth of a per cent of the truth. The real figure
was 536 queries and 902 impressions.

Two fixes. The limit is now 1000 in seo-cli. And the membership rules here, `new` and `lost`,
are suppressed whenever the two snapshots differ in size by more than a factor of two, because
absence only means absence when both sides are the whole population.

## The trap this is built to avoid

A zero-click query is not automatically a bad title. `dv photo checker` had 17 impressions and
no clicks, and the title was already *"US DV Lottery photo (Green Card lottery) checker"* —
every word of the query, in the right order. Rewriting it would have been fixing the wrong
thing; it simply ranks too deep. Check which page ranks and what its title says before
concluding anything.

## Reading the archive

```bash
# how one query has moved
jq -r '.date + " " + (.queries["dv photo checker"].position|tostring)' history/*.json
```

## How it is scheduled

A launchd agent, `~/Library/LaunchAgents/co.superduperai.visayes.seo-watch.plist`, at 09:23
daily. Off the hour deliberately, and launchd catches up after a missed slot, so a laptop
asleep at 09:23 still gets that day rather than skipping it.

It calls `scripts/seo-watch-cron.sh` rather than node directly. launchd starts with almost no
PATH — not the shell's, not the login one — so node and uv are invisible to it unless said
outright, and keeping that in the wrapper means the schedule and the environment are fixed in
one place while the script stays runnable by hand.

Output appends to `docs/seo/watch.log`, which is gitignored: the dated files in `history/` are
the record, the log is only a readable trail.

```bash
# check it is registered
launchctl list | grep visayes

# run it now rather than waiting for 09:23
launchctl kickstart -p gui/$(id -u)/co.superduperai.visayes.seo-watch

# remove it
launchctl bootout gui/$(id -u)/co.superduperai.visayes.seo-watch
rm ~/Library/LaunchAgents/co.superduperai.visayes.seo-watch.plist
```

There is deliberately no second, session-bound schedule. One was tried and removed: it ran the
same fetch, only when a Claude session happened to be alive and idle, and produced analysis of
a file that had nothing in it yet. Analysis does not need a timer — the data is cumulative and
can be asked for at any moment:

```bash
node scripts/seo-watch.mjs          # today, against the last archived day
cd ~/startups/shared/seo-cli && uv run seo analytics --days 28
```

What genuinely has to happen on a schedule is the collecting, because a day not archived is a
day that has to be re-fetched to reconstruct. That is the whole job of the agent above.
