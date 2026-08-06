import type { Dict } from "../i18n";

/**
 * Turkish. The titles are built as noun compounds — "Kanada vize fotoğrafı" — because that is
 * the one construction whose suffix does not change with the word in front of it: the
 * possessive lands on fotoğraf, and fotoğrafı stays fotoğrafı whatever precedes it. Anything
 * with a case suffix on the country would need vowel harmony that no shared template can do
 * (Kanada'ya but İngiltere'ye, ABD'ye but Hindistan'a).
 */
const tr: Dict = {
  nav: { countries: "Tüm ülkeler", models: "Arka plan modelleri" },
  unit: { mm: "mm", cm: "cm", in: "inç", px: "px", kb: "KB", mb: "MB" },
  dateLocale: "tr-TR",
  readHere: "Bu sayfayı Türkçe okuyun",

  kindName: { visa: "Vize", passport: "Pasaport", permit: "İkamet izni" },
  gen: {
    docTitle: ({ country, doc }) => `${country} ${doc.toLocaleLowerCase("tr")} fotoğrafı`,
    pageTitle: ({ country, doc, size }) =>
      `${country} ${doc.toLocaleLowerCase("tr")} fotoğrafı ölçüleri — ${size}, şartlar ve ücretsiz araç`,
    docNotes: ({ background, size, headMm, mm }) =>
      `${background} arka plan, ${size}, çeneden tepeye baş yüksekliği yaklaşık ${headMm} ${mm}.`,
  },

  answer: ({ w, h, kb, format, bg }) =>
    `${bg} arka plan üzerinde, ${format} biçiminde ve en çok ${kb} KB olan ${w} × ${h} piksellik bir fotoğraf gerekiyor. ` +
    `Hemen burada hazırlayın. Fotoğrafınız tarayıcınızda işlenir, hiçbir yere yüklenmez.`,
  verified: ({ date, source }) => `${date} tarihinde doğrulandı · ${source}`,
  checkerVerified: ({ date }) =>
    `Bu sayfadan çıkan bir fotoğraf, ${date} tarihinde kurumun resmî fotoğraf denetiminden geçti`,
  backgroundIn: { white: "beyaz", "light-grey": "açık gri" },
  backgroundName: { white: "Beyaz", "light-grey": "Açık gri" },

  spec: {
    heading: "Teknik şartname",
    print: "Baskı ölçüsü",
    digital: "Dijital ölçü",
    background: "Arka plan",
    headHeight: "Baş yüksekliği",
    eyeLine: "Göz hizası",
    file: "Dosya",
    perSheet: "Sayfa başına",
    fromBottom: "alttan",
    pieces: "fotoğraf",
  },

  tool: {
    dropTitle: "Fotoğrafınızı buraya bırakın",
    dropSub: (doc) =>
      `Fotoğrafınız ${doc} şartnamesine göre kırpılır, yüz hizalanır, arka plan temizlenir — hepsi tek adımda`,
    choose: "Dosya seçin",
    camera: "ya da kameranızı kullanın",
    working: "İşleniyor…",
    framedTo: (size) => `${size} ölçüsüne çerçevelendi`,
    downloadJpeg: "JPEG indirin",
    downloadPng: "PNG, sıkıştırmasız",
    downloadSheet: (n) => `A4 sayfası · ${n} fotoğraf`,
    guideCrown: "tepe",
    guideEyes: (pct) => `gözler %${pct}`,
    guideChin: "çene",
    reset: "Baştan başlayın",
    checkResult: "Bu sonucu denetleyin",
    tip: "Taşımak için sürükleyin · yakınlaştırmak için kaydırın",

    removeBg: "Arka planı beyaz yapın",
    removeBgHint: "{mb} MB'lık model bir kez indirilir, sonrasında internetsiz çalışır",
    bgDone: "Arka plan değiştirildi",
    bgUndo: "Aslını geri getirin",
    tryBetterHint: "Daha ağır bir model deneyin. Saç ve gözlük, hafif modelin pes ettiği yerdir.",
    modelCaveat:
      "Tek bir model her fotoğrafın altından kalkmaz. Kenarlar tırtıklı çıktıysa daha büyük bir " +
      "model bunu genelde düzeltir — arkanızdaki düz bir duvar ise her modelden iyi sonuç verir.",
    cached: "Zaten indirildi",

    alignFace: "Yüze göre hizalayın",
    aligning: "Yüz aranıyor…",
    alignHint: "Başı ve göz hizasını bu belgenin istediği yere yerleştirir. 15 MB'lık model bir kez indirilir.",
    alignFailed: "Yüz bulunamadı — kırpmayı elle ayarlayın",
    tooTight: "Çok yakından çekilmiş: başınızın çevresinde bu belgeye göre kırpmaya yetecek boşluk yok. Biraz geri çekilip yeniden çekin.",
    aligned: "Yüze göre hizalandı",
    rotateLeft: "Sola çevirin",
    rotateRight: "Sağa çevirin",
    autoLevels: "Otomatik seviyeler",
    zoom: "Yakınlaştırma",

    undoLevels: "Ayarları geri alın",
    changeModel: "Modeli değiştirin",
    changeModelWhen: "Arka plan hâlâ beyaz olmadı mı, kenarlar tırtıklı mı?",
    modelsPageLink: "Modeller arasındaki fark",
    modelDefault: "Varsayılan",

    advanced: "Daha fazla ayar",
    advancedHint: "Çoğu fotoğrafta bunlara gerek kalmaz.",
    brightness: "Parlaklık",
    contrast: "Kontrast",
    shadows: "Gölgeler",
    resetLevels: "Sıfırlayın",
    transparentBg: "Saydam arka plan (PNG)",
    transparentHint: "Arka planı kendisi ekleyen formlar için. Başvuruların çoğu beyaz ister.",
    faceOval: "Yüz ovalini gösterin",
    fileName: "Dosya adı",
    fileNamePlaceholder: "örneğin soyadınız",
    backdropLabel: "Arka plan rengi",
    backdropNames: {
      white: "Beyaz",
      "off-white": "Kırık beyaz",
      "light-grey": "Açık gri",
      "mid-grey": "Orta gri",
      "pale-blue": "Soluk mavi",
    },
    backdropRequired:
      "Bu belge {colour} istiyor. Diğer renkler ise bazı kurallar yalnızca “düz, açık renk” dediği " +
      "için burada; gri de açık renk saçın beyaz arka planda kaybolmasını önlüyor.",
  },

  trust: {
    inBrowser: "Tarayıcınızda işlenir",
    noServer: "Hiçbir sunucuya gitmez",
    noWatermark: "Filigran yok",
    noSignup: "Kayıt yok",
  },

  seo: {
    requirements: "Fotoğraf şartları",
    requirementsIntro: (doc) => `Kabul edilen bir ${doc.toLocaleLowerCase("tr")} fotoğrafının karşılaması gereken her şey.`,
    howToShoot: "Evde nasıl çekilir",
    howToShootBody:
      "Düz bir duvardan yaklaşık iki metre uzakta, ışık yüzünüze eşit düşecek şekilde pencereye " +
      "dönük durun. Fotoğrafı çeken kişi makineyi aşağıdan değil göz hizasında tutsun. Nötr ifade, " +
      "ağız kapalı, iki kulak ve çene hattı görünür, başınızın arkasında gölge yok.",
    printing: "Baskı: sayfa başına kaç fotoğraf",
    printingBody: ({ n, w, h, dpi }) =>
      `${w} × ${h} mm ölçüsündeki ${n} fotoğraf, ${dpi} dpi ile tek bir A4 sayfasına sığar. ` +
      `%100 ölçekte yazdırın. “Sayfaya sığdır” seçeneği ölçüyü sessizce değiştirir, fotoğraf da şartnameye uymaz hâle gelir.`,
    faq: "Sık sorulanlar",
    sources: "Kaynaklar",
    disclaimer:
      "Burası bağımsız bir site, resmî bir kurum değil. Şartlar değişir; bu yüzden başvurudan önce " +
      "şartları resmî kaynaktan doğrulayın. Söz verdiğimiz şey, yayımlanmış şartnameye uyan bir " +
      "fotoğraftır. Başvurunun kabul edileceğine dair asla söz vermiyoruz.",
    disclaimerShort: "Bağımsız site, resmî kurum değil. Şartları resmî kaynaktan doğrulayın.",
    related: "İlgili sayfalar",
  },

  warn: {
    noEditing:
      "Bu kurum düzenleme yazılımı, filtre veya yapay zekâ araçlarıyla değiştirilmiş fotoğrafları " +
      "kabul etmiyor. Buradaki araçla çerçevelemeyi kontrol edin, başvuruda düzenlenmemiş bir " +
      "fotoğraf teslim edin.",
    noEditingAtAction:
      "Arka planı kaldırmak da fotoğrafı düzenlemek sayılır ve bu kurum düzenlenmiş fotoğrafları reddeder. " +
      "Bu aracı, çerçevelemenin işe yarayıp yaramadığını görmek için kullanın; teslim edeceğiniz dosya için değil.",
    noHomePrint: "Evde basılan fotoğraflar kabul edilmiyor — profesyonel baskı hizmeti kullanın.",
    studioOnly:
      "Bu kurum fotoğrafın ticari bir stüdyoda çekilmesini istiyor; stüdyo arkasına adını ve tarihi yazar. Buradaki araçla çerçevelemeyi ve ölçüleri görebilirsiniz, ama fotoğrafın kendisi stüdyodan gelmeli.",
    proceedAnyway: "Yine de kaldırın",
  },

  submission: {
    upload: "Dosya olarak gönderilir",
    print: "Basılı olarak teslim edilir",
    captured: "Randevuda sizin için çekilir",
  },

  countryPage: {
    faqDocs: (country) => `${country} hangi belgeler için fotoğraf istiyor?`,
    faqDocsA: ({ country, list }) =>
      `${country}: ${list}. Her sayfada tam ölçü ve o ölçüye kırpan bir araç var.`,
    faqSame: (country) => `${country} için bütün belgelerde tek bir fotoğraf işe yarar mı?`,
    faqSameYes: ({ size }) => `Evet — hepsi ${size} kullanıyor, tek bir dışa aktarma hepsine yeter.`,
    faqSameNo: "Hayır — ölçüler farklı, her biri için ayrı bir dışa aktarma gerekiyor.",
    h1: (country) => `${country}: fotoğraf şartları`,
    lead: ({ country, n }) =>
      `${country} için ${n} belge; her biri tam ölçüsü ve o ölçüye kırpan aracıyla birlikte.`,
    title: (country) => `${country} fotoğraf ölçüleri ve şartları — ücretsiz araç`,
    docHeadline: ({ title, size }) => `${title}: ${size}`,
  },

  agent: {
    heading: "Bunu bir yapay zekâ asistanına verin",
    lead:
      "Metni herhangi bir yapay zekâ asistanına yapıştırın; gereken her şey elinde olur: kesin " +
      "sayılar, geldikleri sayfa ve doğrulandıkları kaynak. Tam şartname ise aynı bilginin daha " +
      "uzun, ayrıntılı sürümüdür.",
    copyPrompt: "Asistanınız için metni kopyalayın",
    copySpec: "Tam şartnameyi kopyalayın",
    copied: "Kopyalandı",
    openSkills: "Asistan becerileri",
    disclaimer:
      "Göçmenlik danışmanlığı değil, bilgilendirme amaçlı kaynaktır. Başvuruyu başvuran doldurur ve imzalar.",
  },

  check: {
    tab: "Fotoğraf denetleme",
    makeTab: "Fotoğraf hazırlama",
    title: "Elinizdeki fotoğrafı denetleyin",
    lead:
      "Elinizde hazır bir dosya mı var? Buraya bırakın, hangi şartları karşıladığını görün. Hiçbir şey " +
      "yüklenmiyor — denetimler tarayıcınızda çalışıyor.",
    drop: "Denetlemek istediğiniz fotoğrafı buraya bırakın",
    choose: "Dosya seçin",
    allPass: "Ölçülebilen her şey uyuyor",
    someFail: "{n} denetim başarısız oldu",
    someWarn: "Her şey uyuyor, bakılması gereken bir nokta var",
    measured: "Ölçülen",
    expected: "İstenen",
    notChecked: "Bu denetimin söyleyemedikleri",
    notCheckedBody:
      "Yüz ifadesi, gözlerin açık olup olmadığı, gözlük, şapka veya " +
      "başörtüsü, başın arkasındaki gölge ve fotoğrafın ne kadar yeni olduğu. Buradan geçmesi, " +
      "dosyanın yeterince düz bir arka plan üzerinde doğru biçimde ve doğru boyutta olduğu " +
      "anlamına gelir; başvurunuzun kabul edileceği anlamına gelmez.",
    fixIt: "Burada düzeltin",
    checkFace: "Yüzü de denetleyin",
    checkingFace: "Yüz ölçülüyor…",
    faceHint: "Baş yüksekliği, göz hizası ve eğiklik. 15 MB'lık model bir kez indirilir.",
    noFace: "Bu fotoğrafta yüz bulunamadı",
    labels: {
      dimensions: "Piksel ölçüsü",
      ratio: "En-boy oranı",
      filesize: "Dosya boyutu",
      format: "Biçim",
      "bg-brightness": "Arka plan parlaklığı",
      "bg-even": "Arka plan düzgünlüğü",
      "head-height": "Baş yüksekliği",
      "eye-line": "Alttan göz hizası",
      tilt: "Baş eğikliği",
    },
  },

  hub: {
    h1: "Vize ve belge fotoğrafları, her ülkenin şartnamesine göre",
    lead:
      "Belgeyi seçin. Ölçüler kendiliğinden dolar, kırpma ve arka plan tek adımda biter, hiçbir şey " +
      "tarayıcınızdan dışarı çıkmaz.",
    stats: ({ docs, langs }) => `${docs} belge · ${langs} dil · ücretsiz, filigransız`,
    faq: [
      {
        q: "Gerçekten ücretsiz mi?",
        a:
          "Evet. Filigran da yok, kayıt da. Başka siteler ücretsiz önizleme gösterip temiz dosyayı " +
          "indirmek için para ister; burada indirmenin kendisi ücretsiz olan kısım.",
      },
      {
        q: "Fotoğrafım bir yere yükleniyor mu?",
        a:
          "Hayır. Kırpma ve arka plan kaldırma, tarayıcınızın içinde WebAssembly ile çalışır. " +
          "İndirilen tek şey arka plan modelidir, fotoğraf cihazdan hiç çıkmaz. Kaynak kod açık, " +
          "yani buna inanmak yerine bakıp doğrulayabilirsiniz.",
      },
      {
        q: "Fotoğrafta konumum ve telefon modelim kalıyor mu?",
        a:
          "Hayır. Telefon fotoğrafı EXIF verisi taşır — çekildiği yerin GPS koordinatları, kamera " +
          "modeli, tarih, bazen sahibinin adı — ve aslını gönderdiğinizde konsolosluk bunların " +
          "hepsini alır. Bu aracın ürettiği dosya sıfırdan kodlanır, dolayısıyla hiçbiri kalmaz: " +
          "yalnızca piksel verisi, bir renk profili ve baskı çözünürlüğü.",
      },
      {
        q: "Evde basabilir miyim?",
        a:
          "Evet. Her belge sayfası, doğru sayıda kopyayı doğru ölçüde içeren bir A4 sayfasını PNG ve " +
          "PDF olarak verir. %100 ölçekte yazdırın — “sayfaya sığdır” ölçüyü sessizce değiştirir. İyi bir ev yazıcısı ve fotoğraf kâğıdı " +
          "belgelerin çoğu için yeterli; stüdyo şart olan belgelerde bu, o belgenin sayfasında yazar.",
      },
      {
        q: "Başvurum kabul edilecek mi?",
        a:
          "Bunun sözünü veremeyiz, dürüst hiç kimse de veremez. Aracın güvence verdiği şey, seçtiğiniz " +
          "belgenin yayımlanmış şartnamesine uyan bir dosyadır. Şartlar değişir, bu yüzden başvurudan " +
          "önce her sayfada bağlantısı verilen resmî kaynağa bakın.",
      },
    ],
  },

  autoFaq: {
    size: ({ doc }) => `${doc}: kaç santimetre, kaç inç?`,
    sizeA: ({ mm, cm, inch }) =>
      `${mm} mm, yani ${cm} cm ya da ${inch} inç. Bunlar aynı fotoğrafın üç ayrı söylenişi; ` +
      `önünüzdeki form hangi birimi istiyorsa onu kullanın.`,
    pixels: ({ doc }) => `${doc}: kaç piksel olmalı?`,
    pixelsA: ({ px, dpi }) =>
      `${px} piksel; baskı ölçüsünde bu ${dpi} dpi eder. Daha küçüğü baskıda bulanık çıkar.`,
    perSheet: ({ doc }) => `${doc}: bir sayfaya kaç adet sığar?`,
    perSheetA: ({ n, size }) =>
      `Bir A4 sayfasına ${size} ölçüsünde ${n} fotoğraf sığar. %100 ölçekte yazdırın, asla “sayfaya sığdır” seçeneğiyle değil.`,
    background: ({ doc }) => `${doc}: arka plan rengi ne olmalı?`,
    backgroundA: ({ bg }) =>
      `${bg}, düz ve eşit aydınlatılmış, başınızın arkasında gölge yok. Arkanızdaki duvar uygun ` +
      `değilse araç arka planı sizin için değiştirebilir.`,
    fileSize: ({ doc }) => `${doc}: hangi biçim ve boyutta olmalı?`,
    fileSizeA: ({ format, kb }) =>
      `${format}, en çok ${kb} KB. Buradaki dışa aktarma, gereken çözünürlüğün altına düşmeden ` +
      `bu sınırın içinde kalacak şekilde sıkıştırır.`,
    uploadFails: ({ form }) => `${form} fotoğrafı neden reddediyor?`,
    uploadFailsA: ({ form, format, kb, px }) =>
      `${form}, ${format} olmayan her şeyi, ${kb} KB üzerindeki her şeyi ve ${px} pikselden küçük ` +
      `her şeyi geri çevirir. Buradan dışa aktarmak üçünü de sınırın içinde tutar. Dosya şartnameye ` +
      `uyuyorsa ve site yine hata veriyorsa, sorun onların hizmetinde, sizin fotoğrafınızda değil.`,
  },

  // Generated from the catalogue and presets.toml — see ../docText.ts.
  country: {},
  docTitle: {},
  docShort: {},
  docNotes: {},
  pageTitle: {},
  faq: {},
};

export default tr;
