#!/bin/bash
# Wrapper for the launchd agent.
#
# launchd starts with almost no PATH — not the shell's, not the login one — so node and uv are
# invisible to it unless said outright. Keeping that here rather than in the plist means the
# schedule and the environment are fixed in one place, and the script stays runnable by hand.
set -uo pipefail

export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"

REPO="$HOME/startups/active/visa_photo/visa-photo-web"
LOG="$HOME/startups/active/visa_photo/docs/seo/watch.log"

mkdir -p "$(dirname "$LOG")"

{
  echo "──────── $(date '+%Y-%m-%d %H:%M %Z')"
  cd "$REPO" || { echo "repo missing: $REPO"; exit 1; }
  # Never fails the job: a quiet day and a broken network should both leave a readable line
  # rather than a launchd error nobody sees.
  node scripts/seo-watch.mjs 2>&1 || echo "seo-watch exited $?"
  echo ""
} >> "$LOG" 2>&1

# Keep the log from growing without bound; a year of daily runs is a few hundred KB, but the
# archive in history/ is the real record and this is only the readable trail.
if [ -f "$LOG" ] && [ "$(wc -l < "$LOG")" -gt 4000 ]; then
  tail -n 2000 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"
fi
