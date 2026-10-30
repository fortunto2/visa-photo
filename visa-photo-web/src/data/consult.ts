import type { ActiveLang } from "./locales";
import type { CatalogEntry } from "./catalog";

/**
 * "Need help with the visa itself?" — a request form for the questions the site cannot answer.
 *
 * The site does photos and nothing else, and says so. The form takes the rest (the application,
 * the appointment, the interview, a refusal) and posts to the `visayes-leads` Worker
 * (workers/leads), which stores the request and mails it on. We answer first, with the help of
 * an AI assistant; a request that needs a consultant is then passed to one who handles that
 * country, and consultants may pay for that. The consent line and the privacy page say all
 * three, because each is something the person agrees to by sending.
 *
 * It is also how demand is measured before there is a partner for every country: each page asks
 * the topics that fit it, so a request says "Canada, study" rather than "Canada, something".
 *
 * Lines it does not cross, wherever it appears: no promise of a visa; no claim of a link to any
 * government; no paid help with entering the DV lottery, which costs $1 and needs no agent. Where
 * a country licenses visa advice (Canada, the UK, Australia, New Zealand), a request is passed
 * only to a licensed adviser, and the copy promises that.
 */

/**
 * How a page offers the form, or null where it does not.
 *
 * The United States has a consultant who answers, so its pages get an open banner beside the
 * checker instead of a folded line. On the DV page the banner is about what follows selection
 * (the DS-260, the documents, the interview): the people there are entering the lottery, and the
 * B1/B2 offer it showed first drew clicks from them and no requests. Every other visa page keeps
 * the folded form.
 */
export type ConsultOffer = "us-visa" | "us-dv" | "general";

/** Matches CC_COUNTRY in workers/leads: the country whose requests reach the partner. */
const PARTNER_COUNTRY = "united-states";

export function consultOffer(entry: CatalogEntry): ConsultOffer | null {
  if (entry.kind !== "visa") return null;
  if (entry.country === PARTNER_COUNTRY) return entry.doc === "dv-lottery" ? "us-dv" : "us-visa";
  return "general";
}

/** Stored as is in the `topic` column; the Worker accepts any lowercase slug. */
export type Topic = "tourist" | "study" | "work" | "family" | "refusal" | "dv-selected" | "dv-entry" | "other";

/** What each page asks about, most likely first. */
export const TOPICS: Record<ConsultOffer, Topic[]> = {
  "us-visa": ["tourist", "study", "work", "family", "refusal", "other"],
  "us-dv": ["dv-selected", "dv-entry", "tourist", "other"],
  general: ["tourist", "study", "work", "family", "refusal", "other"],
};

interface Pitch {
  heading: string;
  /** The banner with the form. */
  body: string;
  /** The teaser beside the headline. */
  short: string;
}

/** The DV page asks for something else in the free text: nobody there is planning a trip yet. */
interface DvPitch extends Pitch {
  hint: string;
}

interface Copy {
  /** The folded line on pages without a banner. */
  heading: (country: string) => string;
  body: string;
  open: string;
  name: string;
  /** Names the messenger people in this language actually use, so the field reads as theirs. */
  contact: string;
  topic: string;
  /** The empty first option, so nobody's topic is chosen for them. */
  choose: string;
  topics: Record<Topic, string>;
  message: string;
  messageHint: string;
  consent: string;
  privacy: string;
  submit: string;
  sending: string;
  sent: string;
  failed: string;
  /** The banner's label: someone else's service beside the checker, not a step of it. */
  tag: string;
  usVisa: Pitch;
  usDv: DvPitch;
}

