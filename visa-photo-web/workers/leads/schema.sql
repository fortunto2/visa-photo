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
  status      TEXT NOT NULL DEFAULT 'new',
  -- 'form' or 'chat'. Added to the live table with:
  -- ALTER TABLE leads ADD COLUMN source TEXT NOT NULL DEFAULT 'form';
  source      TEXT NOT NULL DEFAULT 'form'
);

CREATE INDEX IF NOT EXISTS leads_created ON leads (created_at);

-- Chat conversations (workers/leads/src/chat.ts). The history is kept here, not in the browser, so
-- the model only ever sees turns the Worker wrote. Deleted with the leads after a year.
CREATE TABLE IF NOT EXISTS chats (
  id                 TEXT PRIMARY KEY,
  created_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  lang               TEXT NOT NULL,
  page               TEXT NOT NULL DEFAULT '',
  country            TEXT NOT NULL DEFAULT '',
  doc                TEXT NOT NULL DEFAULT '',
  ip_country         TEXT,
  -- Anthropic MessageParam[] as JSON; assistant turns are the model's JSON answers.
  messages           TEXT NOT NULL DEFAULT '[]',
  user_turns         INTEGER NOT NULL DEFAULT 0,
  off_topic          INTEGER NOT NULL DEFAULT 0,
  input_tokens       INTEGER NOT NULL DEFAULT 0,
  output_tokens      INTEGER NOT NULL DEFAULT 0,
  cache_read_tokens  INTEGER NOT NULL DEFAULT 0,
  cache_write_tokens INTEGER NOT NULL DEFAULT 0,
  lead_id            INTEGER,
  closed             INTEGER NOT NULL DEFAULT 0,
  -- The rotated hook (1-3) the person came in through. Added with:
  -- ALTER TABLE chats ADD COLUMN variant TEXT NOT NULL DEFAULT '';
  variant            TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS chats_created ON chats (created_at);
CREATE INDEX IF NOT EXISTS chats_updated ON chats (updated_at);

-- "Tell me when it changes" (workers/leads/src/notify.ts): one row per address and notice topic.
-- Not a lead and never passed on; used for the one message, then deleted 30 days after it is sent.
CREATE TABLE IF NOT EXISTS subscribers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  email       TEXT NOT NULL,
  -- A notice's `notify` topic, e.g. "dv-2027".
  topic       TEXT NOT NULL,
  -- The language to write the message in, and the page the address was left on.
  lang        TEXT NOT NULL,
  page        TEXT NOT NULL DEFAULT '',
  -- Random; the unsubscribe link in the message is /api/notify?unsubscribe=<token>.
  token       TEXT NOT NULL UNIQUE,
  notified_at TEXT,
  -- Set with notified_at when Cloudflare refused this one address (src/notify-send.ts). Added
  -- 2026-11-05; on a database created before: ALTER TABLE subscribers ADD COLUMN notify_error TEXT;
  notify_error TEXT,
  UNIQUE (email, topic)
);

-- A row here starts the one message for a topic (src/notify-send.ts); the hourly cron sends it.
CREATE TABLE IF NOT EXISTS notify_sends (
  topic       TEXT PRIMARY KEY,
  -- YYYY-MM-DD, as the State Department announced them.
  opens       TEXT NOT NULL,
  closes      TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
