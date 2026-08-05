import type { Preset } from "./presets";
import type { FacePlacement } from "./face";

export interface CropPlacement {
  cx: number;
  cy: number;
  scale: number;
}

/**
 * Where the crop must sit so the face lands where the specification says.
 *
 * Works backwards from the rules rather than centring and hoping: the preset states the head
 * as a share of the photo height and the eye line as a share from the bottom, so the crop
 * height follows from the measured chin-to-crown distance, and the vertical position follows
 * from the eye line. Everything is in fractions of the source image.
 */
export function placeCrop(
  face: FacePlacement,
  preset: Preset,
  imgW: number,
  imgH: number,
): CropPlacement | null {
  const headFraction = face.chinY - face.skullTopY;
  if (headFraction <= 0) return null;

  // The head must occupy face_height_percent of the crop, so the crop is that much taller.
  const cropH = (headFraction / (preset.face_height_percent / 100)) * imgH;
  const cropW = cropH * (preset.digital_width / preset.digital_height);

  // The eye line sits at a stated distance from the bottom of the crop.
  const eyeFromTop = 1 - preset.eye_line_from_bottom_percent / 100;
  let cropTop = face.eyeY * imgH - eyeFromTop * cropH;

  // A crown touching the top edge is refused everywhere, while an eye line a point or two off
  // usually is not, so when the estimate leaves the head short of room the crop gives way.
  const crownY = face.skullTopY * imgH;
  const headroom = 0.02 * cropH;
  if (cropTop > crownY - headroom) cropTop = crownY - headroom;

  const cx = face.faceCenterX;
  const cy = (cropTop + cropH / 2) / imgH;

  // The editor expresses zoom as a share of the largest crop that fits.
  const maxH = Math.min(imgH, (imgW * preset.digital_height) / preset.digital_width);
  const scale = Math.max(0.3, Math.min(1, cropH / maxH));

  return {
    cx: Math.max(0, Math.min(1, cx)),
    cy: Math.max(0, Math.min(1, cy)),
    scale,
  };
}

/**
 * How the face sits inside a finished photo, as the percentages a specification is written in.
 * Used by the checker, where the crop is already fixed and only the verdict is missing.
 */
export function measureAgainst(face: FacePlacement, preset: Preset) {
  const headPct = (face.chinY - face.skullTopY) * 100;
  const eyePct = (1 - face.eyeY) * 100;
  return {
    headPct,
    eyePct,
    headTarget: preset.face_height_percent,
    eyeTarget: preset.eye_line_from_bottom_percent,
    tiltDeg: face.tiltDeg,
  };
}
