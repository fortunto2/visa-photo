import type { Dict } from "../i18n";

/**
 * French. The dash between document and country saves the whole problem of prepositions:
 * French says en France, au Canada, aux États-Unis, à Singapour, and nothing in a country's
 * name tells a template which one to pick.
 *
 * Typographic detail worth keeping: French puts a narrow no-break space before ; : ? and !.
 * The colon in the heading is the layout's business, so it lives in docHeadline below.
 */
const fr: Dict = {
  nav: { countries: "Tous les pays", models: "Modèles d'arrière-plan" },
  unit: { mm: "mm", cm: "cm", in: "po", px: "px", kb: "Ko", mb: "Mo" },
  dateLocale: "fr-FR",
  readHere: "Lire cette page en français",

  kindName: { visa: "Visa", passport: "Passeport", permit: "Titre de séjour" },
  gen: {
    docTitle: ({ country, doc }) => `Photo de ${doc.toLowerCase()} — ${country}`,
    pageTitle: ({ country, doc, size }) =>
      `${country} : format de la photo de ${doc.toLowerCase()} — ${size}, exigences et outil gratuit`,
    docNotes: ({ background, size, headMm, mm }) =>
      `Fond ${background}, ${size}, tête d'environ ${headMm} ${mm} du menton au sommet du crâne.`,
  },

  answer: ({ w, h, kb, format, bg }) =>
    `Il vous faut une photo de ${w} × ${h} pixels sur fond ${bg}, en ${format} et sous les ${kb} Ko. ` +
    `Faites-la ici même. La photo est traitée dans votre navigateur et n'est envoyée nulle part.`,
  verified: ({ date, source }) => `Vérifié le ${date} · ${source}`,
  checkerVerified: ({ date }) =>
    `Une photo issue de cette page a passé le contrôle officiel de l'administration le ${date}`,
  backgroundIn: { white: "blanc", "light-grey": "gris clair" },
  backgroundName: { white: "Blanc", "light-grey": "Gris clair" },

  spec: {
    heading: "Spécification",
    print: "Format imprimé",
    digital: "Format numérique",
    background: "Fond",
    headHeight: "Hauteur du visage",
    eyeLine: "Ligne des yeux",
    file: "Fichier",
    perSheet: "Par feuille",
    fromBottom: "depuis le bas",
    pieces: "photos",
  },

  tool: {
    dropTitle: "Déposez votre photo ici",
    dropSub: (doc) => `Nous recadrons selon la norme ${doc}, redressons le visage et nettoyons le fond en une seule étape`,
    choose: "Choisir un fichier",
    camera: "ou utilisez l'appareil photo",
    working: "Traitement…",
    framedTo: (size) => `Cadrée au format ${size}`,
    downloadJpeg: "Télécharger en JPEG",
    downloadPng: "PNG, sans compression",
    downloadSheet: (n) => `Feuille A4 · ${n} photos`,
    guideCrown: "sommet du crâne",
    guideEyes: (pct) => `yeux ${pct} %`,
    guideChin: "menton",
    reset: "Recommencer",
    checkResult: "Contrôler ce résultat",
    tip: "Faites glisser pour déplacer · molette pour zoomer",

    removeBg: "Rendre le fond blanc",
    removeBgHint: "Télécharge une fois un modèle de {mb} Mo, puis fonctionne hors ligne",
    bgDone: "Fond remplacé",
    bgUndo: "Revenir à l'originale",
    tryBetterHint: "Essayez un modèle plus lourd. Les cheveux et les lunettes sont là où le léger abandonne.",
    modelCaveat:
      "Aucun modèle ne convient à toutes les photos. Si le contour ressort déchiqueté, un plus " +
      "grand y remédie en général — et un mur uni derrière vous vaut mieux que n'importe quel modèle.",
    cached: "Déjà téléchargé",

    alignFace: "Aligner sur le visage",
    aligning: "Recherche du visage…",
    alignHint: "Place la tête et la ligne des yeux là où ce document l'exige. Télécharge une fois un modèle de 15 Mo.",
    alignFailed: "Aucun visage trouvé — ajustez le cadrage à la main",
    tooTight: "Prise de trop près : il ne reste pas assez d'espace autour de la tête pour recadrer selon ce document. Reculez et refaites-la.",
    aligned: "Alignée sur le visage",
    rotateLeft: "Pivoter à gauche",
    rotateRight: "Pivoter à droite",
    autoLevels: "Niveaux automatiques",
    zoom: "Zoom",

    undoLevels: "Annuler les réglages",
    changeModel: "Changer de modèle",
    changeModelWhen: "Le fond n'est toujours pas blanc, ou les bords sont déchiquetés ?",
    modelsPageLink: "Ce qui distingue les modèles",
    modelDefault: "Par défaut",

    advanced: "Plus de réglages",
    advancedHint: "Pour la plupart des photos, vous n'en aurez pas besoin.",
    brightness: "Luminosité",
    contrast: "Contraste",
    shadows: "Ombres",
    resetLevels: "Réinitialiser",
    transparentBg: "Fond transparent (PNG)",
    transparentHint: "Pour les formulaires qui composent le fond eux-mêmes. La plupart des demandes le veulent blanc.",
    faceOval: "Afficher l'ovale du visage",
    fileName: "Nom du fichier",
    fileNamePlaceholder: "par exemple votre nom de famille",
    backdropLabel: "Couleur du fond",
    backdropNames: {
      white: "Blanc",
      "off-white": "Blanc cassé",
      "light-grey": "Gris clair",
      "mid-grey": "Gris moyen",
      "pale-blue": "Bleu pâle",
    },
    backdropRequired:
      "Ce document demande du {colour}. Les autres sont là parce que certaines règles disent " +
      "seulement « fond clair et uni », et parce qu'un gris empêche les cheveux clairs de se " +
      "fondre dans le blanc.",
  },

  trust: {
    inBrowser: "Traitée dans votre navigateur",
    noServer: "Jamais envoyée à un serveur",
    noWatermark: "Sans filigrane",
    noSignup: "Sans inscription",
  },

  seo: {
    requirements: "Exigences pour la photo",
    requirementsIntro: (doc) => `Tout ce qu'une photo de ${doc.toLowerCase()} doit respecter pour être acceptée.`,
    howToShoot: "Comment la faire chez soi",
    howToShootBody:
      "Placez-vous face à une fenêtre pour que la lumière tombe uniformément sur le visage, à deux " +
      "mètres environ d'un mur uni. Demandez à quelqu'un de tenir l'appareil à hauteur des yeux, " +
      "et non en contre-plongée. Expression neutre, bouche fermée, les deux oreilles et la ligne de " +
      "la mâchoire visibles, aucune ombre derrière la tête.",
    printing: "Impression : combien de photos par feuille",
    printingBody: ({ n, w, h, dpi }) =>
      `${n} photos de ${w} × ${h} mm tiennent sur une feuille A4 à ${dpi} ppp. ` +
      `Imprimez à l'échelle 100 %. « Ajuster à la page » redimensionne sans prévenir et la photo cesse de respecter la norme.`,
    faq: "Questions fréquentes",
    sources: "Sources",
    disclaimer:
      "Ce site est indépendant, ce n'est pas une administration. Les exigences changent : vérifiez-les " +
      "auprès de la source officielle avant de déposer votre demande. Nous garantissons une photo " +
      "conforme à la spécification publiée. Nous ne garantissons jamais l'acceptation d'une demande.",
    disclaimerShort: "Site indépendant, pas une administration. Vérifiez les exigences à la source officielle.",
    related: "Pages liées",
  },

  warn: {
    noEditing:
      "Cette administration n'accepte pas les photos retouchées avec un logiciel d'édition, des " +
      "filtres ou des outils d'IA. Servez-vous de l'outil ici pour vérifier le cadrage, puis " +
      "déposez une photo non retouchée.",
    noEditingAtAction:
      "Supprimer le fond, c'est retoucher la photo, et cette administration refuse les photos " +
      "retouchées. Utilisez-le pour voir si le cadrage tient, pas pour le fichier que vous déposerez.",
    noHomePrint: "Les photos imprimées chez soi ne sont pas acceptées — passez par un service d'impression professionnel.",
    proceedAnyway: "Le supprimer quand même",
  },

  submission: {
    upload: "Déposée sous forme de fichier",
    print: "Remise imprimée",
    captured: "Prise pour vous lors du rendez-vous",
  },

  countryPage: {
    faqDocs: (country) => `Pour quels documents ${country} exige-t-il une photo ?`,
    faqDocsA: ({ country, list }) =>
      `${country} : ${list}. Chaque page indique le format exact et propose un outil qui y recadre.`,
    faqSame: (country) => `Une seule photo suffit-elle pour tous les documents de ${country} ?`,
    faqSameYes: ({ size }) => `Oui — ils utilisent tous ${size}, un seul export convient à tous.`,
    faqSameNo: "Non — les formats diffèrent, chacun demande son propre export.",
    h1: (country) => `${country} : exigences pour la photo`,
    lead: ({ country, n }) =>
      `${n} documents pour ${country}, chacun avec son format exact et un outil qui y recadre.`,
    title: (country) => `Format et exigences des photos pour ${country} — outil gratuit`,
    docHeadline: ({ title, size }) => `${title} : ${size}`,
  },

  agent: {
    heading: "Confiez ceci à un assistant IA",
    lead:
      "Collez le texte dans n'importe quel assistant IA et il aura tout ce qu'il lui faut : les " +
      "chiffres exacts, la page d'où ils viennent et la source auprès de laquelle ils ont été " +
      "vérifiés. La spécification complète en est la version de référence, plus longue.",
    copyPrompt: "Copier le texte pour votre assistant",
    copySpec: "Copier la spécification complète",
    copied: "Copié",
    openSkills: "Compétences pour assistants",
    disclaimer:
      "Information de référence, pas un conseil en immigration. La demande est remplie et signée par son auteur.",
  },

  check: {
    tab: "Contrôler une photo",
    makeTab: "Faire une photo",
    title: "Contrôler une photo existante",
    lead:
      "Vous avez déjà le fichier ? Déposez-le ici et voyez quelles exigences il respecte. Rien n'est " +
      "envoyé — les contrôles tournent dans votre navigateur.",
    drop: "Déposez la photo à contrôler",
    choose: "Choisir un fichier",
    allPass: "Tout ce qui est mesurable est conforme",
    someFail: "{n} contrôles n'ont pas été passés",
    someWarn: "Tout est conforme, avec un point à regarder",
    measured: "Mesuré",
    expected: "Exigé",
    notChecked: "Ce que cela ne peut pas vous dire",
    notCheckedBody:
      "La taille et la position de la tête, l'expression, si les yeux sont ouverts, les lunettes, " +
      "les couvre-chefs, les ombres derrière la tête et l'ancienneté de la photo. Passer ici signifie " +
      "que le fichier a la bonne forme et le bon poids sur un fond suffisamment uni — pas qu'une " +
      "demande sera acceptée.",
    fixIt: "La corriger ici",
    checkFace: "Contrôler aussi le visage",
    checkingFace: "Mesure du visage…",
    faceHint: "Hauteur du visage, ligne des yeux et inclinaison. Télécharge une fois un modèle de 4 Mo.",
    noFace: "Aucun visage trouvé sur cette photo",
    labels: {
      dimensions: "Taille en pixels",
      ratio: "Proportions",
      filesize: "Poids du fichier",
      format: "Format",
      "bg-brightness": "Clarté du fond",
      "bg-even": "Uniformité du fond",
      "head-height": "Hauteur du visage",
      "eye-line": "Ligne des yeux depuis le bas",
      tilt: "Inclinaison de la tête",
    },
  },

  hub: {
    h1: "Photos de visa et de documents, à la norme de chaque pays",
    lead:
      "Choisissez le document. Les dimensions se remplissent toutes seules, le recadrage et le fond " +
      "se font en une étape, et rien ne sort de votre navigateur.",
    stats: ({ docs, langs }) => `${docs} documents · ${langs} langues · gratuit, sans filigrane`,
    faq: [
      {
        q: "C'est vraiment gratuit ?",
        a:
          "Oui, sans filigrane ni inscription. D'autres sites montrent un aperçu gratuit et font payer " +
          "le téléchargement du fichier propre ; ici, le téléchargement est justement la partie gratuite.",
      },
      {
        q: "Ma photo est-elle envoyée quelque part ?",
        a:
          "Non. Le recadrage et la suppression du fond tournent dans votre navigateur, en WebAssembly. " +
          "La seule chose téléchargée est le modèle d'arrière-plan, et la photo ne quitte jamais " +
          "l'appareil. Le code est public : cela se vérifie au lieu de se croire.",
      },
      {
        q: "La photo garde-t-elle ma position et le modèle de mon téléphone ?",
        a:
          "Non. Une photo de téléphone porte des métadonnées EXIF — les coordonnées GPS du lieu de " +
          "prise de vue, le modèle d'appareil, la date, parfois un nom de propriétaire — et le consulat " +
          "reçoit tout cela si vous envoyez l'originale. Le fichier produit ici est réencodé depuis " +
          "zéro : il n'en subsiste rien, seulement les pixels, un profil colorimétrique et la " +
          "résolution d'impression.",
      },
      {
        q: "Puis-je les imprimer chez moi ?",
        a:
          "Oui. Chaque page de document exporte une feuille A4 en PNG et en PDF, avec le bon nombre " +
          "de copies au bon format. Imprimez à l'échelle 100 % — « ajuster à la page » les " +
          "redimensionne en silence.",
      },
      {
        q: "Ma demande sera-t-elle acceptée ?",
        a:
          "Nous ne pouvons pas le promettre, et personne d'honnête ne le fera. Ce que l'outil garantit, " +
          "c'est un fichier conforme à la spécification publiée du document que vous avez choisi. Les " +
          "exigences changent : consultez la source officielle liée sur chaque page avant de déposer.",
      },
    ],
  },

  autoFaq: {
    size: ({ doc }) => `Quel est le format d'une photo de ${doc.toLowerCase()} en centimètres et en pouces ?`,
    sizeA: ({ mm, cm, inch }) =>
      `${mm} mm, soit ${cm} cm ou ${inch} pouces. C'est la même photo dite de trois façons ; ` +
      `utilisez l'unité que réclame le formulaire que vous avez sous les yeux.`,
    pixels: ({ doc }) => `Quel est le format d'une photo de ${doc.toLowerCase()} en pixels ?`,
    pixelsA: ({ px, dpi }) =>
      `${px} pixels, ce qui fait ${dpi} ppp au format imprimé. En dessous, le tirage paraîtra flou.`,
    perSheet: ({ doc }) => `Combien de copies d'une photo de ${doc.toLowerCase()} tiennent sur une feuille ?`,
    perSheetA: ({ n, size }) =>
      `${n} photos de ${size} sur une feuille A4. Imprimez à l'échelle 100 %, jamais « ajuster à la page ».`,
    background: ({ doc }) => `Quelle couleur de fond faut-il pour une photo de ${doc.toLowerCase()} ?`,
    backgroundA: ({ bg }) =>
      `${bg}, uni et éclairé uniformément, sans ombre derrière la tête. Si le mur derrière vous ne ` +
      `convient pas, l'outil peut remplacer le fond.`,
    fileSize: ({ doc }) => `Quel format et quel poids de fichier pour une photo de ${doc.toLowerCase()} ?`,
    fileSizeA: ({ format, kb }) =>
      `${format}, sans dépasser ${kb} Ko. L'export d'ici comprime pour rester sous cette limite ` +
      `sans descendre sous la résolution exigée.`,
    uploadFails: ({ form }) => `Pourquoi ${form} refuse-t-il la photo ?`,
    uploadFailsA: ({ form, format, kb, px }) =>
      `${form} refuse tout ce qui n'est pas ${format}, tout ce qui dépasse ${kb} Ko et tout ce qui ` +
      `est plus petit que ${px} pixels. L'export d'ici maintient les trois dans les limites. Si le ` +
      `fichier est conforme et que le site renvoie quand même une erreur, le problème vient de leur ` +
      `service, pas de votre photo.`,
  },

  // Generated from the catalogue and presets.toml — see ../docText.ts.
  country: {},
  docTitle: {},
  docShort: {},
  docNotes: {},
  pageTitle: {},
  faq: {},
};

export default fr;
