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
      `${country}: tamaño de la foto para ${doc.toLowerCase()} — ${size}, requisitos y herramienta gratis`,
    docNotes: ({ background, size, headMm, mm }) =>
      `Fondo ${background}, ${size}, cabeza de unos ${headMm} ${mm} desde el mentón hasta la coronilla.`,
  },

  answer: ({ w, h, kb, format, bg }) =>
    `Necesitas una foto de ${w} × ${h} píxeles sobre fondo ${bg}, en ${format} y por debajo de ${kb} KB. ` +
    `Hazla aquí mismo. La foto se procesa en tu navegador y no se sube a ningún sitio.`,
  verified: ({ date, source }) => `Verificado el ${date} · ${source}`,
  checkerVerified: ({ date }) =>
    `Una foto de esta página pasó el verificador oficial del organismo el ${date}`,
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
    dropSub: (doc) => `Recortamos según la norma de ${doc}, enderezamos la cara y limpiamos el fondo en un solo paso`,
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
    tip: "Arrastra para mover · rueda para acercar",

    removeBg: "Poner el fondo blanco",
    removeBgHint: "Descarga una vez un modelo de {mb} MB y después funciona sin conexión",
    bgDone: "Fondo sustituido",
    bgUndo: "Recuperar la original",
    tryBetterHint: "Prueba un modelo más pesado. El pelo y las gafas son donde el ligero se rinde.",
    modelCaveat:
      "Ningún modelo sirve para todas las fotos. Si el contorno sale mellado, uno más grande suele " +
      "arreglarlo, y una pared lisa detrás de ti gana a cualquier modelo.",
    cached: "Ya descargado",

    alignFace: "Alinear con la cara",
    aligning: "Buscando la cara…",
    alignHint: "Coloca la cabeza y la línea de los ojos donde lo exige este documento. Descarga una vez un modelo de 15 MB.",
    alignFailed: "No se encontró ninguna cara: ajusta el recorte a mano",
    tooTight: "Tomada demasiado cerca: no queda espacio alrededor de la cabeza para recortar según este documento. Aléjate y repítela.",
    aligned: "Alineada con la cara",
    rotateLeft: "Girar a la izquierda",
    rotateRight: "Girar a la derecha",
    autoLevels: "Niveles automáticos",
    zoom: "Zoom",

    undoLevels: "Deshacer los ajustes",
    changeModel: "Cambiar de modelo",
    changeModelWhen: "¿El fondo sigue sin quedar blanco, o los bordes salen mellados?",
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
      "off-white": "Blanco roto",
      "light-grey": "Gris claro",
      "mid-grey": "Gris medio",
      "pale-blue": "Azul pálido",
    },
    backdropRequired:
      "Este documento pide {colour}. Los demás están aquí porque algunas normas solo dicen " +
      "«fondo claro y liso», y un gris evita que el pelo claro se funda con el blanco.",
  },

  trust: {
    inBrowser: "Se procesa en tu navegador",
    noServer: "Nunca se envía a un servidor",
    noWatermark: "Sin marca de agua",
    noSignup: "Sin registro",
  },

  seo: {
    requirements: "Requisitos de la foto",
    requirementsIntro: (doc) => `Todo lo que debe cumplir una foto de ${doc} para ser aceptada.`,
    howToShoot: "Cómo hacerla en casa",
    howToShootBody:
      "Ponte de cara a una ventana para que la luz caiga pareja sobre el rostro, a unos dos metros " +
      "de una pared lisa. Que alguien sostenga la cámara a la altura de los ojos, no desde abajo. " +
      "Expresión neutra, boca cerrada, las dos orejas y la línea de la mandíbula visibles, sin " +
      "sombra detrás de la cabeza.",
    printing: "Impresión: cuántas fotos por hoja",
    printingBody: ({ n, w, h, dpi }) =>
      `${n} fotos de ${w} × ${h} mm caben en una hoja A4 a ${dpi} dpi. ` +
      `Imprime al 100 % de escala. «Ajustar a la página» cambia el tamaño sin avisar y la foto deja de cumplir la norma.`,
    faq: "Preguntas frecuentes",
    sources: "Fuentes",
    disclaimer:
      "Este es un sitio independiente, no un organismo oficial. Los requisitos cambian, así que " +
      "compruébalos en la fuente oficial antes de presentar la solicitud. Prometemos una foto que " +
      "cumple la especificación publicada. Nunca prometemos que una solicitud vaya a ser aprobada.",
    disclaimerShort: "Sitio independiente, no oficial. Comprueba los requisitos en la fuente oficial.",
    related: "Páginas relacionadas",
  },

  warn: {
    noEditing:
      "Este organismo no acepta fotos modificadas con programas de edición, filtros o herramientas " +
      "de IA. Usa la herramienta de aquí para comprobar el encuadre y presenta una foto sin editar.",
    noEditingAtAction:
      "Quitar el fondo es editar la foto, y este organismo rechaza las fotos editadas. " +
      "Úsalo para ver si el encuadre funciona, no para el archivo que vas a presentar.",
    noHomePrint: "Las fotos impresas en casa no se aceptan: usa un servicio de impresión profesional.",
    proceedAnyway: "Quitarlo de todos modos",
  },

  submission: {
    upload: "Se presenta como archivo",
    print: "Se entrega impresa",
    captured: "Te la hacen en la cita",
  },

  countryPage: {
    faqDocs: (country) => `¿Para qué documentos hace falta una foto en ${country}?`,
    faqDocsA: ({ country, list }) =>
      `${country}: ${list}. Cada página indica el tamaño exacto y trae una herramienta que recorta a él.`,
    faqSame: (country) => `¿Sirve una sola foto para todos los documentos de ${country}?`,
    faqSameYes: ({ size }) => `Sí: todos usan ${size}, así que una sola exportación vale para todos.`,
    faqSameNo: "No: los tamaños son distintos, cada uno necesita su propia exportación.",
    h1: (country) => `${country}: requisitos de la foto`,
    lead: ({ country, n }) =>
      `${n} documentos de ${country}, cada uno con su tamaño exacto y una herramienta que recorta a él.`,
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
      "Información de referencia, no asesoría migratoria. La solicitud la rellena y la firma quien la presenta.",
  },

  check: {
    tab: "Verificar una foto",
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
      "El tamaño y la posición de la cabeza, la expresión, si los ojos están abiertos, las gafas, " +
      "cualquier prenda en la cabeza, las sombras detrás y cuánto tiempo tiene la foto. Pasar aquí " +
      "significa que el archivo tiene la forma y el peso correctos sobre un fondo suficientemente " +
      "liso, no que la solicitud vaya a ser aceptada.",
    fixIt: "Arreglarla aquí",
    checkFace: "Verificar también la cara",
    checkingFace: "Midiendo la cara…",
    faceHint: "Altura de la cabeza, línea de los ojos e inclinación. Descarga una vez un modelo de 4 MB.",
    noFace: "No se encontró ninguna cara en esta foto",
    labels: {
      dimensions: "Tamaño en píxeles",
      ratio: "Proporción",
      filesize: "Tamaño del archivo",
      format: "Formato",
      "bg-brightness": "Luminosidad del fondo",
      "bg-even": "Uniformidad del fondo",
      "head-height": "Altura de la cabeza",
      "eye-line": "Línea de los ojos desde abajo",
      tilt: "Inclinación de la cabeza",
    },
  },

  hub: {
    h1: "Fotos de visa y de documentos, según la norma de cada país",
    lead:
      "Elige el documento. Las medidas se rellenan solas, el recorte y el fondo se hacen en un paso, " +
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
          "El código es público, así que esto se puede comprobar en lugar de creerlo.",
      },
      {
        q: "¿La foto sigue llevando mi ubicación y el modelo del teléfono?",
        a:
          "No. Una foto de móvil lleva metadatos EXIF: las coordenadas GPS del lugar donde se tomó, " +
          "el modelo de la cámara, la fecha y a veces un nombre de propietario, y el consulado lo " +
          "recibe todo si envías el original. El archivo que produce esta herramienta se codifica " +
          "desde cero, así que no sobrevive nada de eso: solo los píxeles, un perfil de color y la " +
          "resolución de impresión.",
      },
      {
        q: "¿Puedo imprimirlas en casa?",
        a:
          "Sí. Cada página de documento exporta una hoja A4 en PNG y PDF con el número de copias " +
          "correcto y al tamaño correcto. Imprime al 100 % de escala: «ajustar a la página» las " +
          "redimensiona en silencio.",
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
    size: ({ doc }) => `¿Qué tamaño tiene una foto de ${doc} en centímetros y pulgadas?`,
    sizeA: ({ mm, cm, inch }) =>
      `${mm} mm, es decir ${cm} cm o ${inch} pulgadas. Son la misma foto dicha de tres maneras; ` +
      `usa la unidad que te pida el formulario que tienes delante.`,
    pixels: ({ doc }) => `¿Qué tamaño tiene una foto de ${doc} en píxeles?`,
    pixelsA: ({ px, dpi }) =>
      `${px} píxeles, que al tamaño de impresión son ${dpi} dpi. Cualquier cosa menor se verá blanda al imprimir.`,
    perSheet: ({ doc }) => `¿Cuántas copias de una foto de ${doc} caben en una hoja?`,
    perSheetA: ({ n, size }) =>
      `${n} fotos de ${size} en una hoja A4. Imprime al 100 % de escala, nunca «ajustar a la página».`,
    background: ({ doc }) => `¿De qué color debe ser el fondo de una foto de ${doc}?`,
    backgroundA: ({ bg }) =>
      `${bg}, liso y con luz pareja, sin sombra detrás de la cabeza. Si la pared que tienes detrás ` +
      `no sirve, la herramienta puede sustituir el fondo.`,
    fileSize: ({ doc }) => `¿Qué formato y tamaño de archivo necesita una foto de ${doc}?`,
    fileSizeA: ({ format, kb }) =>
      `${format}, sin pasar de ${kb} KB. La exportación de aquí comprime para quedarse por debajo ` +
      `de ese límite sin bajar de la resolución exigida.`,
    uploadFails: ({ form }) => `¿Por qué ${form} rechaza la foto?`,
    uploadFailsA: ({ form, format, kb, px }) =>
      `${form} rechaza todo lo que no sea ${format}, todo lo que pase de ${kb} KB y todo lo menor ` +
      `de ${px} píxeles. Exportar aquí mantiene los tres dentro del límite. Si el archivo cumple y ` +
      `el sitio sigue dando error, el problema es de su servicio, no de tu foto.`,
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
