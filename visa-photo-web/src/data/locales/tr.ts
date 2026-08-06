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
      `${country} ${doc.toLocaleLowerCase("tr")} fotoğrafı ölçüsü — ${size}, şartlar ve ücretsiz araç`,
    docNotes: ({ background, size, headMm, mm }) =>
      `${background} arka plan, ${size}, çeneden tepeye baş yüksekliği yaklaşık ${headMm} ${mm}.`,
  },

  answer: ({ w, h, kb, format, bg }) =>
    `${bg} arka plan üzerinde ${w} × ${h} piksel, ${format} biçiminde ve ${kb} KB altında bir fotoğraf gerekiyor. ` +
    `Hemen burada hazırlayın. Fotoğraf tarayıcınızda işlenir, hiçbir yere yüklenmez.`,
  verified: ({ date, source }) => `${date} tarihinde doğrulandı · ${source}`,
  checkerVerified: ({ date }) =>
    `Bu sayfadan çıkan bir fotoğraf ${date} tarihinde kurumun resmî fotoğraf denetiminden geçti`,
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
    dropSub: (doc) => `${doc} şartnamesine göre kırpar, yüzü düzeltir ve arka planı tek adımda temizleriz`,
    choose: "Dosya seçin",
    camera: "ya da kamerayı kullanın",
    working: "İşleniyor…",
    framedTo: (size) => `${size} ölçüsüne çerçevelendi`,
    downloadJpeg: "JPEG indir",
    downloadPng: "PNG, sıkıştırmasız",
    downloadSheet: (n) => `A4 sayfa · ${n} fotoğraf`,
    guideCrown: "tepe",
    guideEyes: (pct) => `gözler %${pct}`,
    guideChin: "çene",
    reset: "Baştan başla",
    checkResult: "Bu sonucu denetle",
    tip: "Taşımak için sürükleyin · yakınlaştırmak için kaydırın",

    removeBg: "Arka planı beyaz yap",
    removeBgHint: "{mb} MB'lık model bir kez iner, sonrası internetsiz çalışır",
    bgDone: "Arka plan değiştirildi",
    bgUndo: "Aslını geri getir",
    tryBetterHint: "Daha ağır bir model deneyin. Saç ve gözlük, hafif modelin pes ettiği yerdir.",
    modelCaveat:
      "Tek bir model her fotoğrafın altından kalkmaz. Kenarlar tırtıklı çıktıysa büyüğü genelde " +
      "düzeltir — ve arkanızdaki düz bir duvar her modeli geçer.",
    cached: "Zaten indirildi",

    alignFace: "Yüze göre hizala",
    aligning: "Yüz aranıyor…",
    alignHint: "Başı ve göz hizasını bu belgenin istediği yere koyar. 15 MB'lık model bir kez iner.",
    alignFailed: "Yüz bulunamadı — kırpmayı elle ayarlayın",
    tooTight: "Çok yakından çekilmiş: başın çevresinde bu belgeye kırpacak yer kalmamış. Biraz geri çekilip yeniden çekin.",
    aligned: "Yüze göre hizalandı",
    rotateLeft: "Sola çevir",
    rotateRight: "Sağa çevir",
    autoLevels: "Otomatik seviyeler",
    zoom: "Yakınlaştırma",

    undoLevels: "Ayarları geri al",
    changeModel: "Model değiştir",
    changeModelWhen: "Arka plan hâlâ beyaz olmadı mı, kenarlar tırtıklı mı?",
    modelsPageLink: "Modeller arasındaki fark",
    modelDefault: "Varsayılan",

    advanced: "Daha fazla denetim",
    advancedHint: "Fotoğrafların çoğunda bunlara gerek olmaz.",
    brightness: "Parlaklık",
    contrast: "Karşıtlık",
    shadows: "Gölgeler",
    resetLevels: "Sıfırla",
    transparentBg: "Saydam arka plan (PNG)",
    transparentHint: "Arka planı kendisi ekleyen formlar için. Başvuruların çoğu beyaz ister.",
    faceOval: "Yüz ovalini göster",
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
      "Bu belge {colour} istiyor. Diğerleri burada, çünkü bazı kurallar yalnızca «düz açık renk» " +
      "diyor ve gri, açık renk saçın beyaza karışmasını önlüyor.",
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
      "Işık yüzünüze eşit düşsün diye pencereye dönük durun, düz bir duvardan yaklaşık iki metre " +
      "uzakta. Biri makineyi aşağıdan değil göz hizasında tutsun. Nötr ifade, ağız kapalı, iki " +
      "kulak ve çene hattı görünür, başın arkasında gölge yok.",
    printing: "Baskı: sayfa başına kaç fotoğraf",
    printingBody: ({ n, w, h, dpi }) =>
      `${w} × ${h} mm ölçüsündeki ${n} fotoğraf, ${dpi} dpi ile tek bir A4 sayfaya sığar. ` +
      `%100 ölçekte yazdırın. «Sayfaya sığdır» ölçüyü sessizce değiştirir ve fotoğraf şartnameye uymaz olur.`,
    faq: "Sık sorulanlar",
    sources: "Kaynaklar",
    disclaimer:
      "Burası bağımsız bir site, resmî bir kurum değil. Şartlar değişir, bu yüzden başvurudan önce " +
      "resmî kaynakla karşılaştırın. Yayımlanmış şartnameye uyan bir fotoğrafın sözünü veriyoruz. " +
      "Başvurunun kabul edileceğinin sözünü asla vermiyoruz.",
    disclaimerShort: "Bağımsız site, resmî kurum değil. Şartları resmî kaynaktan doğrulayın.",
    related: "İlgili sayfalar",
  },

  warn: {
    noEditing:
      "Bu kurum düzenleme yazılımı, filtre veya yapay zekâ araçlarıyla değiştirilmiş fotoğrafları " +
      "kabul etmiyor. Buradaki araçla çerçevelemeyi kontrol edin, başvuruya düzenlenmemiş bir " +
      "fotoğraf verin.",
    noEditingAtAction:
      "Arka planı kaldırmak da fotoğrafı düzenlemektir ve bu kurum düzenlenmiş fotoğrafı reddeder. " +
      "Bunu çerçevelemenin tutup tutmadığını görmek için kullanın, teslim edeceğiniz dosya için değil.",
    noHomePrint: "Evde basılan fotoğraflar kabul edilmiyor — profesyonel baskı hizmeti kullanın.",
    proceedAnyway: "Yine de kaldır",
  },

  submission: {
    upload: "Dosya olarak verilir",
    print: "Basılı olarak teslim edilir",
    captured: "Randevuda sizin için çekilir",
  },

  countryPage: {
    faqDocs: (country) => `${country} hangi belgeler için fotoğraf istiyor?`,
    faqDocsA: ({ country, list }) =>
      `${country}: ${list}. Her sayfa tam ölçüyü yazar ve o ölçüye kırpan bir araç taşır.`,
    faqSame: (country) => `${country} belgelerinin hepsinde tek fotoğraf işe yarar mı?`,
    faqSameYes: ({ size }) => `Evet — hepsi ${size} kullanıyor, tek bir dışa aktarma hepsine yeter.`,
    faqSameNo: "Hayır — ölçüler farklı, her biri kendi dışa aktarmasını istiyor.",
    h1: (country) => `${country}: fotoğraf şartları`,
    lead: ({ country, n }) =>
      `${country} için ${n} belge; her biri tam ölçüsü ve o ölçüye kırpan aracıyla.`,
    title: (country) => `${country} fotoğraf ölçüsü ve şartları — ücretsiz araç`,
    docHeadline: ({ title, size }) => `${title}: ${size}`,
  },

  agent: {
    heading: "Bunu bir yapay zekâ asistanına verin",
    lead:
      "Metni herhangi bir yapay zekâ asistanına yapıştırın; gereken her şey elinde olur: kesin " +
      "sayılar, geldikleri sayfa ve karşılaştırıldıkları kaynak. Tam şartname ise daha uzun olan " +
      "başvuru sürümüdür.",
    copyPrompt: "Asistanınız için metni kopyalayın",
    copySpec: "Tam şartnameyi kopyalayın",
    copied: "Kopyalandı",
    openSkills: "Asistan becerileri",
    disclaimer:
      "Başvuru rehberliği değil, başvuru bilgisi. Başvuruyu başvuran doldurur ve imzalar.",
  },

  check: {
    tab: "Fotoğraf denetle",
    makeTab: "Fotoğraf hazırla",
    title: "Elinizdeki fotoğrafı denetleyin",
    lead:
      "Dosya zaten var mı? Buraya bırakın, hangi şartları karşıladığını görün. Hiçbir şey " +
      "yüklenmiyor — denetimler tarayıcınızda çalışıyor.",
    drop: "Denetlemek istediğiniz fotoğrafı bırakın",
    choose: "Dosya seçin",
    allPass: "Ölçülebilen her şey uyuyor",
    someFail: "{n} denetim geçmedi",
    someWarn: "Her şey uyuyor, bakılması gereken bir nokta var",
    measured: "Ölçülen",
    expected: "İstenen",
    notChecked: "Bunun söyleyemeyecekleri",
    notCheckedBody:
      "Başın boyu ve yeri, yüz ifadesi, gözlerin açık olup olmadığı, gözlük, başörtüsü, başın " +
      "arkasındaki gölge ve fotoğrafın ne kadar yeni olduğu. Buradan geçmek, dosyanın yeterince " +
      "düz bir arka plan üzerinde doğru biçim ve ağırlıkta olduğu anlamına gelir — başvurunun " +
      "kabul edileceği anlamına değil.",
    fixIt: "Burada düzeltin",
    checkFace: "Yüzü de denetle",
    checkingFace: "Yüz ölçülüyor…",
    faceHint: "Baş yüksekliği, göz hizası ve eğiklik. 4 MB'lık model bir kez iner.",
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
          "Evet, filigran da yok kayıt da. Başka siteler ücretsiz önizleme gösterip temiz dosyayı " +
          "indirmek için para ister; burada indirmenin kendisi ücretsiz olan kısım.",
      },
      {
        q: "Fotoğrafım bir yere yükleniyor mu?",
        a:
          "Hayır. Kırpma ve arka plan silme, tarayıcınızın içinde WebAssembly ile çalışır. İnen tek " +
          "şey arka plan modelidir, fotoğraf cihazdan hiç çıkmaz. Kaynak kod açık, yani buna " +
          "inanmak yerine bakıp doğrulayabilirsiniz.",
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
          "Evet. Her belge sayfası, doğru sayıda kopyayı doğru ölçüde taşıyan bir A4 sayfayı PNG ve " +
          "PDF olarak verir. %100 ölçekte yazdırın — «sayfaya sığdır» ölçüyü sessizce değiştirir.",
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
    size: ({ doc }) => `${doc} fotoğrafı santimetre ve inç olarak kaç?`,
    sizeA: ({ mm, cm, inch }) =>
      `${mm} mm, yani ${cm} cm ya da ${inch} inç. Bunlar aynı fotoğrafın üç ayrı söylenişi; ` +
      `önünüzdeki form hangi birimi istiyorsa onu kullanın.`,
    pixels: ({ doc }) => `${doc} fotoğrafı piksel olarak kaç?`,
    pixelsA: ({ px, dpi }) =>
      `${px} piksel; baskı ölçüsünde bu ${dpi} dpi eder. Daha küçüğü baskıda yumuşak görünür.`,
    perSheet: ({ doc }) => `Bir sayfaya kaç adet ${doc} fotoğrafı sığar?`,
    perSheetA: ({ n, size }) =>
      `A4 sayfaya ${size} ölçüsünde ${n} fotoğraf. %100 ölçekte yazdırın, asla «sayfaya sığdır» ile değil.`,
    background: ({ doc }) => `${doc} fotoğrafı hangi arka plan rengini istiyor?`,
    backgroundA: ({ bg }) =>
      `${bg}, düz ve eşit aydınlatılmış, başın arkasında gölge yok. Arkanızdaki duvar uygun ` +
      `değilse araç arka planı sizin için değiştirebilir.`,
    fileSize: ({ doc }) => `${doc} fotoğrafı hangi biçim ve boyutta olmalı?`,
    fileSizeA: ({ format, kb }) =>
      `${format}, en çok ${kb} KB. Buradaki dışa aktarma, gereken çözünürlüğün altına düşmeden ` +
      `bu sınırın içinde kalacak şekilde sıkıştırır.`,
    uploadFails: ({ form }) => `${form} fotoğrafı neden reddediyor?`,
    uploadFailsA: ({ form, format, kb, px }) =>
      `${form}, ${format} olmayan her şeyi, ${kb} KB üstündeki her şeyi ve ${px} pikselden küçük ` +
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
