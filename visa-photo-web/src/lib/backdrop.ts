import type { Preset } from "./presets";

/**
 * Colours offered behind a cut-out subject.
 *
 * Not a decorative palette. Authorities disagree about the backdrop, and some disagree with
 * themselves depending on the applicant: Turkey's own ICAO sheet asks for white behind dark
 * hair and a mid grey behind light hair, because white on white loses the outline. The UK asks
 * for cream or light grey outright, and Canada's visa rule reads "plain white or light-coloured".
 *
 * So every entry here is a shade some authority names. Nothing saturated, nothing tinted warm
 * enough to read as a colour cast — those get photos refused, which is the opposite of the job.
 */
export interface Backdrop {
  id: string;
  /** css colour, also what the canvas is filled with */
  css: string;
}

export const BACKDROPS: Backdrop[] = [
  { id: "white", css: "#FFFFFF" },
  { id: "off-white", css: "#F5F3EF" },
  { id: "light-grey", css: "#E9EAEC" },
  { id: "mid-grey", css: "#CFD2D6" },
  { id: "pale-blue", css: "#E7EDF4" },
];

/**
 * The one the document asks for, which is where the picker starts. White for almost everything;
 * the UK is the exception that made the field necessary in the first place.
 */
export function backdropFor(preset: Preset): Backdrop {
  const wanted = preset.background === "light-grey" ? "light-grey" : "white";
  return BACKDROPS.find((b) => b.id === wanted) ?? BACKDROPS[0];
}
