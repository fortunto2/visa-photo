import type { ActiveLang } from "./locales";
import type { CatalogEntry } from "./catalog";

/**
 * "Need help with the visa itself?" — a chat for the questions the site cannot answer.
 *
 * The site does photos and nothing else, and says so. The chat (ConsultChat.astro) takes the rest:
 * the application, the appointment, the interview, a refusal. An AI assistant in the
 * `visayes-leads` Worker (workers/leads/src/chat.ts) answers briefly and asks for a contact; when
 * the person leaves one, the conversation becomes a request that is stored and mailed on, and a
 * consultant who handles that country follows up by hand. Consultants may pay for that. The line
 * under the chat and the privacy page say all three, because each is something the person agrees
 * to by writing. Until 2026-10-30 this was a form; the request still records the country, the page
 * and a topic, which is how demand is measured before there is a partner for every country.
 *
 * Lines it does not cross, wherever it appears: no promise of a visa; no claim of a link to any
 * government; no paid help with entering the DV lottery, which costs $1 and needs no agent. Where
 * a country licenses visa advice (Canada, the UK, Australia, New Zealand), a request is passed
 * only to a licensed adviser, and the copy promises that.
 */

/**
 * How a page offers the chat, or null where it does not.
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

/**
 * Three ways into the same chat, rotated per visitor (ConsultChat, Page.astro) and compared in
 * analytics by `variant`: how fast it answers, a free look at the case, and fear of a refusal.
 * Each is a question the person can say yes to; none promises a visa or a date. Index 0 is
 * variant 1, which is also what a visitor without script sees.
 */
type Three<T> = [T, T, T];
interface Hooks {
  /** Visa pages without a consultant: the folded line, with the country's name. */
  visa: Three<(country: string) => string>;
  /** US visa pages, where the consultant answers: the card beside the headline and the banner. */
  us: Three<string>;
  /** DV pages. Nobody has been selected for DV-2027 yet, so none of these is about winning. */
  dv: Three<string>;
  cta: Three<string>;
}

interface Pitch {
  /** The banner with the chat. */
  body: string;
  /** The teaser beside the headline. */
  short: string;
}


interface Copy {
  hooks: Hooks;
  body: string;
  /** The chat's first message, written here rather than by the model: it costs nothing and says it is an AI. */
  greet: { "us-visa": string; "us-dv": string; general: (country: string) => string };
  placeholder: string;
  send: string;
  /** Under the input: who answers, and what happens to a contact left in the chat. */
  notice: string;
  privacy: string;
  failed: string;
  closed: string;
  /** The banner's label: someone else's service beside the checker, not a step of it. */
  tag: string;
  usVisa: Pitch;
  usDv: Pitch;
}

