import type { Dict } from "../i18n";

/**
 * Spanish. "Visa" rather than "visado": the applicants this reaches are overwhelmingly Mexican,
 * Colombian and Peruvian, and that is the word they type. Spain says visado, and would still
 * find the page.
 *
 * The templates join country and document with a dash on purpose. Spanish would otherwise need
 * the right preposition and article for each country — para México, para el Reino Unido, para
 * los Estados Unidos — which no shared template can decide from a name alone.
 */
const es: Dict = {
  nav: { countries: "Todos los países", models: "Modelos de fondo" },
  unit: { mm: "mm", cm: "cm", in: "in", px: "px", kb: "KB", mb: "MB" },
  dateLocale: "es-ES",
  readHere: "Leer esta página en español",

  kindName: { visa: "Visa", passport: "Pasaporte", permit: "Permiso de residencia" },
  gen: {
    docTitle: ({ country, doc }) => `Foto para ${doc.toLowerCase()} — ${country}`,
    pageTitle: ({ country, doc, size }) =>
      `${country}: tamaño de foto para ${doc.toLowerCase()} — ${size}, requisitos y herramienta gratis`,
    docNotes: ({ background, size, headMm, mm }) =>
      `Fondo ${background}, ${size}, cabeza de unos ${headMm} ${mm} desde el mentón hasta la coronilla.`,
  },

  answer: ({ w, h, kb, format, bg }) =>
    `Necesitas una foto de ${w} × ${h} píxeles con fondo ${bg}, en ${format} y de menos de ${kb} KB. ` +
    `Hazla aquí mismo. La foto se procesa en tu navegador y nunca se sube a ningún servidor.`,
  verified: ({ date, source }) => `Verificado el ${date} · ${source}`,
  checkerVerified: ({ date }) =>
    `Una foto de esta página superó el verificador oficial del organismo el ${date}`,
  backgroundIn: { white: "blanco", "light-grey": "gris claro" },
  backgroundName: { white: "Blanco", "light-grey": "Gris claro" },

  spec: {
    heading: "Especificación",
    print: "Tamaño impreso",
    digital: "Tamaño digital",
    background: "Fondo",
    headHeight: "Altura de la cabeza",
    eyeLine: "Línea de los ojos",
    file: "Archivo",
    perSheet: "Por hoja",
    fromBottom: "desde abajo",
    pieces: "fotos",
  },

  tool: {
    dropTitle: "Suelta aquí tu foto",
    dropSub: (doc) => `Recortamos según la norma de ${doc}, corregimos la inclinación de la cara y limpiamos el fondo en un solo paso`,
    choose: "Elegir un archivo",
    camera: "o usa la cámara",
    working: "Procesando…",
    framedTo: (size) => `Encuadrada a ${size}`,
    downloadJpeg: "Descargar JPEG",
    downloadPng: "PNG, sin compresión",
    downloadSheet: (n) => `Hoja A4 · ${n} fotos`,
    guideCrown: "coronilla",
    guideEyes: (pct) => `ojos ${pct} %`,
    guideChin: "mentón",
    reset: "Empezar de nuevo",
    checkResult: "Verificar este resultado",
    tip: "Arrastra para mover · rueda para hacer zoom",

    removeBg: "Poner el fondo blanco",
    removeBgHint: "Descarga un modelo de {mb} MB una sola vez; después funciona sin conexión",
    bgDone: "Fondo reemplazado",
    bgUndo: "Recuperar la foto original",
    tryBetterHint: "Prueba un modelo más pesado. Con el pelo y las gafas es donde el ligero se rinde.",
    modelCaveat:
      "Ningún modelo sirve para todas las fotos. Si el contorno sale dentado, uno más grande suele " +
      "arreglarlo, y una pared lisa detrás de ti supera a cualquier modelo.",
    cached: "Ya descargado",

    alignFace: "Alinear con la cara",
    aligning: "Buscando la cara…",
    alignHint: "Coloca la cabeza y la línea de los ojos en la posición que exige este documento. Descarga un modelo de 15 MB una sola vez.",
    alignFailed: "No se encontró ninguna cara: ajusta el recorte a mano",
    tooTight: "Tomada demasiado cerca: no queda espacio alrededor de la cabeza para recortar según este documento. Aléjate un poco y vuelve a tomarla.",
    aligned: "Alineada con la cara",
    rotateLeft: "Girar a la izquierda",
    rotateRight: "Girar a la derecha",
    autoLevels: "Niveles automáticos",
    zoom: "Zoom",

    undoLevels: "Deshacer los ajustes",
    changeModel: "Cambiar de modelo",
    changeModelWhen: "¿El fondo sigue sin quedar blanco o los bordes salen dentados?",
    modelsPageLink: "En qué se diferencian los modelos",
    modelDefault: "Predeterminado",

    advanced: "Más controles",
    advancedHint: "Para la mayoría de las fotos no hacen falta.",
    brightness: "Brillo",
    contrast: "Contraste",
    shadows: "Sombras",
    resetLevels: "Restablecer",
    transparentBg: "Fondo transparente (PNG)",
    transparentHint: "Para formularios que componen el fondo por su cuenta. La mayoría de las solicitudes lo quieren blanco.",
    faceOval: "Mostrar el óvalo de la cara",
    fileName: "Nombre del archivo",
    fileNamePlaceholder: "por ejemplo, tu apellido",
    backdropLabel: "Color del fondo",
    backdropNames: {
      white: "Blanco",
      "off-white": "Blanco hueso",
      "light-grey": "Gris claro",
      "mid-grey": "Gris medio",
      "pale-blue": "Azul pálido",
    },
    backdropRequired:
      "Este documento pide {colour}. Los demás están aquí porque algunas normas solo dicen " +
      "«fondo claro y liso», y un gris evita que el pelo claro se pierda en el blanco.",
  },

  trust: {
    inBrowser: "Se procesa en tu navegador",
    noServer: "Nunca se envía a un servidor",
    noWatermark: "Sin marca de agua",
    noSignup: "Sin registro",
    free: "Gratis, sin límites",
    why: "No se sube nada porque no hace falta. El recorte ocurre en un lienzo dentro de tu navegador, y el fondo lo quita una red neuronal que se descarga a tu dispositivo y se ejecuta ahí. Lo único que viaja es el modelo al bajar; tu foto no sale de la pestaña. El código es público, así que esto se comprueba en lugar de creerse.",
  },

  seo: {
    requirements: "Requisitos de la foto",
    requirementsIntro: (doc) => `Todo lo que debe cumplir una foto de ${doc} para ser aceptada.`,
    howToShoot: "Cómo hacerla en casa",
    howToShootBody:
      "Colócate frente a una ventana para que la luz te ilumine el rostro de forma uniforme, a unos " +
      "dos metros de una pared lisa. Que alguien sostenga la cámara a la altura de los ojos, no " +
      "desde abajo. Expresión neutra, boca cerrada, las dos orejas y la línea de la mandíbula " +
      "visibles, sin sombra detrás de la cabeza.",
    printing: "Impresión: cuántas fotos por hoja",
    printingBody: ({ n, w, h, dpi }) =>
      `${n} fotos de ${w} × ${h} mm caben en una hoja A4 a ${dpi} dpi. ` +
      `Imprime al 100 % de escala. «Ajustar a la página» cambia el tamaño sin avisar y la foto deja de cumplir la norma.`,
    faq: "Preguntas frecuentes",
    sources: "Fuentes",
    disclaimer:
      "Este es un sitio independiente, no un organismo oficial. Los requisitos cambian, así que " +
      "verifícalos en la fuente oficial antes de presentar la solicitud. Prometemos una foto que " +
      "cumple la especificación publicada. Nunca prometemos que una solicitud vaya a ser aprobada.",
    disclaimerShort: "Sitio independiente, no oficial. Verifica los requisitos en la fuente oficial.",
    related: "Páginas relacionadas",
  },

  warn: {
    noEditing:
      "Este organismo no acepta fotos modificadas con programas de edición, filtros o herramientas " +
      "de IA. Usa esta herramienta para revisar el encuadre y presenta una foto sin editar.",
    noEditingAtAction:
      "Quitar el fondo es editar la foto, y este organismo rechaza las fotos editadas. " +
      "Hazlo solo para ver si el encuadre funciona, no para el archivo que vas a presentar.",
    noHomePrint: "Las fotos impresas en casa no se aceptan: usa un servicio de impresión profesional.",
    studioOnly:
      "Este organismo exige que la foto se tome en un estudio comercial, que escribe su nombre y la fecha al dorso. Usa la herramienta para ver el encuadre y las medidas; la foto en sí tiene que salir del estudio.",
    proceedAnyway: "Quitarlo de todos modos",
  },

  submission: {
    upload: "Se presenta como archivo",
    print: "Se entrega impresa",
    captured: "Te la toman en la cita",
  },

  countryPage: {
    faqDocs: (country) => `¿Para qué documentos hace falta una foto en ${country}?`,
    faqDocsA: ({ country, list }) =>
      `${country}: ${list}. Cada página indica el tamaño exacto e incluye una herramienta que recorta a esa medida.`,
    faqSame: (country) => `¿Sirve una sola foto para todos los documentos de ${country}?`,
    faqSameYes: ({ size }) => `Sí: todos usan ${size}, así que una sola exportación sirve para todos.`,
    faqSameNo: "No: los tamaños son distintos, así que cada uno necesita su propia exportación.",
    h1: (country) => `${country}: requisitos de la foto`,
    lead: ({ country, n }) =>
      `${n} documentos de ${country}, cada uno con su tamaño exacto y una herramienta que recorta a esa medida.`,
    title: (country) => `Tamaño y requisitos de las fotos de ${country} — herramienta gratis`,
    docHeadline: ({ title, size }) => `${title}: ${size}`,
  },

  agent: {
    heading: "Dáselo a un asistente de IA",
    lead:
      "Pega el texto en cualquier asistente de IA y tendrá todo lo necesario: las cifras exactas, " +
      "la página de la que salieron y la fuente con la que se contrastaron. La especificación " +
      "completa es la versión de referencia, más larga.",
    copyPrompt: "Copiar el texto para tu asistente",
    copySpec: "Copiar la especificación completa",
    copied: "Copiado",
    openSkills: "Habilidades para asistentes",
    disclaimer:
      "Información de referencia, no asesoría migratoria. La solicitud la llena y la firma quien la presenta.",
  },

  check: {
    tab: "Verificar una foto",
    seoTitle: (doc: string) => `${doc}: verificador online — gratis, en tu navegador`,
    hubTitle: "Verificador de fotos de pasaporte y visa — gratis, sin subir nada",
    h1: (doc: string) => `${doc}: verificador`,
    seoDescription: (doc: string) => `Suelta la foto y comprueba qué requisitos cumple: tamaño, peso, formato, fondo, altura de la cabeza y línea de los ojos. No se sube nada: las comprobaciones se hacen en tu navegador.`,
    makeTab: "Hacer una foto",
    title: "Verificar una foto que ya tienes",
    lead:
      "¿Ya tienes el archivo? Suéltalo aquí y verás qué requisitos cumple. No se sube nada: las " +
      "comprobaciones se hacen en tu navegador.",
    drop: "Suelta la foto que quieres verificar",
    choose: "Elegir un archivo",
    allPass: "Todo lo medible cumple",
    someFail: "{n} de las comprobaciones no pasaron",
    someWarn: "Todo cumple, con una cosa que conviene mirar",
    measured: "Medido",
    expected: "Requerido",
    notChecked: "Lo que esto no puede decirte",
    notCheckedBody:
      "La expresión, si los ojos están abiertos, las gafas, " +
      "cualquier prenda en la cabeza, las sombras detrás de ti y cuánto tiempo tiene la foto. Que la " +
      "foto pase aquí significa que el archivo tiene la forma y el peso correctos sobre un fondo " +
      "suficientemente liso, no que la solicitud vaya a ser aceptada.",
    fixIt: "Arreglarla aquí",
    checkFace: "Verificar también la cara",
    checkingFace: "Midiendo la cara…",
    faceHint: "Altura de la cabeza, línea de los ojos e inclinación. Descarga un modelo de 15 MB una sola vez.",
    noFace: "No se encontró ninguna cara en esta foto",
    bgReplaced: "sustituido por software",
    bgPhotographed: "fotografiado",
    legendGot: "dónde está tu cara",
    legendWant: "dónde la quiere este documento",
    labels: {
      dimensions: "Tamaño en píxeles",
      ratio: "Proporción",
      filesize: "Tamaño del archivo",
      format: "Formato",
      "bg-brightness": "Luminosidad del fondo",
      "bg-even": "Uniformidad del fondo",
      "bg-synthetic": "Origen del fondo",
      "head-height": "Altura de la cabeza",
      "eye-line": "Línea de los ojos desde abajo",
      tilt: "Inclinación de la cabeza",
    },
  },

  hub: {
    h1: "Fotos para visa y documentos, según la norma de cada país",
    lead:
      "Elige el documento. Las medidas se completan solas, el recorte y el fondo se hacen en un paso, " +
      "y nada sale de tu navegador.",
    stats: ({ docs, langs }) => `${docs} documentos · ${langs} idiomas · gratis, sin marca de agua`,
    faq: [
      {
        q: "¿De verdad es gratis?",
        a:
          "Sí, y sin marca de agua ni registro. Otros sitios muestran una vista previa gratuita y " +
          "cobran por descargar el archivo limpio; aquí la descarga es justamente la parte gratuita.",
      },
      {
        q: "¿Se sube mi foto a algún sitio?",
        a:
          "No. El recorte y el borrado del fondo se ejecutan dentro de tu navegador con WebAssembly. " +
          "Lo único que se descarga es el modelo de fondo, y la foto nunca sale del dispositivo. " +
          "El código es público, así que puedes verificarlo en lugar de confiar en nuestra palabra.",
      },
      {
        q: "¿La foto sigue llevando mi ubicación y el modelo del teléfono?",
        a:
          "No. Una foto tomada con el teléfono lleva metadatos EXIF: las coordenadas GPS del lugar " +
          "donde se tomó, el modelo de la cámara, la fecha y a veces un nombre de propietario, y el " +
          "consulado recibe todo eso si envías el original. El archivo que produce esta herramienta " +
          "se codifica desde cero, así que no sobrevive nada de eso: solo los píxeles, un perfil de " +
          "color y la resolución de impresión.",
      },
      {
        q: "¿Puedo imprimirlas en casa?",
        a:
          "Sí. Cada página de documento exporta una hoja A4 en PNG y PDF con el número de copias " +
          "correcto y al tamaño exacto. Imprime al 100 % de escala: «ajustar a la página» las " +
          "redimensiona sin avisar. Una buena impresora doméstica con papel fotográfico sirve para la " +
          "mayoría de los documentos; donde hace falta un estudio, lo dice la página de ese documento.",
      },
      {
        q: "¿Van a aceptar mi solicitud?",
        a:
          "Eso no podemos prometerlo, y nadie honesto lo hará. Lo que la herramienta garantiza es un " +
          "archivo que cumple la especificación publicada del documento que elegiste. Los requisitos " +
          "cambian, así que revisa la fuente oficial enlazada en cada página antes de presentarla.",
      },
    ],
  },

  autoFaq: {
    size: ({ doc }) => `${doc}: ¿qué tamaño tiene en centímetros y pulgadas?`,
    sizeA: ({ mm, cm, inch }) =>
      `${mm} mm, es decir ${cm} cm o ${inch} pulgadas. Es la misma foto expresada de tres maneras; ` +
      `usa la unidad que te pida el formulario que tienes delante.`,
    pixels: ({ doc }) => `${doc}: ¿qué tamaño tiene en píxeles?`,
    pixelsA: ({ px, dpi }) =>
      `${px} píxeles, que al tamaño de impresión son ${dpi} dpi. Cualquier cosa menor saldrá borrosa al imprimir.`,
    perSheet: ({ doc }) => `${doc}: ¿cuántas copias caben en una hoja?`,
    perSheetA: ({ n, size }) =>
      `${n} fotos de ${size} en una hoja A4. Imprime al 100 % de escala, nunca «ajustar a la página».`,
    background: ({ doc }) => `${doc}: ¿de qué color debe ser el fondo?`,
    backgroundA: ({ bg }) =>
      `${bg}, liso y con luz uniforme, sin sombra detrás de la cabeza. Si la pared que tienes detrás ` +
      `no sirve, la herramienta puede reemplazar el fondo.`,
    fileSize: ({ doc }) => `${doc}: ¿qué formato y tamaño de archivo hacen falta?`,
    fileSizeA: ({ format, kb }) =>
      `${format}, sin pasar de ${kb} KB. La exportación de esta página comprime la foto para quedar ` +
      `por debajo de ese límite sin bajar de la resolución exigida.`,
    howFiled: ({ doc }: { doc: string }) => `${doc}: ¿se sube como archivo o se entrega impresa?`,
    howFiledA: ({ route, form }: { route: string; form: string }) => `${route}${form}`,
    editing: ({ doc }: { doc: string }) => `${doc}: ¿el organismo acepta una foto editada?`,
    checked: ({ doc }: { doc: string }) => `${doc}: ¿se ha verificado oficialmente una foto de esta página?`,
    uploadFails: ({ form }) => `¿Por qué ${form} rechaza la foto?`,
    uploadFailsA: ({ form, format, kb, px }) =>
      `${form} rechaza todo lo que no sea ${format}, todo lo que pase de ${kb} KB y todo lo que ` +
      `baje de ${px} píxeles. Exportar aquí mantiene los tres dentro de los límites. Si el archivo ` +
      `cumple y el sitio sigue dando error, el problema es de su servicio, no de tu foto.`,
  },

  // Generated from the catalogue and presets.toml — see ../docText.ts.
  country: {},
  docTitle: {},
  docShort: {},
  docNotes: {},
  pageTitle: {},
  faq: {},
};

export default es;
