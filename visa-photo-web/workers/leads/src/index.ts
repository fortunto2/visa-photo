/**
 * Consultation requests from the visa pages: stored in D1, then mailed.
 *
 * The site itself is static and promises that nothing about a visitor leaves the tab. This is
 * the one exception, and it is opt-in: a person types a name and a contact into a form and asks
 * to be put in touch with a consultant. So the Worker keeps exactly what was typed plus the page
 * it came from, and nothing that identifies them beyond that — the rate limit counts IPs at the
 * edge and never writes one down.
 *
 * The row is written before the mail is sent. A mail that fails loses nothing: the request is in
 * the database with `email_error` set, and `make leads` lists it.
 */

import { handleChat } from "./chat";
import { handleNotify } from "./notify";
import { sendDue } from "./notify-send";

/** Set with `wrangler secret put`; kept out of wrangler.jsonc because the repo is public. */
interface Secrets {
  LEAD_TO?: string;
  LEAD_CC_US?: string;
  ANTHROPIC_API_KEY?: string;
}

type Bindings = Env & Secrets;

export interface Lead {
  name: string;
  contact: string;
  destination: string;
  /** What the page asked it to be about ("study", "dv-selected", ...), or "" from an older page. */
  topic: string;
  message: string;
  lang: string;
  page: string;
  /** The form, or a chat that turned into a request when the person typed a contact. */
  source?: "form" | "chat";
  /** The rotated hook a chat started from; only mailed, the chat row keeps it too. */
  variant?: string;
}

const LIMITS = { name: 100, contact: 200, message: 2000, page: 300 } as const;

/** The country whose requests are copied to LEAD_CC_US. */
const CC_COUNTRY = "united-states";

/** Requests older than this are deleted by the daily cron. The privacy page states the same. */
const KEEP_DAYS = 365;

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length <= max ? trimmed : null;
}

/**
 * The request body as a lead, or the name of the first field that is wrong.
 *
 * `website` is a field people never see; a bot that fills every input fills it too. That case
 * is reported as "spam" so the caller can answer 200 and store nothing — telling a bot it was
 * caught only teaches it which field to skip.
 */
export function parseLead(body: unknown): Lead | { error: string } {
  if (!body || typeof body !== "object") return { error: "body" };
  const b = body as Record<string, unknown>;

  if (typeof b.website === "string" && b.website.trim() !== "") return { error: "spam" };
  if (b.consent !== true) return { error: "consent" };

  const name = text(b.name, LIMITS.name);
  if (!name) return { error: "name" };
  const contact = text(b.contact, LIMITS.contact);
  if (!contact || contact.length < 3) return { error: "contact" };
  const destination = text(b.destination, 40);
  if (!destination || !/^[a-z-]{2,40}$/.test(destination)) return { error: "destination" };
  const topic = text(b.topic ?? "", 20);
  if (topic === null || !/^[a-z-]*$/.test(topic)) return { error: "topic" };
  const message = text(b.message ?? "", LIMITS.message);
  if (message === null) return { error: "message" };
  const lang = text(b.lang, 5);
  if (!lang || !/^[a-z]{2}$/.test(lang)) return { error: "lang" };
  const page = text(b.page ?? "", LIMITS.page);
  if (page === null || (page !== "" && !page.startsWith("/"))) return { error: "page" };

  return { name, contact, destination, topic, message, lang, page };
}

/** Who gets the mail for this lead. Everyone gets LEAD_TO; US requests also go to LEAD_CC_US. */
export function recipients(lead: Lead, env: Secrets): { to: string; cc?: string } | null {
  if (!env.LEAD_TO) return null;
  const cc = lead.destination === CC_COUNTRY && env.LEAD_CC_US ? env.LEAD_CC_US : undefined;
  return cc ? { to: env.LEAD_TO, cc } : { to: env.LEAD_TO };
}