export const CONSULT_COPY: Record<ActiveLang, Copy> = {
  en: {
    hooks: {
      visa: [(country) => `${country} visa question? Get an answer in a minute`, (country) => `${country} visa: we'll look at your case for free`, (country) => `${country} visa: what could get you refused? Ask before you apply`],
      us: ["Going to the US? Ask about the visa, get an answer in a minute", "Long wait for a US visa interview? Ask how to get one sooner", "Refused a US visa? Let's see what to do next"],
      dv: ["DV lottery question? Get an answer in a minute", "DV-2027 is on hold. What to do now?", "One mistake disqualifies a DV entry. Ask before you apply"],
      cta: ["Ask a question", "Look at my case", "Ask"],
    },
    body: "We only do the photo. Tell us what you need with the visa: we answer every request, and when it takes a consultant, we put you in touch with one who handles this country, licensed where the country requires it. Their work is paid; no one can guarantee a visa.",
    greet: {
      "us-visa": "Hi! I'm the visayes AI assistant. Tell me about your US visa case: the purpose of the trip, citizenship, any past refusals.",
      "us-dv": "Hi! I'm the visayes AI assistant. Ask about the DV lottery: the dates, the photo, or what to do after selection.",
      general: (country) => `Hi! I'm the visayes AI assistant. What do you need with the visa for ${country}?`,
    },
    placeholder: "Write your question",
    notice: "An AI assistant answers. If you leave a contact, visayes passes the conversation to a visa consultant who will write to you.",
    privacy: "How we handle it",
    send: "Send",
    failed: "Could not send. Try again in a minute, or write to info@superduperai.co.",
    closed: "This chat is closed. To continue, write to info@superduperai.co.",
    tag: "Visa help",
    usVisa: {
      body: "The photo is our part. For the rest (the DS-160 form, the interview appointment, getting ready for the interview) tell us your case: we answer, and put you in touch with a visa consultant if you need one. Their work is paid, and they name the price before starting. No one can promise a visa; the consulate decides.",
      short: "Help with the DS-160, the appointment and the interview. Paid; no one can promise a visa.",
    },
    usDv: {
      body: "Entering costs $1, a State Department fee paid at dvprogram.state.gov, and you file the entry yourself: no agent is needed, and we do not sell help with entering. After selection it gets harder: the DS-260 form, the documents, the interview at the consulate. Tell us your case: we answer, and put you in touch with a consultant if you need one; their work is paid. visayes is not affiliated with the US government.",
      short: "After selection: the DS-260, documents and the interview. Entering costs $1 and needs no agent. Not affiliated with the US government.",
    },
  },
  ru: {
    hooks: {
      visa: [(country) => `${country}: вопрос по визе? Ответим за минуту`, (country) => `${country}: бесплатно разберём ваш случай с визой`, (country) => `${country}: что может помешать визе? Спросите до подачи`],
      us: ["Едете в США? Спросите про визу, ответим за минуту", "Долго ждать собеседование в США? Спросите, как быстрее", "Был отказ в визе США? Разберём, что делать дальше"],
      dv: ["Вопрос по DV-лотерее? Ответим за минуту", "DV-2027 на паузе. Что делать сейчас?", "Одна ошибка, и заявку DV аннулируют. Спросите до подачи"],
      cta: ["Задать вопрос", "Разобрать мой случай", "Спросить"],
    },
    body: "Мы делаем только фото. Расскажите, что нужно с визой: мы отвечаем на каждую заявку, а если нужен консультант, сведём с тем, кто работает с этой страной и имеет лицензию там, где она обязательна. Его услуги платные; визу не гарантирует никто.",
    greet: {
      "us-visa": "Здравствуйте! Я ИИ-ассистент visayes. Расскажите о визе в США: цель поездки, гражданство, были ли отказы.",
      "us-dv": "Здравствуйте! Я ИИ-ассистент visayes. Спросите про DV-лотерею: сроки, фото или что делать после выигрыша.",
      general: (country) => `Здравствуйте! Я ИИ-ассистент visayes. Расскажите, что нужно с визой (${country}): цель поездки, гражданство, сроки.`,
    },
    placeholder: "Напишите вопрос",
    notice: "Отвечает ИИ-ассистент. Если оставите контакт, visayes передаст переписку визовому консультанту, и он вам напишет.",
    privacy: "Как мы с ней обращаемся",
    send: "Отправить",
    failed: "Не отправилось. Попробуйте через минуту или напишите на info@superduperai.co.",
    closed: "Чат закрыт. Чтобы продолжить, напишите на info@superduperai.co.",
    tag: "Помощь с визой",
    usVisa: {
      body: "Фото делаем мы. С остальным (анкета DS-160, запись на собеседование, подготовка к нему) расскажите о ситуации: мы ответим и, если нужно, сведём с визовым консультантом. Его услуги платные, цену он называет до начала работы. Гарантировать визу не может никто, решение принимает консул.",
      short: "Анкета DS-160, запись и подготовка к собеседованию. Платно, визу не гарантирует никто.",
    },
    usDv: {
      body: "Участие стоит $1, это сбор Госдепа на dvprogram.state.gov, и подаёте вы сами: посредник не нужен, помощь с участием мы не продаём. После выигрыша сложнее: анкета DS-260, документы, собеседование в консульстве. Расскажите о ситуации: мы ответим и, если нужно, сведём с консультантом, его услуги платные. visayes не связан с правительством США.",
      short: "После выигрыша: DS-260, документы, собеседование. Участие стоит $1, посредник не нужен. Мы не связаны с правительством США.",
    },
  },
  es: {
    hooks: {
      visa: [(country) => `${country}: ¿dudas con el visado? Respuesta en un minuto`, (country) => `${country}: revisamos tu caso de visado gratis`, (country) => `${country}: ¿qué podría hacer que te nieguen el visado? Pregunta antes de solicitar`],
      us: ["¿Vas a EE. UU.? Pregunta por la visa, respuesta en un minuto", "¿Mucha espera para la entrevista de visa de EE. UU.? Pregunta cómo adelantarla", "¿Te negaron la visa de EE. UU.? Veamos qué hacer ahora"],
      dv: ["¿Dudas con la lotería DV? Respuesta en un minuto", "La DV-2027 está en pausa. ¿Qué hacer ahora?", "Un error descalifica tu inscripción DV. Pregunta antes"],
      cta: ["Preguntar", "Revisar mi caso", "Preguntar"],
    },
    body: "Nosotros solo hacemos la foto. Cuéntanos qué necesitas con el visado: respondemos a cada solicitud y, si hace falta un asesor, te ponemos en contacto con uno que lleve este país, con licencia donde el país la exige. Su trabajo es de pago; nadie puede garantizar un visado.",
    greet: {
      "us-visa": "¡Hola! Soy el asistente de IA de visayes. Cuéntame tu caso de visa para EE. UU.: motivo del viaje, nacionalidad, si te la han negado antes.",
      "us-dv": "¡Hola! Soy el asistente de IA de visayes. Pregunta sobre la lotería DV: fechas, foto o qué hacer si te seleccionan.",
      general: (country) => `¡Hola! Soy el asistente de IA de visayes. ¿Qué necesitas con el visado (${country})?`,
    },
    placeholder: "Escribe tu pregunta",
    notice: "Responde un asistente de IA. Si dejas un contacto, visayes pasará la conversación a un asesor de visados que te escribirá.",
    privacy: "Cómo la tratamos",
    send: "Enviar",
    failed: "No se pudo enviar. Inténtalo en un minuto o escribe a info@superduperai.co.",
    closed: "Este chat está cerrado. Para seguir, escribe a info@superduperai.co.",
    tag: "Ayuda con el visado",
    usVisa: {
      body: "La foto es cosa nuestra. Para el resto (el formulario DS-160, la cita de la entrevista y la preparación) cuéntanos tu caso: te respondemos y, si hace falta, te ponemos en contacto con un asesor de visados. Su trabajo es de pago y te dice el precio antes de empezar. Nadie puede garantizar la visa; decide el consulado.",
      short: "Ayuda con el DS-160, la cita y la entrevista. De pago; nadie puede garantizar la visa.",
    },
    usDv: {
      body: "Participar cuesta 1 USD, una tasa del Departamento de Estado que se paga en dvprogram.state.gov, y lo haces tú mismo: no hace falta intermediario y no vendemos ayuda para inscribirse. Tras la selección se complica: el formulario DS-260, los documentos, la entrevista en el consulado. Cuéntanos tu caso: te respondemos y, si hace falta, te ponemos en contacto con un asesor; su trabajo es de pago. visayes no tiene relación con el gobierno de EE. UU.",
      short: "Tras la selección: DS-260, documentos y entrevista. Participar cuesta 1 USD y no necesita intermediarios. Sin relación con el gobierno de EE. UU.",
    },
  },
  fr: {
    hooks: {
      visa: [(country) => `${country} : une question sur le visa ? Réponse en une minute`, (country) => `${country} : on regarde votre dossier de visa gratuitement`, (country) => `${country} : qu'est-ce qui pourrait faire refuser votre visa ? Demandez avant de déposer`],
      us: ["Vous partez aux États-Unis ? Une question sur le visa, réponse en une minute", "Trop d'attente pour l'entretien de visa américain ? Demandez comment l'avancer", "Visa américain refusé ? Voyons quoi faire ensuite"],
      dv: ["Une question sur la loterie DV ? Réponse en une minute", "La DV-2027 est suspendue. Que faire maintenant ?", "Une seule erreur disqualifie une inscription DV. Demandez avant"],
      cta: ["Poser une question", "Regarder mon dossier", "Demander"],
    },
    body: "Nous ne faisons que la photo. Dites-nous ce qu'il vous faut pour le visa : nous répondons à chaque demande et, s'il faut un consultant, nous vous mettons en relation avec un consultant qui s'occupe de ce pays, agréé là où le pays l'exige. Son travail est payant ; personne ne peut garantir un visa.",
    greet: {
      "us-visa": "Bonjour ! Je suis l'assistant IA de visayes. Parlez-moi de votre visa pour les États-Unis : motif du voyage, nationalité, refus éventuels.",
      "us-dv": "Bonjour ! Je suis l'assistant IA de visayes. Posez vos questions sur la loterie DV : dates, photo, ou que faire après la sélection.",
      general: (country) => `Bonjour ! Je suis l'assistant IA de visayes. De quoi avez-vous besoin pour le visa (${country}) ?`,
    },
    placeholder: "Écrivez votre question",
    notice: "Un assistant IA répond. Si vous laissez un contact, visayes transmet la conversation à un consultant en visas qui vous écrira.",
    privacy: "Ce que nous en faisons",
    send: "Envoyer",
    failed: "L'envoi a échoué. Réessayez dans une minute ou écrivez à info@superduperai.co.",
    closed: "Ce chat est fermé. Pour continuer, écrivez à info@superduperai.co.",
    tag: "Aide visa",
    usVisa: {
      body: "La photo, c'est nous. Pour le reste (le formulaire DS-160, le rendez-vous et la préparation de l'entretien), décrivez votre situation : nous répondons et, si besoin, vous mettons en relation avec un consultant en visas. Son travail est payant et il annonce son prix avant de commencer. Personne ne peut garantir un visa, c'est le consulat qui décide.",
      short: "Aide pour le DS-160, le rendez-vous et l'entretien. Payant ; personne ne peut garantir un visa.",
    },
    usDv: {
      body: "La participation coûte 1 $, une taxe du Département d'État payée sur dvprogram.state.gov, et se fait vous-même : aucun intermédiaire n'est nécessaire, et nous ne vendons pas d'aide pour s'inscrire. Après la sélection, c'est plus compliqué : le formulaire DS-260, les documents, l'entretien au consulat. Décrivez votre situation : nous répondons et, si besoin, vous mettons en relation avec un consultant ; son travail est payant. visayes n'a aucun lien avec le gouvernement américain.",
      short: "Après la sélection : DS-260, documents, entretien. La participation coûte 1 $ et ne demande aucun intermédiaire. Aucun lien avec le gouvernement américain.",
    },
  },
  pt: {
    hooks: {
      visa: [(country) => `${country}: dúvida sobre o visto? Resposta em um minuto`, (country) => `${country}: analisamos seu caso de visto de graça`, (country) => `${country}: o que pode fazer seu visto ser negado? Pergunte antes de aplicar`],
      us: ["Vai para os EUA? Pergunte sobre o visto, resposta em um minuto", "Muita espera pela entrevista do visto americano? Pergunte como adiantar", "Teve o visto americano negado? Vamos ver o que fazer agora"],
      dv: ["Dúvida sobre a loteria DV? Resposta em um minuto", "A DV-2027 está em pausa. O que fazer agora?", "Um erro desclassifica a inscrição na DV. Pergunte antes"],
      cta: ["Perguntar", "Analisar meu caso", "Perguntar"],
    },
    body: "Nós só fazemos a foto. Conte o que você precisa com o visto: respondemos a cada pedido e, se for preciso um consultor, colocamos você em contato com um que atende este país, com licença onde o país exige. O trabalho dele é pago; ninguém pode garantir um visto.",
    greet: {
      "us-visa": "Olá! Sou o assistente de IA da visayes. Conte sobre o seu visto para os EUA: motivo da viagem, nacionalidade, se já teve visto negado.",
      "us-dv": "Olá! Sou o assistente de IA da visayes. Pergunte sobre a loteria DV: datas, foto ou o que fazer depois do sorteio.",
      general: (country) => `Olá! Sou o assistente de IA da visayes. Do que você precisa com o visto (${country})?`,
    },
    placeholder: "Escreva sua pergunta",
    notice: "Quem responde é um assistente de IA. Se você deixar um contato, a visayes repassa a conversa a um consultor de vistos, que vai te escrever.",
    privacy: "Como tratamos os dados",
    send: "Enviar",
    failed: "Não foi possível enviar. Tente de novo em um minuto ou escreva para info@superduperai.co.",
    closed: "Este chat foi encerrado. Para continuar, escreva para info@superduperai.co.",
    tag: "Ajuda com visto",
    usVisa: {
      body: "A foto é com a gente. Para o resto (o formulário DS-160, o agendamento da entrevista e a preparação), conte o seu caso: respondemos e, se for preciso, colocamos você em contato com um consultor de vistos. O serviço dele é pago, e ele informa o preço antes de começar. Ninguém pode garantir o visto; quem decide é o consulado.",
      short: "Ajuda com o DS-160, o agendamento e a entrevista. Pago; ninguém pode garantir o visto.",
    },
    usDv: {
      body: "Participar custa US$ 1, uma taxa do Departamento de Estado paga em dvprogram.state.gov, e você mesmo se inscreve: não precisa de intermediário, e não vendemos ajuda com a inscrição. Depois do sorteio fica mais difícil: o formulário DS-260, os documentos, a entrevista no consulado. Conte o seu caso: respondemos e, se for preciso, colocamos você em contato com um consultor; o serviço dele é pago. A visayes não tem ligação com o governo dos EUA.",
      short: "Depois do sorteio: DS-260, documentos e entrevista. Participar custa US$ 1 e não precisa de intermediário. Sem ligação com o governo dos EUA.",
    },
  },
  tr: {
    hooks: {
      visa: [(country) => `${country}: vize sorunuz mu var? Bir dakikada yanıt`, (country) => `${country}: vize durumunuzu ücretsiz inceleyelim`, (country) => `${country}: vizenizin reddedilmesine ne yol açabilir? Başvurmadan önce sorun`],
      us: ["ABD'ye mi gidiyorsunuz? Vizeyi sorun, bir dakikada yanıt", "ABD vize mülakatı için uzun bekleme mi? Nasıl öne alınır, sorun", "ABD vizesi reddedildi mi? Sırada ne yapılacağına bakalım"],
      dv: ["DV piyangosu hakkında sorunuz mu var? Bir dakikada yanıt", "DV-2027 askıda. Şimdi ne yapmalı?", "Tek bir hata DV başvurusunu geçersiz kılar. Önceden sorun"],
      cta: ["Soru sorun", "Durumumu inceleyin", "Sorun"],
    },
    body: "Biz yalnızca fotoğrafı yapıyoruz. Vizeyle ilgili neye ihtiyacınız olduğunu yazın: her talebe yanıt veriyoruz, danışman gerekirse sizi bu ülkeyle ilgilenen, ülkenin şart koştuğu yerde lisanslı bir danışmanla buluşturuyoruz. Danışmanlık ücretlidir; vizeyi kimse garanti edemez.",
    greet: {
      "us-visa": "Merhaba! Ben visayes'in yapay zekâ asistanıyım. ABD vizenizi anlatın: seyahat amacı, vatandaşlık, daha önce ret alıp almadığınız.",
      "us-dv": "Merhaba! Ben visayes'in yapay zekâ asistanıyım. DV piyangosu hakkında sorun: tarihler, fotoğraf ya da kazandıktan sonra ne yapılacağı.",
      general: (country) => `Merhaba! Ben visayes'in yapay zekâ asistanıyım. Vizeyle (${country}) ilgili neye ihtiyacınız var?`,
    },
    placeholder: "Sorunuzu yazın",
    notice: "Yanıtları bir yapay zekâ asistanı verir. İletişim bilgisi bırakırsanız visayes yazışmayı size yazacak bir vize danışmanına iletir.",
    privacy: "Verileri nasıl kullanıyoruz",
    send: "Gönder",
    failed: "Gönderilemedi. Bir dakika sonra tekrar deneyin ya da info@superduperai.co adresine yazın.",
    closed: "Bu sohbet kapandı. Devam etmek için info@superduperai.co adresine yazın.",
    tag: "Vize desteği",
    usVisa: {
      body: "Fotoğraf bizden. Geri kalanı için (DS-160 formu, mülakat randevusu ve mülakata hazırlık) durumunuzu yazın: yanıt veririz, gerekirse sizi bir vize danışmanıyla buluştururuz. Danışmanlık ücretlidir; danışman ücreti işe başlamadan söyler. Vizeyi kimse garanti edemez, kararı konsolosluk verir.",
      short: "DS-160, randevu ve mülakat için destek. Ücretlidir; vizeyi kimse garanti edemez.",
    },
    usDv: {
      body: "Katılım 1 dolardır; bu ücret dvprogram.state.gov üzerinden ABD Dışişleri Bakanlığına ödenir ve başvuruyu kendiniz yaparsınız: aracıya gerek yoktur, biz de katılım için yardım satmıyoruz. Kazandıktan sonrası daha zordur: DS-260 formu, belgeler, konsoloslukta mülakat. Durumunuzu yazın: yanıt veririz, gerekirse sizi ücretli çalışan bir danışmanla buluştururuz. visayes'in ABD hükümetiyle bir bağlantısı yoktur.",
      short: "Kazandıktan sonra: DS-260, belgeler ve mülakat. Katılım 1 dolardır ve aracı gerekmez. ABD hükümetiyle bağlantımız yoktur.",
    },
  },
  ar: {
    hooks: {
      visa: [(country) => `${country}: سؤال عن التأشيرة؟ إجابة خلال دقيقة`, (country) => `${country}: نراجع حالتك مع التأشيرة مجانًا`, (country) => `${country}: ما الذي قد يؤدي إلى رفض تأشيرتك؟ اسأل قبل التقديم`],
      us: ["مسافر إلى الولايات المتحدة؟ اسأل عن التأشيرة واحصل على إجابة خلال دقيقة", "انتظار طويل لمقابلة التأشيرة الأمريكية؟ اسأل كيف تقرّب موعدك", "رُفضت تأشيرتك الأمريكية؟ لنرَ ما الخطوة التالية"],
      dv: ["سؤال عن قرعة DV؟ إجابة خلال دقيقة", "قرعة DV-2027 معلّقة. ماذا تفعل الآن؟", "خطأ واحد يُلغي مشاركتك في DV. اسأل قبل التقديم"],
      cta: ["اطرح سؤالك", "راجعوا حالتي", "اسأل"],
    },
    body: "نحن نجهّز الصورة فقط. أخبرنا بما تحتاجه في التأشيرة: نرد على كل طلب، وإذا احتجت إلى مستشار نوصلك بمستشار يختص بهذا البلد ويحمل ترخيصًا حيث يشترطه البلد. خدماته مدفوعة، ولا أحد يستطيع ضمان التأشيرة.",
    greet: {
      "us-visa": "مرحبًا! أنا مساعد visayes بالذكاء الاصطناعي. أخبرني عن تأشيرتك إلى الولايات المتحدة: غرض السفر، الجنسية، وهل سبق رفض طلبك.",
      "us-dv": "مرحبًا! أنا مساعد visayes بالذكاء الاصطناعي. اسأل عن قرعة DV: المواعيد أو الصورة أو ما يجب فعله بعد الفوز.",
      general: (country) => `مرحبًا! أنا مساعد visayes بالذكاء الاصطناعي. ماذا تحتاج بخصوص تأشيرة ${country}؟`,
    },
    placeholder: "اكتب سؤالك",
    notice: "يجيب مساعد ذكاء اصطناعي. إذا تركت وسيلة تواصل، ينقل الموقع المحادثة إلى مستشار تأشيرات يكتب لك.",
    privacy: "كيف نتعامل معه",
    send: "أرسل",
    failed: "تعذّر الإرسال. حاول بعد دقيقة أو راسلنا على info@superduperai.co.",
    closed: "أُغلقت هذه المحادثة. للمتابعة راسلنا على info@superduperai.co.",
    tag: "مساعدة في التأشيرة",
    usVisa: {
      body: "نحن نجهّز الصورة. أما بقية الخطوات (استمارة DS-160، وحجز موعد المقابلة، والتحضير لها) فأخبرنا بوضعك: نرد عليك، وإن لزم نوصلك بمستشار تأشيرات. خدماته مدفوعة ويحدد السعر قبل البدء. لا أحد يستطيع ضمان التأشيرة، فالقرار للقنصلية.",
      short: "مساعدة في استمارة DS-160 والموعد والمقابلة. خدمة مدفوعة، ولا أحد يضمن التأشيرة.",
    },
    usDv: {
      body: "المشاركة تكلّف دولارًا واحدًا رسومًا لوزارة الخارجية الأمريكية تُدفع عبر dvprogram.state.gov، وتقدّم بنفسك دون حاجة إلى وسيط، ونحن لا نبيع مساعدة في التسجيل. بعد الفوز يصبح الأمر أصعب: استمارة DS-260 والوثائق والمقابلة في القنصلية. أخبرنا بوضعك: نرد عليك، وإن لزم نوصلك بمستشار خدماته مدفوعة. لا علاقة للموقع بالحكومة الأمريكية.",
      short: "بعد الفوز: DS-260 والوثائق والمقابلة. المشاركة بدولار واحد ولا تحتاج إلى وسيط. لا علاقة لنا بالحكومة الأمريكية.",
    },
  },
  hi: {
    hooks: {
      visa: [(country) => `${country}: वीज़ा को लेकर सवाल? एक मिनट में जवाब`, (country) => `${country}: आपके वीज़ा केस को मुफ़्त में देखेंगे`, (country) => `${country}: आपका वीज़ा किस वजह से रिजेक्ट हो सकता है? आवेदन से पहले पूछें`],
      us: ["अमेरिका जा रहे हैं? वीज़ा के बारे में पूछें, एक मिनट में जवाब", "अमेरिकी वीज़ा इंटरव्यू का लंबा इंतज़ार? पूछें कि जल्दी कैसे हो", "अमेरिकी वीज़ा रिजेक्ट हुआ? देखते हैं आगे क्या करें"],
      dv: ["DV लॉटरी को लेकर सवाल? एक मिनट में जवाब", "DV-2027 रुका हुआ है। अभी क्या करें?", "एक गलती से DV एंट्री रद्द हो जाती है। पहले पूछ लें"],
      cta: ["सवाल पूछें", "मेरा केस देखें", "पूछें"],
    },
    body: "हम सिर्फ़ फ़ोटो बनाते हैं। वीज़ा में आपको क्या चाहिए, लिखें: हम हर अनुरोध का जवाब देते हैं, और अगर कंसल्टेंट की ज़रूरत हो, तो आपको इस देश का काम देखने वाले कंसल्टेंट से जोड़ते हैं; जहाँ देश लाइसेंस माँगता है, वहाँ लाइसेंस वाले से। उनकी सर्विस पेड है; वीज़ा की गारंटी कोई नहीं दे सकता।",
    greet: {
      "us-visa": "नमस्ते! मैं visayes का AI असिस्टेंट हूँ। अमेरिका के वीज़ा के बारे में बताइए: यात्रा का मकसद, नागरिकता, पहले कभी रिजेक्शन हुआ या नहीं।",
      "us-dv": "नमस्ते! मैं visayes का AI असिस्टेंट हूँ। DV लॉटरी के बारे में पूछिए: तारीखें, फ़ोटो या चुने जाने के बाद क्या करना है।",
      general: (country) => `नमस्ते! मैं visayes का AI असिस्टेंट हूँ। ${country} के वीज़ा में आपको क्या चाहिए?`,
    },
    placeholder: "अपना सवाल लिखें",
    notice: "जवाब AI असिस्टेंट देता है। अगर आप संपर्क छोड़ते हैं, तो visayes बातचीत किसी वीज़ा कंसल्टेंट को दे देगा, जो आपको लिखेंगे।",
    privacy: "हम इसका क्या करते हैं",
    send: "भेजें",
    failed: "भेजा नहीं जा सका। एक मिनट बाद फिर कोशिश करें या info@superduperai.co पर लिखें।",
    closed: "यह चैट बंद हो गई है। आगे बात करने के लिए info@superduperai.co पर लिखें।",
    tag: "वीज़ा सहायता",
    usVisa: {
      body: "फ़ोटो हम बनाते हैं। बाकी कामों (DS-160 फ़ॉर्म, इंटरव्यू अपॉइंटमेंट और उसकी तैयारी) के लिए अपनी स्थिति लिखें: हम जवाब देंगे, और ज़रूरत हो तो वीज़ा कंसल्टेंट से जोड़ देंगे। उनकी सर्विस पेड है, फ़ीस वे काम शुरू करने से पहले बताते हैं। वीज़ा की गारंटी कोई नहीं दे सकता, फ़ैसला कॉन्सुलेट करता है।",
      short: "DS-160, अपॉइंटमेंट और इंटरव्यू में मदद। पेड सर्विस; वीज़ा की गारंटी कोई नहीं दे सकता।",
    },
    usDv: {
      body: "लॉटरी में हिस्सा लेने की फ़ीस $1 है, जो dvprogram.state.gov पर अमेरिकी विदेश विभाग को दी जाती है, और आवेदन आप खुद करते हैं: किसी एजेंट की ज़रूरत नहीं, और हम एंट्री में मदद नहीं बेचते। चुने जाने के बाद काम मुश्किल होता है: DS-260 फ़ॉर्म, दस्तावेज़, कॉन्सुलेट में इंटरव्यू। अपनी स्थिति लिखें: हम जवाब देंगे, और ज़रूरत हो तो कंसल्टेंट से जोड़ देंगे, उनकी सर्विस पेड है। visayes का अमेरिकी सरकार से कोई संबंध नहीं है।",
      short: "चुने जाने के बाद: DS-260, दस्तावेज़ और इंटरव्यू। एंट्री की फ़ीस $1 है, एजेंट की ज़रूरत नहीं। अमेरिकी सरकार से हमारा कोई संबंध नहीं।",
    },
  },
  zh: {
    hooks: {
      visa: [(country) => `${country}签证有疑问？一分钟内回复`, (country) => `${country}签证：免费帮你看看你的情况`, (country) => `${country}签证：什么会导致拒签？申请前先问问`],
      us: ["要去美国？问问签证，一分钟内回复", "美签面谈要等很久？问问怎么提前", "美签被拒？看看下一步怎么办"],
      dv: ["DV 抽签有疑问？一分钟内回复", "DV-2027 暂停中，现在该怎么办？", "一个错误就会让 DV 报名作废，提交前先问问"],
      cta: ["提问", "看看我的情况", "提问"],
    },
    body: "我们只负责照片。告诉我们你在签证上需要什么：每份申请我们都会回复；如需顾问，我们会为你联系负责该国家的顾问，在该国要求执照的情况下只联系持照顾问。顾问服务收费，任何人都无法保证签证获批。",
    greet: {
      "us-visa": "你好！我是 visayes 的 AI 助手。请说说你的美国签证情况：出行目的、国籍、是否被拒签过。",
      "us-dv": "你好！我是 visayes 的 AI 助手。可以问我 DV 抽签的事：时间、照片，或中签后该做什么。",
      general: (country) => `你好！我是 visayes 的 AI 助手。${country}签证方面你需要什么帮助？`,
    },
    placeholder: "写下你的问题",
    notice: "由 AI 助手回答。如果你留下联系方式，visayes 会把对话转交给签证顾问，由顾问联系你。",
    privacy: "我们如何处理这些信息",
    send: "提交",
    failed: "提交失败。请一分钟后重试，或发邮件至 info@superduperai.co。",
    closed: "此对话已结束。如需继续，请发邮件至 info@superduperai.co。",
    tag: "签证协助",
    usVisa: {
      body: "照片由我们负责。其余部分（DS-160 表格、面签预约和面签准备）请说明你的情况：我们会回复，如有需要再为你联系签证顾问。顾问服务收费，会在开始前报价。任何人都无法保证签证获批，决定权在领事馆。",
      short: "协助 DS-160、预约和面签。付费服务，任何人都无法保证签证获批。",
    },
    usDv: {
      body: "参加抽签需支付 1 美元，这是美国国务院在 dvprogram.state.gov 上收取的费用，由你自己提交，不需要中介，我们也不出售报名协助。中签之后才更复杂：DS-260 表格、各类文件、领事馆面签。请说明你的情况：我们会回复，如有需要再为你联系顾问，顾问服务收费。visayes 与美国政府没有任何关联。",
      short: "中签之后：DS-260、文件和面签。报名费 1 美元，无需中介。我们与美国政府无关联。",
    },
  },
};
