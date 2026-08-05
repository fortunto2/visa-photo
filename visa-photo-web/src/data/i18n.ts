/**
 * Locale order follows visa application volume, not convenience.
 *
 * Schengen applications are led by China, Turkey, India, Russia, Morocco and Algeria;
 * US B1/B2 by Mexico, India, China, Brazil and Colombia. That is what picks this list —
 * hi, zh and ar are here because those applicants outnumber the English-speaking ones,
 * and because Passlens serves them in English only (they ship en/es/fr/ar/zh/de/pt,
 * with no ru, tr or hi at all).
 */
export const PLANNED_LANGS = ["en", "hi", "zh", "ar", "es", "ru", "tr", "pt", "fr"] as const;
export type Lang = (typeof PLANNED_LANGS)[number];

/**
 * Which of these actually ship is decided by the locale registry in ./locales/index.ts,
 * which also owns DEFAULT_LANG — a language exists once someone has written its file, not
 * once it appears in this list, and the default has to be one that exists.
 */

export const LANG_LABEL: Record<Lang, string> = {
  en: "English",
  hi: "हिन्दी",
  zh: "中文",
  ar: "العربية",
  es: "Español",
  ru: "Русский",
  tr: "Türkçe",
  pt: "Português",
  fr: "Français",
};

/** BCP-47 tags for <html lang> and hreflang. */
export const LANG_TAG: Record<Lang, string> = {
  en: "en",
  hi: "hi",
  zh: "zh-Hans",
  ar: "ar",
  es: "es",
  ru: "ru",
  tr: "tr",
  pt: "pt",
  fr: "fr",
};

/** Right-to-left locales need dir="rtl" on <html>; the layout mirrors from there. */
export const RTL_LANGS: ReadonlySet<Lang> = new Set<Lang>(["ar"]);

export function dirOf(lang: Lang): "ltr" | "rtl" {
  return RTL_LANGS.has(lang) ? "rtl" : "ltr";
}

export interface Dict {
  /** site-wide */
  nav: { countries: string; models: string };
  /** unit suffixes, localised — "mm" is not "мм" */
  unit: { mm: string; cm: string; in: string; px: string; kb: string; mb: string };

  /** country page */
  answer: (v: { w: number; h: number; kb: number; format: string; bg: string }) => string;
  verified: (v: { date: string; source: string }) => string;
  /**
   * Two forms, because Russian needs them: the answer sentence says "на белом фоне"
   * (prepositional) while the spec table says "белый" (nominative). One string produced
   * "Фон: белом" on the live page.
   */
  backgroundIn: Record<"white" | "light-grey", string>;
  backgroundName: Record<"white" | "light-grey", string>;

  spec: {
    heading: string;
    print: string;
    digital: string;
    background: string;
    headHeight: string;
    eyeLine: string;
    file: string;
    perSheet: string;
    fromBottom: string;
    pieces: string;
  };

  tool: {
    dropTitle: string;
    dropSub: (docName: string) => string;
    choose: string;
    camera: string;
    working: string;
    /**
     * States what the tool did, not what an official will decide. "Matches the spec" is a
     * promise about someone else's judgement, and the spec ban on promising outcomes covers
     * exactly that.
     */
    framedTo: (size: string) => string;
    downloadJpeg: string;
    downloadPng: string;
    downloadSheet: (n: number) => string;
    guideCrown: string;
    guideEyes: (pct: string) => string;
    guideChin: string;
    reset: string;
    tip: string;

    /** background removal */
    removeBg: string;
    /**
     * Shown before anything downloads, so the cost is never a surprise.
     *
     * A template with a {mb} token rather than a function: props crossing into a client
     * island are JSON-serialised, and a function silently becomes null there. It did — the
     * tool threw on first use for anyone who had not yet downloaded a model.
     */
    removeBgHint: string;
    bgDone: string;
    bgUndo: string;
    /** offered only after a result exists — the retry, not the up-front question */
    tryBetterHint: string;
    /** honest about the limit of any one model */
    modelCaveat: string;
    cached: string;

    /** small edits carried over from the desktop app */
    /** face alignment: the crop the specification actually asks for */
    alignFace: string;
    aligning: string;
    alignHint: string;
    alignFailed: string;
    aligned: string;
    rotateLeft: string;
    rotateRight: string;
    autoLevels: string;
    zoom: string;

    /**
     * Advanced panel. The desktop app's controls, folded away rather than dropped:
     * most visitors need none of them, and the ones who do are usually fixing a specific
     * complaint from a specific consulate.
     */
    /** undo for the levels row — auto levels is a guess, and guesses need taking back */
    undoLevels: string;
    /** the model switch, surfaced next to the background button instead of hidden behind it */
    changeModel: string;
    changeModelWhen: string;
    modelsPageLink: string;
    modelDefault: string;

    advanced: string;
    advancedHint: string;
    brightness: string;
    contrast: string;
    shadows: string;
    resetLevels: string;
    transparentBg: string;
    transparentHint: string;
    faceOval: string;
    fileName: string;
    fileNamePlaceholder: string;
  };

  trust: { inBrowser: string; noServer: string; noWatermark: string; noSignup: string };

  /** SEO zone below the tool */
  seo: {
    requirements: string;
    requirementsIntro: (docName: string) => string;
    howToShoot: string;
    howToShootBody: string;
    printing: string;
    printingBody: (v: { n: number; w: number; h: number; dpi: number }) => string;
    faq: string;
    sources: string;
    disclaimer: string;
    /** one-line version for the footer; the full text lives in the page body */
    disclaimerShort: string;
    related: string;
  };

