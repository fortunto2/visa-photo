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
    // Red Eagle Law, LC v. Rubio, No. 26-6943 (9th Cir.): stay pending appeal granted 29 Oct 2026
    // ("Red Eagle has not shown a likelihood of success on the merits because it is not within the
    // zone of interests of the statute"). It stays the S.D. Cal. injunction of 14 Oct (3:26-cv-04738,
    // Dkt. 21, deadlines moved by Dkt. 23 to 29 Oct / 1 Nov / 3 Dec), which this notice announced
    // until then. The $1 fee: 90 FR, 2025-17851. The passport scan: 91 FR, 2026-04737.
    // Recheck by the end date: the appeal may be decided, or the State Department may announce dates.
    id: "dv-2027-stayed",
    docs: [{ country: "united-states", doc: "dv-lottery" }],
    until: "2026-12-31",
    source: "https://www.courtlistener.com/docket/74994271/red-eagle-law-lc-v-rubio/",
    official: { label: "dvprogram.state.gov", url: "https://dvprogram.state.gov/" },
    checked: "2026-10-30",
    text: {
      en: {
        title: "DV-2027 is on hold again: the appeals court paused the order to open entries",
        body:
          "On 29 October 2026 the Ninth Circuit paused the 14 October order that told the State " +
          "Department to open DV-2027 entries by 1 November, for as long as the government's appeal " +
          "runs. So entries will not open on 1 November, and there are no new dates. When they open, " +
          "it will be only at dvprogram.state.gov: entry costs $1, you upload a scan of your " +
          "passport's biographic and signature page besides the photo, and the photo must be under " +
          "six months old. Anyone taking DV-2027 entries or money before then is not the State Department.",
        sourceLabel: "Appeals court docket (Red Eagle Law v. Rubio)",
      },
      ru: {
        title: "DV-2027 снова на паузе: апелляционный суд приостановил решение об открытии регистрации",
        body:
          "29 октября 2026 года апелляционный суд девятого округа приостановил решение от 14 октября, " +
          "которое обязывало Госдеп открыть приём заявок DV-2027 до 1 ноября, на время рассмотрения " +
          "апелляции правительства. Поэтому 1 ноября регистрация не откроется, новых дат нет. Когда " +
          "откроется, то только на dvprogram.state.gov: участие стоит $1, кроме фото нужен скан " +
          "паспорта (страница с данными и подписью), фото не старше шести месяцев. Кто принимает " +
          "заявки или деньги за DV-2027 до этого, тот не Госдеп.",
        sourceLabel: "Дело в апелляционном суде (Red Eagle Law v. Rubio)",
      },
      ar: {
        title: "DV-2027 معلّقة من جديد: محكمة الاستئناف أوقفت أمر فتح التسجيل",
        body:
          "في 29 أكتوبر 2026 أوقفت محكمة الاستئناف للدائرة التاسعة أمرَ 14 أكتوبر الذي ألزم وزارة " +
          "الخارجية الأمريكية بفتح التسجيل في DV-2027 قبل 1 نوفمبر، إلى حين النظر في استئناف الحكومة. " +
          "لذلك لن يُفتح التسجيل في 1 نوفمبر، ولا توجد مواعيد جديدة. وعندما يُفتح فسيكون عبر " +
          "dvprogram.state.gov فقط: رسوم التسجيل 1 دولار، ومع الصورة يُرفع مسح لصفحة البيانات وصفحة " +
          "التوقيع في جواز السفر، ويجب ألا يزيد عمر الصورة على ستة أشهر. من يقبل طلبات أو أموالًا " +
          "لـ DV-2027 قبل ذلك ليس وزارة الخارجية.",
        sourceLabel: "ملف القضية في محكمة الاستئناف (Red Eagle Law v. Rubio)",
      },
      fr: {
        title: "La DV-2027 de nouveau suspendue : la cour d'appel a gelé l'ordre d'ouverture",
        body:
          "Le 29 octobre 2026, la cour d'appel du neuvième circuit a suspendu, le temps de l'appel du " +
          "gouvernement, la décision du 14 octobre qui obligeait le Département d'État à ouvrir les " +
          "inscriptions DV-2027 avant le 1er novembre. Les inscriptions n'ouvriront donc pas le " +
          "1er novembre, et il n'y a pas de nouvelles dates. Quand elles ouvriront, ce sera uniquement " +
          "sur dvprogram.state.gov : l'inscription coûte 1 $, il faut en plus de la photo un scan de la " +
          "page d'identité et de la page de signature du passeport, et la photo doit dater de moins de " +
          "six mois. Quiconque prend des inscriptions ou de l'argent pour la DV-2027 d'ici là n'est pas " +
          "le Département d'État.",
        sourceLabel: "Dossier à la cour d'appel (Red Eagle Law v. Rubio)",
      },
      tr: {
        title: "DV-2027 yine askıda: istinaf mahkemesi başvuruların açılması kararını durdurdu",
        body:
          "29 Ekim 2026'da Dokuzuncu Daire İstinaf Mahkemesi, Dışişleri Bakanlığı'na DV-2027 " +
          "başvurularını 1 Kasım'a kadar açmasını emreden 14 Ekim kararını, hükümetin itirazı " +
          "görülene kadar durdurdu. Bu yüzden başvurular 1 Kasım'da açılmayacak ve yeni tarih yok. " +
          "Açıldığında yalnızca dvprogram.state.gov üzerinden olacak: başvuru 1 dolar, fotoğrafın " +
          "yanında pasaportun kimlik ve imza sayfasının taraması gerekiyor ve fotoğraf altı aydan eski " +
          "olmamalı. O zamana kadar DV-2027 için başvuru ya da para alan kişi Dışişleri Bakanlığı değildir.",
        sourceLabel: "İstinaf dosyası (Red Eagle Law v. Rubio)",
      },
      es: {
        title: "La DV-2027 vuelve a estar en pausa: el tribunal de apelaciones suspendió la orden de abrir el registro",
        body:
          "El 29 de octubre de 2026 el Tribunal de Apelaciones del Noveno Circuito suspendió, mientras " +
          "se resuelve la apelación del gobierno, la orden del 14 de octubre que obligaba al " +
          "Departamento de Estado a abrir el registro de la DV-2027 antes del 1 de noviembre. Así que " +
          "el registro no abrirá el 1 de noviembre y no hay fechas nuevas. Cuando abra, será solo en " +
          "dvprogram.state.gov: inscribirse cuesta 1 dólar, además de la foto hay que subir un escaneo " +
          "de la página de datos y la de firma del pasaporte, y la foto debe tener menos de seis meses. " +
          "Quien acepte inscripciones o dinero para la DV-2027 antes de eso no es el Departamento de Estado.",
        sourceLabel: "Expediente de apelación (Red Eagle Law v. Rubio)",
      },
      pt: {
        title: "A DV-2027 está em pausa de novo: o tribunal de apelação suspendeu a ordem de abrir as inscrições",
        body:
          "Em 29 de outubro de 2026 o Tribunal de Apelação do Nono Circuito suspendeu, enquanto corre " +
          "o recurso do governo, a decisão de 14 de outubro que obrigava o Departamento de Estado a " +
          "abrir as inscrições da DV-2027 até 1º de novembro. Por isso as inscrições não abrem em " +
          "1º de novembro, e não há novas datas. Quando abrirem, será só em dvprogram.state.gov: a " +
          "inscrição custa US$ 1, além da foto é preciso enviar um escaneamento da página de dados e " +
          "da página de assinatura do passaporte, e a foto deve ter menos de seis meses. Quem aceitar " +
          "inscrições ou dinheiro para a DV-2027 antes disso não é o Departamento de Estado.",
        sourceLabel: "Processo no tribunal de apelação (Red Eagle Law v. Rubio)",
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
