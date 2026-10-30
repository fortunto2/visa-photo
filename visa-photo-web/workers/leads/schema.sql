-- Consultation requests from visa pages. One row per request; nothing else is stored.
--
-- Apply: wrangler d1 execute visayes-leads --remote --file schema.sql
-- (idempotent, safe to run again)

CREATE TABLE IF NOT EXISTS leads (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  name        TEXT NOT NULL,
  -- Whatever the person typed: an e-mail, a phone number or a Telegram handle.
  contact     TEXT NOT NULL,
  -- Catalog country slug ("united-states", "schengen", ...) or "other".
  destination TEXT NOT NULL,
  -- What the page asked it to be about ("tourist", "study", "dv-selected", ...); '' before 2026-10-29.
  -- Added to the live table with: ALTER TABLE leads ADD COLUMN topic TEXT NOT NULL DEFAULT '';
  topic       TEXT NOT NULL DEFAULT '',
  message     TEXT NOT NULL DEFAULT '',
  lang        TEXT NOT NULL,
  -- Path the form was sent from, e.g. /ru/united-states/visa/.
  page        TEXT NOT NULL DEFAULT '',
  -- Cloudflare's CF-IPCountry: where the request came from, not the person's citizenship.
  ip_country  TEXT,
  emailed_at  TEXT,
  email_error TEXT,
  -- Filled by hand when the lead is passed on: who got it, and what happened.
  partner     TEXT,
  status      TEXT NOT NULL DEFAULT 'new'
);

CREATE INDEX IF NOT EXISTS leads_created ON leads (created_at);
