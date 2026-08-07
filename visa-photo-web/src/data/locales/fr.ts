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
  nav: { countries: "Tous les pays", models: "Modèles d'arrière-plan", tools: "Outils" },
  unit: { mm: "mm", cm: "cm", in: "po", px: "px", kb: "Ko", mb: "Mo" },
  dateLocale: "fr-FR",
  readHere: "Lire cette page en français",

  kindName: { visa: "Visa", passport: "Passeport", permit: "Titre de séjour" },
  gen: {
    docTitle: ({ country, doc }) => `Photo de ${doc.toLowerCase()} — ${country}`,
    pageTitle: ({ country, doc, size }) =>
      `Photo ${doc.toLowerCase()} ${country} : format et dimensions ${size} | photo d'identité en ligne gratuit`,
    docNotes: ({ background, size, headMm, mm }) =>
      `Fond ${background}, ${size}, tête de ${headMm} ${mm} environ du menton au sommet du crâne.`,
  },

  answer: ({ w, h, kb, format, bg }) =>
    `Il vous faut une photo de ${w} × ${h} pixels sur fond ${bg}, au format ${format} et de moins de ${kb} Ko. ` +
    `Faites-la ici même. La photo est traitée dans votre navigateur et n'est envoyée nulle part.`,
  verified: ({ date, source }) => `Vérifié le ${date} · ${source}`,
  checkerVerified: ({ date }) =>
    `Une photo issue de cette page a réussi le contrôle photo officiel de l'administration le ${date}`,
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
    guideEyes: (pct) => `yeux ${pct} %`,
    guideChin: "menton",
    reset: "Recommencer",
    checkResult: "Contrôler ce résultat",
    tip: "Faites glisser pour déplacer · molette pour zoomer",

    removeBg: "Rendre le fond blanc",
    removeBgHint: "Un modèle de {mb} Mo se télécharge une seule fois, puis tout fonctionne hors ligne",
    bgDone: "Fond remplacé",
    bgUndo: "Revenir à la photo d'origine",
    tryBetterHint: "Essayez un modèle plus lourd : c'est sur les cheveux et les lunettes que le modèle léger abandonne.",
    modelCaveat:
      "Aucun modèle ne convient à toutes les photos. Si le contour est déchiqueté, un modèle plus " +
      "lourd y remédie en général — et un mur uni derrière vous vaut mieux que n'importe quel modèle.",
    cached: "Déjà téléchargé",

    alignFace: "Aligner sur le visage",
    aligning: "Recherche du visage…",
    alignHint: "La tête et la ligne des yeux sont placées là où ce document l'exige. Un modèle de 15 Mo se télécharge une seule fois.",
    alignFailed: "Aucun visage trouvé — ajustez le cadrage à la main",
    tooTight: "Photo prise de trop près : il n'y a pas assez d'espace autour de la tête pour recadrer selon ce document. Reculez et refaites-la.",
    aligned: "Alignée sur le visage",
    rotateLeft: "Pivoter à gauche",
    rotateRight: "Pivoter à droite",
    autoLevels: "Niveaux automatiques",
    zoom: "Zoom",

    undoLevels: "Annuler les réglages",
    changeModel: "Changer de modèle",
    changeModelWhen: "Le fond n'est toujours pas blanc, ou les bords sont déchiquetés ?",
    modelsPageLink: "Ce qui distingue les modèles",
    modelDefault: "Par défaut",

    advanced: "Plus de réglages",
    advancedHint: "Pour la plupart des photos, vous n'en aurez pas besoin.",
    maxKb: "Poids du fichier",
    maxKbHint: "Cette administration publie {kb} Ko. Ne le changez que si votre portail indique sa propre limite.",
    brightness: "Luminosité",
    contrast: "Contraste",
    shadows: "Ombres",
    resetLevels: "Réinitialiser",
    transparentBg: "Fond transparent (PNG)",
    transparentHint: "Pour les formulaires qui ajoutent le fond eux-mêmes. La plupart des demandes le veulent blanc.",
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
      "Ce document exige le fond « {colour} ». Les autres sont là parce que certaines règles disent " +
      "seulement « fond clair et uni », et parce qu'un gris empêche les cheveux clairs de se " +
      "fondre dans le blanc.",
  },

  trust: {
    inBrowser: "Traitée dans votre navigateur",
    noServer: "Jamais envoyée à un serveur",
    noWatermark: "Sans filigrane",
    noSignup: "Sans inscription",
    free: "Gratuit, sans limite",
    why: "Rien n\u2019est envoyé parce que rien n\u2019a besoin de l\u2019être. Le recadrage se fait sur un canvas dans votre navigateur, et le fond est retiré par un réseau de neurones téléchargé sur votre appareil et exécuté là. La seule chose qui circule, c\u2019est le modèle qui descend ; votre photo ne quitte pas l\u2019onglet. Le code est public : cela se vérifie au lieu de se croire.",
  },

  consent: {
    text: "Votre photo reste sur votre appareil, cela ne change pas. Il s'agit seulement des statistiques Google, qui comptent les visites. Elles sont désactivées tant que vous n'acceptez pas.",
    more: "En savoir plus",
    accept: "Autoriser les statistiques",
    decline: "Non merci",
  },

  seo: {
    requirements: "Exigences pour la photo d'identité",
    requirementsIntro: (doc) => `Tout ce qu'une photo de ${doc.toLowerCase()} doit respecter pour être acceptée.`,
    howToShoot: "Comment la faire chez vous",
    howToShootBody:
      "Placez-vous face à une fenêtre pour que la lumière tombe uniformément sur votre visage, à deux " +
      "mètres environ d'un mur uni. Demandez à quelqu'un de tenir l'appareil à hauteur des yeux, " +
      "et non en contre-plongée. Expression neutre, bouche fermée, les deux oreilles et la ligne de " +
      "la mâchoire visibles, aucune ombre derrière la tête.",
    printing: "Impression : combien de photos par feuille",
    printingBody: ({ n, w, h, dpi }) =>
      `${n} photos de ${w} × ${h} mm tiennent sur une feuille A4 à ${dpi} ppp. ` +
      `Imprimez à l'échelle 100 %. « Ajuster à la page » redimensionne tout sans prévenir, et la photo cesse de respecter la norme.`,
    faq: "Questions fréquentes",
    sources: "Sources",
    disclaimer:
      "Ce site est indépendant, ce n'est pas une administration. Les exigences changent : vérifiez-les " +
      "auprès de la source officielle avant de déposer votre demande. Nous garantissons une photo " +
      "conforme à la spécification publiée. Nous ne garantissons jamais l'acceptation d'une demande.",
    disclaimerShort: "Site indépendant, pas une administration. Vérifiez les exigences auprès de la source officielle.",
    related: "Pages liées",
  },

  warn: {
    noEditing:
      "Cette administration n'accepte pas les photos modifiées avec un logiciel de retouche, des " +
      "filtres ou des outils d'IA. Utilisez l'outil de cette page pour vérifier le cadrage, puis " +
      "déposez une photo non retouchée.",
    noEditingAtAction:
      "Supprimer le fond, c'est retoucher la photo, et cette administration refuse les photos " +
      "retouchées. Servez-vous-en pour vérifier votre cadrage, pas pour produire le fichier que vous déposerez.",
    noHomePrint: "Les photos imprimées chez soi ne sont pas acceptées — passez par un service d'impression professionnel.",
    studioOnly:
      "Cette administration exige que la photo soit prise dans un studio commercial, qui inscrit son nom et la date au dos. Servez-vous de l'outil pour voir le cadrage et les chiffres ; la photo elle-même doit venir du studio.",
    proceedAnyway: "Le supprimer quand même",
  },

  submission: {
    upload: "Déposée sous forme de fichier",
    print: "Remise imprimée",
    captured: "Prise pour vous lors du rendez-vous",
  },

  countryPage: {
    faqDocs: (country) => `${country} : pour quels documents faut-il une photo ?`,
    faqDocsA: ({ country, list }) =>
      `${country} : ${list}. Chaque page indique le format exact et propose un outil qui recadre à ce format.`,
    faqSame: (country) => `${country} : une seule photo suffit-elle pour tous les documents ?`,
    faqSameYes: ({ size }) => `Oui — ils utilisent tous le même format, ${size}, donc un seul export suffit.`,
    faqSameNo: "Non — les formats diffèrent, chacun demande son propre export.",
    h1: (country) => `${country} : exigences pour la photo d'identité`,
    lead: ({ country, n }) =>
      `${country} : ${n} documents, chacun avec son format exact et un outil qui recadre à ce format.`,
    title: (country) => `${country} : format et exigences de la photo d'identité — outil gratuit`,
    docHeadline: ({ title, size }) => `${title} : ${size}`,
  },

  agent: {
    heading: "Confiez ceci à un assistant IA",
    lead:
      "Collez le texte dans n'importe quel assistant IA et il aura tout ce qu'il lui faut : les " +
      "chiffres exacts, la page d'où ils viennent et la source auprès de laquelle ils ont été " +
      "vérifiés. La spécification complète en est la version longue, celle qui fait référence.",
    copyPrompt: "Copier le texte pour votre assistant",
    copySpec: "Copier la spécification complète",
    copied: "Copié",
    openSkills: "Compétences pour assistants",
    disclaimer:
      "Information de référence, pas un conseil en immigration. La demande est remplie et signée par le demandeur.",
  },

  check: {
    tab: "Contrôler une photo",
    seoTitle: (doc: string) => `${doc} : vérificateur en ligne — gratuit, dans votre navigateur`,
    hubTitle: "Vérificateur de photo de passeport et de visa — gratuit, sans envoi",
    h1: (doc: string) => `${doc} : vérificateur`,
    seoDescription: (doc: string) => `Déposez la photo et voyez quelles exigences elle respecte : format, poids, fond, hauteur du visage et ligne des yeux. Rien n\u2019est envoyé — les contrôles tournent dans votre navigateur.`,
    makeTab: "Faire une photo",
    title: "Contrôler une photo existante",
    lead:
      "Vous avez déjà le fichier ? Déposez-le ici et voyez quelles exigences il respecte. Rien n'est " +
      "envoyé — les contrôles s'exécutent dans votre navigateur.",
    drop: "Déposez la photo à contrôler",
    choose: "Choisir un fichier",
    allPass: "Tout ce qui est mesurable est conforme",
    someFail: "Contrôles en échec : {n}",
    someWarn: "Tout est conforme, avec un point à surveiller",
    measured: "Mesuré",
    expected: "Exigé",
    notChecked: "Ce que cela ne peut pas vous dire",
    notCheckedBody:
      "L'expression, l'ouverture des yeux, les lunettes, " +
      "les couvre-chefs, les ombres derrière la tête et l'ancienneté de la photo. Un résultat conforme " +
      "ici signifie que le fichier a les bonnes dimensions et le bon poids sur un fond suffisamment " +
      "uni — pas qu'une demande sera acceptée.",
    fixIt: "La corriger ici",
    checkFace: "Contrôler aussi le visage",
    checkingFace: "Mesure du visage…",
    faceHint: "Hauteur du visage, ligne des yeux et inclinaison. Un modèle de 15 Mo se télécharge une seule fois.",
    noFace: "Aucun visage trouvé sur cette photo",
    bgReplaced: "remplacé par un logiciel",
    bgPhotographed: "photographié",
    legendGot: "où est votre visage",
    legendWant: "où ce document le veut",
    labels: {
      dimensions: "Taille en pixels",
      ratio: "Proportions",
      filesize: "Poids du fichier",
      format: "Format",
      "bg-brightness": "Clarté du fond",
      "bg-even": "Uniformité du fond",
      "bg-synthetic": "Origine du fond",
      "head-height": "Hauteur du visage",
      "eye-line": "Ligne des yeux depuis le bas",
      tilt: "Inclinaison de la tête",
    },
  },

  hub: {
    h1: "Photos d'identité pour visa et passeport, à la norme de chaque pays",
    lead:
      "Choisissez le document. Les dimensions se remplissent toutes seules, le recadrage et le fond " +
      "se font en une étape, et rien ne sort de votre navigateur.",
    stats: ({ docs, langs }) => `${docs} documents · ${langs} langues · gratuit, sans filigrane`,
    faq: [
      {
        q: "C'est vraiment gratuit ?",
        a:
          "Oui, sans filigrane ni inscription. D'autres sites affichent un aperçu gratuit et font payer " +
          "le téléchargement du fichier final ; ici, le téléchargement est justement ce qui est gratuit.",
      },
      {
        q: "Ma photo est-elle envoyée quelque part ?",
        a:
          "Non. Le recadrage et la suppression du fond s'exécutent dans votre navigateur, en WebAssembly. " +
          "La seule chose téléchargée est le modèle d'arrière-plan, et la photo ne quitte jamais " +
          "votre appareil. Le code est public : vous pouvez le vérifier au lieu de nous croire sur parole.",
      },
      {
        q: "La photo conserve-t-elle ma localisation et le modèle de mon téléphone ?",
        a:
          "Non. Une photo prise au téléphone contient des métadonnées EXIF — les coordonnées GPS du lieu " +
          "de prise de vue, le modèle d'appareil, la date, parfois un nom de propriétaire — et le consulat " +
          "reçoit tout cela si vous envoyez la photo d'origine. Le fichier produit ici est entièrement " +
          "réencodé : il n'en subsiste rien, seulement les pixels, un profil colorimétrique et la " +
          "résolution d'impression.",
      },
      {
        q: "Puis-je les imprimer chez moi ?",
        a:
          "Oui. Chaque page de document exporte une feuille A4 en PNG et en PDF, avec le bon nombre " +
          "de copies au bon format. Imprimez à l'échelle 100 % — « ajuster à la page » les " +
          "redimensionne sans prévenir. Une bonne imprimante domestique et du papier photo conviennent " +
          "à la plupart des documents ; là où un studio est exigé, la page du document le précise.",
      },
      {
        q: "Ma demande sera-t-elle acceptée ?",
        a:
          "Nous ne pouvons pas le promettre, et personne d'honnête ne le promettra. Ce que l'outil garantit, " +
          "c'est un fichier conforme à la spécification publiée du document que vous avez choisi. Les " +
          "exigences changent : consultez la source officielle liée sur chaque page avant de déposer votre demande.",
      },
    ],
  },

  customPage: {
    title: "Photo de n'importe quel format — en mm, cm, pouces ou pixels, gratuit",
    h1: "N'importe quel format, saisi à la main",
    lead: "Pour un format que les pages ci-dessus ne couvrent pas : indiquez la mesure demandée par votre formulaire, et le recadrage s'y conforme. En millimètres, centimètres, pouces ou pixels, selon ce qu'on vous demande. Tout se passe dans le navigateur.",
    width: "Largeur",
    height: "Hauteur",
    unitMm: "mm",
    unitPx: "pixels",
    unitLabel: "Unité",
    fileSize: "Poids maximal",
    dpi: "Résolution",
    presetHint: "Votre format",
    common: "Les formats les plus demandés :",
    whenToUse: "Quand cette page sert",
    whenToUseBody: "Un consulat qui demande un format inhabituel, un badge, un titre de transport, un formulaire qui donne ses propres millimètres. Si votre document figure au catalogue, passez plutôt par sa page : on y trouve la source officielle, la règle de hauteur du visage et la limite de poids du fichier, qu'une simple mesure ne dit pas.",
  },

  bgPage: {
    title: "Supprimer le fond d'une photo — gratuit, et rien n'est envoyé",
    cut: "Détourer le fond",
    h1: "Supprimer ou remplacer le fond",
    lead: "Déposez une photo, détourez le fond, puis mettez derrière la couleur que vous voulez — ou laissez-le transparent. Le réseau de neurones tourne dans cet onglet, l'image ne quitte pas votre appareil. Sans compte, sans filigrane, sans limite.",
    colour: "Mettre derrière :",
    keepTransparent: "Garder transparent",
    pickColour: "N'importe quelle couleur",
    download: "Télécharger",
    whenToUse: "À quoi cette page sert",
    whenToUseBody: "La photo d'identité n'est qu'un usage, et les pages par pays s'en chargent avec le cadrage et la règle de hauteur du visage. Cette page couvre tout le reste : une photo de profil, une annonce, un tirage, un portrait dont le fond ne convient pas. Rien n'y est mesuré ni comparé à une norme : la photo ressort à la taille où elle est entrée.",
  },

  privacyPage: {
    title: "Confidentialité — ce que ce site collecte et ce qu'il ne collecte pas",
    h1: "Confidentialité",
    lead: "Court, parce qu'il y a peu à décrire. Votre photo n'est jamais envoyée et rien ici ne vous identifie. Ce qui suit est l'ensemble, écrit pour être vérifié dans le code source plutôt que cru sur parole.",
    photoH: "Votre photographie",
    photoP: "Elle ne quitte pas votre appareil. Le recadrage, le redressement et la planche d'impression sont dessinés sur un canvas dans l'onglet, et le fond est retiré par un réseau de neurones qui tourne sur votre machine. Il n'y a pas d'envoi, donc aucune copie de votre visage sur nos serveurs — non pas supprimée ensuite, jamais reçue. Le vérificateur fonctionne pareil : il mesure le fichier dans l'onglet et rapporte ce qu'il a trouvé.",
    modelsH: "Les modèles",
    modelsP: "Détourer un fond et trouver un visage demandent un modèle, et ce modèle est téléchargé depuis un réseau de diffusion la première fois que vous le demandez. Cette requête indique au réseau votre adresse IP et le fichier demandé, comme tout téléchargement. Le modèle reste ensuite dans le cache du navigateur, et la deuxième fois tout fonctionne sans réseau. Rien de votre photo ne voyage avec lui.",
    countingH: "Le comptage des visites",
    countingP: "Le site a son propre compteur, sur son propre serveur. Il ne pose aucun cookie, n'écrit rien dans votre navigateur et ne crée aucun identifiant : il ne peut donc pas vous suivre d'une visite à l'autre ni d'un site à l'autre. Chaque événement note le chemin de la page, le site d'origine si vous venez d'un lien, l'heure, les paramètres de campagne présents dans l'adresse et les commandes utilisées — jamais ce que vous avez chargé. Comme tout serveur web, le nôtre voit l'adresse IP d'où vient la requête.",
    googleH: "La mesure de Google",
    googleP: "Il y a un conteneur Google Tag Manager, et il démarre éteint. Les valeurs par défaut du Consent Mode sont déclarées avant son chargement : tant que vous n'acceptez pas, il n'enregistre rien et ne lit rien. Le stockage publicitaire est refusé par défaut et rien sur ce site ne peut l'autoriser. Si vous acceptez les statistiques, Google reçoit ce qu'il reçoit partout : page, provenance, localisation approximative, appareil.",
    storedH: "Ce qui reste dans votre navigateur",
    storedP: "Trois choses, toutes locales : votre réponse à la question du consentement, le modèle de fond que vous préférez, et les fichiers des modèles eux-mêmes. Effacer les données de ce site dans votre navigateur supprime les trois, et tout fonctionne ensuite comme avant : la question sera simplement reposée et le modèle retéléchargé.",
    hostingH: "Hébergement",
    hostingP: "Les pages sont des fichiers statiques servis par Cloudflare Pages, qui conserve les journaux de requêtes que tout hébergeur conserve, adresses IP comprises, pour servir le site et le protéger des abus. Nous ne les consultons pour rien d'autre.",
    rightsH: "Comptes, paiement, droits",
    rightsP: "Il n'y a pas de compte, rien à créer, aucune adresse e-mail collectée et rien à payer. Comme nous ne conservons aucun enregistrement lié à une personne, il n'y a pas de profil à demander, corriger ou supprimer. Si vous avez accepté les statistiques Google et souhaitez revenir dessus, utilisez le bouton ci-dessous : l'effet est immédiat et la balise cesse d'enregistrer quoi que ce soit. Pour le reste, écrivez-nous.",
    changeAnswer: "Modifier ma réponse sur les statistiques",
    answerCleared: "C'est fait. La barre reposera la question à la page suivante.",
    contactH: "Contact",
    contactP: "Écrivez à info@superduperai.co. Le code source est public, donc chaque affirmation de cette page peut être vérifiée plutôt que crue.",
  },

  kbPage: {
    title: "Compresser une photo à 50, 100 ou 200 Ko — gratuit, rien n'est envoyé",
    alsoCropQ: "Besoin de recadrer aussi ?",
    alsoCropA: "Réglez la taille et le poids ensemble",
    h1: "Réduire une photo au poids demandé",
    lead: "Qu'un formulaire refuse le fichier parce qu'il dépasse la limite de poids est la première cause de rejet d'une photo. Choisissez le nombre demandé et la photo passe en dessous, ici dans le navigateur. Rien n'est envoyé et les dimensions restent les mêmes, sauf demande contraire.",
    target: "Passer sous :",
    run: "Compresser",
    working: "Compression…",
    was: "Avant",
    now: "maintenant",
    missed: "Impossible de descendre si bas sans abîmer l'image. Essayez un nombre plus grand, ou limitez aussi le plus grand côté : c'est lui qui fait vraiment perdre du poids.",
    keepSize: "Plus grand côté, si le formulaire le limite aussi :",
    download: "Télécharger",
    whenToUse: "Quand cette page sert",
    whenToUseBody: "Les portails indiquent un poids en kilo-octets bien plus souvent qu'une mesure en millimètres, et refusent l'envoi sans dire quelle limite a été dépassée. Si votre document figure au catalogue, passez par sa page : l'export y compresse à la limite de l'administration concernée et recadre à son format en même temps.",
  },

  pdfPage: {
    title: "Compresser un PDF à 1, 2 ou 5 Mo — gratuit, et le fichier ne quitte pas votre appareil",
    h1: "Compresser un PDF au poids demandé",
    lead: "Choisissez la limite indiquée par votre formulaire et le document passe en dessous, ici dans le navigateur. Rien n'est envoyé — et pour le scan d'un passeport, d'un relevé bancaire ou d'un contrat, cela compte bien plus que pour une photo.",
    target: "Faire tenir sous :",
    run: "Compresser",
    working: "Traitement…",
    was: "Avant",
    now: "maintenant",
    pages: "p.",
    missed: "Impossible de descendre si bas en restant lisible. Essayez une limite plus haute, ou découpez le document et envoyez-le en plusieurs fois.",
    rasterWarning: "La voie douce est essayée d'abord : seules les images à l'intérieur sont ré-encodées, et les résidus de métadonnées laissés par les éditeurs sont supprimés. Le texte, les polices, les liens et la couche OCR restent intacts. Ce n'est que si cela n'atteint pas votre limite que chaque page est redessinée en image — toujours plus léger, et toujours au prix du texte.",
    keptText: "Fait sans toucher au texte : il reste sélectionnable et consultable.",
    becameImages: "Les images seules n'ont pas suffi, les pages ont été redessinées. Toujours lisible, mais le texte fait désormais partie de l'image.",
    download: "Télécharger",
    fileLabel: "Fichier",
    whenToUse: "Quand cette page sert",
    whenToUseBody: "Les portails de visa, les universités et les banques annoncent une limite en mégaoctets puis refusent l'envoi sans dire quel fichier l'a dépassée. Le coupable habituel est un scan pris à pleine résolution d'appareil photo. Ici tout tourne dans votre navigateur et le document ne nous parvient jamais — et c'est précisément le sujet : ce que l'on compresse, ce sont des passeports, des relevés et des contrats, et tous les autres outils vous demandent justement de les téléverser.",
  },

  autoFaq: {
    size: ({ doc }) => `${doc} : quel format en centimètres et en pouces ?`,
    sizeA: ({ mm, cm, inch }) =>
      `${mm} mm, soit ${cm} cm ou ${inch} pouces. C'est la même photo exprimée de trois façons ; ` +
      `utilisez l'unité qu'exige le formulaire que vous avez sous les yeux.`,
    pixels: ({ doc }) => `${doc} : quel format en pixels ?`,
    pixelsA: ({ px, dpi }) =>
      `${px} pixels, soit ${dpi} ppp à la taille imprimée. En dessous, le tirage paraîtra flou.`,
    perSheet: ({ doc }) => `${doc} : combien de copies tiennent sur une feuille ?`,
    perSheetA: ({ n, size }) =>
      `${n} photos de ${size} sur une feuille A4. Imprimez à l'échelle 100 %, jamais « ajuster à la page ».`,
    background: ({ doc }) => `${doc} : quelle couleur de fond faut-il ?`,
    backgroundA: ({ bg }) =>
      `${bg}, uni et éclairé uniformément, sans ombre derrière la tête. Si le mur derrière vous ne ` +
      `convient pas, l'outil peut remplacer le fond.`,
    fileSize: ({ doc }) => `${doc} : quel format et quel poids de fichier ?`,
    fileSizeA: ({ format, kb }) =>
      `${format}, sans dépasser ${kb} Ko. L'export proposé ici comprime le fichier pour rester sous ` +
      `cette limite sans descendre sous la résolution exigée.`,
    howFiled: ({ doc }: { doc: string }) => `${doc} : déposée en fichier ou remise imprimée ?`,
    howFiledA: ({ route, form }: { route: string; form: string }) => `${route}${form}`,
    editing: ({ doc }: { doc: string }) => `${doc} : l\u2019administration accepte-t-elle une photo retouchée ?`,
    checked: ({ doc }: { doc: string }) => `${doc} : une photo de cette page a-t-elle été contrôlée officiellement ?`,
    uploadFails: ({ form }) => `${form} : la photo ne se charge pas ou elle est refusée, pourquoi ?`,
    uploadFailsA: ({ form, format, kb, px }) =>
      `${form} refuse tout ce qui n'est pas ${format}, tout ce qui dépasse ${kb} Ko et tout ce qui ` +
      `est plus petit que ${px} pixels. L'export proposé ici respecte les trois limites. Si le ` +
      `fichier est conforme et que le site renvoie quand même une erreur, le problème vient de leur ` +
      `service, pas de votre photo.`,
    covering: ({ doc }) => `${doc} : possible avec un hijab, un turban ou un autre couvre-chef ?`,
    coveringA: () =>
      `Oui. Le couvre-chef porté chaque jour pour un motif religieux est accepté ; un chapeau ` +
      `ordinaire ne l'est pas. Le visage doit être visible du bas du menton jusqu'au front, les deux ` +
      `bords du visage dégagés, et rien ne doit y porter d'ombre. Tissu uni, sans motif, et d'une ` +
      `couleur qui tranche avec le fond : un voile blanc sur fond blanc s'y confond, et c'est ` +
      `le refus que le Canada et la Türkiye signalent nommément. La palette proposée ici permet de ` +
      `mettre un fond contrasté.`,
    coveringStatement:
      `Les États-Unis demandent en plus une note signée attestant qu'il s'agit d'un vêtement ` +
      `religieux porté quotidiennement en public. Une phrase sur papier, jointe au dossier, sans ` +
      `rapport avec la photo.`,
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
