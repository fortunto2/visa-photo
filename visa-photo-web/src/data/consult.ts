import type { ActiveLang } from "./locales";
import { countryGroups, type CatalogEntry } from "./catalog";

/**
 * "Need help with the visa itself?" — a request form that hands the person to a consultant.
 *
 * The site does photos and nothing else, and says so; the form is for the questions it cannot
 * answer (the application, the appointment, the interview, a refusal). It posts to the
 * `visayes-leads` Worker (workers/leads), which stores the request and mails it on; requests
 * about the United States are copied to the US partner.
 *
 * This is the one place the site takes personal data, and only what the person types. The
 * privacy page has a section for it, and the consent line here names the transfer to a partner,
 * because that transfer is the whole point of sending it.
 */

/**
 * How a page offers the consultant, or null where it does not.
 *
 * The United States has a partner who answers, and her work is the ordinary B1/B2 tourist visa,
 * so those pages get an open banner labelled as a partner's offer rather than a folded line.
 * The DV lottery page gets it too, but it never sells help with the lottery: entry is free, and
 * the State Department's standing warning is that paid "DV agents" are the usual scam. It says
 * that first and offers the tourist visa. Every other visa page keeps the folded form; those
 * requests reach visayes and wait for a partner.
 */
export type ConsultOffer = "us-visa" | "us-dv" | "general";

/** Matches CC_COUNTRY in workers/leads: the country whose requests reach the partner. */
const PARTNER_COUNTRY = "united-states";

export function consultOffer(entry: CatalogEntry): ConsultOffer | null {
  if (entry.kind !== "visa") return null;
  if (entry.country === PARTNER_COUNTRY) return entry.doc === "dv-lottery" ? "us-dv" : "us-visa";
  return "general";
}

/** Countries the select offers: those with a page the form appears on, in catalogue order. */
export function consultDestinations(): { slug: string; nameKey: string }[] {
  return countryGroups()
    .filter((g) => g.entries.some((e) => consultOffer(e) !== null))
    .map((g) => ({ slug: g.slug, nameKey: g.nameKey }));
}

interface Copy {
  heading: string;
  body: string;
  open: string;
  name: string;
  /** Names the messenger people in this language actually use, so the field reads as theirs. */
  contact: string;
  destination: string;
  other: string;
  message: string;
  messageHint: string;
  consent: string;
  privacy: string;
  submit: string;
  sending: string;
  sent: string;
  failed: string;
  /** Says the US banner is someone else's paid service, not a step of the checker. */
  partnerTag: string;
  usVisa: { heading: string; body: string };
  usDv: { heading: string; body: string };
  usHint: string;
}

