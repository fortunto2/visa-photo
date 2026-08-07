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
  nav: { countries: "Todos os países", models: "Modelos de fundo", tools: "Ferramentas" },
  unit: { mm: "mm", cm: "cm", in: "pol", px: "px", kb: "KB", mb: "MB" },
  dateLocale: "pt-BR",
  readHere: "Ler esta página em português",

  kindName: { visa: "Visto", passport: "Passaporte", permit: "Autorização de residência" },
  gen: {
    docTitle: ({ country, doc }) => `Foto para ${doc.toLowerCase()} — ${country}`,
    pageTitle: ({ country, doc, size }) =>
      `${country}: foto para ${doc.toLowerCase()} ${size} — tamanho | fazer foto online grátis`,
    docNotes: ({ background, size, headMm, mm }) =>
      `Fundo ${background}, ${size}, cabeça com cerca de ${headMm} ${mm} do queixo ao topo.`,
  },

  answer: ({ w, h, kb, format, bg }) =>
    `Você precisa de uma foto de ${w} × ${h} pixels com fundo ${bg}, em ${format} e com menos de ${kb} KB. ` +
    `Faça a sua aqui mesmo. A foto é processada no seu navegador e não é enviada para lugar nenhum.`,
  verified: ({ date, source }) => `Conferido em ${date} · ${source}`,
  checkerVerified: ({ date }) =>
    `Uma foto desta página passou no verificador oficial de fotos do governo em ${date}`,
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
    fromBottom: "a partir da base",
    pieces: "fotos",
  },

  tool: {
    dropTitle: "Solte sua foto aqui",
    dropSub: (doc) => `Cortamos no tamanho exigido para ${doc}, alinhamos o rosto e limpamos o fundo em uma etapa só`,
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
    removeBgHint: "Baixa um modelo de {mb} MB uma única vez; depois funciona sem internet",
    bgDone: "Fundo substituído",
    bgUndo: "Restaurar a foto original",
    tryBetterHint: "Tente um modelo mais pesado. É no cabelo e nos óculos que o leve desiste.",
    modelCaveat:
      "Nenhum modelo dá conta de todas as fotos. Se o contorno sair irregular, um maior costuma " +
      "resolver — e uma parede lisa atrás de você vale mais que qualquer modelo.",
    cached: "Já baixado",

    alignFace: "Alinhar pelo rosto",
    aligning: "Procurando o rosto…",
    alignHint: "Coloca a cabeça e a linha dos olhos na posição que este documento exige. Baixa um modelo de 15 MB uma única vez.",
    alignFailed: "Nenhum rosto encontrado — ajuste o corte à mão",
    tooTight: "Tirada de perto demais: não sobra espaço em volta da cabeça para cortar no tamanho deste documento. Afaste-se e tire outra.",
    aligned: "Alinhada pelo rosto",
    rotateLeft: "Girar à esquerda",
    rotateRight: "Girar à direita",
    autoLevels: "Níveis automáticos",
    zoom: "Zoom",

    undoLevels: "Desfazer os ajustes",
    changeModel: "Trocar de modelo",
    changeModelWhen: "O fundo ainda não ficou branco, ou as bordas saíram irregulares?",
    modelsPageLink: "Qual é a diferença entre os modelos",
    modelDefault: "Padrão",

    advanced: "Mais controles",
    advancedHint: "Na maioria das fotos você não vai precisar deles.",
    brightness: "Brilho",
    contrast: "Contraste",
    shadows: "Sombras",
    resetLevels: "Redefinir",
    transparentBg: "Fundo transparente (PNG)",
    transparentHint: "Para formulários que montam o fundo por conta própria. A maioria dos pedidos exige branco.",
    faceOval: "Mostrar o oval do rosto",
    fileName: "Nome do arquivo",
    fileNamePlaceholder: "ex.: seu sobrenome",
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
      "“fundo claro e liso”, e um cinza evita que o cabelo claro se dissolva no branco.",
  },

  trust: {
    inBrowser: "Processada no seu navegador",
    noServer: "Nunca enviada para um servidor",
    noWatermark: "Sem marca d'água",
    noSignup: "Sem cadastro",
    free: "Grátis, sem limites",
    why: "Nada é enviado porque não precisa ser. O corte acontece em um canvas dentro do seu navegador, e o fundo é removido por uma rede neural que baixa para o seu aparelho e roda ali. A única coisa que viaja é o modelo descendo; a sua foto não sai da aba. O código é público, então dá para conferir em vez de acreditar.",
  },

  seo: {
    requirements: "Requisitos da foto",
    requirementsIntro: (doc) => `Tudo o que uma foto de ${doc} precisa cumprir para ser aceita.`,
    howToShoot: "Como tirar em casa",
    howToShootBody:
      "Fique de frente para uma janela, para a luz cair por igual no rosto, a uns dois metros de " +
      "uma parede lisa. Peça para alguém segurar a câmera na altura dos olhos, e não de baixo. " +
      "Expressão neutra, boca fechada, as duas orelhas e a linha do queixo visíveis, sem sombra " +
      "atrás da cabeça.",
    printing: "Impressão: quantas fotos por folha",
    printingBody: ({ n, w, h, dpi }) =>
      `${n} fotos de ${w} × ${h} mm cabem em uma folha A4 a ${dpi} dpi. ` +
      `Imprima em escala 100 %. O “ajustar à página” muda o tamanho sem avisar e a foto deixa de atender à especificação.`,
    faq: "Perguntas frequentes",
    sources: "Fontes",
    disclaimer:
      "Este é um site independente, não um órgão do governo. Os requisitos mudam, então confira na " +
      "fonte oficial antes de dar entrada no pedido. Prometemos uma foto que atende à especificação publicada. " +
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
      "Use só para conferir se o enquadramento funciona; não use no arquivo que você vai entregar.",
    noHomePrint: "Fotos impressas em casa não são aceitas — use um serviço de impressão profissional.",
    studioOnly:
      "Este órgão exige que a foto seja tirada em um estúdio comercial, que escreve o nome e a data no verso. Use a ferramenta para ver o enquadramento e as medidas; a foto em si precisa vir do estúdio.",
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
      `${country}: ${list}. Cada página traz o tamanho exato e uma ferramenta que corta nessa medida.`,
    faqSame: (country) => `Uma foto só serve para todos os documentos de ${country}?`,
    faqSameYes: ({ size }) => `Sim — todos usam ${size}, então uma exportação vale para todos.`,
    faqSameNo: "Não — os tamanhos são diferentes, então cada um precisa da própria exportação.",
    h1: (country) => `${country}: requisitos da foto`,
    lead: ({ country, n }) =>
      `${n} documentos de ${country}, cada um com seu tamanho exato e uma ferramenta que corta nessa medida.`,
    title: (country) => `Tamanho e requisitos das fotos de ${country} — ferramenta grátis`,
    docHeadline: ({ title, size }) => `${title}: ${size}`,
  },

  agent: {
    heading: "Entregue isto para um assistente de IA",
    lead:
      "Cole o texto em qualquer assistente de IA e ele terá tudo o que precisa: os números exatos, " +
      "a página de onde vieram e a fonte usada para conferi-los. A especificação completa é a " +
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
    seoTitle: (doc: string) => `${doc}: verificador online — grátis, no seu navegador`,
    hubTitle: "Verificador de foto de passaporte e visto — grátis, sem upload",
    h1: (doc: string) => `${doc}: verificador`,
    seoDescription: (doc: string) => `Solte a foto e veja quais requisitos ela cumpre: tamanho, peso, formato, fundo, altura da cabeça e linha dos olhos. Nada é enviado — as verificações rodam no seu navegador.`,
    makeTab: "Fazer uma foto",
    title: "Verificar uma foto que você já tem",
    lead:
      "Já tem o arquivo? Solte aqui e veja quais requisitos ele cumpre. Nada é enviado — as " +
      "verificações rodam no seu navegador.",
    drop: "Solte a foto que você quer verificar",
    choose: "Escolher um arquivo",
    allPass: "Tudo o que dá para medir está de acordo",
    someFail: "{n} verificações não passaram",
    someWarn: "Tudo de acordo, com um ponto que vale conferir",
    measured: "Medido",
    expected: "Exigido",
    notChecked: "O que isto não consegue dizer",
    notCheckedBody:
      "A expressão, se os olhos estão abertos, óculos, chapéus " +
      "e véus, sombras atrás da cabeça e há quanto tempo a foto foi tirada. Passar aqui quer " +
      "dizer que o arquivo tem a forma e o peso certos, com um fundo liso o bastante — não que o " +
      "pedido será aceito.",
    fixIt: "Corrigir aqui",
    checkFace: "Verificar também o rosto",
    checkingFace: "Medindo o rosto…",
    faceHint: "Altura da cabeça, linha dos olhos e inclinação. Baixa um modelo de 15 MB uma única vez.",
    noFace: "Nenhum rosto encontrado nesta foto",
    bgReplaced: "substituído por software",
    bgPhotographed: "fotografado",
    legendGot: "onde está o seu rosto",
    legendWant: "onde este documento o quer",
    labels: {
      dimensions: "Tamanho em pixels",
      ratio: "Proporção",
      filesize: "Tamanho do arquivo",
      format: "Formato",
      "bg-brightness": "Luminosidade do fundo",
      "bg-even": "Uniformidade do fundo",
      "bg-synthetic": "Origem do fundo",
      "head-height": "Altura da cabeça",
      "eye-line": "Linha dos olhos a partir da base",
      tilt: "Inclinação da cabeça",
    },
  },

  hub: {
    h1: "Fotos de visto e de documentos, no padrão de cada país",
    lead:
      "Escolha o documento. As medidas se preenchem sozinhas, o corte e o fundo saem em uma etapa, " +
      "e nada sai do seu navegador.",
    stats: ({ docs, langs }) => `${docs} documentos · ${langs} idiomas · grátis, sem marca d'água`,
    faq: [
      {
        q: "É grátis mesmo?",
        a:
          "É sim, sem marca d'água e sem cadastro. Outros sites mostram uma prévia grátis e cobram para " +
          "baixar o arquivo limpo; aqui o download é justamente a parte grátis.",
      },
      {
        q: "Minha foto é enviada para algum lugar?",
        a:
          "Não. O corte e a remoção do fundo rodam dentro do seu navegador com WebAssembly. A única " +
          "coisa baixada é o modelo de fundo, e a foto nunca sai do aparelho. O código é público, " +
          "então dá para conferir em vez de confiar na nossa palavra.",
      },
      {
        q: "A foto ainda carrega minha localização e o modelo do celular?",
        a:
          "Não. Uma foto de celular guarda metadados EXIF — as coordenadas GPS de onde foi tirada, o " +
          "modelo da câmera, a data e às vezes até o nome do dono do aparelho — e o consulado recebe tudo " +
          "isso quando você manda o original. O arquivo que esta ferramenta gera é codificado do " +
          "zero, então nada disso sobrevive: só os pixels, um perfil de cor e a resolução de impressão.",
      },
      {
        q: "Dá para imprimir em casa?",
        a:
          "Dá. Cada página de documento exporta uma folha A4 em PNG e PDF com o número certo de " +
          "cópias no tamanho certo. Imprima em escala 100 % — o “ajustar à página” redimensiona sem avisar. Uma boa impressora caseira com papel " +
          "fotográfico dá conta da maioria dos documentos; onde é preciso um estúdio, isso está na página dele.",
      },
      {
        q: "Meu pedido vai ser aceito?",
        a:
          "Isso não podemos prometer, e ninguém honesto vai prometer. O que a ferramenta garante é um " +
          "arquivo que atende à especificação publicada do documento que você escolheu. Os requisitos " +
          "mudam, então confira a fonte oficial indicada em cada página antes de dar entrada no pedido.",
      },
    ],
  },

  customPage: {
    title: "Foto de qualquer tamanho — 3x4, 5x7, 2x2, em cm, mm ou pixels, grátis",
    h1: "Qualquer tamanho, você que define",
    lead: "Para um tamanho que as páginas acima não cobrem: digite a medida que o seu formulário pede e recorte nela. Em centímetros, milímetros, polegadas ou pixels — 3x4 e 5x7 estão a um clique. Tudo roda no navegador.",
    width: "Largura",
    height: "Altura",
    unitMm: "mm",
    unitPx: "pixels",
    unitLabel: "Unidade",
    dpi: "Resolução",
    presetHint: "Seu tamanho",
    common: "Os tamanhos mais pedidos:",
    whenToUse: "Quando isto serve",
    whenToUseBody: "Um consulado que pede algo fora do comum, um crachá, um bilhete, um formulário que informa os próprios milímetros. Se o seu documento está no catálogo, use a página dele: lá estão a fonte oficial, a regra de altura da cabeça e o limite de tamanho do arquivo, que uma medida sozinha não conta.",
  },

  bgPage: {
    title: "Remover o fundo de uma foto — grátis, e nada é enviado",
    cut: "Recortar o fundo",
    h1: "Remover ou trocar o fundo",
    lead: "Solte uma foto, recorte o fundo e ponha atrás a cor que quiser — ou deixe transparente. A rede neural roda dentro desta aba, então a imagem não sai do seu aparelho. Sem conta, sem marca d'água, sem limite.",
    colour: "Pôr atrás:",
    keepTransparent: "Deixar transparente",
    pickColour: "Qualquer cor",
    download: "Baixar",
    whenToUse: "Para que serve",
    whenToUseBody: "Foto de documento é só um dos usos, e para isso existem as páginas por país, que já trazem o recorte e a regra de altura da cabeça. Esta página é para todo o resto: foto de perfil, anúncio, impressão, um retrato com o fundo errado. Aqui nada é medido nem comparado com uma especificação — a foto sai do tamanho que entrou.",
  },

  autoFaq: {
    size: ({ doc }) => `${doc}: qual é o tamanho em centímetros e polegadas?`,
    sizeA: ({ mm, cm, inch }) =>
      `${mm} mm, ou seja, ${cm} cm ou ${inch} polegadas. É a mesma foto dita de três jeitos; ` +
      `use a unidade que o formulário à sua frente pedir.`,
    pixels: ({ doc }) => `${doc}: qual é o tamanho em pixels?`,
    pixelsA: ({ px, dpi }) =>
      `${px} pixels, o que dá ${dpi} dpi no tamanho de impressão. Menos que isso sai borrado no papel.`,
    perSheet: ({ doc }) => `${doc}: quantas cópias cabem em uma folha?`,
    perSheetA: ({ n, size }) =>
      `${n} fotos de ${size} em uma folha A4. Imprima em escala 100 %, nunca no “ajustar à página”.`,
    background: ({ doc }) => `${doc}: que cor de fundo precisa ter?`,
    backgroundA: ({ bg }) =>
      `${bg}, liso e com luz uniforme, sem sombra atrás da cabeça. Se a parede atrás de você não ` +
      `servir, a ferramenta pode trocar o fundo.`,
    fileSize: ({ doc }) => `${doc}: que formato e tamanho de arquivo precisa ter?`,
    fileSizeA: ({ format, kb }) =>
      `${format}, no máximo ${kb} KB. A exportação daqui comprime para ficar abaixo desse limite ` +
      `sem perder a resolução exigida.`,
    howFiled: ({ doc }: { doc: string }) => `${doc}: enviada como arquivo ou entregue impressa?`,
    howFiledA: ({ route, form }: { route: string; form: string }) => `${route}${form}`,
    editing: ({ doc }: { doc: string }) => `${doc}: o órgão aceita uma foto editada?`,
    checked: ({ doc }: { doc: string }) => `${doc}: alguma foto desta página foi verificada oficialmente?`,
    uploadFails: ({ form }) => `${form}: não consigo enviar a foto ou ela é recusada — por quê?`,
    uploadFailsA: ({ form, format, kb, px }) =>
      `${form} recusa tudo o que não for ${format}, tudo acima de ${kb} KB e tudo menor que ${px} ` +
      `pixels. Exportar daqui mantém os três dentro do limite. Se o arquivo está dentro da ` +
      `especificação e o site ainda dá erro, o problema é do serviço deles, não da sua foto.`,
    covering: ({ doc }) => `${doc}: pode ser com hijab, turbante ou outra cobertura de cabeça?`,
    coveringA: () =>
      `Pode. A cobertura usada todos os dias por motivo religioso é aceita; um chapéu comum, não. ` +
      `O rosto precisa aparecer do queixo até a testa, com as duas bordas do rosto à mostra e sem ` +
      `nenhuma sombra sobre ele. Tecido liso, sem estampa, e de cor diferente do fundo: uma ` +
      `cobertura branca sobre fundo branco se funde com ele, e é essa a recusa que Canadá e Turquia ` +
      `avisam pelo nome. A paleta daqui deixa você pôr um fundo que contraste.`,
    coveringStatement:
      `Os Estados Unidos pedem ainda um bilhete assinado dizendo que é traje religioso usado ` +
      `diariamente em público. É uma frase no papel, entregue com o pedido, e não tem a ver com a foto.`,
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
