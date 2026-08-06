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
  nav: { countries: "所有国家", models: "背景模型" },
  unit: { mm: "毫米", cm: "厘米", in: "英寸", px: "px", kb: "KB", mb: "MB" },
  dateLocale: "zh-CN",
  readHere: "阅读中文版",

  kindName: { visa: "签证", passport: "护照", permit: "居留许可" },
  gen: {
    docTitle: ({ country, doc }) => `${country}${doc}照片`,
    pageTitle: ({ country, doc, size }) =>
      `${country}${doc}照片尺寸 — ${size}，要求与免费工具`,
    docNotes: ({ background, size, headMm, mm }) =>
      `${background}背景，${size}，下巴到头顶约 ${headMm} ${mm}。`,
  },

  answer: ({ w, h, kb, format, bg }) =>
    `你需要一张 ${w} × ${h} 像素的照片，${bg}背景，${format} 格式，小于 ${kb} KB。` +
    `在这里就能做好。照片只在你的浏览器里处理，不会上传。`,
  verified: ({ date, source }) => `核对于 ${date} · ${source}`,
  checkerVerified: ({ date }) => `本页生成的照片已于 ${date} 通过官方照片检测系统`,
  backgroundIn: { white: "白色", "light-grey": "浅灰色" },
  backgroundName: { white: "白色", "light-grey": "浅灰色" },

  spec: {
    heading: "规格",
    print: "打印尺寸",
    digital: "数字尺寸",
    background: "背景",
    headHeight: "头部高度",
    eyeLine: "眼睛位置",
    file: "文件",
    perSheet: "每张纸",
    fromBottom: "自下而上",
    pieces: "张",
  },

  tool: {
    dropTitle: "把照片拖到这里",
    dropSub: (doc) => `我们按${doc}的规格裁切、摆正面部并去除背景，一步完成`,
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
    checkResult: "检测这个结果",
    tip: "拖动可移动 · 滚轮可缩放",

    removeBg: "把背景换成白色",
    removeBgHint: "只需下载一次 {mb} MB 的模型，之后离线也能用",
    bgDone: "背景已替换",
    bgUndo: "恢复原图",
    tryBetterHint: "换个更大的模型试试。头发和眼镜正是轻量模型放弃的地方。",
    modelCaveat:
      "没有哪个模型能处理所有照片。轮廓毛糙时，换大一点的通常能解决 — " +
      "而身后一面素色的墙胜过任何模型。",
    cached: "已下载",

    alignFace: "按面部对齐",
    aligning: "正在寻找面部…",
    alignHint: "把头部和眼睛放到这份证件要求的位置。只需下载一次 15 MB 的模型。",
    alignFailed: "没有找到面部 — 请手动调整裁切",
    tooTight: "拍得太近了：头部四周没有足够空间按这份证件裁切。请后退一些重拍。",
    aligned: "已按面部对齐",
    rotateLeft: "向左旋转",
    rotateRight: "向右旋转",
    autoLevels: "自动色阶",
    zoom: "缩放",

    undoLevels: "撤销调整",
    changeModel: "更换模型",
    changeModelWhen: "背景还是不够白，或者边缘毛糙？",
    modelsPageLink: "各模型的区别",
    modelDefault: "默认",

    advanced: "更多控制",
    advancedHint: "大多数照片用不到这些。",
    brightness: "亮度",
    contrast: "对比度",
    shadows: "阴影",
    resetLevels: "重置",
    transparentBg: "透明背景（PNG）",
    transparentHint: "适用于自行合成背景的表单。多数申请要求白色。",
    faceOval: "显示面部椭圆",
    fileName: "文件名",
    fileNamePlaceholder: "例如你的姓氏",
    backdropLabel: "背景颜色",
    backdropNames: {
      white: "白色",
      "off-white": "米白色",
      "light-grey": "浅灰色",
      "mid-grey": "中灰色",
      "pale-blue": "淡蓝色",
    },
    backdropRequired:
      "这份证件要求{colour}。其他颜色放在这里，是因为有些规定只写「素色浅底」，" +
      "而灰色能让浅色头发不至于融进白色里。",
  },

  trust: {
    inBrowser: "在你的浏览器中处理",
    noServer: "从不发送到服务器",
    noWatermark: "没有水印",
    noSignup: "无需注册",
  },

  seo: {
    requirements: "照片要求",
    requirementsIntro: (doc) => `一张能被接受的${doc}照片需要满足的全部条件。`,
    howToShoot: "怎样在家里拍",
    howToShootBody:
      "面朝窗户站好，让光均匀落在脸上，距离素色墙面约两米。" +
      "请人把相机举到与眼睛齐平的高度，不要从下往上拍。表情自然，嘴巴闭合，" +
      "两只耳朵和下颌线都要露出来，头后不要有阴影。",
    printing: "打印：每张纸放几张照片",
    printingBody: ({ n, w, h, dpi }) =>
      `${w} × ${h} 毫米的照片，在 ${dpi} dpi 下一张 A4 纸可放 ${n} 张。` +
      `请按 100 % 比例打印。「适应页面」会悄悄改变尺寸，照片就不再符合规格了。`,
    faq: "常见问题",
    sources: "来源",
    disclaimer:
      "这是一个独立网站，不是政府机构。要求会变，申请前请与官方来源核对。" +
      "我们承诺照片符合已公布的规格。我们从不承诺申请一定获批。",
    disclaimerShort: "独立网站，非政府机构。请以官方来源核对要求。",
    related: "相关页面",
  },

  warn: {
    noEditing:
      "该机构不接受用修图软件、滤镜或 AI 工具处理过的照片。" +
      "请用这里的工具确认构图，然后提交未经处理的照片。",
    noEditingAtAction:
      "去除背景也属于修图，而该机构会拒绝修过的照片。" +
      "请用它来判断构图是否合适，而不是用来生成要提交的文件。",
    noHomePrint: "家里打印的照片不被接受 — 请使用专业冲印服务。",
    proceedAnyway: "仍然去除",
  },

  submission: {
    upload: "以文件形式提交",
    print: "打印后当面递交",
    captured: "在预约现场为你拍摄",
  },

  countryPage: {
    faqDocs: (country) => `${country}的哪些证件需要照片？`,
    faqDocsA: ({ country, list }) =>
      `${country}：${list}。每个页面都写明确切尺寸，并配有按此裁切的工具。`,
    faqSame: (country) => `${country}的所有证件能用同一张照片吗？`,
    faqSameYes: ({ size }) => `可以 — 它们都用 ${size}，所以导出一次就能通用。`,
    faqSameNo: "不行 — 尺寸不同，每一种都需要单独导出。",
    h1: (country) => `${country}：照片要求`,
    lead: ({ country, n }) => `${country}的 ${n} 种证件，各自的确切尺寸和对应的裁切工具。`,
    title: (country) => `${country}照片尺寸与要求 — 免费制作工具`,
    docHeadline: ({ title, size }) => `${title}：${size}`,
  },

  agent: {
    heading: "把这个交给 AI 助手",
    lead:
      "把提示词粘贴到任何 AI 助手里，它就拿到了全部信息：确切的数字、数字所在的页面，" +
      "以及核对时依据的来源。完整规格是更长的参考版本。",
    copyPrompt: "复制给助手的提示词",
    copySpec: "复制完整规格",
    copied: "已复制",
    openSkills: "助手技能",
    disclaimer: "这是参考信息，不是移民建议。申请由申请人本人填写并签署。",
  },

  check: {
    tab: "检测照片",
    makeTab: "制作照片",
    title: "检测已有的照片",
    lead:
      "已经有文件了？拖到这里，看看它满足哪些要求。什么都不会上传 — 检测在你的浏览器里进行。",
    drop: "把要检测的照片拖到这里",
    choose: "选择文件",
    allPass: "所有可测量的项目都符合",
    someFail: "有 {n} 项未通过",
    someWarn: "全部符合，有一处值得留意",
    measured: "实测",
    expected: "要求",
    notChecked: "它无法告诉你的事",
    notCheckedBody:
      "头部大小和位置、表情、眼睛是否睁开、眼镜、头饰、头后的阴影，以及照片拍摄的时间。" +
      "这里通过只意味着文件的尺寸、大小和背景足够干净 — 并不意味着申请会被接受。",
    fixIt: "在这里修正",
    checkFace: "同时检测面部",
    checkingFace: "正在测量面部…",
    faceHint: "头部高度、眼睛位置和倾斜度。只需下载一次 4 MB 的模型。",
    noFace: "这张照片里没有找到面部",
    labels: {
      dimensions: "像素尺寸",
      ratio: "宽高比",
      filesize: "文件大小",
      format: "格式",
      "bg-brightness": "背景亮度",
      "bg-even": "背景均匀度",
      "head-height": "头部高度",
      "eye-line": "眼睛距底边",
      tilt: "头部倾斜",
    },
  },

  hub: {
    h1: "签证和证件照片，按各国规格制作",
    lead: "选择证件。尺寸会自动填好，裁切和背景一步完成，而且没有任何数据离开你的浏览器。",
    stats: ({ docs, langs }) => `${docs} 种证件 · ${langs} 种语言 · 免费，无水印`,
    faq: [
      {
        q: "真的免费吗？",
        a:
          "是的，没有水印，也不需要注册。别的网站给你看免费预览，下载干净文件却要收费；" +
          "在这里，下载才是免费的那部分。",
      },
      {
        q: "我的照片会被上传吗？",
        a:
          "不会。裁切和去背景都通过 WebAssembly 在你的浏览器里运行。唯一下载的是背景模型，" +
          "照片始终不会离开设备。源代码是公开的，所以这一点可以查验，而不必只靠相信。",
      },
      {
        q: "照片里还会留下我的位置和手机型号吗？",
        a:
          "不会。手机拍的照片带有 EXIF 元数据 — 拍摄地点的 GPS 坐标、相机型号、日期，有时还有机主姓名 — " +
          "直接发送原图时，领事馆会收到这一切。本工具生成的文件是从头重新编码的，所以这些都不会保留：" +
          "只剩像素数据、色彩配置和打印分辨率。",
      },
      {
        q: "可以在家里打印吗？",
        a:
          "可以。每个证件页面都能导出 A4 拼版的 PNG 和 PDF，份数和尺寸都正确。" +
          "请按 100 % 比例打印 — 「适应页面」会悄悄改变尺寸。",
      },
      {
        q: "我的申请会通过吗？",
        a:
          "这个我们无法承诺，任何诚实的人都不会承诺。工具保证的是：文件符合你所选证件的公开规格。" +
          "要求会变，所以申请前请查看每个页面上标注的官方来源。",
      },
    ],
  },

  autoFaq: {
    size: ({ doc }) => `${doc}照片的尺寸用厘米和英寸表示是多少？`,
    sizeA: ({ mm, cm, inch }) =>
      `${mm} 毫米，也就是 ${cm} 厘米或 ${inch} 英寸。这是同一张照片的三种说法；` +
      `你面前的表格要求哪个单位，就用哪个。`,
    pixels: ({ doc }) => `${doc}照片的像素尺寸是多少？`,
    pixelsA: ({ px, dpi }) => `${px} 像素，按打印尺寸算是 ${dpi} dpi。比这更小，打印出来会发虚。`,
    perSheet: ({ doc }) => `一张纸上能放几张${doc}照片？`,
    perSheetA: ({ n, size }) =>
      `一张 A4 纸可放 ${n} 张 ${size} 的照片。请按 100 % 比例打印，绝不要用「适应页面」。`,
    background: ({ doc }) => `${doc}照片需要什么颜色的背景？`,
    backgroundA: ({ bg }) =>
      `${bg}，素色、光线均匀，头后没有阴影。如果你身后的墙不合适，工具可以替你更换背景。`,
    fileSize: ({ doc }) => `${doc}照片需要什么格式和多大的文件？`,
    fileSizeA: ({ format, kb }) =>
      `${format}，不超过 ${kb} KB。这里的导出会在不低于所需分辨率的前提下压缩，以留在该限制之内。`,
    uploadFails: ({ form }) => `${form} 为什么拒绝这张照片？`,
    uploadFailsA: ({ form, format, kb, px }) =>
      `${form} 会拒绝一切非 ${format} 的文件、超过 ${kb} KB 的文件，以及小于 ${px} 像素的文件。` +
      `在这里导出会让这三项都留在限制之内。如果文件符合规格而网站仍然报错，那是他们的服务问题，` +
      `不是你的照片问题。`,
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
