import type { Dict } from "../i18n";

const en: Dict = {
  nav: { countries: "All countries", models: "Background models", tools: "Tools" },
  unit: { mm: "mm", cm: "cm", in: "in", px: "px", kb: "KB", mb: "MB" },
  dateLocale: "en-GB",
  readHere: "Read this in English",

  kindName: { visa: "Visa", passport: "Passport", permit: "Residence permit" },
  gen: {
    docTitle: ({ country, doc }) => `${country} ${doc.toLowerCase()} photo`,
    pageTitle: ({ country, doc, size }) =>
      `${country} ${doc} Photo Size — ${size}, requirements & free tool`,
    docNotes: ({ background, size, headMm, mm }) =>
      `A ${background} background, ${size}, head about ${headMm} ${mm} from chin to crown.`,
  },

  answer: ({ w, h, kb, format, bg }) =>
    `You need a ${w} × ${h} pixel photo on a ${bg} background, ${format} under ${kb} KB. ` +
    `Make it right here. Your photo is processed in the browser and never uploaded.`,
  verified: ({ date, source }) => `Checked ${date} · ${source}`,
  checkerVerified: ({ date }) => `A photo from this page passed the official government photo checker on ${date}`,
  backgroundIn: { white: "white", "light-grey": "light grey" },
  backgroundName: { white: "White", "light-grey": "Light grey" },

  spec: {
    heading: "Specification",
    print: "Print size",
    digital: "Digital size",
    background: "Background",
    headHeight: "Head height",
    eyeLine: "Eye line",
    file: "File",
    perSheet: "Per sheet",
    fromBottom: "from bottom",
    pieces: "photos",
  },

  tool: {
    dropTitle: "Drop your photo here",
    dropSub: (doc) => `We crop to the ${doc} spec, straighten the face and clear the background in one step`,
    choose: "Choose a file",
    camera: "or use your camera",
    working: "Working…",
    framedTo: (size) => `Framed to ${size}`,
    downloadJpeg: "Download JPEG",
    downloadPng: "PNG, no compression",
    downloadSheet: (n) => `A4 sheet · ${n} photos`,
    guideCrown: "crown",
    guideEyes: (pct) => `eyes ${pct} %`,
    guideChin: "chin",
    reset: "Start over",
    checkResult: "Check this result",
    tip: "Drag to reposition · scroll to zoom",

    removeBg: "Make the background white",
    removeBgHint: "Downloads a {mb} MB model once, then works offline",
    bgDone: "Background replaced",
    bgUndo: "Bring the original back",
    tryBetterHint: "Try a heavier model. Hair and glasses are where the light one gives up.",
    modelCaveat:
      "No single model handles every photo. If the outline is ragged, a larger one usually fixes it — " +
      "and a plain wall behind you beats any model.",
    cached: "Already downloaded",

    alignFace: "Align to the face",
    aligning: "Finding the face…",
    alignHint: "Positions the head and eye line where this document requires. Downloads a 15 MB model once.",
    alignFailed: "No face found — position the crop by hand",
    tooTight: "Taken too close: there is not enough room around the head to crop to this document. Step back and retake it.",
    aligned: "Aligned to the face",
    rotateLeft: "Rotate left",
    rotateRight: "Rotate right",
    autoLevels: "Auto levels",
    zoom: "Zoom",

    undoLevels: "Undo adjustments",
    changeModel: "Change model",
    changeModelWhen: "Background still not white, or edges ragged?",
    modelsPageLink: "How the models differ",
    modelDefault: "Default",

    advanced: "More controls",
    advancedHint: "You will not need these for most photos.",
    maxKb: "Max file size",
    maxKbHint: "This authority publishes {kb} KB. Change it only if your portal states its own limit.",
    brightness: "Brightness",
    contrast: "Contrast",
    shadows: "Shadows",
    resetLevels: "Reset",
    transparentBg: "Transparent background (PNG)",
    transparentHint: "For forms that composite the photo themselves. Most applications want white.",
    faceOval: "Show face oval",
    fileName: "File name",
    fileNamePlaceholder: "e.g. your surname",
    backdropLabel: "Background colour",
    backdropNames: {
      white: "White",
      "off-white": "Off-white",
      "light-grey": "Light grey",
      "mid-grey": "Mid grey",
      "pale-blue": "Pale blue",
    },
    backdropRequired: "This document asks for {colour}. The others are here because some rules say \"plain light-coloured\", and a grey keeps light hair from disappearing into white.",
  },

  trust: {
    inBrowser: "Processed in your browser",
    noServer: "Never sent to a server",
    noWatermark: "No watermark",
    noSignup: "No sign-up",
    free: "Free, no limits",
    why: "Nothing is uploaded because nothing needs to be. Cropping happens on a canvas in your browser, and the background is removed by a neural network that downloads to your device and runs there. The only thing that travels is the model coming down — your photo never leaves the tab, and the source code is public so this can be checked rather than believed.",
  },

  consent: {
    text: "Your photo stays on your device — that never changes. This is only about Google's analytics, which counts visits. Off until you say otherwise.",
    more: "More",
    accept: "Allow analytics",
    decline: "No thanks",
  },

  seo: {
    requirements: "Photo requirements",
    requirementsIntro: (doc) => `Everything an accepted ${doc} photo has to satisfy.`,
    howToShoot: "How to shoot it at home",
    howToShootBody:
      "Stand facing a window so the light falls evenly on your face, about two metres from a plain wall. " +
      "Have someone hold the camera at eye level rather than shooting from below. Neutral expression, " +
      "mouth closed, both ears and the jawline visible, no shadow behind your head.",
    printing: "Printing: photos per sheet",
    printingBody: ({ n, w, h, dpi }) =>
      `${n} photos of ${w} × ${h} mm fit on one A4 sheet at ${dpi} dpi. ` +
      `Print at 100 % scale. “Fit to page” quietly resizes everything, and the photo stops matching the spec.`,
    faq: "Frequently asked",
    sources: "Sources",
    disclaimer:
      "This is an independent site, not a government body. Requirements change, so check them against " +
      "the official source before you apply. We promise a photo that matches the published " +
      "specification. We never promise that an application will be approved.",
    disclaimerShort: "Independent site, not a government body. Verify requirements at the official source.",
    related: "Related pages",
  },

  modelsPage: {
    title: "Background removal models — sizes, quality, storage",
    h1: "Which model removes the background",
    lead: "The tool cuts you out of the photo and puts white behind you. That is done by a neural network running inside your browser, and you choose which one.",
    howItWorks: "Why there is a choice at all",
    howItWorksBody:
      "A bigger model traces hair, glasses and thin edges more carefully, and costs more to download. " +
      "The light one runs first because 5 MB is a fair price for a result most photos are fine with. " +
      "If your outline came out ragged, switching model is the fix, and the tool offers it right after the first attempt.",
    table: { model: "Model", size: "Download", bestFor: "Best for", status: "On this device" },
    bestFor: {
      u2netp: "Plain backgrounds, short hair. The default.",
      silueta: "Same idea, a little more careful at the edges.",
      u2net: "Busy backgrounds where the light model bleeds.",
      u2net_human_seg: "Trained on people: the best one for hair and glasses.",
      isnet: "Fine detail, at 1024 px input instead of 320.",
      face_landmarker: "Finds the face so the crop lands where the document wants it, and measures head height for the checker.",
    },
    storage: "Where the model is kept",
    storageBody:
      "It downloads once and stays in your browser's storage, so the second photo needs no network at all. " +
      "Clearing site data removes it. The photo itself is never uploaded — only the model comes down.",
    limits: "What no model fixes",
    limitsBody:
      "A patterned wall, a shadow behind your head, or clothing the colour of the wall will defeat every model here. " +
      "Standing a metre away from a plain wall beats any amount of megabytes.",
    kinds: { face: "face detection" },
    downloaded: "Downloaded",
    notDownloaded: "Not yet",
    download: "Download",
    downloading: "Downloading",
    remove: "Remove",
    makeDefault: "Use by default",
    isDefault: "Default",
    defaultNote:
      "The default is what the background button reaches for first. Downloading a model here, " +
      "on wifi, means it is ready when you need it instead of arriving mid-job.",
  },

  warn: {
    noEditing:
      "This authority does not accept photos altered with editing software, filters or AI tools. " +
      "Use the tool here to check the framing, then submit an unedited photo.",
    noEditingAtAction:
      "Removing the background edits the photo, and this authority rejects edited photos. " +
      "Use it to see whether your framing works, not for the file you submit.",
    noHomePrint: "Photos printed at home are not accepted — use a professional print service.",
    studioOnly:
      "This authority wants the photo taken in a commercial studio, which writes its name and the date on the back. Use the tool here to see the framing and the numbers; the photo itself has to come from the studio.",
    proceedAnyway: "Remove it anyway",
  },

  submission: {
    upload: "Submitted as a file",
    print: "Handed over printed",
    captured: "Taken for you at the appointment",
  },

  countryPage: {
    faqDocs: (country) => `Which documents does ${country} need a photo for?`,
    faqDocsA: ({ country, list }) => `${country}: ${list}. Each page states the exact size and has a tool that crops to it.`,
    faqSame: (country) => `Can one photo be used for every ${country} document?`,
    faqSameYes: ({ size }) => `Yes — they all use ${size}, so a single export works for all of them.`,
    faqSameNo: "No — the sizes differ, so each one needs its own export.",
    h1: (country) => `${country}: photo requirements`,
    lead: ({ country, n }) =>
      `${n} document${n === 1 ? "" : "s"} for ${country}, each with its exact size and a tool that crops to it.`,
    title: (country) => `${country} photo size and requirements — free maker`,
    docHeadline: ({ title, size }) => `${title}: ${size}`,
  },

  agent: {
    heading: "Hand this to an agent",
    lead: "Paste the prompt into any AI assistant and it has everything it needs: the exact numbers, the page they came from and the source they were checked against. The full spec is the longer reference version.",
    copyPrompt: "Copy prompt for your agent",
    copySpec: "Copy full spec",
    copied: "Copied",
    openSkills: "Agent skills",
    disclaimer:
      "Reference information, not immigration advice. An application is filled in and signed by the applicant.",
  },

  check: {
    tab: "Check a photo",
    seoTitle: (doc: string) => `${doc} checker — free, runs in your browser`,
    hubTitle: "Passport and visa photo checker — free, no upload",
    h1: (doc: string) => `${doc} checker`,
    seoDescription: (doc: string) => `Drop in your photo and see which requirements it meets — size, weight, format, background, head height and eye line. Nothing is uploaded; the checks run in your browser.`,
    makeTab: "Make a photo",
    title: "Check an existing photo",
    lead: "Already have a file? Drop it here and see which requirements it meets. Nothing is uploaded — the checks run in your browser.",
    drop: "Drop the photo you want checked",
    choose: "Choose a file",
    allPass: "Everything measurable matches",
    someFail: "{n} of the checks did not pass",
    someWarn: "Everything matches, with one thing to look at",
    measured: "Measured",
    expected: "Required",
    notChecked: "What this cannot tell you",
    notCheckedBody:
      "Expression, whether the eyes are open, glasses, headwear, shadows behind the head, and " +
      "how recent the photo is. A pass here means the file is the " +
      "right shape and weight on a plain enough background — not that an application will be " +
      "accepted.",
    fixIt: "Fix it here",
    checkFace: "Also check the face",
    checkingFace: "Measuring the face…",
    faceHint: "Head height, eye line and tilt. Downloads a 15 MB model once.",
    noFace: "No face found in this photo",
    bgReplaced: "replaced by software",
    bgPhotographed: "photographed",
    legendGot: "where your face is",
    legendWant: "where this document wants it",
    labels: {
      dimensions: "Pixel size",
      ratio: "Aspect ratio",
      filesize: "File size",
      format: "Format",
      "bg-brightness": "Background brightness",
      "bg-even": "Background evenness",
      "bg-synthetic": "Background",
      "head-height": "Head height",
      "eye-line": "Eye line from bottom",
      tilt: "Head tilt",
    },
  },

  customPage: {
    title: "Any photo size — set millimetres yourself, free tool",
    h1: "Any size, set by hand",
    lead: "For a size the pages above do not cover: type the millimetres from your form and crop to them. Everything runs in the browser, as everywhere else here.",
    width: "Width",
    height: "Height",
    unitMm: "mm",
    unitPx: "px",
    unitLabel: "Units",
    fileSize: "Max file size",
    dpi: "Resolution",
    presetHint: "Your size",
    common: "Sizes people ask for most:",
    whenToUse: "When you need this",
    whenToUseBody:
      "A consulate that asks for something unusual, an internal pass, a form that states its own " +
      "millimetres. If your document is in the catalogue, use its page instead — it carries the " +
      "official source, the head-height rule and the file-size limit, none of which a bare " +
      "measurement can tell you.",
  },

  skills: {
    title: "Agent skills — photo specs your assistant can use",
    h1: "Skills for AI agents",
    lead: ({ docs, countries }) =>
      `Give your assistant the photo specifications for ${docs} documents in ${countries} countries, so it ` +
      `can size a photo correctly and tell you what a country requires — with the official source attached.`,
    install: "How to install",
    installBody:
      "Save the file below into your assistant's skills directory. For Claude Code that is " +
      "~/.claude/skills/visa-photo/SKILL.md; other tools take the same Markdown. Nothing is " +
      "executed on install — the skill is text your agent reads.",
    whatItDoes: "What it does",
    limits: "What it deliberately does not do",
    limitsBody:
      "It does not fill in, submit or advise on applications. Filling an immigration form on " +
      "someone else's behalf is regulated in the UK (OISC), the United States and Canada, and " +
      "automating a government portal usually breaks its terms of use. The skill states " +
      "requirements and cites where they came from; the applicant decides and signs.",
    copyFile: "Copy the skill",
    endpoints: "Endpoints your agent can call directly",
    endpointsBody:
      "No key, no sign-up, no rate limit worth mentioning. These are static files.",
  },

  hub: {
    h1: "Visa and document photos, to each country's spec",
    lead: "Pick a document. The dimensions fill themselves in, cropping and background take one step, and nothing leaves your browser.",
    stats: ({ docs, langs }) => `${docs} documents · ${langs} languages · free, no watermark`,
    faq: [
      {
        q: "Is it really free?",
        a: "Yes, and there is no watermark and no sign-up. Competitors show a free preview and " +
          "charge to download the clean file; here the download is the free part.",
      },
      {
        q: "Is my photo uploaded anywhere?",
        a: "No. Cropping and background removal run inside your browser using WebAssembly. The " +
          "only thing downloaded is the background model, and the photo never leaves the device. " +
          "The source code is public so this can be checked rather than taken on trust.",
      },
      {
        q: "Does the photo still carry my location and phone model?",
        a: "No. A phone photo holds EXIF metadata — GPS coordinates of where it was taken, the " +
          "camera model, the date, sometimes an owner name — and consulates receive all of it " +
          "when you send the original. The file this tool produces is encoded from scratch, so " +
          "none of that survives: only the pixel data, a colour profile and the print resolution.",
      },
      {
        q: "Can I print these at home?",
        a: "Yes. Every document page exports an A4 sheet as PNG and PDF with the right number of " +
          "copies at the correct size. Print at 100 % scale — “fit to page” silently resizes them. A good home printer on photo paper is fine for most documents; where an authority insists on a studio or a print shop, that document's page says so.",
      },
      {
        q: "Will my application be accepted?",
        a: "We cannot promise that, and nobody honest can. What the tool guarantees is a file " +
          "matching the published specification for the document you picked. Requirements change, " +
          "so check the official source linked on each page before you apply.",
      },
    ],
  },

  country: {
    turkey: "Turkey",
    eu_schengen: "Schengen area",
  },

  docTitle: {
    jp_passport_online: "Japan passport photo for online application (Mynaportal)",
    es_tie: "Spain TIE photo (residence card)",
    ie_passport: "Irish passport photo",
    nz_passport: "New Zealand passport photo",
    in_visa: "India e-Visa photo",
    us_dv: "US DV Lottery photo (Green Card lottery)",
    turkey: "Turkish residence permit (ikamet) photo",
    eu_schengen: "Schengen visa photo",
    us_visa: "US visa photo (DS-160)",
    us_passport: "US passport photo",
    uk_passport: "UK passport photo",
    ca_passport: "Canadian passport and PR photo",
    ca_visa: "Canada visa and permit photo",
    cn_passport: "Chinese passport photo",
    in_passport: "Indian passport photo",
    jp_passport: "Japanese passport photo",
    kr_passport: "South Korean passport photo",
    au_passport: "Australian passport photo",
    ru_passport: "Russian passport photo",
  },

  docNotes: {

    cn_visa: "White or close to white, no border. Uploaded at 354 × 472 to 420 × 560 px, JPEG 40–120 KB. The printed copy attached to the form is 33 × 48 mm with a 28–33 mm head — a different shape, not a resize of this file.",

    ae_visa: "White background, face 70–80 % of the frame. The UAE publishes a width of 35–40 mm and no height; 40 × 60 mm follows its own services guide, which writes the size as “4/6” without a unit. No pixel size, file format or weight is published anywhere official, and applicants report being asked for other sizes again — 43 × 55 mm among them. Check the size on the service you are applying through.",
    es_tie: "White background, 26×32 mm — smaller than the 35×45 everything else uses. Head 70–80 % of the height. Handed in on photographic paper; a file is not accepted.",
    ie_passport: "At least 715 × 951 px, JPEG, not a scan of a printed photo, taken in the last six months.",
    nz_passport: "3:4 portrait, at least 900 × 1200 px, file between 250 KB and 5 MB. Selfies are rejected.",
    in_visa: "White background, square 2×2 inches, head 50–69 % of the height. Rejected automatically if the dimensions are even slightly off.",
    us_dv: "White background, 2×2 inches. A non-compliant photo disqualifies the entry, and there is no second chance until next year.",
    turkey: "White background, no headwear, taken within the last six months. White suits dark hair; their own sheet prefers a mid grey behind light hair.",
    eu_schengen: "White background, face 32–36 mm from chin to crown.",
    us_visa: "White background, 2×2 inches, head between 50 % and 69 % of the height.",
    us_passport: "White background, 2×2 inches, head 1 to 1⅜ inches.",
    uk_passport: "Light grey or cream background. GOV.UK states a minimum of 600 × 750 px for the digital photo; a printed one is a different shape.",
    ca_passport: "White background, 50×70 mm, face 31–36 mm.",
    ca_visa: "White background, 35×45 mm, face 31–36 mm.",
    cn_passport: "White background, 33×48 mm, face 28–33 mm.",
    in_passport: "Pure white background, 35×45 mm. The portal takes exactly 630×810 px under 250 KB, with the face filling 80–85 % of the height.",
    jp_passport: "White background, face 34 mm ± 2 mm.",
    kr_passport: "White background, 35×45 mm.",
    au_passport: "White background, head 32–36 mm.",
    ru_passport: "White background, 35×45 mm.",
  },

  docShort: {
    jp_passport_online: "Passport · online",
    es_tie: "Residence card (TIE)",
    ie_passport: "Passport",
    nz_passport: "Passport",
    in_visa: "e-Visa",
    us_dv: "DV Lottery",
    turkey: "Residence permit",
    eu_schengen: "Schengen visa",
    us_visa: "Visa (DS-160)",
    us_passport: "Passport",
    uk_passport: "Passport",
    ca_passport: "Passport / PR",
    ca_visa: "Visa / Work / Study",
    cn_passport: "Passport",
    in_passport: "Passport",
    jp_passport: "Passport",
    kr_passport: "Passport",
    au_passport: "Passport",
    ru_passport: "Passport",
  },

  bgPage: {
    title: "Remove the background from a photo — free, and nothing is uploaded",
    cut: "Cut the background out",
    h1: "Remove or replace a background",
    lead: "Drop in a photo, cut the background out, and put any colour behind it — or leave it transparent. The network runs inside this tab, so the picture never leaves your device. No account, no watermark, no limit.",
    colour: "Put behind it:",
    keepTransparent: "Keep it transparent",
    pickColour: "Any colour",
    download: "Download",
    whenToUse: "What this is for",
    whenToUseBody: "A document photo is one use, and the country pages here do that with the crop and the head-height rule included. This page is for everything else: a profile picture, a listing, a print, a portrait whose backdrop is wrong. Nothing is measured or judged against a specification — the photo comes out the size it went in.",
  },

  privacyPage: {
    title: "Privacy — what this site does and does not collect",
    h1: "Privacy",
    lead: "Short, because there is little to describe. Your photograph is never uploaded, and nothing here identifies you. What follows is the whole of it, written so it can be checked against the source code rather than believed.",
    photoH: "Your photograph",
    photoP: "It never leaves your device. The crop, the straightening and the print sheet are drawn on a canvas inside the browser tab, and the background is removed by a neural network that runs on your machine. There is no upload, so there is no copy of your face on any server of ours — not deleted later, never received. The checker works the same way: it measures the file in the tab and reports what it found.",
    modelsH: "The models",
    modelsP: "Removing a background and finding a face need a model, and that model is downloaded from a content delivery network the first time you ask for it. That request tells the network your IP address and which file you asked for, as any download does. The model is then kept in your browser's cache, so the second time it works with no network at all. Nothing about your photograph travels with it.",
    countingH: "Counting visits",
    countingP: "This site runs its own visit counter, on its own server. It sets no cookie, stores nothing in your browser and creates no identifier, so it cannot follow you between visits or between sites. Each event records the page path, the referring site if you came from one, the time, any campaign tags in the URL, and which controls were used — never what you uploaded. As with every web server, ours sees the IP address the request came from.",
    googleH: "Google's measurement",
    googleP: "There is a Google Tag Manager container, and it starts switched off. Consent Mode defaults are declared before it loads, so until you allow it, it stores nothing and reads nothing. Advertising storage is denied at the default and nothing on this site can grant it. If you allow analytics, Google receives the ordinary things it receives everywhere: page, referrer, approximate location, device.",
    storedH: "What is kept in your browser",
    storedP: "Three things, all local: your answer to the consent question, which background model you prefer, and the model files themselves. Clearing this site's data in your browser removes all three, and the site works exactly as before afterwards — it will simply ask again and download again.",
    hostingH: "Hosting",
    hostingP: "The pages are static files served by Cloudflare Pages, which keeps the request logs any host keeps, including IP addresses, to serve the site and defend it from abuse. We do not read them for any other purpose.",
    rightsH: "Accounts, payment, rights",
    rightsP: "There is no account, nothing to sign up for, no e-mail address collected, and nothing to pay. Since we hold no record tied to a person, there is no profile to request, correct or delete. If you allowed Google's analytics and want that undone, use the button below — it takes effect immediately and the tag stops storing anything. For anything else, write to us.",
    changeAnswer: "Change my answer about analytics",
    answerCleared: "Cleared. The bar will ask again on the next page.",
    contactH: "Contact",
    contactP: "Write to info@superduperai.co. The source code is public, so any claim on this page can be checked rather than trusted.",
  },

  kbPage: {
    title: "Compress a photo to 50, 100 or 200 KB — free, nothing uploaded",
    alsoCropQ: "Need to crop it as well?",
    alsoCropA: "Set a size and a weight together",
    h1: "Reduce a photo to a set number of KB",
    lead: "A form that refuses your file over a weight limit is the most common reason a photo is rejected. Pick the number it asks for and the photo is squeezed under it, here in the browser. Nothing is uploaded and the picture keeps its dimensions unless you say otherwise.",
    target: "Squeeze it under:",
    run: "Compress",
    working: "Compressing…",
    was: "Was",
    now: "now",
    missed: "It would not go that small without wrecking it. Try a larger number, or cap the longest side as well — that is what actually removes weight.",
    keepSize: "Longest side, if the form limits it too:",
    download: "Download",
    whenToUse: "When this is what you need",
    whenToUseBody: "Portals state a weight in kilobytes far more often than they state one in millimetres, and they refuse the upload without saying which limit was broken. If your document is in the catalogue, use its page instead: the export there compresses to that authority's own limit and crops to its size at the same time.",
  },

  pdfPage: {
    title: "Compress a PDF to 1, 2 or 5 MB — free, and it never leaves your device",
    h1: "Compress a PDF to a set number of MB",
    lead: "Pick the limit your form states and the document is squeezed under it, here in the browser. Nothing is uploaded — which for a passport scan, a bank statement or a contract matters rather more than for a photo.",
    target: "Fit it under:",
    run: "Compress",
    working: "Working…",
    was: "Was",
    now: "now",
    pages: "pages",
    missed: "It would not go that small and stay readable. Try a larger limit, or split the document and send it in parts.",
    rasterWarning: "It tries the gentle way first: only the pictures inside are re-encoded, and the metadata junk editors leave behind is dropped. Text, fonts, links and any OCR layer stay exactly as they were. Only if that cannot reach your limit does it fall back to redrawing each page as an image — which always gets smaller, and always costs the text.",
    keptText: "Done without touching the text — it is still selectable and searchable.",
    becameImages: "The pictures alone were not enough, so the pages were redrawn. Still legible, but the text is now part of the image.",
    download: "Download",
    fileLabel: "File",
    whenToUse: "When this is what you need",
    whenToUseBody: "Visa portals, universities and banks state a limit in megabytes and refuse the upload without saying which file broke it. The usual culprit is a scan photographed at full camera resolution. Everything here runs in your browser, so the document never reaches us — the reason to care is that the files people compress are passports, bank statements and contracts, and every other tool for this asks you to upload exactly those.",
  },

  autoFaq: {
    size: ({ doc }) => `What size is a ${doc}, in cm and inches?`,
    sizeA: ({ mm, cm, inch }) =>
      `${mm} mm, which is ${cm} cm or ${inch} inches. Those are the same photo stated three ways; ` +
      `use whichever unit the form in front of you asks for.`,
    pixels: ({ doc }) => `What size is a ${doc} in pixels?`,
    pixelsA: ({ px, dpi }) =>
      `${px} pixels, which is ${dpi} dpi at the print size. Anything smaller will look soft when printed.`,
    perSheet: ({ doc }) => `How many copies of a ${doc} fit on one sheet?`,
    perSheetA: ({ n, size }) =>
      `${n} photos of ${size} on an A4 sheet. Print at 100 % scale, never "fit to page".`,
    background: ({ doc }) => `What background colour does a ${doc} need?`,
    backgroundA: ({ bg }) =>
      `${bg}, plain and evenly lit, with no shadow behind the head. The tool can replace the ` +
      `background for you if the wall behind you is not right.`,
    fileSize: ({ doc }) => `What file format and size does a ${doc} need?`,
    fileSizeA: ({ format, kb }) =>
      `${format}, no larger than ${kb} KB. The export here compresses to stay under that limit ` +
      `without dropping below the required resolution.`,
    howFiled: ({ doc }: { doc: string }) => `${doc}: uploaded, or handed over printed?`,
    howFiledA: ({ route, form }: { route: string; form: string }) => `${route}${form}`,
    editing: ({ doc }: { doc: string }) => `${doc}: does this authority accept an edited photo?`,
    checked: ({ doc }: { doc: string }) => `${doc}: has one from this page been checked officially?`,
    uploadFails: ({ form }) => `${form}: the photo will not upload, or comes back rejected — why?`,
    uploadFailsA: ({ form, format, kb, px }) =>
      `${form} refuses anything that is not ${format}, anything above ${kb} KB, and anything ` +
      `smaller than ${px} pixels. Exporting here keeps all three inside the limits. If the file ` +
      `is within spec and the site still errors, that is their service, not your photo.`,
    covering: ({ doc }) => `Can a ${doc} be taken in a hijab, turban or other head covering?`,
    coveringA: () =>
      `Yes. A covering worn every day for religious reasons is accepted; an ordinary hat is not. ` +
      `The face has to be visible from the bottom of the chin to the forehead, both edges of the ` +
      `face have to show, and nothing may cast a shadow across it. Keep the fabric plain and ` +
      `unpatterned, and pick a colour that stands apart from the background — a white ` +
      `covering on a white background merges into it, which is the rejection Canada and Türkiye ` +
      `both warn about by name. The palette here can set a background that contrasts.`,
    coveringStatement:
      `The United States also asks for a signed note saying the covering is religious attire worn ` +
      `daily in public. It is a sentence on paper, filed with the application, not part of the photo.`,
  },

  faq: {
    ru_passport: [
      {
        q: "Is a photo needed for a Russian passport, or is it taken there?",
        a: "It depends which of the three routes you are on. For the biometric ten-year passport " +
          "you are photographed on the spot, at the ministry or in a booth at an MFC, and paper " +
          "photos are not accepted for it at all. The old-style five-year passport still takes " +
          "printed 35 × 45 mm photos. And the application filed through Gosuslugi asks for an " +
          "uploaded photo, which goes with the form rather than into the document. This page " +
          "serves the second and third of those.",
      },
    ],
    cn_passport: [
      {
        q: "Do I need to bring a photo for a Chinese passport?",
        a: "Not necessarily. The exit-entry administration hall photographs applicants during " +
          "the visit, free of charge. A photo of your own is also accepted, but only with a " +
          "\u7167\u7247\u56de\u6267 — a receipt code issued by an approved studio — which no file made here " +
          "can carry. The size on this page is right for that studio photo and for applications " +
          "at a Chinese mission abroad, and the checker works on any file you already have.",
      },
    ],
    in_passport: [
      {
        q: "Do I need to bring or upload a photo for an Indian passport?",
        a: "At a Passport Seva Kendra, no. The centre photographs you during the appointment, free " +
          "of charge, and Passport Seva states that a photograph is not required for the visit. " +
          "A photo is still needed in two cases: a child under four, who needs one printed " +
          "35 × 45 mm photo on a white background, and an application made at an Indian mission " +
          "abroad, which has its own rules. The size on this page is for those, and the checker " +
          "works for any photo you already have.",
      },
    ],
    fr_schengen: [
      {
        q: "Is the French visa photo different from other Schengen countries?",
        a:
          "No. France uses the same 35 × 45 mm photo as the other 28 Schengen countries, because the rule comes from one EU decision rather than from each country. What is specific to France is the process around it: the form is filled in on France-Visas, and the appointment and the printed photo go to the centre that serves your country — usually TLScontact or VFS Global, some of which photograph you on the spot.",
      },
    ],
    de_schengen: [
      {
        q: "Is the German visa photo different from other Schengen countries?",
        a:
          "No. Germany uses the same 35 × 45 mm photo as the rest of the Schengen area. What is German is the form: it is completed in VIDEX, printed and signed, and taken to the mission or the visa centre with the photo. Germany also publishes its own biometric photo template for national documents, which is stricter than the Schengen rule and is not what a visa application is judged against.",
      },
    ],
    it_schengen: [
      {
        q: "Is the Italian visa photo different from other Schengen countries?",
        a:
          "No. Italy uses the same 35 × 45 mm photo as the rest of the Schengen area. What is Italian is the appointment: most consulates book through Prenot@Mi, and the printed photo is handed over at the appointment rather than uploaded with the form.",
      },
    ],
    es_schengen: [
      {
        q: "Is the Spanish visa photo different from other Schengen countries?",
        a:
          "No. Spain uses the same 35 × 45 mm photo as the rest of the Schengen area. Note that this is not the same as the Spanish residence card, which is 26 × 32 mm on photographic paper — a different document with a genuinely different photo.",
      },
    ],
    gr_schengen: [
      {
        q: "Is the Greek visa photo different from other Schengen countries?",
        a:
          "No. Greece uses the same 35 × 45 mm photo as the rest of the Schengen area. What differs is where the application is filed: Greek consulates work through visa centres in most countries, and the printed photo is handed over there.",
      },
    ],
    eu_schengen: [
      {
        q: "Is the photo the same for Germany, Italy, France and the other Schengen countries?",
        a: "Yes. All 29 Schengen countries — Austria, Belgium, Bulgaria, Croatia, Czechia, " +
          "Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Iceland, Italy, Latvia, " +
          "Liechtenstein, Lithuania, Luxembourg, Malta, the Netherlands, Norway, Poland, " +
          "Portugal, Romania, Slovakia, Slovenia, Spain, Sweden and Switzerland — take the same " +
          "35 × 45 mm photo, because the rule comes from a single EU decision rather than from " +
          "each country. What differs is who collects it: most consulates work through a visa " +
          "centre such as VFS Global, TLScontact or BLS, and some of those photograph you on the " +
          "spot.",
      },
      {
        q: "How many copies do I need?",
        a: "Usually two, and consulates differ. Bring the printed pair to the appointment even " +
          "if the application was filled in online — the sheet this page exports has both at the " +
          "right size.",
      },
    ],
    us_visa: [
      {
        q: "Does a green card application need a photo made here?",
        a: "Not any more, if it goes through USCIS. Since 12 December 2025 USCIS no longer accepts " +
          "a photo you submit yourself — it takes one at the biometrics appointment, and Form I-485 " +
          "(adjust status), I-90 (replace the card), N-400 (naturalisation) and N-600 all require a " +
          "fresh one regardless of when you were last photographed. A photo made here is for the " +
          "DS-160 and for an immigrant visa applied for at a consulate abroad, which are State " +
          "Department, not USCIS.",
      },
      {
        q: "What size is a US visa photo?",
        a: "2 × 2 inches, which is 51 × 51 mm or 5.08 × 5.08 cm. Digitally that is 600 × 600 pixels " +
          "at minimum, square, with your head taking up 50 % to 69 % of the height.",
      },
      {
        q: "How many photos do I need?",
        a: "One digital photo for the DS-160 form. Consulates often also ask for a printed 2 × 2 " +
          "photo at the interview, so check your appointment letter and bring one to be safe.",
      },
      {
        q: "Why does DS-160 say the photo upload failed?",
        a: "The form rejects anything over 240 KB, anything that is not JPEG, and anything smaller " +
          "than 600 × 600 pixels or not perfectly square. Exporting here keeps all four inside the " +
          "limits. If the file is within spec and the site still errors, that is their service, " +
          "not your photo — try again later.",
      },
      {
        q: "Can I wear glasses?",
        a: "No. Glasses have not been allowed in US visa and passport photos since November 2016, " +
          "except with a signed medical statement.",
      },
      {
        q: "What should I wear?",
        a: "Everyday clothes. No uniforms, nothing that looks like a uniform, and no white top — " +
          "it blends into the white background. Head coverings only for religious reasons, with " +
          "your full face visible.",
      },
      {
        q: "What if my photo is rejected?",
        a: "The usual causes are head size outside 50–69 %, shadow on the face or behind the head, " +
          "a background that is not plain white, glasses, or a photo older than six months. " +
          "Retake it against a plain wall and re-crop; the specification itself does not change.",
      },
      {
        q: "How old can the photo be?",
        a: "Taken within the last six months, and it must show your current appearance.",
      },
    ],
    us_passport: [
      {
        q: "What size is a US passport photo?",
        a: "2 × 2 inches (51 × 51 mm), 600 × 600 pixels or more, with the head between 1 inch and " +
          "1⅜ inches from chin to crown.",
      },
      {
        q: "Can I wear glasses?",
        a: "No, not since November 2016, unless you provide a signed medical statement.",
      },
    ],
  },

  pageTitle: {
    es_tie: "Spain TIE Photo Size — 26x32 mm, requirements & free tool",
    ie_passport: "Irish Passport Photo Size — 715x951 px minimum, free tool",
    nz_passport: "New Zealand Passport Photo — 3:4, 900x1200 px minimum, free tool",
    in_visa: "India Visa Photo Size — 2x2 inch (51x51 mm), free tool",
    us_dv: "US DV Lottery Photo Tool — 2x2 inch, 600x600 px, free checker",
    turkey: "Turkey Residence Permit Photo (ikamet) — 50x60 mm, free tool",
    eu_schengen: "Schengen Visa Photo Size — 35x45 mm, requirements & free tool",
    us_visa: "US Visa Photo Tool — 2x2 inch, 600x600 px, DS-160 ready, free",
    us_passport: "US Passport Photo Tool — 2x2 inch, 600x600 px, free, no watermark",
    uk_passport: "UK Passport Photo Size & Requirements — 35x45 mm, free tool",
    ca_passport: "Canada Passport Photo Size — 50x70 mm, requirements & free tool",
    ca_visa: "Canada Visa Photo Size — 35x45 mm, requirements & free tool",
    cn_passport: "China Visa & Passport Photo Size — 33x48 mm, free tool",
    in_passport: "Indian Passport Photo Size — 35x45 mm, in cm & pixels, free tool",
    jp_passport: "Japan Passport Photo Size — 35x45 mm, in cm & inches, free tool",
    kr_passport: "Korean Passport Photo Size — 35x45 mm, requirements & free tool",
    au_passport: "Australian Passport Photo Requirements — 35x45 mm, free tool",
    ru_passport: "Russian Passport Photo Size — 35x45 mm, free tool",
  },
};

export default en;
