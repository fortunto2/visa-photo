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
