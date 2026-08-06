/**
 * Keeps a dimension readable on a right-to-left page.
 *
 * "35 × 45 mm" set in Arabic renders as "45 × 35 mm". The digits are separate runs, the bidi
 * algorithm hands the separator the paragraph's direction, and the two numbers swap places.
 * That was measured on the live page, not guessed: width and height were shown the wrong way
 * round, which is worse than a typo because the result still looks like a valid size.
 *
 * U+2066 and U+2069 isolate the run as left-to-right. They are invisible characters, and on a
 * left-to-right page they change nothing.
 */
export const ltr = (dimension: string): string => `⁦${dimension}⁩`;

/**
 * Removes the isolates again for anything a machine reads.
 *
 * llms.txt, specs.json, the markdown twins and the agent prompt are parsed and compared, not
 * laid out, so an invisible character inside "35 × 45" is only a way to make an exact match
 * fail. The isolation is a rendering concern and stops at the edge of the HTML.
 */
export const plain = (text: string): string => text.replace(/[⁦⁩]/g, "");
