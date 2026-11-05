/**
 * The one message a notify list exists for (src/notify.ts keeps the list).
 *
 * Nothing goes out until a row in `notify_sends` says so. On the day the State Department
 * announces the DV-2027 dates, one command starts it:
 *
 *   npx wrangler d1 execute visayes-leads --remote --command \
 *     "INSERT INTO notify_sends (topic, opens, closes) VALUES ('dv-2027', '2027-MM-DD', '2027-MM-DD')"
 *
 * From then on the hourly cron mails everyone on that topic who has not had it, a batch per run,
 * in the language of the page they signed up on. An address is marked the moment its mail is
 * accepted, so a run that dies halfway sends nobody twice. An address Cloudflare refuses for
 * itself (malformed, suppressed, bounced) is marked with the reason and skipped; any other refusal
 * (daily quota, rate limit, sending not enabled) ends the run, and the next hour carries on.
 *
 * Sending to addresses outside the account needs Cloudflare Email Sending on visayes.app: the
 * Workers Paid plan and `npx wrangler email sending enable visayes.app`. Without it every send is
 * refused, the run stops at the first address, and nobody is marked.
 */

export interface DueSend {
  topic: string;
  /** YYYY-MM-DD, as announced. */
  opens: string;
  closes: string;
}

interface Recipient {
  id: number;
  email: string;
  lang: string;
  token: string;
}

interface Mail {
  subject: string;
  text: string;
}

interface MailParts {
  opens: string;
  closes: string;
  check: string;
  unsubscribe: string;
}

/** Addresses per cron run: each costs a send and an update, well inside a Worker's subrequests. */
export const BATCH = 100;

/** Who the message is from, and where a reply goes (the address the privacy page gives). */
const FROM = { email: "hello@visayes.app", name: "visayes" };
const REPLY_TO = "info@superduperai.co";

/** Refusals about one address; anything else is about the account and stops the run. */
const PER_ADDRESS = new Set(["E_VALIDATION_ERROR", "E_RECIPIENT_SUPPRESSED", "E_DELIVERY_FAILED"]);

/** The DV-2027 message in every language its notice is shown in; anything else gets English. */
const DV_2027: Record<string, (p: MailParts) => Mail> = {
  en: (p) => ({
    subject: `DV-2027 entries are open: ${p.opens} to ${p.closes}`,
    text: `You asked visayes to write once when DV-2027 opens. The State Department has announced the dates: entries are accepted from ${p.opens} to ${p.closes}.

Enter only at https://dvprogram.state.gov, the State Department's own site.

If you still need the photo, this page checks it against the lottery rules in your browser, without uploading it:
${p.check}

That was the one message. Your address will be deleted within 30 days. To delete it now: ${p.unsubscribe}`,
  }),
  ru: (p) => ({
    subject: `Регистрация DV-2027 открыта: с ${p.opens} по ${p.closes}`,
    text: `Вы просили visayes написать один раз, когда откроют DV-2027. Госдеп объявил даты: заявки принимают с ${p.opens} по ${p.closes}.

Подавайте только на https://dvprogram.state.gov, это сайт самого Госдепа.

Если фото ещё нет или вы в нём не уверены, эта страница проверит его по правилам лотереи прямо в браузере, ничего не загружая:
${p.check}

Это было то самое одно письмо. Адрес удалится в течение 30 дней. Удалить сейчас: ${p.unsubscribe}`,
  }),
  fr: (p) => ({
    subject: `Inscriptions DV-2027 ouvertes : du ${p.opens} au ${p.closes}`,
    text: `Vous avez demandé à visayes de vous écrire une fois, à l'ouverture de la DV-2027. Le Département d'État a annoncé les dates : les inscriptions sont acceptées du ${p.opens} au ${p.closes}.

Inscrivez-vous uniquement sur https://dvprogram.state.gov, le site du Département d'État lui-même.

S'il vous faut encore la photo, cette page la vérifie selon les règles de la loterie dans votre navigateur, sans l'envoyer :
${p.check}

C'était l'unique message. Votre adresse sera supprimée sous 30 jours. Pour la supprimer maintenant : ${p.unsubscribe}`,
  }),
  es: (p) => ({
    subject: `Inscripción DV-2027 abierta: del ${p.opens} al ${p.closes}`,
    text: `Pidió a visayes que le escribiera una vez cuando abriera la DV-2027. El Departamento de Estado anunció las fechas: las solicitudes se aceptan del ${p.opens} al ${p.closes}.

Inscríbase solo en https://dvprogram.state.gov, el sitio del propio Departamento de Estado.

Si aún necesita la foto, esta página la revisa según las reglas de la lotería en su navegador, sin subirla:
${p.check}

Este era el único mensaje. Su dirección se borrará en un plazo de 30 días. Para borrarla ahora: ${p.unsubscribe}`,
  }),
  pt: (p) => ({
    subject: `Inscrições DV-2027 abertas: de ${p.opens} a ${p.closes}`,
    text: `Você pediu ao visayes que escrevesse uma vez quando a DV-2027 abrisse. O Departamento de Estado anunciou as datas: as inscrições são aceitas de ${p.opens} a ${p.closes}.

Inscreva-se apenas em https://dvprogram.state.gov, o site do próprio Departamento de Estado.

Se ainda precisa da foto, esta página a verifica pelas regras da loteria no seu navegador, sem enviá-la:
${p.check}

Esta era a única mensagem. Seu endereço será apagado em até 30 dias. Para apagá-lo agora: ${p.unsubscribe}`,
  }),
  tr: (p) => ({
    subject: `DV-2027 başvuruları açıldı: ${p.opens} - ${p.closes}`,
    text: `DV-2027 açıldığında size bir kez yazmamızı istemiştiniz. ABD Dışişleri Bakanlığı tarihleri açıkladı: başvurular ${p.opens} ile ${p.closes} arasında kabul ediliyor.

Yalnızca https://dvprogram.state.gov üzerinden başvurun; bu, Bakanlığın kendi sitesidir.

Fotoğrafa hâlâ ihtiyacınız varsa bu sayfa onu lotarya kurallarına göre tarayıcınızda, hiçbir yere yüklemeden kontrol eder:
${p.check}

Tek mesaj buydu. Adresiniz 30 gün içinde silinecek. Hemen silmek için: ${p.unsubscribe}`,
  }),
  ar: (p) => ({
    subject: `فُتح التسجيل في DV-2027: من ${p.opens} إلى ${p.closes}`,
    text: `طلبتَ من visayes أن نراسلك مرة واحدة عند فتح DV-2027. أعلنت وزارة الخارجية الأمريكية المواعيد: تُقبل الطلبات من ${p.opens} إلى ${p.closes}.

قدّم طلبك فقط عبر https://dvprogram.state.gov، وهو موقع وزارة الخارجية نفسها.

إذا كنت لا تزال بحاجة إلى الصورة، فهذه الصفحة تفحصها وفق شروط القرعة داخل متصفحك دون رفعها:
${p.check}

كانت هذه الرسالة الوحيدة. سيُحذف عنوانك خلال 30 يومًا. لحذفه الآن: ${p.unsubscribe}`,
  }),
};

