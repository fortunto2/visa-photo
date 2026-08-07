import type { Dict } from "../i18n";

/**
 * Simplified Chinese. Like Hindi, this file carries no per-document text: country names come
 * from ICU, titles and notes from presets.toml. The secondary pages are absent rather than
 * English, so /zh/models/ and /zh/skills/ are simply not built.
 *
 * Chinese needs no separator between the country and the document — 西班牙居留许可照片 reads as
 * one noun — which is exactly why the templates are per-language functions.
 */
const zh: Dict = {
  nav: { countries: "所有国家", models: "背景模型", tools: "工具" },
  unit: { mm: "毫米", cm: "厘米", in: "英寸", px: "px", kb: "KB", mb: "MB" },
  dateLocale: "zh-CN",
  readHere: "阅读中文版",

  kindName: { visa: "签证", passport: "护照", permit: "居留许可" },
  gen: {
    docTitle: ({ country, doc }) => `${country}${doc}照片`,
    pageTitle: ({ country, doc, size }) =>
      `${country}${doc}照片要求和尺寸 ${size} | 在线制作，免费换底色`,
    docNotes: ({ background, size, headMm, mm }) =>
      `${background}背景，${size}，下巴到头顶约 ${headMm} ${mm}。`,
  },

  answer: ({ w, h, kb, format, bg }) =>
    `你需要一张 ${w} × ${h} 像素的照片：${bg}背景、${format} 格式、小于 ${kb} KB。` +
    `本页就能做好。照片只在你的浏览器里处理，不会上传。`,
  verified: ({ date, source }) => `核对日期：${date} · ${source}`,
  checkerVerified: ({ date }) => `本页生成的照片已于 ${date} 通过官方照片检测系统`,
  backgroundIn: { white: "白色", "light-grey": "浅灰色" },
  backgroundName: { white: "白色", "light-grey": "浅灰色" },

  spec: {
    heading: "规格",
    print: "打印尺寸",
    digital: "电子版尺寸",
    background: "背景",
    headHeight: "头部高度",
    eyeLine: "眼睛位置",
    file: "文件",
    perSheet: "每张纸",
    fromBottom: "自底边算起",
    pieces: "张",
  },

  tool: {
    dropTitle: "把照片拖到这里",
    dropSub: (doc) => `按${doc}的规格裁切、摆正人脸、去掉背景，一步完成`,
    choose: "选择文件",
    camera: "或用相机拍摄",
    working: "处理中…",
    framedTo: (size) => `已按 ${size} 裁切`,
    downloadJpeg: "下载 JPEG",
    downloadPng: "PNG，无压缩",
    downloadSheet: (n) => `A4 纸 · ${n} 张`,
    guideCrown: "头顶",
    guideEyes: (pct) => `眼睛 ${pct} %`,
    guideChin: "下巴",
    reset: "重新开始",
    checkResult: "检测这张照片",
    tip: "拖动可调整位置 · 滚轮可缩放",

    removeBg: "把背景换成白色",
    removeBgHint: "只需下载一次 {mb} MB 的模型，之后离线也能用",
    bgDone: "背景已替换",
    bgUndo: "恢复原图",
    tryBetterHint: "换个更大的模型试试。头发和眼镜正是轻量模型最容易出错的地方。",
    modelCaveat:
      "没有哪个模型能应付所有照片。轮廓毛糙时，换个大一点的通常就能解决；" +
      "而身后有一面素色的墙，胜过任何模型。",
    cached: "已下载",

    alignFace: "按人脸对齐",
    aligning: "正在检测人脸…",
    alignHint: "自动把头部和眼睛放到这份证件要求的位置。只需下载一次 15 MB 的模型。",
    alignFailed: "没有检测到人脸，请手动调整裁切框",
    tooTight: "拍得太近：头部四周留白不够，按这份证件的规格裁不出来。请后退一些重拍。",
    aligned: "已按人脸对齐",
    rotateLeft: "向左旋转",
    rotateRight: "向右旋转",
    autoLevels: "自动色阶",
    zoom: "缩放",

    undoLevels: "撤销调整",
    changeModel: "更换模型",
    changeModelWhen: "背景还是不够白，或者边缘毛糙？",
    modelsPageLink: "各模型的区别",
    modelDefault: "默认",

    advanced: "更多调整",
    advancedHint: "大多数照片用不到这些。",
    brightness: "亮度",
    contrast: "对比度",
    shadows: "阴影",
    resetLevels: "重置",
    transparentBg: "透明背景（PNG）",
    transparentHint: "适用于会自行合成背景的表单。多数申请要求白底。",
    faceOval: "显示人脸椭圆",
    fileName: "文件名",
    fileNamePlaceholder: "例如你的姓氏",
    backdropLabel: "底色",
    backdropNames: {
      white: "白色",
      "off-white": "米白色",
      "light-grey": "浅灰色",
      "mid-grey": "中灰色",
      "pale-blue": "淡蓝色",
    },
    backdropRequired:
      "这份证件要求的底色是{colour}。这里还给出其他颜色，是因为有些规定只写了“浅色素底”，" +
      "而灰底能让浅色头发不至于糊进白色里。",
  },

  trust: {
    inBrowser: "在你的浏览器里处理",
    noServer: "绝不上传服务器",
    noWatermark: "无水印",
    noSignup: "无需注册",
    free: "免费，无限制",
    why: "什么都不上传，因为根本不需要。裁切在你浏览器的画布上完成，背景由一个下载到你设备上、并在本地运行的神经网络去除。传输的只有模型本身，照片不会离开这个标签页。源代码是公开的，所以这一点可以查验而不必只靠相信。",
  },

  seo: {
    requirements: "照片要求",
    requirementsIntro: (doc) => `${doc}照片要想顺利通过，需要满足的全部条件。`,
    howToShoot: "怎样在家里自己拍",
    howToShootBody:
      "面朝窗户站好，让光均匀落在脸上，离素色墙面约两米。" +
      "请人帮忙把相机举到与眼睛齐平的高度，不要从下往上拍。表情自然、嘴巴闭合，" +
      "两只耳朵和下颌线都要露出来，头后不能有阴影。",
    printing: "打印：每张纸放几张照片",
    printingBody: ({ n, w, h, dpi }) =>
      `按 ${dpi} dpi 计算，一张 A4 纸能放 ${n} 张 ${w} × ${h} 毫米的照片。` +
      `请按 100 % 比例打印；选“适应页面”会悄悄改变尺寸，照片就不再符合规格了。`,
    faq: "常见问题",
    sources: "资料来源",
    disclaimer:
      "本站是独立网站，不是政府机构。要求随时可能变化，申请前请以官方来源为准核对。" +
      "我们保证照片符合已公布的规格，但绝不承诺申请一定获批。",
    disclaimerShort: "独立网站，不是政府机构。请以官方来源核对要求。",
    related: "相关页面",
  },

  warn: {
    noEditing:
      "该受理机构不接受经修图软件、滤镜或 AI 工具处理过的照片。" +
      "可以用这里的工具确认构图，但提交的必须是未经处理的原图。",
    noEditingAtAction:
      "去背景也算修图，而该受理机构会拒收修过的照片。" +
      "可以用它判断构图是否合适，但不要用它生成最终提交的文件。",
    noHomePrint: "自己在家打印的照片不被接受，请到专业冲印店打印。",
    studioOnly:
      "该机构要求照片由商业影楼拍摄，影楼会在背面写上名称和日期。这里可以看构图和各项数字，但照片本身必须出自影楼。",
    proceedAnyway: "仍要去除背景",
  },

  submission: {
    upload: "以文件形式提交",
    print: "打印后当面递交",
    captured: "预约当天由现场工作人员拍摄",
  },

  countryPage: {
    faqDocs: (country) => `${country}的哪些证件需要照片？`,
    faqDocsA: ({ country, list }) =>
      `${country}：${list}。每个页面都列出确切尺寸，并配有按该尺寸裁切的工具。`,
    faqSame: (country) => `${country}的所有证件能用同一张照片吗？`,
    faqSameYes: ({ size }) => `可以：它们都用 ${size}，导出一次就能通用。`,
    faqSameNo: "不行：尺寸各不相同，每一种都要单独导出。",
    h1: (country) => `${country}：照片要求`,
    lead: ({ country, n }) => `${country}的 ${n} 种证件，各自的确切尺寸和对应的裁切工具。`,
    title: (country) => `${country}照片尺寸与要求 — 免费制作工具`,
    docHeadline: ({ title, size }) => `${title}：${size}`,
  },

  agent: {
    heading: "把这个交给 AI 助手",
    lead:
      "把提示词粘贴到任意 AI 助手，它就拿到了全部信息：确切的数值、这些数值出自哪个页面，" +
      "以及核对时依据的来源。“完整规格”是更长的参考版本。",
    copyPrompt: "复制给助手的提示词",
    copySpec: "复制完整规格",
    copied: "已复制",
    openSkills: "助手技能",
    disclaimer: "这是参考信息，不是移民建议。申请由申请人本人填写并签署。",
  },

  check: {
    tab: "检测照片",
    seoTitle: (doc: string) => `${doc}检测 — 免费，在浏览器中运行`,
    hubTitle: "护照与签证照片检测 — 免费，无需上传",
    h1: (doc: string) => `${doc}检测`,
    seoDescription: (doc: string) => `把照片拖进来，看看它满足哪些要求：尺寸、体积、格式、背景、头部高度和眼睛位置。什么都不会上传，检测在你的浏览器里进行。`,
    makeTab: "制作照片",
    title: "检测已有的照片",
    lead:
      "已经有照片了？拖到这里，看看它符合哪些要求。什么都不会上传：检测就在你的浏览器里进行。",
    drop: "把要检测的照片拖到这里",
    choose: "选择文件",
    allPass: "能测量的项目全部符合",
    someFail: "有 {n} 项未通过",
    someWarn: "全部符合，但有一处需要留意",
    measured: "实测",
    expected: "要求",
    notChecked: "这里查不出来的部分",
    notCheckedBody:
      "表情、眼睛是否睁开、眼镜、头饰、头后的阴影，以及照片拍摄的时间。" +
      "这里通过，只说明文件的尺寸、体积和背景够干净，并不代表申请一定会被接受。",
    fixIt: "在这里修好",
    checkFace: "同时检测人脸",
    checkingFace: "正在测量人脸…",
    faceHint: "头部高度、眼睛位置和倾斜角度。只需下载一次 15 MB 的模型。",
    noFace: "这张照片里没有检测到人脸",
    bgReplaced: "由软件替换",
    bgPhotographed: "相机拍摄",
    legendGot: "你的脸在哪里",
    legendWant: "证件要求的位置",
    labels: {
      dimensions: "像素尺寸",
      ratio: "宽高比",
      filesize: "文件大小",
      format: "格式",
      "bg-brightness": "背景亮度",
      "bg-even": "背景均匀度",
      "bg-synthetic": "背景来源",
      "head-height": "头部高度",
      "eye-line": "眼睛距底边",
      tilt: "头部倾斜",
    },
  },

  hub: {
    h1: "签证照和证件照，按各国规格制作",
    lead: "选好证件，尺寸自动填好；裁切和换底色一步完成，任何数据都不会离开你的浏览器。",
    stats: ({ docs, langs }) => `${docs} 种证件 · ${langs} 种语言 · 免费，无水印`,
    faq: [
      {
        q: "真的免费吗？",
        a:
          "免费，没有水印，也不用注册。别的网站让你免费预览，下载干净文件却要收费；" +
          "在这里，下载本身就是免费的。",
      },
      {
        q: "我的照片会被上传吗？",
        a:
          "不会。裁切和去背景都用 WebAssembly 在你的浏览器里完成，只有背景模型需要从网上下载，" +
          "照片始终不会离开你的设备。源代码是公开的，这一点你可以自己验证，不用只听我们说。",
      },
      {
        q: "照片里还会留下我的位置和手机型号吗？",
        a:
          "不会。手机拍的照片带有 EXIF 元数据：拍摄地点的 GPS 坐标、相机型号、日期，有时还有机主姓名；" +
          "直接把原图发过去，领事馆会连这些一起收到。本工具生成的文件是从头重新编码的，这些信息都不会保留，" +
          "只剩像素数据、色彩配置文件和打印分辨率。",
      },
      {
        q: "可以在家里打印吗？",
        a:
          "可以。每个证件页面都能导出 A4 拼版的 PNG 和 PDF，张数和尺寸都是对的。" +
          "记得按 100 % 比例打印，选“适应页面”会悄悄改变尺寸。多数证件用好一点的家用打印机配相纸就够；" +
          "哪些证件必须由影楼出片，会写在该证件的页面上。",
      },
      {
        q: "我的申请会通过吗？",
        a:
          "这个我们无法承诺，诚实的人都不会承诺。工具能保证的是：文件符合你所选证件已公布的规格。" +
          "要求随时会变，申请前请查看每个页面上标注的官方来源。",
      },
    ],
  },

  customPage: {
    title: "任意尺寸证件照 — 毫米、厘米、英寸或像素，免费在线制作",
    h1: "任意尺寸，自己设定",
    lead: "上面的页面没有覆盖的尺寸，可以在这里自己填：按表格上写的数字输入，就按它裁切。毫米、厘米、英寸、像素都行，表格要哪个就用哪个。全部在浏览器里完成。",
    width: "宽",
    height: "高",
    unitMm: "毫米",
    unitPx: "像素",
    unitLabel: "单位",
    dpi: "分辨率",
    presetHint: "你的尺寸",
    common: "问得最多的尺寸：",
    whenToUse: "什么时候用这个",
    whenToUseBody: "领事馆要求了一个少见的尺寸、单位的门禁卡、票证，或者某张表格自己写明了毫米数。如果你的证件在目录里，请用它自己的页面——那里有官方出处、头部高度的规定和文件大小上限，这些都不是一个尺寸数字能告诉你的。",
  },

  bgPage: {
    title: "照片一键抠图换背景 — 免费，照片不上传",
    cut: "抠掉背景",
    h1: "抠掉或更换背景",
    lead: "拖入照片，把背景抠掉，然后在后面换上任意颜色——也可以保留透明。神经网络就在这个标签页里运行，照片不会离开你的设备。不用注册，没有水印，没有次数限制。",
    colour: "背景换成：",
    keepTransparent: "保留透明",
    pickColour: "自定义颜色",
    download: "下载",
    whenToUse: "这个页面适合什么",
    whenToUseBody: "证件照只是其中一种用途，各国的页面已经把裁切和头部高度的规定一起做好了。这一页是给别的场景用的：头像、商品图、打印、背景不合适的人像。这里不做任何测量，也不对照任何规格——照片进来多大，出去还是多大。",
  },

  autoFaq: {
    size: ({ doc }) => `${doc}的尺寸是多少厘米、多少英寸？`,
    sizeA: ({ mm, cm, inch }) =>
      `${mm} 毫米，也就是 ${cm} 厘米或 ${inch} 英寸。三种写法说的是同一个尺寸；` +
      `申请表要求哪个单位，就填哪个。`,
    pixels: ({ doc }) => `${doc}的像素尺寸是多少？`,
    pixelsA: ({ px, dpi }) => `${px} 像素，按打印尺寸算相当于 ${dpi} dpi。再小，打印出来就会发虚。`,
    perSheet: ({ doc }) => `一张纸能放几张${doc}？`,
    perSheetA: ({ n, size }) =>
      `一张 A4 纸可放 ${n} 张 ${size} 的照片。请按 100 % 比例打印，绝不要选“适应页面”。`,
    background: ({ doc }) => `${doc}要什么底色？`,
    backgroundA: ({ bg }) =>
      `${bg}，纯色、光线均匀，头后不能有阴影。如果你身后的墙不合适，工具可以帮你换掉背景。`,
    fileSize: ({ doc }) => `${doc}要什么格式？文件不能超过多大？`,
    fileSizeA: ({ format, kb }) =>
      `${format}，不超过 ${kb} KB。本站导出时会在保证分辨率达标的前提下压缩，把文件控制在这个上限内。`,
    howFiled: ({ doc }: { doc: string }) => `${doc}：上传文件还是交打印件？`,
    howFiledA: ({ route, form }: { route: string; form: string }) => `${route}${form}`,
    editing: ({ doc }: { doc: string }) => `${doc}：该机构接受修过的照片吗？`,
    checked: ({ doc }: { doc: string }) => `${doc}：本页生成的照片经过官方检测吗？`,
    uploadFails: ({ form }) => `${form} 照片上传不了或被退回，为什么？`,
    uploadFailsA: ({ form, format, kb, px }) =>
      `${form} 会拒收所有非 ${format} 格式、大于 ${kb} KB，或者小于 ${px} 像素的文件。` +
      `在本站导出，这三项都会控制在限制之内。如果文件本身符合规格、网站还是报错，那是他们的系统问题，` +
      `不是你的照片问题。`,
    covering: ({ doc }) => `${doc}可以戴头巾、盖头或其他宗教头饰吗？`,
    coveringA: () =>
      `可以。出于宗教原因每天佩戴的头饰是被接受的，普通帽子则不行。脸部必须从下巴露到额头，` +
      `两侧脸缘都要露出，脸上不能有任何阴影。布料要素色无花纹，颜色要和背景区分开——` +
      `白色头饰配白色背景会糊成一片，加拿大和土耳其都专门提醒过这一点。本站的调色板可以换成对比色背景。`,
    coveringStatement:
      `美国还要求附一份签名说明，写明这是每天在公共场合佩戴的宗教服饰。那是随申请提交的一句话，与照片本身无关。`,
  },

  // Generated from the catalogue and presets.toml — see ../docText.ts.
  country: {},
  docTitle: {},
  docShort: {},
  docNotes: {},
  pageTitle: {},
  faq: {},
};

export default zh;
