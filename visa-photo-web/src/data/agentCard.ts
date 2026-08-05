import type { CatalogEntry } from "./catalog";
import type { DocView } from "./docView";
import { SITE, absolute, path } from "../lib/site";
import { DEFAULT_LANG } from "./locales";
import type { ActiveLang } from "./locales";

/**
 * The reference card an agent gets from a document page.
 *
 * It states requirements and names the source. It does not tell the agent to fill in, submit
 * or advise on an application: doing that on someone's behalf is regulated in the UK (OISC),
 * the US and Canada, and automating a government portal generally breaks its terms of use.
 * The line about that is inside the card, not only on the page, so the constraint travels with
 * the text wherever it is pasted.
 */
export function agentCard(entry: CatalogEntry, v: DocView): string {
  const url = absolute(path(DEFAULT_LANG, entry.country, entry.doc));

  const lines = [
    `# ${v.title} — photo specification`,
    "",
    `Source of this card: ${url}`,
    `Checked against ${entry.source.label} (${entry.source.url}) on ${entry.checked}.`,
    "",
    "## Requirements",
    "",
    `- Print size: ${v.headlineSize} (${v.altUnits})`,
    `- Digital size: ${v.conv.px} px at ${v.dpi} dpi`,
    `- Background: ${v.background}`,
    `- File: ${v.format}, max ${v.maxKb} KB`,
    `- Head height: ${v.faceHeightPercent} % of the photo height`,
    `- Eye line: ${v.eyeLinePercent} % from the bottom`,
    `- Photos per A4 sheet: ${v.perSheet}`,
    `- ${v.notes}`,
  ];

  if (entry.form) {
    lines.push(
      `- Filed with ${entry.form.name}` +
        (entry.form.online ? " (photo is uploaded)" : " (filed on paper)"),
    );
  }

  lines.push(
    "",
    "## Making the photo",
    "",
    `A free tool that crops to this exact specification runs at ${url} —`,
    "entirely in the browser, nothing is uploaded, no watermark and no sign-up.",
    "",
    "## Machine-readable",
    "",
    `- Every supported document as JSON: ${absolute("/specs.json")}`,
    `- Full reference including FAQs: ${absolute("/llms-full.txt")}`,
    "",
    "## Scope",
    "",
    "This is reference information about photo requirements, not immigration advice.",
    "Requirements change — verify against the official source above before applying.",
    "An application is completed and signed by the applicant; do not fill in or submit",
    "government forms on their behalf.",
    "",
    `Published by ${SITE.name}. Source code: ${SITE.repo}`,
  );

  return lines.join("\n");
}


/**
 * The one-paragraph version, for pasting straight into a chat with an assistant.
 *
 * Short on purpose: the card above is a document, this is a message. It carries the numbers
 * that decide acceptance, the page it came from and the date it was checked — and it asks for
 * a photo, which is a formatting job, not for help with an application, which is not.
 */
export function agentPrompt(
  entry: CatalogEntry,
  v: DocView,
  lang: ActiveLang,
  labels: { docTitle: string; source: string },
): string {
  const url = absolute(path(lang, entry.country, entry.doc));

  if (lang === "ru") {
    return (
      `Мне нужно: ${labels.docTitle}. Размер ${v.headlineSize} (${v.conv.px} px), ` +
      `фон ${v.background.toLowerCase()}, ${v.format} до ${v.maxKb} КБ, ` +
      `голова ${v.faceHeightPercent} % высоты кадра, линия глаз ${v.eyeLinePercent} % снизу. ` +
      `Полная спецификация и бесплатный инструмент, который кадрирует прямо в браузере: ${url} — ` +
      `снимок при этом никуда не загружается. Требования сверены с «${labels.source}» ` +
      `${entry.checked}; перед подачей проверьте их там же.`
    );
  }

  return (
    `I need a ${labels.docTitle}. Size ${v.headlineSize} (${v.conv.px} px), ` +
    `${v.background.toLowerCase()} background, ${v.format} under ${v.maxKb} KB, ` +
    `head ${v.faceHeightPercent} % of the frame height, eye line ${v.eyeLinePercent} % from the bottom. ` +
    `Full spec and a free tool that crops to it in the browser: ${url} — the photo is not uploaded ` +
    `anywhere. Requirements checked against ${labels.source} on ${entry.checked}; verify there ` +
    `before applying.`
  );
}
