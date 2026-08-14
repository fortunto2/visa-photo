import type { GuideText } from "./index";

/**
 * Chinese gets two: the USCIS change, and the receipt-code guide, which is about a Chinese
 * document and belongs in the language of the people applying for it. Written in Simplified,
 * which is what this locale is; the reachable audience is largely Taiwan and Hong Kong, and
 * a Traditional locale is its own job rather than a filter run over this one.
 */
const zh: Record<string, GuideText> = {
  "uscis-stopped-accepting-your-photo": {
    title: "USCIS 不再接受你自己提交的照片",
    h1: "USCIS 不再收你的照片了",
    lead:
      "2025 年 12 月 12 日起，USCIS 不再接受申请人提交的照片，改为在生物信息采集预约时当场拍摄。国务院不在此列，而这个区别决定了你到底要不要准备文件。",
    body: [
      "政策通知写得很具体：只使用 USCIS 或其他获授权机构采集的照片；此前采集的照片，只有在最近 36 个月内拍摄的才可重复使用。有四种表格无论上次何时拍照都必须重新采集：更换绿卡的 I-90、调整身份的 I-485、入籍的 N-400，以及公民身份证明的 N-600。",
      "容易搞错，是因为「绿卡」指的是经由两个不同机构的两条路径。在美国境内调整身份走的是 USCIS，那边已经没有需要你准备的东西。在境外领事馆申请的移民签证走的是国务院，那边仍然要你提供照片。",
      "国务院经办的一切都没有变。非移民签证的 DS-160 仍然接受 600 × 600 的文件；护照的 DS-11 仍然要求 2 × 2 英寸的冲印照片；多元化移民签证抽签也仍然使用参与者自己提交的照片——不合规的照片依旧会让整份申请作废。",
      "USCIS 把理由说得很直白：疫情期间的宽松规定允许照片重复使用长达十年，哪怕本人相貌已有明显变化，而这项安排维持的时间超过了必要。",
    ],
    takeaway:
      "USCIS 的表格：现场给你拍，什么都不用准备。国务院的表格——DS-160、DS-11、DV 抽签：照旧准备照片。",
  },

  "china-photo-receipt-code": {
    title: "办中国护照要的不只是照片，还有照片回执",
    h1: "中国：照片要配一张照片回执",
    lead:
      "出入境管理大厅在办理时会免费为申请人拍照。自带照片也可以，但必须同时有照片回执——由具备资质的照相馆出具的回执号，而这是任何在家做出来的文件都无法附带的。",
    body: [
      "回执才是这条规定的重点。它证明的不是照片尺寸合格，而是这张照片由具备资质的照相馆拍摄，并对应一个系统可以查验的编号。所以无论尺寸多么准确，任何工具导出的文件——包括本站的——都无法满足它。",
      "因此只有两条实在的路：在大厅拍，免费而且最省事；或者去有资质的照相馆，付一点钱，连同照片拿到回执号。",
      "各地实际做法比全国性规定更参差。部分省份对某些出入境证件要求蓝底而非白底，广东是最常被提到的一个。在花钱去照相馆之前，先问清楚你要去的那个大厅究竟怎么要求。",
      "外国人申请的中国签证则完全是另一回事：走 COVA 系统，需要上传文件，与回执无关。",
    ],
    takeaway:
      "中国护照：在大厅拍，或者找能出具照片回执的照相馆。外国人办中国签证：上传文件，尺寸见证件页面。",
  },
};

export default zh;
