import type { ActiveLang } from "./locales";

/**
 * Dated status notices: something an authority (or a court) did this month that changes when
 * or how the photo gets used.
 *
 * Kept apart from the catalogue because a notice expires and a specification does not. Each one
 * carries `until`, and a build after that date simply stops drawing it — a stale "registration
 * opens on…" banner is worse than none. The text is per language and partial on purpose: a
 * notice appears only where someone it concerns reads (India and mainland China are not
 * eligible for the DV lottery, so there is no Hindi or Chinese copy).
 */
export interface NoticeText {
  title: string;
  body: string;
  /** link text for the primary source */
  sourceLabel: string;
}

export interface Notice {
  id: string;
  docs: { country: string; doc: string }[];
  /** last day (inclusive) the notice is drawn, ISO date */
  until: string;
  source: string;
  /** the one official place to act */
  official: { label: string; url: string };
  checked: string;
  text: Partial<Record<ActiveLang, NoticeText>>;
}

export const NOTICES: Notice[] = [
  {
    // Red Eagle Law, L.C. v. Rubio, 3:26-cv-04738-JO-VET (S.D. Cal.), Dkt. 21, 14 Oct 2026.
    // The $1 fee: 90 FR, 2025-17851. The passport scan: 91 FR, 2026-04737, effective 10 Apr 2026.
    // Dkt. 23, same day: the parties' joint motion moved every deadline by two weeks (29 Oct, 1 Nov, 3 Dec).
    id: "dv-2027-court-order",
    docs: [{ country: "united-states", doc: "dv-lottery" }],
    until: "2026-12-03",
    source:
      "https://storage.courtlistener.com/recap/gov.uscourts.casd.867598/gov.uscourts.casd.867598.23.0.pdf",
    official: { label: "dvprogram.state.gov", url: "https://dvprogram.state.gov/" },
    checked: "2026-10-19",
    text: {
      en: {
        title: "DV-2027 will run: a court ordered registration to open by 1 November",
        body:
          "On 14 October 2026 a federal court ordered the State Department to announce the DV-2027 " +
          "dates by 29 October, open entries by 1 November for 30 days, and notify selectees by " +
          "3 December. The court can still move these dates. Two things are new this year: entry " +
          "costs $1, and besides the photo you upload a scan of your passport's biographic and " +
          "signature page. The photo must be taken within the last six months.",
        sourceLabel: "Court order (Red Eagle Law v. Rubio)",
      },
      ru: {
        title: "Лотерея DV-2027 состоится: суд обязал открыть регистрацию до 1 ноября",
        body:
          "14 октября 2026 года федеральный суд обязал Госдеп объявить даты DV-2027 до 29 октября, " +
          "открыть приём заявок до 1 ноября на 30 дней и уведомить победителей до 3 декабря. " +
          "Суд может сдвинуть эти сроки. Нового в этом году два: участие стоит $1, и кроме фото " +
          "загружается скан паспорта (страница с данными и подписью). Фото должно быть сделано " +
          "не раньше чем за шесть месяцев. Заявку подают только на официальном сайте, посредник для этого не нужен.",
        sourceLabel: "Решение суда (Red Eagle Law v. Rubio)",
      },
      ar: {
        title: "قرعة DV-2027 ستُجرى: محكمة أمرت بفتح التسجيل قبل 1 نوفمبر",
        body:
          "في 14 أكتوبر 2026 أمرت محكمة فدرالية وزارة الخارجية الأمريكية بإعلان مواعيد DV-2027 قبل " +
          "29 أكتوبر، وفتح التسجيل قبل 1 نوفمبر لمدة 30 يومًا، وإبلاغ الفائزين قبل 3 ديسمبر. " +
          "قد تعدّل المحكمة هذه المواعيد. الجديد هذا العام: رسوم التسجيل 1 دولار، ومع الصورة يُرفع " +
          "مسح لصفحة البيانات وصفحة التوقيع في جواز السفر. يجب أن تكون الصورة ملتقطة خلال آخر ستة أشهر.",
        sourceLabel: "أمر المحكمة (Red Eagle Law v. Rubio)",
      },
      fr: {
        title: "La loterie DV-2027 aura lieu : un tribunal impose l'ouverture avant le 1er novembre",
        body:
          "Le 14 octobre 2026, un tribunal fédéral a ordonné au Département d'État d'annoncer les " +
          "dates de la DV-2027 avant le 29 octobre, d'ouvrir les inscriptions avant le 1er novembre " +
          "pour 30 jours et de prévenir les gagnants avant le 3 décembre. Le tribunal peut encore " +
          "modifier ces dates. Deux nouveautés : l'inscription coûte 1 $, et en plus de la photo on " +
          "téléverse un scan de la page d'identité et de la page de signature du passeport. La photo " +
          "doit dater de moins de six mois.",
        sourceLabel: "Décision du tribunal (Red Eagle Law v. Rubio)",
      },
      tr: {
        title: "DV-2027 yapılacak: mahkeme başvuruların 1 Kasım'a kadar açılmasını emretti",
        body:
          "14 Ekim 2026'da bir federal mahkeme, Dışişleri Bakanlığı'na DV-2027 tarihlerini 29 Ekim'e " +
          "kadar duyurmasını, başvuruları 1 Kasım'a kadar 30 günlüğüne açmasını ve kazananları " +
          "3 Aralık'a kadar bildirmesini emretti. Mahkeme bu tarihleri değiştirebilir. Bu yıl iki " +
          "yenilik var: başvuru 1 dolar, ve fotoğrafın yanında pasaportun kimlik ve imza sayfasının " +
          "taraması yükleniyor. Fotoğraf son altı ay içinde çekilmiş olmalı.",
        sourceLabel: "Mahkeme kararı (Red Eagle Law v. Rubio)",
      },
      es: {
        title: "La lotería DV-2027 se hará: un tribunal ordenó abrir el registro antes del 1 de noviembre",
        body:
          "El 14 de octubre de 2026 un tribunal federal ordenó al Departamento de Estado anunciar las " +
          "fechas de la DV-2027 antes del 29 de octubre, abrir el registro antes del 1 de noviembre " +
          "durante 30 días y notificar a los seleccionados antes del 3 de diciembre. El tribunal aún " +
          "puede mover estas fechas. Dos novedades: inscribirse cuesta 1 dólar, y además de la foto se " +
          "sube un escaneo de la página de datos y la de firma del pasaporte. La foto debe tener menos " +
          "de seis meses.",
        sourceLabel: "Orden del tribunal (Red Eagle Law v. Rubio)",
      },
      pt: {
        title: "A loteria DV-2027 vai acontecer: tribunal mandou abrir o registro até 1º de novembro",
        body:
          "Em 14 de outubro de 2026 um tribunal federal ordenou ao Departamento de Estado anunciar as " +
          "datas da DV-2027 até 29 de outubro, abrir as inscrições até 1º de novembro por 30 dias e " +
          "notificar os selecionados até 3 de dezembro. O tribunal ainda pode mudar essas datas. Duas " +
          "novidades: a inscrição custa US$ 1, e além da foto envia-se um escaneamento da página de " +
          "dados e da página de assinatura do passaporte. A foto deve ter sido tirada nos últimos seis meses.",
        sourceLabel: "Decisão do tribunal (Red Eagle Law v. Rubio)",
      },
    },
  },
];

/** The live notice for a document in a language, if any. `today` is the build date. */
export function noticeFor(
  country: string,
  doc: string,
  lang: ActiveLang,
  today: string = new Date().toISOString().slice(0, 10),
): (Notice & { copy: NoticeText }) | undefined {
  for (const n of NOTICES) {
    if (today > n.until) continue;
    if (!n.docs.some((d) => d.country === country && d.doc === doc)) continue;
    const copy = n.text[lang];
    if (copy) return { ...n, copy };
  }
  return undefined;
}
