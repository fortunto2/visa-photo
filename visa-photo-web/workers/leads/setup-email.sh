#!/usr/bin/env bash
# One-time: lets the visayes-leads Worker deliver mail.
#
# Without a paid Email Sending plan, a Worker on visayes.app may mail only addresses verified in
# that zone's Email Routing. This turns routing on and asks Cloudflare to verify both inboxes:
# each address gets a mail with a link, and nothing reaches it until that link is clicked.
#
# Needs a wrangler token with the email_routing scope. If `wrangler whoami` lists
# email_routing:write as missing, run `wrangler login` first.
#
# The US partner's address comes from the environment because this repo is public:
#   LEAD_CC_US=partner@example.com bash workers/leads/setup-email.sh
#
# Requests that arrived before this ran are not lost: the Worker's hourly cron retries every
# request from the last 7 days whose mail did not go out.
set -euo pipefail

: "${LEAD_CC_US:?set LEAD_CC_US to the US partner address}"
LEAD_TO="${LEAD_TO:-info@superduperai.co}"

wrangler email routing enable visayes.app
wrangler email routing addresses create "$LEAD_TO"
wrangler email routing addresses create "$LEAD_CC_US"
wrangler email routing addresses list

echo
echo "Now click the verification link in both inboxes ($LEAD_TO, $LEAD_CC_US)."
echo "Then: pnpm leads   (emailed_at fills in within the hour)"