  /**
   * Rules that contradict what this tool does. Shown on the page, and again at the moment
   * someone reaches for the feature the rule forbids — a banner at the top is read once and
   * forgotten by the time the button is clicked.
   */
  warn: {
    noEditing: string;
    noEditingAtAction: string;
    noHomePrint: string;
    proceedAnyway: string;
  };

  /** How the photo reaches the application — stated before the spec, because it decides
   *  whether a file is needed at all. */
  submission: {
    upload: string;
    print: string;
    captured: string;
  };

  /** country page: one country, all of its documents */
  countryPage: {
    h1: (country: string) => string;
    /** Answers built from the catalogue, so a country page carries facts, not just links. */
    faqDocs: (country: string) => string;
    faqDocsA: (v: { country: string; list: string }) => string;
    faqSame: (country: string) => string;
    faqSameYes: (v: { size: string }) => string;
    faqSameNo: string;
    lead: (v: { country: string; n: number }) => string;
    title: (country: string) => string;
  };

  /** the models page: what the background remover actually downloads and why */
  modelsPage: {
    title: string;
    h1: string;
    lead: string;
    howItWorks: string;
    howItWorksBody: string;
    table: { model: string; size: string; bestFor: string; status: string };
    bestFor: Record<string, string>;
    storage: string;
    storageBody: string;
    limits: string;
    limitsBody: string;
    downloaded: string;
    notDownloaded: string;
    /** actions available per row */
    download: string;
    downloading: string;
    remove: string;
    makeDefault: string;
    isDefault: string;
    defaultNote: string;
  };

  /**
   * Handing the page to an agent.
   *
   * Deliberately a reference card, not an instruction to act: the text copied here states
   * requirements and cites the official source. Filling or filing an application on someone's
   * behalf is regulated advice in the UK, the US and Canada, so nothing here tells an agent
   * to do that.
   */
  agent: {
    heading: string;
    lead: string;
    copyPrompt: string;
    copySpec: string;
    copied: string;
    openSkills: string;
    disclaimer: string;
  };

  /**
   * Checking a photo that already exists. Named for what it measures, not for what an
   * official decides — the list of what it cannot see is part of the result, not a footnote.
   */
  check: {
    tab: string;
    makeTab: string;
    title: string;
    lead: string;
    drop: string;
    choose: string;
    allPass: string;
    /** template with an {n} token: the count is only known in the browser, and a
     *  function cannot cross into an island. */
    someFail: string;
    someWarn: string;
    measured: string;
    expected: string;
    notChecked: string;
    notCheckedBody: string;
    fixIt: string;
    labels: Record<string, string>;
  };

  /** the any-size page: what the catalogue does not cover */
  customPage: {
    title: string;
    h1: string;
    lead: string;
    width: string;
    height: string;
    unitMm: string;
    unitPx: string;
    dpi: string;
    presetHint: string;
    common: string;
    whenToUse: string;
    whenToUseBody: string;
  };

  /** the skills section */
  skills: {
    title: string;
    h1: string;
    lead: string;
    install: string;
    installBody: string;
    whatItDoes: string;
    limits: string;
    limitsBody: string;
    copyFile: string;
    endpoints: string;
    endpointsBody: string;
  };

  /** hub */
  hub: {
    h1: string;
    lead: string;
    /** Questions about the site itself, not about a document. */
    faq: { q: string; a: string }[];
    stats: (v: { docs: number; langs: number }) => string;
  };

  /** BCP-47 tag used to format the "checked on" date; ISO dates look untranslated */
  dateLocale: string;

  /** names, keyed by catalog preset */
  country: Record<string, string>;
  docTitle: Record<string, string>;
  docShort: Record<string, string>;
  /**
   * The `notes` field in presets.toml is English prose ("White bg, no headwear").
   * Numbers can be shared across locales; sentences cannot.
   */
  docNotes: Record<string, string>;
  /** page <title>, kept separate so it can carry the search phrasing */
  pageTitle: Record<string, string>;
  /**
   * Questions people actually type, per document. Sourced from Google autocomplete and
   * "people also search", not invented: "how many copies", "what to wear", "what if my photo
   * is rejected", "upload error". Rendered as FAQPage schema.
   *
   * Documents with nothing written yet simply have no FAQ section — an empty answer is worse
   * than an absent one on a page people use to prepare official paperwork.
   */
  faq: Record<string, { q: string; a: string }[]>;

  /**
   * Questions whose answers come straight out of presets.toml, so every document gets them
   * without anyone writing prose. These are the searches that repeat for every country:
   * "size in cm", "size in inches", "size in pixels", "how many", "background".
   */
  autoFaq: {
    size: (v: { doc: string }) => string;
    sizeA: (v: { mm: string; cm: string; inch: string }) => string;
    pixels: (v: { doc: string }) => string;
    pixelsA: (v: { px: string; dpi: number }) => string;
    perSheet: (v: { doc: string }) => string;
    perSheetA: (v: { n: number; size: string }) => string;
    background: (v: { doc: string }) => string;
    backgroundA: (v: { bg: string }) => string;
    fileSize: (v: { doc: string }) => string;
    fileSizeA: (v: { format: string; kb: number }) => string;
    uploadFails: (v: { form: string }) => string;
    uploadFailsA: (v: { form: string; format: string; kb: number; px: string }) => string;
  };
}