export const CONSULT_COPY: Record<ActiveLang, Copy> = {
  en: {
    heading: (country) => `${country}: need help with the visa?`,
    body: "We only do the photo. Tell us what you need with the visa: we answer every request, and when it takes a consultant, we put you in touch with one who handles this country, licensed where the country requires it. Their work is paid; no one can guarantee a visa.",
    open: "Ask a question",
    name: "Name",
    contact: "E-mail, phone or WhatsApp",
    topic: "What is it about?",
    choose: "Choose",
    topics: {
      tourist: "Tourist or business trip",
      study: "Study",
      work: "Work",
      family: "Joining family, residence",
      refusal: "I was refused a visa",
      "dv-selected": "I was selected: DS-260 and the interview",
      "dv-entry": "A question about my entry",
      other: "Something else",
    },
    message: "Your situation in a few words",
    messageHint: "Citizenship, when you plan to go, any past refusals",
    consent: "I agree that visayes reviews my request, also with the help of an AI assistant, and may pass it to a visa consultant who will contact me.",
    privacy: "How we handle it",
    submit: "Send",
    sending: "Sending…",
    sent: "Sent. We will reply to the contact you gave.",
    failed: "Could not send. Try again in a minute, or write to info@superduperai.co.",
    tag: "Visa help",
    usVisa: {
      heading: "US visa, with a consultant",
      body: "The photo is our part. For the rest (the DS-160 form, the interview appointment, getting ready for the interview) tell us your case: we answer, and put you in touch with a visa consultant if you need one. Their work is paid, and they name the price before starting. No one can promise a visa; the consulate decides.",
      short: "Help with the DS-160, the appointment and the interview. Paid; no one can promise a visa.",
    },
    usDv: {
      heading: "Selected in the DV lottery?",
      body: "Entering costs $1, a State Department fee paid at dvprogram.state.gov, and you file the entry yourself: no agent is needed, and we do not sell help with entering. After selection it gets harder: the DS-260 form, the documents, the interview at the consulate. Tell us your case: we answer, and put you in touch with a consultant if you need one; their work is paid. visayes is not affiliated with the US government.",
      short: "After selection: the DS-260, documents and the interview. Entering costs $1 and needs no agent. Not affiliated with the US government.",
      hint: "Citizenship and what is unclear",
    },
  },
  ru: {
    heading: (country) => `${country}: нужна помощь с визой?`,
    body: "Мы делаем только фото. Расскажите, что нужно с визой: мы отвечаем на каждую заявку, а если нужен консультант, сведём с тем, кто работает с этой страной и имеет лицензию там, где она обязательна. Его услуги платные; визу не гарантирует никто.",
    open: "Задать вопрос",
    name: "Имя",
    contact: "Почта, телефон или Telegram",
    topic: "О чём вопрос",
    choose: "Выберите",
    topics: {
      tourist: "Туризм или деловая поездка",
      study: "Учёба",
      work: "Работа",
      family: "Переезд к семье, ВНЖ",
      refusal: "Был отказ в визе",
      "dv-selected": "После выигрыша: DS-260 и собеседование",
      "dv-entry": "Вопрос по участию",
      other: "Другое",
    },
    message: "Коротко о ситуации",
    messageHint: "Гражданство, когда планируете ехать, были ли отказы",
    consent: "Разрешаю visayes разобрать заявку, в том числе с помощью ИИ-ассистента, и передать её визовому консультанту, который со мной свяжется.",
    privacy: "Как мы с ней обращаемся",
    submit: "Отправить",
    sending: "Отправляем…",
    sent: "Отправлено. Ответим на указанный контакт.",
    failed: "Не отправилось. Попробуйте через минуту или напишите на info@superduperai.co.",
    tag: "Помощь с визой",
    usVisa: {
      heading: "Виза в США с консультантом",
      body: "Фото делаем мы. С остальным (анкета DS-160, запись на собеседование, подготовка к нему) расскажите о ситуации: мы ответим и, если нужно, сведём с визовым консультантом. Его услуги платные, цену он называет до начала работы. Гарантировать визу не может никто, решение принимает консул.",
      short: "Анкета DS-160, запись и подготовка к собеседованию. Платно, визу не гарантирует никто.",
    },
    usDv: {
      heading: "Выиграли в DV-лотерее?",
      body: "Участие стоит $1, это сбор Госдепа на dvprogram.state.gov, и подаёте вы сами: посредник не нужен, помощь с участием мы не продаём. После выигрыша сложнее: анкета DS-260, документы, собеседование в консульстве. Расскажите о ситуации: мы ответим и, если нужно, сведём с консультантом, его услуги платные. visayes не связан с правительством США.",
      short: "После выигрыша: DS-260, документы, собеседование. Участие стоит $1, посредник не нужен. Мы не связаны с правительством США.",
      hint: "Гражданство и что непонятно",
    },
  },
  es: {
    heading: (country) => `${country}: ¿necesitas ayuda con el visado?`,
    body: "Nosotros solo hacemos la foto. Cuéntanos qué necesitas con el visado: respondemos a cada solicitud y, si hace falta un asesor, te ponemos en contacto con uno que lleve este país, con licencia donde el país la exige. Su trabajo es de pago; nadie puede garantizar un visado.",
    open: "Hacer una pregunta",
    name: "Nombre",
    contact: "Correo, teléfono o WhatsApp",
    topic: "¿De qué se trata?",
    choose: "Elige",
    topics: {
      tourist: "Turismo o viaje de negocios",
      study: "Estudios",
      work: "Trabajo",
      family: "Reunirme con mi familia, residencia",
      refusal: "Me negaron un visado",
      "dv-selected": "Me seleccionaron: DS-260 y entrevista",
      "dv-entry": "Una duda sobre mi inscripción",
      other: "Otra cosa",
    },
    message: "Tu situación en pocas palabras",
    messageHint: "Nacionalidad, cuándo piensas viajar, si te han negado alguna visa",
    consent: "Acepto que visayes revise mi solicitud, también con ayuda de un asistente de IA, y pueda pasarla a un asesor de visados que me contactará.",
    privacy: "Cómo la tratamos",
    submit: "Enviar",
    sending: "Enviando…",
    sent: "Enviado. Te responderemos al contacto que indicaste.",
    failed: "No se pudo enviar. Inténtalo en un minuto o escribe a info@superduperai.co.",
    tag: "Ayuda con el visado",
    usVisa: {
      heading: "Visa para EE. UU., con un asesor",
      body: "La foto es cosa nuestra. Para el resto (el formulario DS-160, la cita de la entrevista y la preparación) cuéntanos tu caso: te respondemos y, si hace falta, te ponemos en contacto con un asesor de visados. Su trabajo es de pago y te dice el precio antes de empezar. Nadie puede garantizar la visa; decide el consulado.",
      short: "Ayuda con el DS-160, la cita y la entrevista. De pago; nadie puede garantizar la visa.",
    },
    usDv: {
      heading: "¿Te seleccionaron en la lotería DV?",
      body: "Participar cuesta 1 USD, una tasa del Departamento de Estado que se paga en dvprogram.state.gov, y lo haces tú mismo: no hace falta intermediario y no vendemos ayuda para inscribirse. Tras la selección se complica: el formulario DS-260, los documentos, la entrevista en el consulado. Cuéntanos tu caso: te respondemos y, si hace falta, te ponemos en contacto con un asesor; su trabajo es de pago. visayes no tiene relación con el gobierno de EE. UU.",
      short: "Tras la selección: DS-260, documentos y entrevista. Participar cuesta 1 USD y no necesita intermediarios. Sin relación con el gobierno de EE. UU.",
      hint: "Nacionalidad y qué no está claro",
    },
  },
  fr: {
    heading: (country) => `${country} : besoin d'aide pour le visa ?`,
    body: "Nous ne faisons que la photo. Dites-nous ce qu'il vous faut pour le visa : nous répondons à chaque demande et, s'il faut un consultant, nous vous mettons en relation avec un consultant qui s'occupe de ce pays, agréé là où le pays l'exige. Son travail est payant ; personne ne peut garantir un visa.",
    open: "Poser une question",
    name: "Nom",
    contact: "E-mail, téléphone ou WhatsApp",
    topic: "De quoi s'agit-il ?",
    choose: "Choisissez",
    topics: {
      tourist: "Tourisme ou voyage d'affaires",
      study: "Études",
      work: "Travail",
      family: "Rejoindre ma famille, titre de séjour",
      refusal: "On m'a refusé un visa",
      "dv-selected": "Après la sélection : DS-260 et entretien",
      "dv-entry": "Une question sur ma participation",
      other: "Autre chose",
    },
    message: "Votre situation en quelques mots",
    messageHint: "Nationalité, date de voyage prévue, refus éventuels",
    consent: "J'accepte que visayes examine ma demande, notamment à l'aide d'un assistant IA, et puisse la transmettre à un consultant en visas qui me contactera.",
    privacy: "Ce que nous en faisons",
    submit: "Envoyer",
    sending: "Envoi…",
    sent: "Envoyé. Nous répondrons au contact indiqué.",
    failed: "L'envoi a échoué. Réessayez dans une minute ou écrivez à info@superduperai.co.",
    tag: "Aide visa",
    usVisa: {
      heading: "Visa pour les États-Unis, avec un consultant",
      body: "La photo, c'est nous. Pour le reste (le formulaire DS-160, le rendez-vous et la préparation de l'entretien), décrivez votre situation : nous répondons et, si besoin, vous mettons en relation avec un consultant en visas. Son travail est payant et il annonce son prix avant de commencer. Personne ne peut garantir un visa, c'est le consulat qui décide.",
      short: "Aide pour le DS-160, le rendez-vous et l'entretien. Payant ; personne ne peut garantir un visa.",
    },
    usDv: {
      heading: "Votre nom est sorti à la loterie DV ?",
      body: "La participation coûte 1 $, une taxe du Département d'État payée sur dvprogram.state.gov, et se fait vous-même : aucun intermédiaire n'est nécessaire, et nous ne vendons pas d'aide pour s'inscrire. Après la sélection, c'est plus compliqué : le formulaire DS-260, les documents, l'entretien au consulat. Décrivez votre situation : nous répondons et, si besoin, vous mettons en relation avec un consultant ; son travail est payant. visayes n'a aucun lien avec le gouvernement américain.",
      short: "Après la sélection : DS-260, documents, entretien. La participation coûte 1 $ et ne demande aucun intermédiaire. Aucun lien avec le gouvernement américain.",
      hint: "Nationalité et ce qui n'est pas clair",
    },
  },
  pt: {
    heading: (country) => `${country}: precisa de ajuda com o visto?`,
    body: "Nós só fazemos a foto. Conte o que você precisa com o visto: respondemos a cada pedido e, se for preciso um consultor, colocamos você em contato com um que atende este país, com licença onde o país exige. O trabalho dele é pago; ninguém pode garantir um visto.",
    open: "Fazer uma pergunta",
    name: "Nome",
    contact: "E-mail, telefone ou WhatsApp",
    topic: "Qual é o assunto?",
    choose: "Escolha",
    topics: {
      tourist: "Turismo ou viagem de negócios",
      study: "Estudo",
      work: "Trabalho",
      family: "Morar com a família, residência",
      refusal: "Tive um visto negado",
      "dv-selected": "Ganhei na loteria: DS-260 e entrevista",
      "dv-entry": "Uma dúvida sobre a inscrição",
      other: "Outra coisa",
    },
    message: "Sua situação em poucas palavras",
    messageHint: "Nacionalidade, quando pretende viajar, se já teve visto negado",
    consent: "Concordo que a visayes analise meu pedido, inclusive com ajuda de um assistente de IA, e possa repassá-lo a um consultor de vistos que vai entrar em contato comigo.",
    privacy: "Como tratamos os dados",
    submit: "Enviar",
    sending: "Enviando…",
    sent: "Enviado. Vamos responder no contato informado.",
    failed: "Não foi possível enviar. Tente de novo em um minuto ou escreva para info@superduperai.co.",
    tag: "Ajuda com visto",
    usVisa: {
      heading: "Visto para os EUA, com um consultor",
      body: "A foto é com a gente. Para o resto (o formulário DS-160, o agendamento da entrevista e a preparação), conte o seu caso: respondemos e, se for preciso, colocamos você em contato com um consultor de vistos. O serviço dele é pago, e ele informa o preço antes de começar. Ninguém pode garantir o visto; quem decide é o consulado.",
      short: "Ajuda com o DS-160, o agendamento e a entrevista. Pago; ninguém pode garantir o visto.",
    },
    usDv: {
      heading: "Ganhou na loteria DV?",
      body: "Participar custa US$ 1, uma taxa do Departamento de Estado paga em dvprogram.state.gov, e você mesmo se inscreve: não precisa de intermediário, e não vendemos ajuda com a inscrição. Depois do sorteio fica mais difícil: o formulário DS-260, os documentos, a entrevista no consulado. Conte o seu caso: respondemos e, se for preciso, colocamos você em contato com um consultor; o serviço dele é pago. A visayes não tem ligação com o governo dos EUA.",
      short: "Depois do sorteio: DS-260, documentos e entrevista. Participar custa US$ 1 e não precisa de intermediário. Sem ligação com o governo dos EUA.",
      hint: "Nacionalidade e o que não está claro",
    },
  },
  tr: {
    heading: (country) => `${country}: vize için yardım mı lazım?`,
    body: "Biz yalnızca fotoğrafı yapıyoruz. Vizeyle ilgili neye ihtiyacınız olduğunu yazın: her talebe yanıt veriyoruz, danışman gerekirse sizi bu ülkeyle ilgilenen, ülkenin şart koştuğu yerde lisanslı bir danışmanla buluşturuyoruz. Danışmanlık ücretlidir; vizeyi kimse garanti edemez.",
    open: "Soru sorun",
    name: "Adınız",
    contact: "E-posta, telefon veya WhatsApp",
    topic: "Konu nedir?",
    choose: "Seçin",
    topics: {
      tourist: "Turistik veya iş seyahati",
      study: "Eğitim",
      work: "Çalışma",
      family: "Aile birleşimi, oturum izni",
      refusal: "Vize reddi aldım",
      "dv-selected": "Kazandım: DS-260 ve mülakat",
      "dv-entry": "Başvurumla ilgili bir soru",
      other: "Başka bir konu",
    },
    message: "Durumunuzu kısaca yazın",
    messageHint: "Vatandaşlık, ne zaman seyahat etmeyi düşündüğünüz, daha önce ret alıp almadığınız",
    consent: "visayes'in talebimi bir yapay zekâ asistanının da yardımıyla incelemesini ve benimle iletişime geçecek bir vize danışmanına iletebilmesini kabul ediyorum.",
    privacy: "Verileri nasıl kullanıyoruz",
    submit: "Gönder",
    sending: "Gönderiliyor…",
    sent: "Gönderildi. Verdiğiniz iletişim bilgisinden yanıt vereceğiz.",
    failed: "Gönderilemedi. Bir dakika sonra tekrar deneyin ya da info@superduperai.co adresine yazın.",
    tag: "Vize desteği",
    usVisa: {
      heading: "Danışman desteğiyle ABD vizesi",
      body: "Fotoğraf bizden. Geri kalanı için (DS-160 formu, mülakat randevusu ve mülakata hazırlık) durumunuzu yazın: yanıt veririz, gerekirse sizi bir vize danışmanıyla buluştururuz. Danışmanlık ücretlidir; danışman ücreti işe başlamadan söyler. Vizeyi kimse garanti edemez, kararı konsolosluk verir.",
      short: "DS-160, randevu ve mülakat için destek. Ücretlidir; vizeyi kimse garanti edemez.",
    },
    usDv: {
      heading: "DV piyangosunu kazandınız mı?",
      body: "Katılım 1 dolardır; bu ücret dvprogram.state.gov üzerinden ABD Dışişleri Bakanlığına ödenir ve başvuruyu kendiniz yaparsınız: aracıya gerek yoktur, biz de katılım için yardım satmıyoruz. Kazandıktan sonrası daha zordur: DS-260 formu, belgeler, konsoloslukta mülakat. Durumunuzu yazın: yanıt veririz, gerekirse sizi ücretli çalışan bir danışmanla buluştururuz. visayes'in ABD hükümetiyle bir bağlantısı yoktur.",
      short: "Kazandıktan sonra: DS-260, belgeler ve mülakat. Katılım 1 dolardır ve aracı gerekmez. ABD hükümetiyle bağlantımız yoktur.",
      hint: "Vatandaşlık ve neyin net olmadığı",
    },
  },
  ar: {
    heading: (country) => `${country}: هل تحتاج مساعدة في التأشيرة؟`,
    body: "نحن نجهّز الصورة فقط. أخبرنا بما تحتاجه في التأشيرة: نرد على كل طلب، وإذا احتجت إلى مستشار نوصلك بمستشار يختص بهذا البلد ويحمل ترخيصًا حيث يشترطه البلد. خدماته مدفوعة، ولا أحد يستطيع ضمان التأشيرة.",
    open: "اطرح سؤالك",
    name: "الاسم",
    contact: "البريد الإلكتروني أو الهاتف أو واتساب",
    topic: "ما موضوع طلبك؟",
    choose: "اختر",
    topics: {
      tourist: "سياحة أو رحلة عمل",
      study: "دراسة",
      work: "عمل",
      family: "الالتحاق بالعائلة أو الإقامة",
      refusal: "رُفضت لي تأشيرة من قبل",
      "dv-selected": "بعد الفوز بالقرعة: DS-260 والمقابلة",
      "dv-entry": "سؤال عن المشاركة",
      other: "شيء آخر",
    },
    message: "صف وضعك باختصار",
    messageHint: "الجنسية، موعد السفر المتوقع، وهل سبق رفض طلبك",
    consent: "أوافق على أن يراجع الموقع طلبي، بمساعدة مساعد ذكاء اصطناعي أيضًا، وأن ينقله إلى مستشار تأشيرات يتواصل معي.",
    privacy: "كيف نتعامل معه",
    submit: "أرسل",
    sending: "جارٍ الإرسال…",
    sent: "تم الإرسال. سنرد على وسيلة التواصل التي ذكرتها.",
    failed: "تعذّر الإرسال. حاول بعد دقيقة أو راسلنا على info@superduperai.co.",
    tag: "مساعدة في التأشيرة",
    usVisa: {
      heading: "تأشيرة الولايات المتحدة بمساعدة مستشار",
      body: "نحن نجهّز الصورة. أما بقية الخطوات (استمارة DS-160، وحجز موعد المقابلة، والتحضير لها) فأخبرنا بوضعك: نرد عليك، وإن لزم نوصلك بمستشار تأشيرات. خدماته مدفوعة ويحدد السعر قبل البدء. لا أحد يستطيع ضمان التأشيرة، فالقرار للقنصلية.",
      short: "مساعدة في استمارة DS-160 والموعد والمقابلة. خدمة مدفوعة، ولا أحد يضمن التأشيرة.",
    },
    usDv: {
      heading: "هل فزت في قرعة DV؟",
      body: "المشاركة تكلّف دولارًا واحدًا رسومًا لوزارة الخارجية الأمريكية تُدفع عبر dvprogram.state.gov، وتقدّم بنفسك دون حاجة إلى وسيط، ونحن لا نبيع مساعدة في التسجيل. بعد الفوز يصبح الأمر أصعب: استمارة DS-260 والوثائق والمقابلة في القنصلية. أخبرنا بوضعك: نرد عليك، وإن لزم نوصلك بمستشار خدماته مدفوعة. لا علاقة للموقع بالحكومة الأمريكية.",
      short: "بعد الفوز: DS-260 والوثائق والمقابلة. المشاركة بدولار واحد ولا تحتاج إلى وسيط. لا علاقة لنا بالحكومة الأمريكية.",
      hint: "الجنسية وما الذي ليس واضحًا",
    },
  },
  hi: {
    heading: (country) => `${country}: वीज़ा में मदद चाहिए?`,
    body: "हम सिर्फ़ फ़ोटो बनाते हैं। वीज़ा में आपको क्या चाहिए, लिखें: हम हर अनुरोध का जवाब देते हैं, और अगर कंसल्टेंट की ज़रूरत हो, तो आपको इस देश का काम देखने वाले कंसल्टेंट से जोड़ते हैं; जहाँ देश लाइसेंस माँगता है, वहाँ लाइसेंस वाले से। उनकी सर्विस पेड है; वीज़ा की गारंटी कोई नहीं दे सकता।",
    open: "सवाल पूछें",
    name: "नाम",
    contact: "ईमेल, फ़ोन या WhatsApp",
    topic: "किस बारे में है?",
    choose: "चुनें",
    topics: {
      tourist: "टूरिस्ट या बिज़नेस यात्रा",
      study: "पढ़ाई",
      work: "नौकरी",
      family: "परिवार के पास जाना, रेज़िडेंस",
      refusal: "पहले वीज़ा रिजेक्ट हुआ",
      "dv-selected": "लॉटरी में चुने जाने के बाद: DS-260 और इंटरव्यू",
      "dv-entry": "एंट्री के बारे में सवाल",
      other: "कुछ और",
    },
    message: "अपनी स्थिति कुछ शब्दों में",
    messageHint: "नागरिकता, यात्रा कब करनी है, पहले कभी वीज़ा रिजेक्ट हुआ या नहीं",
    consent: "मैं सहमत हूँ कि visayes मेरे अनुरोध को AI असिस्टेंट की मदद से भी देखे और उसे किसी वीज़ा कंसल्टेंट को दे सके, जो मुझसे संपर्क करेंगे।",
    privacy: "हम इसका क्या करते हैं",
    submit: "भेजें",
    sending: "भेजा जा रहा है…",
    sent: "भेज दिया गया। हम आपके दिए संपर्क पर जवाब देंगे।",
    failed: "भेजा नहीं जा सका। एक मिनट बाद फिर कोशिश करें या info@superduperai.co पर लिखें।",
    tag: "वीज़ा सहायता",
    usVisa: {
      heading: "अमेरिका का वीज़ा, कंसल्टेंट की मदद से",
      body: "फ़ोटो हम बनाते हैं। बाकी कामों (DS-160 फ़ॉर्म, इंटरव्यू अपॉइंटमेंट और उसकी तैयारी) के लिए अपनी स्थिति लिखें: हम जवाब देंगे, और ज़रूरत हो तो वीज़ा कंसल्टेंट से जोड़ देंगे। उनकी सर्विस पेड है, फ़ीस वे काम शुरू करने से पहले बताते हैं। वीज़ा की गारंटी कोई नहीं दे सकता, फ़ैसला कॉन्सुलेट करता है।",
      short: "DS-160, अपॉइंटमेंट और इंटरव्यू में मदद। पेड सर्विस; वीज़ा की गारंटी कोई नहीं दे सकता।",
    },
    usDv: {
      heading: "DV लॉटरी में चुने गए?",
      body: "लॉटरी में हिस्सा लेने की फ़ीस $1 है, जो dvprogram.state.gov पर अमेरिकी विदेश विभाग को दी जाती है, और आवेदन आप खुद करते हैं: किसी एजेंट की ज़रूरत नहीं, और हम एंट्री में मदद नहीं बेचते। चुने जाने के बाद काम मुश्किल होता है: DS-260 फ़ॉर्म, दस्तावेज़, कॉन्सुलेट में इंटरव्यू। अपनी स्थिति लिखें: हम जवाब देंगे, और ज़रूरत हो तो कंसल्टेंट से जोड़ देंगे, उनकी सर्विस पेड है। visayes का अमेरिकी सरकार से कोई संबंध नहीं है।",
      short: "चुने जाने के बाद: DS-260, दस्तावेज़ और इंटरव्यू। एंट्री की फ़ीस $1 है, एजेंट की ज़रूरत नहीं। अमेरिकी सरकार से हमारा कोई संबंध नहीं।",
      hint: "नागरिकता और क्या साफ़ नहीं है",
    },
  },
  zh: {
    heading: (country) => `${country}：签证需要帮助？`,
    body: "我们只负责照片。告诉我们你在签证上需要什么：每份申请我们都会回复；如需顾问，我们会为你联系负责该国家的顾问，在该国要求执照的情况下只联系持照顾问。顾问服务收费，任何人都无法保证签证获批。",
    open: "提问",
    name: "姓名",
    contact: "邮箱、电话或微信",
    topic: "咨询内容",
    choose: "请选择",
    topics: {
      tourist: "旅游或商务出行",
      study: "留学",
      work: "工作",
      family: "家庭团聚、居留",
      refusal: "曾被拒签",
      "dv-selected": "中签之后：DS-260 和面签",
      "dv-entry": "关于报名的问题",
      other: "其他",
    },
    message: "简要说明你的情况",
    messageHint: "国籍、计划出行时间、是否被拒签过",
    consent: "我同意 visayes 审阅我的申请（包括借助 AI 助手），并可将其转交给签证顾问，由顾问与我联系。",
    privacy: "我们如何处理这些信息",
    submit: "提交",
    sending: "正在提交…",
    sent: "已提交。我们会通过你留下的联系方式回复。",
    failed: "提交失败。请一分钟后重试，或发邮件至 info@superduperai.co。",
    tag: "签证协助",
    usVisa: {
      heading: "美国签证，请顾问协助",
      body: "照片由我们负责。其余部分（DS-160 表格、面签预约和面签准备）请说明你的情况：我们会回复，如有需要再为你联系签证顾问。顾问服务收费，会在开始前报价。任何人都无法保证签证获批，决定权在领事馆。",
      short: "协助 DS-160、预约和面签。付费服务，任何人都无法保证签证获批。",
    },
    usDv: {
      heading: "DV 抽签中签了？",
      body: "参加抽签需支付 1 美元，这是美国国务院在 dvprogram.state.gov 上收取的费用，由你自己提交，不需要中介，我们也不出售报名协助。中签之后才更复杂：DS-260 表格、各类文件、领事馆面签。请说明你的情况：我们会回复，如有需要再为你联系顾问，顾问服务收费。visayes 与美国政府没有任何关联。",
      short: "中签之后：DS-260、文件和面签。报名费 1 美元，无需中介。我们与美国政府无关联。",
      hint: "国籍以及不清楚的地方",
    },
  },
};
