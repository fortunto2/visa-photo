import type { GuideText } from "./index";

/**
 * Every claim below was read out of the authority's own words while auditing the catalogue,
 * and the date it was read is on the page. Where something is a judgement rather than a
 * quotation it says so.
 */
const en: Record<string, GuideText> = {
  "india-photo-taken-at-psk": {
    title: "Indian passport photo: the centre takes it, you do not bring one",
    h1: "India photographs you at the centre",
    lead:
      "If you are applying at a Passport Seva Kendra, you do not need to upload a photo or carry a printed one. The centre photographs you during the appointment, free of charge.",
    body: [
      "Passport Seva says it in two places. Its getting-started guidance explains that applicants attend the centre so their photograph and biometrics can be collected there, and the section on what to bring to a PSK or POPSK visit states that a photograph is not required.",
      "This catches people out because every guide on the internet, including the ones selling photo services, describes an Indian passport photo as something you prepare. That was true of an older process and is still true in two cases.",
      "The first is a child under four, who cannot be photographed reliably at a counter: bring one printed colour photograph, 45 × 35 mm, on a white background. The second is an application made at an Indian mission abroad, which runs its own process and its own specification — a consulate in another country is not a PSK.",
      "There is a third case that is not an exception so much as a different document: an Indian visa, applied for by a foreign national, is filed online and does want an uploaded file.",
    ],
    takeaway:
      "Applying in India, at a centre: bring nothing. Under four, or applying abroad: bring a photograph, and the size is on the document page.",
  },

  "uscis-stopped-accepting-your-photo": {
    title: "USCIS no longer accepts a photo you submit yourself",
    h1: "USCIS stopped accepting your photograph",
    lead:
      "On 12 December 2025 USCIS stopped accepting photographs submitted by applicants. It takes one at the biometrics appointment instead. This does not apply to the State Department, and the difference decides whether you need a file at all.",
    body: [
      "The policy alert is specific. Only photographs collected by USCIS or another authorised entity are used, and a previously collected one is reusable only if it was taken within the last 36 months. Four forms require a fresh photograph regardless of when the applicant was last photographed: I-90 to replace a permanent resident card, I-485 to adjust status, N-400 for naturalisation, and N-600 for a certificate of citizenship.",
      "The reason it is easy to get wrong is that \"green card\" names two different routes through two different agencies. Adjustment of status inside the United States is USCIS, and there is now nothing for you to prepare. An immigrant visa applied for at a consulate abroad is the State Department, and it still wants a photograph from you.",
      "Everything the State Department runs is unchanged. The DS-160 for a non-immigrant visa still takes an uploaded 600 × 600 file. The DS-11 for a passport still takes a printed 2 × 2. The Diversity Visa entry still takes a photograph the entrant supplies, and a non-compliant one still disqualifies the entry.",
      "USCIS gave its reason plainly: pandemic-era flexibility had allowed photographs to be reused for up to ten years even when someone's appearance had changed considerably, and that was kept in place longer than it needed to be.",
    ],
    takeaway:
      "USCIS form: you are photographed there, prepare nothing. State Department form — DS-160, DS-11, DV entry: prepare a photograph as before.",
  },

  "japan-online-photo-is-a-different-shape": {
    title: "Japan's online passport photo is not the same shape as the paper one",
    h1: "Japan online: 600 × 730, not 35 × 45",
    lead:
      "Since 24 March 2025 every prefecture accepts a passport application through Mynaportal. The file it wants is 600 × 730 pixels — and the ministry warns, in as many words, that this is not the proportion of the 35 × 45 mm photograph used on paper.",
    body: [
      "The numbers are 0.822 against 0.778. That is a small enough difference to look like a rounding error and a large enough one to be refused: resizing a print-shaped photograph to 600 × 730 stretches the face, and cropping it to fit takes something off the sides.",
      "The rest of the specification is unchanged, which is what makes the trap work. The face is still 32 to 36 mm of the 45 mm frame, which is the same 71 to 80 per cent of the height, and the margin above the head is still 2 to 6 mm. Only the width grows. In other words the online frame is the paper frame with more air at the sides, not a scaled version of it.",
      "The file itself must be JPG, and between 20 KB and 2 MB. The lower bound is unusual and worth noting: a photograph compressed hard enough to be light is refused for being light.",
      "Because these are two genuinely different shapes, they are two documents here rather than one page with a footnote — the same way Canada's passport and visa routes are separate.",
    ],
    takeaway:
      "Applying through Mynaportal: 600 × 730 px, JPG, 20 KB to 2 MB. Applying on paper at a counter: 35 × 45 mm. Do not convert one into the other.",
  },

  "china-photo-receipt-code": {
    title: "A Chinese passport photo needs a receipt code, not just a photograph",
    h1: "China: the photo comes with a 照片回执",
    lead:
      "The exit-entry administration hall photographs applicants during the visit, free of charge. A photograph of your own is also accepted — but only together with a 照片回执, a receipt code issued by an approved studio, which no file made at home can carry.",
    body: [
      "The receipt is the point of the rule. It is not a certificate that the photograph is the right size; it is a record that an accredited studio took it, tied to a number the system can look up. That is why a file exported from any tool, this one included, cannot satisfy it however correct its dimensions are.",
      "So there are two honest routes. Be photographed at the hall, which costs nothing and is the simplest thing to do. Or go to an approved studio, which charges a small fee and gives you the code with the print.",
      "Local practice varies more than the national rule suggests. Some provinces ask for a blue background rather than white for particular exit-entry documents, and Guangdong is the one people run into most often. Check what the hall you are actually attending asks for before paying a studio.",
      "A Chinese visa, applied for by a foreign national, is a different matter entirely: it is filed through COVA, it takes an uploaded file, and no receipt code is involved.",
    ],
    takeaway:
      "Chinese passport: be photographed at the hall, or use a studio that issues the 照片回执. Chinese visa, as a foreigner: upload a file, and the size is on the document page.",
  },

  "russia-three-routes": {
    title: "A Russian passport photo: three routes, three different answers",
    h1: "Russia: three routes under one name",
    lead:
      "\"A photo for a Russian passport\" describes three different requirements, and the one that applies depends on which passport you are getting and how you are applying. Two of them do not take a photograph from you at all.",
    body: [
      "The biometric ten-year passport is photographed on the spot, at a police-service office or in a booth at an MFC, using their own equipment. Paper photographs are not accepted for it, and neither are files on a memory stick — the photograph that ends up in the document is the one taken during the appointment, and it is not retouched afterwards.",
      "The old-style five-year passport still works the old way: printed photographs, 35 × 45 mm, handed over with the application.",
      "The third case causes the most confusion. An application filed through Gosuslugi asks you to upload a photograph, and people reasonably assume it is the one that will be printed in the passport. It is not: it belongs to the application file. For a biometric passport you will still be photographed at the appointment.",
      "The practical consequence is worth stating: for the biometric route, the photograph in your document is taken on a day you can choose. It is worth arriving having slept, in clothes you would not mind seeing for ten years.",
    ],
    takeaway:
      "Biometric, ten years: photographed on the spot. Old-style, five years: bring prints. Gosuslugi: upload a file for the form, which is not the one in the passport.",
  },
};

export default en;