export const CONSULT_COPY: Record<ActiveLang, Copy> = {
  en: {
    heading: "Need help with the visa itself?",
    body: "We only do the photo. For the form, the appointment, the interview or a refusal, leave a request and we pass it to a visa consultant. They contact you directly, and you agree the price and terms with them.",
    open: "Ask a consultant",
    name: "Name",
    contact: "E-mail, phone or WhatsApp",
    destination: "Visa to",
    other: "Another country",
    message: "What do you need help with?",
    messageHint: "Citizenship, type of visa, travel dates",
    consent: "I agree that visayes passes these details to a partner consultant so they can contact me.",
    privacy: "How we handle them",
    submit: "Send request",
    sending: "Sending…",
    sent: "Request sent. The consultant will write to the contact you gave.",
    failed: "Could not send. Try again in a minute, or write to info@superduperai.co.",
    partnerTag: "Partner",
    usVisa: {
      heading: "US tourist visa, with a consultant",
      body: "The photo is our part. For the rest of a B1/B2 visa (the DS-160 form, the interview appointment, getting ready for the interview) a partner visa consultant can help. It is a paid service: the consultant names the price before starting. No one can promise a visa; the consulate decides.",
    },
    usDv: {
      heading: "Want a regular US tourist visa?",
      body: "Entering the DV lottery is free and you do it yourself at dvprogram.state.gov: you don't need to pay anyone for it. If you want to visit the US as a tourist, a partner visa consultant can help with the B1/B2 visa: the DS-160 form, the appointment, the interview. It is a paid service; you agree the price with the consultant.",
    },
    usHint: "Citizenship, when you plan to travel, any past refusals",
  },
  ru: {
    heading: "Нужна помощь с самой визой?",
    body: "Мы делаем только фото. С анкетой, записью, собеседованием или после отказа поможет визовый консультант: оставьте заявку, и мы её передадим. Он свяжется с вами сам, цену и условия обсуждаете с ним.",
    open: "Спросить консультанта",
    name: "Имя",
    contact: "Почта, телефон или Telegram",
    destination: "Виза в",
    other: "Другая страна",
    message: "С чем нужна помощь?",
    messageHint: "Гражданство, тип визы, даты поездки",
    consent: "Даю согласие передать эти данные консультанту-партнёру visayes, чтобы он со мной связался.",
    privacy: "Как мы с ними обращаемся",
    submit: "Отправить заявку",
    sending: "Отправляем…",
    sent: "Заявка отправлена. Консультант напишет на указанный контакт.",
    failed: "Не отправилось. Попробуйте через минуту или напишите на info@superduperai.co.",
    partnerTag: "Партнёр",
    usVisa: {
      heading: "Туристическая виза в США с консультантом",
      body: "Фото делаем мы. С остальным для визы B1/B2 (анкета DS-160, запись на собеседование, подготовка к нему) поможет визовый консультант-партнёр. Услуга платная: цену консультант называет до начала работы. Гарантировать визу не может никто, решение принимает консул.",
    },
    usDv: {
      heading: "Нужна обычная туристическая виза в США?",
      body: "Участие в DV-лотерее бесплатное, и подаёте вы сами на dvprogram.state.gov: платить за это никому не нужно. А если хотите поехать в США туристом, с визой B1/B2 (анкета DS-160, запись, собеседование) поможет визовый консультант-партнёр. Услуга платная, цену обсуждаете с ним.",
    },
    usHint: "Гражданство, когда планируете поездку, были ли отказы",
  },
  es: {
    heading: "¿Necesitas ayuda con el visado en sí?",
    body: "Nosotros solo hacemos la foto. Para el formulario, la cita, la entrevista o tras una denegación, deja una solicitud y la pasamos a un asesor de visados. Te contacta directamente, y el precio y las condiciones los acuerdas con él.",
    open: "Consultar a un asesor",
    name: "Nombre",
    contact: "Correo, teléfono o WhatsApp",
    destination: "Visado para",
    other: "Otro país",
    message: "¿En qué necesitas ayuda?",
    messageHint: "Nacionalidad, tipo de visado, fechas del viaje",
    consent: "Acepto que visayes pase estos datos a un asesor colaborador para que me contacte.",
    privacy: "Cómo los tratamos",
    submit: "Enviar solicitud",
    sending: "Enviando…",
    sent: "Solicitud enviada. El asesor te escribirá al contacto que indicaste.",
    failed: "No se pudo enviar. Inténtalo en un minuto o escribe a info@superduperai.co.",
    partnerTag: "Colaborador",
    usVisa: {
      heading: "Visa de turista para EE. UU., con un asesor",
      body: "La foto es cosa nuestra. Para el resto de la visa B1/B2 (el formulario DS-160, la cita de la entrevista y la preparación) te ayuda un asesor de visados colaborador. Es un servicio de pago: el asesor te dice el precio antes de empezar. Nadie puede garantizar la visa; decide el consulado.",
    },
    usDv: {
      heading: "¿Necesitas una visa de turista normal para EE. UU.?",
      body: "Participar en la lotería DV es gratis y lo haces tú mismo en dvprogram.state.gov: no hace falta pagar a nadie. Si quieres viajar a EE. UU. como turista, un asesor de visados colaborador te ayuda con la visa B1/B2: el formulario DS-160, la cita y la entrevista. Es de pago; el precio lo acuerdas con él.",
    },
    usHint: "Nacionalidad, cuándo piensas viajar, si te han negado alguna visa",
  },
  fr: {
    heading: "Besoin d'aide pour le visa lui-même ?",
    body: "Nous ne faisons que la photo. Pour le formulaire, le rendez-vous, l'entretien ou après un refus, laissez une demande : nous la transmettons à un consultant en visas. Il vous contacte directement, et vous convenez avec lui du prix et des conditions.",
    open: "Demander à un consultant",
    name: "Nom",
    contact: "E-mail, téléphone ou WhatsApp",
    destination: "Visa pour",
    other: "Autre pays",
    message: "Sur quoi avez-vous besoin d'aide ?",
    messageHint: "Nationalité, type de visa, dates du voyage",
    consent: "J'accepte que visayes transmette ces informations à un consultant partenaire pour qu'il me contacte.",
    privacy: "Ce que nous en faisons",
    submit: "Envoyer la demande",
    sending: "Envoi…",
    sent: "Demande envoyée. Le consultant vous écrira au contact indiqué.",
    failed: "L'envoi a échoué. Réessayez dans une minute ou écrivez à info@superduperai.co.",
    partnerTag: "Partenaire",
    usVisa: {
      heading: "Visa touristique pour les États-Unis, avec un consultant",
      body: "La photo, c'est nous. Pour le reste du visa B1/B2 (le formulaire DS-160, le rendez-vous et la préparation de l'entretien), un consultant en visas partenaire peut vous aider. Le service est payant : le consultant annonce son prix avant de commencer. Personne ne peut garantir un visa, c'est le consulat qui décide.",
    },
    usDv: {
      heading: "Besoin d'un visa touristique classique pour les États-Unis ?",
      body: "La participation à la loterie DV est gratuite et se fait vous-même sur dvprogram.state.gov : inutile de payer qui que ce soit. Si vous voulez aller aux États-Unis en touriste, un consultant en visas partenaire peut vous aider pour le visa B1/B2 : formulaire DS-160, rendez-vous, entretien. Le service est payant, le prix se convient avec lui.",
    },
    usHint: "Nationalité, date de voyage prévue, refus éventuels",
  },
  pt: {
    heading: "Precisa de ajuda com o visto em si?",
    body: "Nós só fazemos a foto. Para o formulário, o agendamento, a entrevista ou depois de uma recusa, deixe um pedido e nós o passamos a um consultor de vistos. Ele entra em contato direto com você, e preço e condições você combina com ele.",
    open: "Falar com um consultor",
    name: "Nome",
    contact: "E-mail, telefone ou WhatsApp",
    destination: "Visto para",
    other: "Outro país",
    message: "Com o que você precisa de ajuda?",
    messageHint: "Nacionalidade, tipo de visto, datas da viagem",
    consent: "Concordo que a visayes repasse estes dados a um consultor parceiro para que ele entre em contato comigo.",
    privacy: "Como tratamos os dados",
    submit: "Enviar pedido",
    sending: "Enviando…",
    sent: "Pedido enviado. O consultor vai escrever para o contato informado.",
    failed: "Não foi possível enviar. Tente de novo em um minuto ou escreva para info@superduperai.co.",
    partnerTag: "Parceiro",
    usVisa: {
      heading: "Visto de turista para os EUA, com um consultor",
      body: "A foto é com a gente. Para o resto do visto B1/B2 (o formulário DS-160, o agendamento da entrevista e a preparação), um consultor de vistos parceiro pode ajudar. O serviço é pago: o consultor informa o preço antes de começar. Ninguém pode garantir o visto; quem decide é o consulado.",
    },
    usDv: {
      heading: "Precisa de um visto de turista comum para os EUA?",
      body: "Participar da loteria DV é gratuito e você mesmo se inscreve em dvprogram.state.gov: não precisa pagar ninguém. Se quiser ir aos EUA como turista, um consultor de vistos parceiro ajuda com o visto B1/B2: formulário DS-160, agendamento e entrevista. O serviço é pago; o preço você combina com ele.",
    },
    usHint: "Nacionalidade, quando pretende viajar, se já teve visto negado",
  },
  tr: {
    heading: "Vizenin kendisi için yardım mı lazım?",
    body: "Biz yalnızca fotoğrafı yapıyoruz. Form, randevu, mülakat ya da ret sonrası için talep bırakın, bir vize danışmanına iletelim. Danışman sizinle doğrudan iletişime geçer; ücreti ve koşulları onunla konuşursunuz.",
    open: "Danışmana sorun",
    name: "Adınız",
    contact: "E-posta, telefon veya WhatsApp",
    destination: "Vize ülkesi",
    other: "Başka bir ülke",
    message: "Hangi konuda yardım gerekiyor?",
    messageHint: "Vatandaşlık, vize türü, seyahat tarihleri",
    consent: "Benimle iletişime geçebilmesi için visayes'in bu bilgileri iş ortağı bir danışmana iletmesini kabul ediyorum.",
    privacy: "Verileri nasıl kullanıyoruz",
    submit: "Talebi gönder",
    sending: "Gönderiliyor…",
    sent: "Talebiniz iletildi. Danışman verdiğiniz iletişim bilgisinden size yazacak.",
    failed: "Gönderilemedi. Bir dakika sonra tekrar deneyin ya da info@superduperai.co adresine yazın.",
    partnerTag: "İş ortağı",
    usVisa: {
      heading: "Danışman desteğiyle ABD turist vizesi",
      body: "Fotoğraf bizden. B1/B2 vizesinin geri kalanı için (DS-160 formu, mülakat randevusu ve mülakata hazırlık) iş ortağımız olan bir vize danışmanı yardımcı olabilir. Hizmet ücretlidir: danışman ücreti işe başlamadan söyler. Vizeyi kimse garanti edemez, kararı konsolosluk verir.",
    },
    usDv: {
      heading: "Normal bir ABD turist vizesi mi lazım?",
      body: "DV piyangosuna katılım ücretsizdir ve başvuruyu dvprogram.state.gov üzerinden kendiniz yaparsınız: kimseye para ödemeniz gerekmez. ABD'ye turist olarak gitmek istiyorsanız, iş ortağımız olan bir vize danışmanı B1/B2 vizesinde yardımcı olur: DS-160 formu, randevu, mülakat. Hizmet ücretlidir, ücreti danışmanla konuşursunuz.",
    },
    usHint: "Vatandaşlık, ne zaman seyahat etmeyi düşündüğünüz, daha önce ret alıp almadığınız",
  },
  ar: {
    heading: "هل تحتاج مساعدة في التأشيرة نفسها؟",
    body: "نحن نجهّز الصورة فقط. إذا احتجت مساعدة في الاستمارة أو الموعد أو المقابلة أو بعد الرفض، اترك طلبًا وسننقله إلى مستشار تأشيرات. سيتواصل معك مباشرة، وتتفق معه على السعر والشروط.",
    open: "اسأل مستشارًا",
    name: "الاسم",
    contact: "البريد الإلكتروني أو الهاتف أو واتساب",
    destination: "التأشيرة إلى",
    other: "بلد آخر",
    message: "بماذا تحتاج المساعدة؟",
    messageHint: "الجنسية، نوع التأشيرة، مواعيد السفر",
    consent: "أوافق على أن ينقل الموقع هذه البيانات إلى مستشار شريك ليتواصل معي.",
    privacy: "كيف نتعامل معها",
    submit: "أرسل الطلب",
    sending: "جارٍ الإرسال…",
    sent: "تم إرسال الطلب. سيكتب لك المستشار على وسيلة التواصل التي ذكرتها.",
    failed: "تعذّر الإرسال. حاول بعد دقيقة أو راسلنا على info@superduperai.co.",
    partnerTag: "شريك",
    usVisa: {
      heading: "تأشيرة سياحية إلى الولايات المتحدة بمساعدة مستشار",
      body: "نحن نجهّز الصورة. أما بقية خطوات تأشيرة B1/B2 (استمارة DS-160، وحجز موعد المقابلة، والتحضير لها) فيساعدك فيها مستشار تأشيرات شريك. الخدمة مدفوعة: يحدد المستشار السعر قبل البدء. لا أحد يستطيع ضمان التأشيرة، فالقرار للقنصلية.",
    },
    usDv: {
      heading: "هل تحتاج تأشيرة سياحية عادية إلى الولايات المتحدة؟",
      body: "المشاركة في قرعة DV مجانية، وتقدّم بنفسك عبر dvprogram.state.gov، ولا داعي للدفع لأي أحد. وإذا أردت السفر إلى الولايات المتحدة سائحًا، يساعدك مستشار تأشيرات شريك في تأشيرة B1/B2: استمارة DS-160 والموعد والمقابلة. الخدمة مدفوعة، وتتفق معه على السعر.",
    },
    usHint: "الجنسية، موعد السفر المتوقع، وهل سبق رفض طلبك",
  },
  hi: {
    heading: "वीज़ा में ही मदद चाहिए?",
    body: "हम सिर्फ़ फ़ोटो बनाते हैं। फ़ॉर्म, अपॉइंटमेंट, इंटरव्यू या रिजेक्शन के बाद मदद के लिए अनुरोध छोड़ें, हम उसे वीज़ा कंसल्टेंट तक पहुँचा देंगे। कंसल्टेंट आपसे सीधे संपर्क करेंगे; फ़ीस और शर्तें आप उन्हीं से तय करें।",
    open: "कंसल्टेंट से पूछें",
    name: "नाम",
    contact: "ईमेल, फ़ोन या WhatsApp",
    destination: "किस देश का वीज़ा",
    other: "कोई और देश",
    message: "किस चीज़ में मदद चाहिए?",
    messageHint: "नागरिकता, वीज़ा का प्रकार, यात्रा की तारीखें",
    consent: "मैं सहमत हूँ कि visayes ये जानकारी पार्टनर कंसल्टेंट को दे, ताकि वे मुझसे संपर्क कर सकें।",
    privacy: "हम इसका क्या करते हैं",
    submit: "अनुरोध भेजें",
    sending: "भेजा जा रहा है…",
    sent: "अनुरोध भेज दिया गया। कंसल्टेंट आपके दिए संपर्क पर लिखेंगे।",
    failed: "भेजा नहीं जा सका। एक मिनट बाद फिर कोशिश करें या info@superduperai.co पर लिखें।",
    partnerTag: "पार्टनर",
    usVisa: {
      heading: "अमेरिका का टूरिस्ट वीज़ा, कंसल्टेंट की मदद से",
      body: "फ़ोटो हम बनाते हैं। B1/B2 वीज़ा के बाकी काम (DS-160 फ़ॉर्म, इंटरव्यू अपॉइंटमेंट और उसकी तैयारी) में हमारे पार्टनर वीज़ा कंसल्टेंट मदद कर सकते हैं। यह पेड सर्विस है: कंसल्टेंट काम शुरू करने से पहले फ़ीस बताते हैं। वीज़ा की गारंटी कोई नहीं दे सकता, फ़ैसला कॉन्सुलेट करता है।",
    },
    usDv: {
      heading: "अमेरिका का सामान्य टूरिस्ट वीज़ा चाहिए?",
      body: "DV लॉटरी में हिस्सा लेना मुफ़्त है और आप खुद dvprogram.state.gov पर आवेदन करते हैं: इसके लिए किसी को पैसे देने की ज़रूरत नहीं। अगर आप टूरिस्ट बनकर अमेरिका जाना चाहते हैं, तो B1/B2 वीज़ा (DS-160 फ़ॉर्म, अपॉइंटमेंट, इंटरव्यू) में हमारे पार्टनर वीज़ा कंसल्टेंट मदद करेंगे। सर्विस पेड है, फ़ीस आप उन्हीं से तय करें।",
    },
    usHint: "नागरिकता, यात्रा कब करनी है, पहले कभी वीज़ा रिजेक्ट हुआ या नहीं",
  },
  zh: {
    heading: "签证本身需要帮助？",
    body: "我们只负责照片。如果在填表、预约、面签或被拒后需要帮助，留下申请，我们会转交给签证顾问。顾问会直接联系你，费用和条件由你与顾问商定。",
    open: "咨询签证顾问",
    name: "姓名",
    contact: "邮箱、电话或微信",
    destination: "签证国家",
    other: "其他国家",
    message: "需要哪方面的帮助？",
    messageHint: "国籍、签证类型、出行日期",
    consent: "我同意 visayes 将以上信息转交给合作顾问，以便其与我联系。",
    privacy: "我们如何处理这些信息",
    submit: "提交申请",
    sending: "正在提交…",
    sent: "申请已提交。顾问会通过你留下的联系方式与你联系。",
    failed: "提交失败。请一分钟后重试，或发邮件至 info@superduperai.co。",
    partnerTag: "合作伙伴",
    usVisa: {
      heading: "美国旅游签证，请顾问协助",
      body: "照片由我们负责。B1/B2 签证的其余部分（DS-160 表格、面签预约和面签准备）可由合作签证顾问协助。这是付费服务：顾问会在开始前报价。任何人都无法保证签证获批，决定权在领事馆。",
    },
    usDv: {
      heading: "需要普通的美国旅游签证吗？",
      body: "参加 DV 抽签是免费的，你可以自己在 dvprogram.state.gov 上提交，不需要付钱给任何人。如果你想以游客身份去美国，合作签证顾问可以协助办理 B1/B2 签证：DS-160 表格、预约和面签。服务收费，价格与顾问商定。",
    },
    usHint: "国籍、计划出行时间、是否被拒签过",
  },
};