/** Plain text: it is read in a mail client and forwarded to a partner, not rendered. */
export function mailBody(
  id: number,
  lead: Lead,
  origin: string,
  ipCountry: string | null,
  at: string,
  note?: string,
): string {
  return [
    ...(note ? [note, ""] : []),
    `Заявка на консультацию #${id}${lead.source === "chat" ? " (из чата)" : ""}`,
    "",
    `Куда: ${lead.destination}`,
    `Тема: ${lead.topic || "(нет)"}`,
    `Имя: ${lead.name}`,
    `Контакт: ${lead.contact}`,
    "",
    lead.source === "chat" ? "Переписка:" : "Вопрос:",
    lead.message || "(не написал)",
    "",
    `Язык страницы: ${lead.lang}`,
    `Страница: ${lead.page ? origin + lead.page : "(нет)"}`,
    ...(lead.variant ? [`Вариант заголовка: ${lead.variant}`] : []),
    `Страна по IP: ${ipCountry ?? "(нет)"}`,
    `Время: ${at}`,
  ].join("\n");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function describe(e: unknown): string {
  const err = e as { code?: string; message?: string };
  return `${err.code ?? "error"}: ${err.message ?? String(e)}`.slice(0, 500);
}

async function notify(env: Bindings, id: number, lead: Lead, ipCountry: string | null, at: string): Promise<void> {
  const rcpt = recipients(lead, env);
  const send = (to: { to: string; cc?: string }, note?: string) =>
    env.EMAIL.send({
      from: { email: env.LEAD_FROM, name: "visayes" },
      ...to,
      // Replying from the mail client then reaches the applicant, when they left an e-mail.
      ...(EMAIL_RE.test(lead.contact) ? { replyTo: lead.contact } : {}),
      subject: `Заявка #${id}: ${lead.destination}${lead.topic ? `/${lead.topic}` : ""}, ${lead.name}`,
      text: mailBody(id, lead, env.ALLOWED_ORIGIN, ipCountry, at, note),
    });

  let error: string | null = null;
  if (!rcpt) {
    error = "LEAD_TO is not set";
  } else {
    try {
      await send(rcpt);
    } catch (e) {
      error = describe(e);
      // One recipient Cloudflare refuses (an unverified copy address) fails the whole mail, so
      // without this the US requests would not reach LEAD_TO either. Send it alone and say why.
      if (rcpt.cc) {
        try {
          await send({ to: rcpt.to }, `Копия на ${rcpt.cc} не ушла (${error}). Перешли вручную.`);
          error = null;
        } catch (e2) {
          error = describe(e2);
        }
      }
    }
  }
  if (error) console.error(`lead ${id}: mail failed: ${error}`);
  await env.DB.prepare(
    error
      ? "UPDATE leads SET email_error = ?1 WHERE id = ?2"
      : "UPDATE leads SET emailed_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), email_error = NULL WHERE id = ?2",
  )
    .bind(error, id)
    .run();
}

async function handle(request: Request, env: Bindings, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== "POST") return json(405, { ok: false, error: "method" });

  // A form on another site posting here is the cheapest kind of spam; browsers always send Origin
  // on a cross-origin POST, so anything not from the site is refused.
  const origin = request.headers.get("origin");
  if (origin !== env.ALLOWED_ORIGIN) {
    console.warn(`refused origin: ${origin}`);
    return json(403, { ok: false, error: "origin" });
  }

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const { success } = await env.LIMITER.limit({ key: ip });
  if (!success) return json(429, { ok: false, error: "rate" });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: "body" });
  }

  const lead = parseLead(body);
  if ("error" in lead) {
    return lead.error === "spam" ? json(200, { ok: true }) : json(400, { ok: false, error: lead.error });
  }

  const id = await storeLead(env, ctx, lead, request.headers.get("cf-ipcountry"));
  return id ? json(200, { ok: true }) : json(500, { ok: false, error: "store" });
}

/** Writes the row, then mails it in the background: the visitor has nothing to wait for once it exists. */
async function storeLead(env: Bindings, ctx: ExecutionContext, lead: Lead, ipCountry: string | null): Promise<number> {
  const row = await env.DB.prepare(
    `INSERT INTO leads (name, contact, destination, topic, message, lang, page, ip_country, source)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9) RETURNING id, created_at`,
  )
    .bind(lead.name, lead.contact, lead.destination, lead.topic, lead.message, lead.lang, lead.page, ipCountry, lead.source ?? "form")
    .first<{ id: number; created_at: string }>();
  if (!row) return 0;
  ctx.waitUntil(notify(env, row.id, lead, ipCountry, row.created_at));
  return row.id;
}

/** How long an unsent request keeps being retried. A lead older than a week is cold anyway. */
const RETRY_DAYS = 7;

type Row = Lead & { id: number; ip_country: string | null; created_at: string };

export default {
  fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/chat") {
      return handleChat(request, env, (lead, ipCountry) => storeLead(env, ctx, lead, ipCountry));
    }
    if (pathname === "/api/notify") return handleNotify(request, env);
    if (pathname === "/api/lead") return handle(request, env, ctx);
    // The notify route ends in a star (see wrangler.jsonc), so other paths under it land here.
    return json(404, { ok: false, error: "path" });
  },
  /**
   * Hourly. Retries mail that did not go out — so requests that arrive while mail is broken or
   * not yet set up are delivered once it works — and deletes requests past the retention period.
   */
  async scheduled(_event, env) {
    const { results } = await env.DB.prepare(
      `SELECT id, name, contact, destination, topic, message, lang, page, ip_country, created_at, source FROM leads
       WHERE emailed_at IS NULL AND created_at > strftime('%Y-%m-%dT%H:%M:%SZ', 'now', ?1)
       ORDER BY id LIMIT 20`,
    )
      .bind(`-${RETRY_DAYS} days`)
      .all<Row>();
    for (const row of results) await notify(env, row.id, row, row.ip_country, row.created_at);

    for (const table of ["leads", "chats"]) {
      await env.DB.prepare(`DELETE FROM ${table} WHERE created_at < strftime('%Y-%m-%dT%H:%M:%SZ', 'now', ?1)`)
        .bind(`-${KEEP_DAYS} days`)
        .run();
    }
    // A notify address has done its job a month after the message went out, and waits a year at most.
    await env.DB.prepare(
      `DELETE FROM subscribers WHERE notified_at < strftime('%Y-%m-%dT%H:%M:%SZ', 'now', '-30 days')
       OR created_at < strftime('%Y-%m-%dT%H:%M:%SZ', 'now', ?1)`,
    )
      .bind(`-${KEEP_DAYS} days`)
      .run();

    // The one message per notify topic, once a row in notify_sends has started it.
    await sendDue(env);
  },
} satisfies ExportedHandler<Bindings>;
