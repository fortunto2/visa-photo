import type { Preset } from "./presets";

const MAX_W = 500;
const MAX_H = 620;

export function containerForImage(imgW: number, imgH: number): [number, number] {
  const ratio = imgW / imgH;
  if (ratio > MAX_W / MAX_H) {
    return [MAX_W, MAX_W / ratio];
  }
  return [MAX_H * ratio, MAX_H];
}

export function cropRectPx(
  cx: number, cy: number,
  preset: Preset,
  contW: number, contH: number,
  scale: number,
): [number, number, number, number] {
  const cropRatio = preset.digital_width / preset.digital_height;
  const imgRatio = contW / contH;

  const [maxCW, maxCH] = cropRatio > imgRatio
    ? [contW, contW / cropRatio]
    : [contH * cropRatio, contH];

  const cw = maxCW * scale;
  const ch = maxCH * scale;
  const centerX = cx * contW;
  const centerY = cy * contH;
  const left = Math.max(0, Math.min(centerX - cw / 2, contW - cw));
  const top = Math.max(0, Math.min(centerY - ch / 2, contH - ch));
  return [left, top, cw, ch];
}

export interface CropGuides {
  left: number; top: number; width: number; height: number;
  headTopY: number;
  chinY: number;
  eyeY: number;
  faceHeight: number;
}

export function calcGuides(
  cx: number, cy: number,
  preset: Preset,
  contW: number, contH: number,
  scale: number,
): CropGuides {
  const [left, top, width, height] = cropRectPx(cx, cy, preset, contW, contH, scale);
  const headTopY = height * preset.face_top_margin_percent / 100;
  const faceHeight = height * preset.face_height_percent / 100;
  const chinY = headTopY + faceHeight;
  const eyeY = height * (1 - preset.eye_line_from_bottom_percent / 100);
  return { left, top, width, height, headTopY, chinY, eyeY, faceHeight };
}
