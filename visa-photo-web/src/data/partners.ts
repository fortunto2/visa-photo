import type { ActiveLang } from "./locales";
import type { CatalogEntry } from "./catalog";

/**
 * What a visa applicant needs right after the photo, and the partner that sells it.
 *
 * The tool stays free and unwatermarked (docs/tz-visa-site.md §7): money comes from the step
 * AFTER the photo, never from the photo itself. Links come from Travelpayouts, project
 * "Visayes" (585380), marker 771286, sub_id `visa_next`.
 *
 * Russian-language pages get only services that work for people in Russia, and every link
 * there carries the ad-law label (erid + advertiser line), because Russian law requires it
 * next to the link. Other languages get international services.
 *
 * Insurance for non-Russian pages is missing on purpose: EKTA closed on 2026-10-08, and the
 * replacements (VisitorsCoverage, Insubuy) are still in Travelpayouts review.
 */

export interface Partner {
  id: string;
  href: string;
  /** Russian ad-law disclosure, shown next to the link. Only for links aimed at Russia. */
  adLabel?: string;
}

const AIRALO: Partner = {
  id: "airalo",
  href: "https://tp.media/r?campaign_id=541&erid=2VtzqxFGyBj&marker=771286&p=8310&sub_id=visa_next&trs=585380&u=https%3A%2F%2Fairalo.com",
};

const CHEREHAPA: Partner = {
  id: "cherehapa",
  href: "https://tp.media/r?campaign_id=24&erid=2VtzqxdWnQu&marker=771286&p=659&sub_id=visa_next&trs=585380&u=https%3A%2F%2Fcherehapa.ru",
  adLabel: "Реклама. ООО «Лаборатория Страхования Черехапа». ИНН 7731337242",
};

const AVIASALES: Partner = {
  id: "aviasales",
  href: "https://tp.media/r?campaign_id=100&erid=2VtzqxZ4pZs&marker=771286&p=4114&sub_id=visa_next&trs=585380&u=https%3A%2F%2Faviasales.ru",
  adLabel: "Реклама. Go Travel Un Limited. ИНН 9909520797",
};

/** Only visas lead to a trip. A passport or a residence permit does not imply one. */
export function showsPartners(entry: CatalogEntry): boolean {
  return entry.kind === "visa" && entry.doc !== "dv-lottery";
}

export function partnersFor(lang: ActiveLang): Partner[] {
  return lang === "ru" ? [CHEREHAPA, AVIASALES] : [AIRALO];
}

interface Copy {
  heading: string;
  disclosure: string;
  items: Record<string, { title: string; body: string; cta: string }>;
}

const ESIM = (title: string, body: string, cta: string) => ({ airalo: { title, body, cta } });

export const PARTNER_COPY: Record<ActiveLang, Copy> = {
  en: {
    heading: "Photo done. Next: the trip",
    disclosure: "Partner link: if you buy, we may earn a commission. Your price stays the same.",
    items: ESIM("eSIM for the trip", "Mobile data from the moment you land, no roaming and no SIM shop at the airport.", "Pick an eSIM on Airalo"),
  },
  ru: {
    heading: "Фото готово. Дальше поездка",
    disclosure: "Партнёрские ссылки: если купите, мы можем получить комиссию. Цена для вас та же.",
    items: {
      cherehapa: {
        title: "Страховка для визы",
        body: "Для Шенгена обязательна, с покрытием от 30 000 €. Сравнение полисов разных страховщиков на одной странице.",
        cta: "Подобрать полис на Черехапе",
      },
      aviasales: {
        title: "Билеты",
        body: "Поиск дешёвых рейсов по всем авиакомпаниям сразу.",
        cta: "Найти билеты на Авиасейлс",
      },
    },
  },
  es: {
    heading: "Foto lista. Ahora, el viaje",
    disclosure: "Enlace de afiliado: si compras, podemos recibir una comisión. Tu precio no cambia.",
    items: ESIM("eSIM para el viaje", "Datos móviles desde que aterrizas, sin roaming ni tienda de SIM en el aeropuerto.", "Elegir una eSIM en Airalo"),
  },
  fr: {
    heading: "Photo prête. Ensuite, le voyage",
    disclosure: "Lien partenaire : si vous achetez, nous pouvons toucher une commission. Votre prix reste le même.",
    items: ESIM("eSIM pour le voyage", "Des données mobiles dès l'atterrissage, sans roaming ni boutique SIM à l'aéroport.", "Choisir une eSIM sur Airalo"),
  },
  pt: {
    heading: "Foto pronta. Agora, a viagem",
    disclosure: "Link de parceiro: se você comprar, podemos receber uma comissão. Seu preço não muda.",
    items: ESIM("eSIM para a viagem", "Dados móveis desde o pouso, sem roaming e sem loja de chip no aeroporto.", "Escolher um eSIM na Airalo"),
  },
  tr: {
    heading: "Fotoğraf hazır. Sırada yolculuk var",
    disclosure: "Ortaklık bağlantısı: satın alırsanız komisyon alabiliriz. Sizin için fiyat değişmez.",
    items: ESIM("Yolculuk için eSIM", "İndiğiniz andan itibaren mobil veri, dolaşım ücreti ve havalimanında SIM kuyruğu yok.", "Airalo'da eSIM seçin"),
  },
  ar: {
    heading: "الصورة جاهزة. الخطوة التالية: الرحلة",
    disclosure: "رابط شريك: إذا اشتريت، قد نحصل على عمولة. السعر بالنسبة لك لا يتغير.",
    items: ESIM("شريحة eSIM للرحلة", "بيانات الجوال منذ لحظة الهبوط، بلا تجوال وبلا متجر شرائح في المطار.", "اختر eSIM من Airalo"),
  },
  hi: {
    heading: "फ़ोटो तैयार। अब यात्रा",
    disclosure: "पार्टनर लिंक: अगर आप खरीदते हैं, तो हमें कमीशन मिल सकता है। आपकी क़ीमत वही रहती है।",
    items: ESIM("यात्रा के लिए eSIM", "उतरते ही मोबाइल डेटा, बिना रोमिंग और बिना एयरपोर्ट पर सिम की दुकान के।", "Airalo पर eSIM चुनें"),
  },
  zh: {
    heading: "照片已完成。下一步：出行",
    disclosure: "合作链接：如果您购买，我们可能获得佣金。您支付的价格不变。",
    items: ESIM("出行用 eSIM", "落地即可上网，无需漫游，也不用在机场排队买 SIM 卡。", "在 Airalo 选择 eSIM"),
  },
};