const TEMPLATES: Record<string, Record<string, (p: MailParts) => Mail>> = { "dv-2027": DV_2027 };

/** A calendar date in the reader's language, or null when it is not YYYY-MM-DD. */
export function formatDate(iso: string, lang: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso) return null;
  return new Intl.DateTimeFormat(lang, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
}

/** The message one subscriber gets, or null when the topic has no text or a date is malformed. */
export function composeMail(send: DueSend, r: Recipient, origin: string): Mail | null {
  const forTopic = TEMPLATES[send.topic];
  if (!forTopic) return null;
  const lang = forTopic[r.lang] ? r.lang : "en";
  const opens = formatDate(send.opens, lang);
  const closes = formatDate(send.closes, lang);
  if (!opens || !closes) return null;
  // Always the checker in the message's language: the page they signed up on may be the spec page,
  // which states the rules but checks nothing, and the message promises a check.
  const check = `${origin}/${lang}/united-states/dv-lottery/check/`;
  return forTopic[lang]({ opens, closes, check, unsubscribe: unsubscribeUrl(origin, r.token) });
}

export function unsubscribeUrl(origin: string, token: string): string {
  return `${origin}/api/notify?unsubscribe=${token}`;
}

/** Mails the next batch for every started topic. Called from the hourly cron. */
export async function sendDue(env: Env): Promise<void> {
  const { results: sends } = await env.DB.prepare("SELECT topic, opens, closes FROM notify_sends").all<DueSend>();
  for (const send of sends) {
    const { results } = await env.DB.prepare(
      "SELECT id, email, lang, token FROM subscribers WHERE topic = ?1 AND notified_at IS NULL ORDER BY id LIMIT ?2",
    )
      .bind(send.topic, BATCH)
      .all<Recipient>();

    for (const r of results) {
      const mail = composeMail(send, r, env.ALLOWED_ORIGIN);
      if (!mail) {
        console.error(`notify ${send.topic}: no message for it (topic text, or dates ${send.opens}..${send.closes})`);
        break;
      }
      let error: string | null = null;
      try {
        await env.EMAIL.send({
          from: FROM,
          to: r.email,
          replyTo: REPLY_TO,
          subject: mail.subject,
          text: mail.text,
          headers: {
            "List-Unsubscribe": `<${unsubscribeUrl(env.ALLOWED_ORIGIN, r.token)}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            "Auto-Submitted": "auto-generated",
          },
        });
      } catch (e) {
        const err = e as { code?: string; message?: string };
        if (!PER_ADDRESS.has(err.code ?? "")) {
          console.error(`notify ${send.topic}: stopped at subscriber ${r.id}: ${err.code ?? "error"}: ${err.message ?? String(e)}`);
          return;
        }
        error = `${err.code}: ${err.message ?? ""}`.slice(0, 300);
      }
      // Marked either way: a refused address is done too, and the 30-day deletion covers it.
      await env.DB.prepare(
        "UPDATE subscribers SET notified_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), notify_error = ?1 WHERE id = ?2",
      )
        .bind(error, r.id)
        .run();
    }
  }
}
