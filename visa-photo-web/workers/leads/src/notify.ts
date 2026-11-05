/**
 * "Tell me when it changes": an e-mail list per notice topic (src/data/notices.ts, `notify`).
 *
 * POST /api/notify {email, topic, lang, page} adds an address; GET /api/notify?unsubscribe=<token>
 * deletes it, and that link goes into the one message the list exists for. Nothing is mailed from
 * here: the message is sent by hand once the State Department announces dates, so this only
 * stores. The address is not a lead and is not passed to consultants; the privacy page says so.
 *
 * A repeated address is accepted and stored once. The answer is the same either way, so the form
 * cannot be used to learn whether someone is on the list.
 */

/** Topics a notice may collect for. Anything else is refused, so the list cannot grow by itself. */
export const NOTIFY_TOPICS = ["dv-2027"] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface Subscription {
  email: string;
  topic: string;
  lang: string;
  page: string;
}

/** The body as a subscription, or the first field that is wrong; "spam" when the trap field is filled. */
export function parseSubscription(body: unknown): Subscription | { error: string } {
  if (!body || typeof body !== "object") return { error: "body" };
  const b = body as Record<string, unknown>;
  if (typeof b.website === "string" && b.website.trim() !== "") return { error: "spam" };

  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  if (email.length > 200 || !EMAIL_RE.test(email)) return { error: "email" };
  const topic = typeof b.topic === "string" ? b.topic : "";
  if (!(NOTIFY_TOPICS as readonly string[]).includes(topic)) return { error: "topic" };
  const lang = typeof b.lang === "string" ? b.lang : "";
  if (!/^[a-z]{2}$/.test(lang)) return { error: "lang" };
  const page = typeof b.page === "string" ? b.page.slice(0, 300) : "";
  if (page !== "" && !page.startsWith("/")) return { error: "page" };
  return { email, topic, lang, page };
}

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function page(status: number, text: string): Response {
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex">` +
      `<title>visayes</title><p style="font:17px/1.5 system-ui;max-width:32em;margin:15vh auto;padding:0 20px">${text}</p>`,
    { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
  );
}

export async function handleNotify(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "GET") {
    const token = url.searchParams.get("unsubscribe") ?? "";
    if (!/^[0-9a-f]{32}$/.test(token)) return page(400, "This link is not complete.");
    await env.DB.prepare("DELETE FROM subscribers WHERE token = ?1").bind(token).run();
    // The same answer whether or not the address was still there: a second click is not an error.
    return page(200, "Your address has been deleted. You will not get any mail from visayes.");
  }
  if (request.method !== "POST") return json(405, { ok: false, error: "method" });

  if (request.headers.get("origin") !== env.ALLOWED_ORIGIN) return json(403, { ok: false, error: "origin" });
  const { success } = await env.LIMITER.limit({ key: request.headers.get("cf-connecting-ip") ?? "unknown" });
  if (!success) return json(429, { ok: false, error: "rate" });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: "body" });
  }
  const sub = parseSubscription(body);
  if ("error" in sub) return sub.error === "spam" ? json(200, { ok: true }) : json(400, { ok: false, error: sub.error });

  const token = [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");
  await env.DB.prepare(
    `INSERT INTO subscribers (email, topic, lang, page, token) VALUES (?1, ?2, ?3, ?4, ?5)
     ON CONFLICT (email, topic) DO NOTHING`,
  )
    .bind(sub.email, sub.topic, sub.lang, sub.page, token)
    .run();
  return json(200, { ok: true });
}
