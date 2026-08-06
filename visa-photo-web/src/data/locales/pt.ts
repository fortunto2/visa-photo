import type { Dict } from "../i18n";

/**
 * Portuguese, written for Brazil — that is where the applicants are, and the vocabulary differs
 * from Portugal in places ("tela" vs "ecrã" and so on). Nothing here depends on the difference.
 *
 * The dash between document and country is deliberate. Portuguese would otherwise need the
 * contracted preposition for each one — para o Brasil, para a Espanha, para os Estados Unidos —
 * and a template cannot pick the article from a country name.
 */
const pt: Dict = {
  nav: { countries: "Todos os países", models: "Modelos de fundo" },
  unit: { mm: "mm", cm: "cm", in: "pol", px: "px", kb: "KB", mb: "MB" },
  dateLocale: "pt-BR",
  readHere: "Ler esta página em português",

  kindName: { visa: "Visto", passport: "Passaporte", permit: "Autorização de residência" },
  gen: {
    docTitle: ({ country, doc }) => `Foto para ${doc.toLowerCase()} — ${country}`,
    pageTitle: ({ country, doc, size }) =>
      `${country}: tamanho da foto para ${doc.toLowerCase()} — ${size}, requisitos e ferramenta grátis`,
    docNotes: ({ background, size, headMm, mm }) =>
      `Fundo ${background}, ${size}, cabeça de cerca de ${headMm} ${mm} do queixo ao topo.`,
  },

  answer: ({ w, h, kb, format, bg }) =>
    `Você precisa de uma foto de ${w} × ${h} pixels em fundo ${bg}, em ${format} e abaixo de ${kb} KB. ` +
    `Faça aqui mesmo. A foto é processada no seu navegador e não é enviada para lugar nenhum.`,
  verified: ({ date, source }) => `Conferido em ${date} · ${source}`,
  checkerVerified: ({ date }) =>
    `Uma foto desta página passou no verificador oficial do órgão em ${date}`,
  backgroundIn: { white: "branco", "light-grey": "cinza-claro" },
  backgroundName: { white: "Branco", "light-grey": "Cinza-claro" },

  spec: {
    heading: "Especificação",
    print: "Tamanho impresso",
    digital: "Tamanho digital",
    background: "Fundo",
    headHeight: "Altura da cabeça",
    eyeLine: "Linha dos olhos",
    file: "Arquivo",
    perSheet: "Por folha",
    fromBottom: "de baixo",
    pieces: "fotos",
  },

  tool: {
    dropTitle: "Solte sua foto aqui",
    dropSub: (doc) => `Cortamos na especificação de ${doc}, alinhamos o rosto e limpamos o fundo em uma etapa só`,
    choose: "Escolher um arquivo",
    camera: "ou use a câmera",
    working: "Processando…",
    framedTo: (size) => `Enquadrada em ${size}`,
    downloadJpeg: "Baixar JPEG",
    downloadPng: "PNG, sem compressão",
    downloadSheet: (n) => `Folha A4 · ${n} fotos`,
    guideCrown: "topo da cabeça",
    guideEyes: (pct) => `olhos ${pct} %`,
    guideChin: "queixo",
    reset: "Começar de novo",
    checkResult: "Verificar este resultado",
    tip: "Arraste para mover · role para ampliar",

    removeBg: "Deixar o fundo branco",
    removeBgHint: "Baixa uma vez um modelo de {mb} MB e depois funciona sem internet",
    bgDone: "Fundo substituído",
    bgUndo: "Trazer a original de volta",
    tryBetterHint: "Tente um modelo mais pesado. Cabelo e óculos são onde o leve desiste.",
    modelCaveat:
      "Nenhum modelo dá conta de todas as fotos. Se o contorno sair irregular, um maior costuma " +
      "resolver — e uma parede lisa atrás de você ganha de qualquer modelo.",
    cached: "Já baixado",

    alignFace: "Alinhar pelo rosto",
    aligning: "Procurando o rosto…",
    alignHint: "Coloca a cabeça e a linha dos olhos onde este documento exige. Baixa uma vez um modelo de 15 MB.",
    alignFailed: "Nenhum rosto encontrado — ajuste o corte à mão",
    tooTight: "Tirada perto demais: não há espaço em volta da cabeça para cortar neste documento. Afaste-se e tire de novo.",
    aligned: "Alinhada pelo rosto",
    rotateLeft: "Girar à esquerda",
    rotateRight: "Girar à direita",
    autoLevels: "Níveis automáticos",
    zoom: "Zoom",

    undoLevels: "Desfazer os ajustes",
    changeModel: "Trocar de modelo",
    changeModelWhen: "O fundo ainda não ficou branco, ou as bordas saíram irregulares?",
    modelsPageLink: "Em que os modelos diferem",
    modelDefault: "Padrão",

    advanced: "Mais controles",
    advancedHint: "Na maioria das fotos você não vai precisar deles.",
    brightness: "Brilho",
    contrast: "Contraste",
    shadows: "Sombras",
    resetLevels: "Redefinir",
    transparentBg: "Fundo transparente (PNG)",
    transparentHint: "Para formulários que compõem o fundo sozinhos. A maioria dos pedidos quer branco.",
    faceOval: "Mostrar o oval do rosto",
    fileName: "Nome do arquivo",
    fileNamePlaceholder: "por exemplo, seu sobrenome",
    backdropLabel: "Cor do fundo",
    backdropNames: {
      white: "Branco",
      "off-white": "Branco-gelo",
      "light-grey": "Cinza-claro",
      "mid-grey": "Cinza-médio",
      "pale-blue": "Azul-claro",
    },
    backdropRequired:
      "Este documento pede {colour}. Os outros estão aqui porque algumas regras dizem apenas " +
      "«fundo claro e liso», e um cinza impede que cabelo claro se dissolva no branco.",
  },

  trust: {
    inBrowser: "Processada no seu navegador",
    noServer: "Nunca enviada a um servidor",
    noWatermark: "Sem marca d'água",
    noSignup: "Sem cadastro",
  },

  seo: {
    requirements: "Requisitos da foto",
    requirementsIntro: (doc) => `Tudo o que uma foto de ${doc} precisa cumprir para ser aceita.`,
    howToShoot: "Como tirar em casa",
    howToShootBody:
      "Fique de frente para uma janela, para a luz cair por igual no rosto, a uns dois metros de " +
      "uma parede lisa. Peça a alguém que segure a câmera na altura dos olhos, não de baixo. " +
      "Expressão neutra, boca fechada, as duas orelhas e a linha do queixo visíveis, sem sombra " +
      "atrás da cabeça.",
    printing: "Impressão: quantas fotos por folha",
    printingBody: ({ n, w, h, dpi }) =>
      `${n} fotos de ${w} × ${h} mm cabem em uma folha A4 a ${dpi} dpi. ` +
      `Imprima em escala 100 %. «Ajustar à página» muda o tamanho sem avisar e a foto deixa de cumprir a norma.`,
    faq: "Perguntas frequentes",
    sources: "Fontes",
    disclaimer:
      "Este é um site independente, não um órgão do governo. Os requisitos mudam, então confira na " +
      "fonte oficial antes de dar entrada. Prometemos uma foto que atende à especificação publicada. " +
      "Nunca prometemos que um pedido será aprovado.",
    disclaimerShort: "Site independente, não governamental. Confira os requisitos na fonte oficial.",
    related: "Páginas relacionadas",
  },

  warn: {
    noEditing:
      "Este órgão não aceita fotos alteradas com editor de imagem, filtros ou ferramentas de IA. " +
      "Use a ferramenta daqui para conferir o enquadramento e entregue uma foto sem edição.",
    noEditingAtAction:
      "Remover o fundo é editar a foto, e este órgão rejeita fotos editadas. " +
      "Use isto para ver se o enquadramento funciona, não para o arquivo que você vai entregar.",
    noHomePrint: "Fotos impressas em casa não são aceitas — use um serviço de impressão profissional.",
    proceedAnyway: "Remover mesmo assim",
  },

  submission: {
    upload: "Entregue como arquivo",
    print: "Entregue impressa",
    captured: "Tirada para você no atendimento",
  },

  countryPage: {
    faqDocs: (country) => `Para quais documentos ${country} exige foto?`,
    faqDocsA: ({ country, list }) =>
      `${country}: ${list}. Cada página traz o tamanho exato e uma ferramenta que corta nele.`,
    faqSame: (country) => `Uma foto só serve para todos os documentos de ${country}?`,
    faqSameYes: ({ size }) => `Sim — todos usam ${size}, então uma exportação vale para todos.`,
    faqSameNo: "Não — os tamanhos são diferentes, cada um precisa da sua própria exportação.",
    h1: (country) => `${country}: requisitos da foto`,
    lead: ({ country, n }) =>
      `${n} documentos de ${country}, cada um com seu tamanho exato e uma ferramenta que corta nele.`,
    title: (country) => `Tamanho e requisitos das fotos de ${country} — ferramenta grátis`,
    docHeadline: ({ title, size }) => `${title}: ${size}`,
  },

  agent: {
    heading: "Entregue isto a um assistente de IA",
    lead:
      "Cole o texto em qualquer assistente de IA e ele terá tudo o que precisa: os números exatos, " +
      "a página de onde vieram e a fonte com que foram conferidos. A especificação completa é a " +
      "versão de referência, mais longa.",
    copyPrompt: "Copiar o texto para seu assistente",
    copySpec: "Copiar a especificação completa",
    copied: "Copiado",
    openSkills: "Habilidades para assistentes",
    disclaimer:
      "Informação de referência, não consultoria de imigração. O pedido é preenchido e assinado por quem o apresenta.",
  },

  check: {
    tab: "Verificar uma foto",
    makeTab: "Fazer uma foto",
    title: "Verificar uma foto que você já tem",
    lead:
      "Já tem o arquivo? Solte aqui e veja quais requisitos ele cumpre. Nada é enviado — as " +
      "verificações rodam no seu navegador.",
    drop: "Solte a foto que você quer verificar",
    choose: "Escolher um arquivo",
    allPass: "Tudo o que dá para medir está de acordo",
    someFail: "{n} verificações não passaram",
    someWarn: "Tudo de acordo, com um ponto que vale olhar",
    measured: "Medido",
    expected: "Exigido",
    notChecked: "O que isto não consegue dizer",
    notCheckedBody:
      "O tamanho e a posição da cabeça, a expressão, se os olhos estão abertos, óculos, cobertura " +
      "de cabeça, sombras atrás da cabeça e há quanto tempo a foto foi tirada. Passar aqui quer " +
      "dizer que o arquivo tem a forma e o peso certos sobre um fundo liso o bastante — não que o " +
      "pedido será aceito.",
    fixIt: "Corrigir aqui",
    checkFace: "Verificar também o rosto",
    checkingFace: "Medindo o rosto…",
    faceHint: "Altura da cabeça, linha dos olhos e inclinação. Baixa uma vez um modelo de 4 MB.",
    noFace: "Nenhum rosto encontrado nesta foto",
    labels: {
      dimensions: "Tamanho em pixels",
      ratio: "Proporção",
      filesize: "Tamanho do arquivo",
      format: "Formato",
      "bg-brightness": "Claridade do fundo",
      "bg-even": "Uniformidade do fundo",
      "head-height": "Altura da cabeça",
      "eye-line": "Linha dos olhos a partir de baixo",
      tilt: "Inclinação da cabeça",
    },
  },

  hub: {
    h1: "Fotos de visto e de documentos, na especificação de cada país",
    lead:
      "Escolha o documento. As medidas se preenchem sozinhas, o corte e o fundo saem em uma etapa, " +
      "e nada sai do seu navegador.",
    stats: ({ docs, langs }) => `${docs} documentos · ${langs} idiomas · grátis, sem marca d'água`,
    faq: [
      {
        q: "É grátis mesmo?",
        a:
          "É, e sem marca d'água nem cadastro. Outros sites mostram uma prévia grátis e cobram para " +
          "baixar o arquivo limpo; aqui o download é justamente a parte grátis.",
      },
      {
        q: "Minha foto é enviada para algum lugar?",
        a:
          "Não. O corte e a remoção do fundo rodam dentro do seu navegador com WebAssembly. A única " +
          "coisa baixada é o modelo de fundo, e a foto nunca sai do aparelho. O código é público, " +
          "então dá para conferir em vez de acreditar.",
      },
      {
        q: "A foto ainda carrega minha localização e o modelo do celular?",
        a:
          "Não. Uma foto de celular guarda metadados EXIF — as coordenadas GPS de onde foi tirada, o " +
          "modelo da câmera, a data e às vezes um nome de proprietário — e o consulado recebe tudo " +
          "isso quando você manda o original. O arquivo que esta ferramenta gera é codificado do " +
          "zero, então nada disso sobrevive: só os pixels, um perfil de cor e a resolução de impressão.",
      },
      {
        q: "Dá para imprimir em casa?",
        a:
          "Dá. Cada página de documento exporta uma folha A4 em PNG e PDF com o número certo de " +
          "cópias no tamanho certo. Imprima em escala 100 % — «ajustar à página» redimensiona sem avisar.",
      },
      {
        q: "Meu pedido vai ser aceito?",
        a:
          "Isso não podemos prometer, e ninguém honesto vai prometer. O que a ferramenta garante é um " +
          "arquivo que atende à especificação publicada do documento que você escolheu. Os requisitos " +
          "mudam, então confira a fonte oficial indicada em cada página antes de dar entrada.",
      },
    ],
  },

  autoFaq: {
    size: ({ doc }) => `Qual é o tamanho de uma foto de ${doc} em centímetros e polegadas?`,
    sizeA: ({ mm, cm, inch }) =>
      `${mm} mm, ou seja ${cm} cm ou ${inch} polegadas. É a mesma foto dita de três jeitos; ` +
      `use a unidade que o formulário à sua frente pedir.`,
    pixels: ({ doc }) => `Qual é o tamanho de uma foto de ${doc} em pixels?`,
    pixelsA: ({ px, dpi }) =>
      `${px} pixels, o que dá ${dpi} dpi no tamanho de impressão. Menos que isso sai borrado no papel.`,
    perSheet: ({ doc }) => `Quantas cópias de uma foto de ${doc} cabem em uma folha?`,
    perSheetA: ({ n, size }) =>
      `${n} fotos de ${size} em uma folha A4. Imprima em escala 100 %, nunca «ajustar à página».`,
    background: ({ doc }) => `Que cor de fundo uma foto de ${doc} precisa ter?`,
    backgroundA: ({ bg }) =>
      `${bg}, liso e com luz uniforme, sem sombra atrás da cabeça. Se a parede atrás de você não ` +
      `servir, a ferramenta pode trocar o fundo.`,
    fileSize: ({ doc }) => `Que formato e tamanho de arquivo uma foto de ${doc} precisa ter?`,
    fileSizeA: ({ format, kb }) =>
      `${format}, no máximo ${kb} KB. A exportação daqui comprime para ficar abaixo desse limite ` +
      `sem cair da resolução exigida.`,
    uploadFails: ({ form }) => `Por que ${form} rejeita a foto?`,
    uploadFailsA: ({ form, format, kb, px }) =>
      `${form} recusa tudo o que não for ${format}, tudo acima de ${kb} KB e tudo menor que ${px} ` +
      `pixels. Exportar daqui mantém os três dentro do limite. Se o arquivo está dentro da ` +
      `especificação e o site ainda dá erro, o problema é do serviço deles, não da sua foto.`,
  },

  // Generated from the catalogue and presets.toml — see ../docText.ts.
  country: {},
  docTitle: {},
  docShort: {},
  docNotes: {},
  pageTitle: {},
  faq: {},
};

export default pt;
