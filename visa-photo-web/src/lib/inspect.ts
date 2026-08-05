import type { Preset } from "./presets";

/**
 * What can honestly be measured from a file, and nothing beyond it.
 *
 * Dimensions, weight and format are exact. The background is a real measurement too — sampled
 * from the edges, where the wall is and the person is not — and an uneven or dark background is
 * one of the commonest rejection reasons. Head placement, expression, glasses and shadows are
 * NOT measured here, and the report says so rather than letting silence imply a pass.
 */

export type Verdict = "pass" | "fail" | "warn";

export interface Finding {
  id: string;
  verdict: Verdict;
  /** measured value, already formatted */
  value: string;
  /** what the spec asks for, already formatted */
  expected: string;
}

export interface Report {
  findings: Finding[];
  failed: number;
  warned: number;
}

interface BackgroundStats {
  /** 0–255 average luminance of the sampled border */
  brightness: number;
  /** standard deviation of luminance across the border: high means patterned or shadowed */
  spread: number;
}

/**
 * Samples the two upper corners only.
 *
 * A wider border sounds better and is not: on a correctly framed photo the head nearly touches
 * the top edge and the shoulders reach the sides, so a border strip measures hair and clothing
 * and reports a "patterned background" on a photo whose background is plain white. The corners
 * are the only region that is background at every legal crop.
 */
function sampleBackground(img: HTMLImageElement): BackgroundStats {
  const w = 160;
  const h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * w));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  const lum: number[] = [];
  const push = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    lum.push(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
  };

  const cornerW = Math.max(3, Math.round(w * 0.18));
  const cornerH = Math.max(3, Math.round(h * 0.14));
  for (let y = 0; y < cornerH; y++) {
    for (let x = 0; x < cornerW; x++) push(x, y);
    for (let x = w - cornerW; x < w; x++) push(x, y);
  }

  const mean = lum.reduce((a, b) => a + b, 0) / lum.length;
  const variance = lum.reduce((a, b) => a + (b - mean) ** 2, 0) / lum.length;
  return { brightness: mean, spread: Math.sqrt(variance) };
}

export interface InspectInput {
  img: HTMLImageElement;
  fileSizeKb: number;
  mimeType: string;
  preset: Preset;
}

export function inspectPhoto({ img, fileSizeKb, mimeType, preset }: InspectInput): Report {
  const findings: Finding[] = [];
  const add = (id: string, verdict: Verdict, value: string, expected: string) =>
    findings.push({ id, verdict, value, expected });

  const w = img.naturalWidth;
  const h = img.naturalHeight;

  // Exact match required: forms reject a photo that is a pixel off.
  add(
    "dimensions",
    w === preset.digital_width && h === preset.digital_height ? "pass" : "fail",
    `${w} × ${h} px`,
    `${preset.digital_width} × ${preset.digital_height} px`,
  );

  // Aspect ratio is reported separately: a photo of the wrong size but right shape can be
  // rescaled, one of the wrong shape has to be re-cropped.
  const ratio = w / h;
  const wanted = preset.digital_width / preset.digital_height;
  add(
    "ratio",
    Math.abs(ratio - wanted) < 0.01 ? "pass" : "fail",
    ratio.toFixed(3),
    wanted.toFixed(3),
  );

  add(
    "filesize",
    fileSizeKb <= preset.max_file_size_kb ? "pass" : "fail",
    `${Math.round(fileSizeKb)} KB`,
    `≤ ${preset.max_file_size_kb} KB`,
  );

  const format = mimeType.replace("image/", "").replace("jpg", "jpeg");
  add("format", format === preset.format ? "pass" : "fail", format, preset.format);

  const bg = sampleBackground(img);
  const wantsWhite = preset.background === "white";
  // 200/255 is a light wall; below that a "white" background reads grey in print.
  const brightEnough = wantsWhite ? bg.brightness >= 200 : bg.brightness >= 150;
  add(
    "bg-brightness",
    brightEnough ? "pass" : "fail",
    `${Math.round((bg.brightness / 255) * 100)} %`,
    wantsWhite ? "≥ 78 %" : "≥ 59 %",
  );

  // Spread above ~12 means a pattern, a gradient or a shadow rather than a plain wall.
  add(
    "bg-even",
    bg.spread <= 12 ? "pass" : bg.spread <= 20 ? "warn" : "fail",
    bg.spread.toFixed(1),
    "≤ 12",
  );

  return {
    findings,
    failed: findings.filter((f) => f.verdict === "fail").length,
    warned: findings.filter((f) => f.verdict === "warn").length,
  };
}
