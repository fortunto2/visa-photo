/**
 * Cleaning up a signature photographed on paper.
 *
 * No neural network here, and none is wanted: a signature is dark ink on light paper, which a
 * luminance threshold separates better and instantly. The model that removes a background from
 * a portrait is looking for a person, and on a sheet of paper it finds nothing.
 *
 * What the portals actually ask for is narrower than it looks — a specific pixel width, a
 * maximum in kilobytes, and often a *minimum* in kilobytes too, which is the part no tool
 * handles. That is why the encoder below climbs as well as descends.
 */

export interface SignatureOptions {
  /** 0-255; anything lighter than this becomes background */
  threshold: number;
  /** leave the paper transparent instead of white — some forms want a PNG that overlays */
  transparent: boolean;
  /** crop to the ink, which is almost always what someone wants and never what they photographed */
  trim: boolean;
  /** longest side of the result */
  width: number;
}

export interface SignatureResult {
  blob: Blob;
  kb: number;
  width: number;
  height: number;
  /** false when nothing dark enough was found — the threshold is probably too low */
  foundInk: boolean;
}

/** Rec. 709 luma: green carries most of the perceived brightness, and ink is judged by eye. */
const luma = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

export async function cleanSignature(
  file: File,
  opts: SignatureOptions,
  targetKb: { min: number | null; max: number | null },
): Promise<SignatureResult> {
  const bitmap = await createImageBitmap(file);
  const src = document.createElement("canvas");
  src.width = bitmap.width;
  src.height = bitmap.height;
  const sctx = src.getContext("2d", { willReadFrequently: true })!;
  sctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const data = sctx.getImageData(0, 0, src.width, src.height);
  const px = data.data;

  // Ink bounds, gathered in the same pass that decides what is ink.
  let minX = src.width, minY = src.height, maxX = -1, maxY = -1;
  for (let y = 0; y < src.height; y++) {
    for (let x = 0; x < src.width; x++) {
      const i = (y * src.width + x) * 4;
      const l = luma(px[i], px[i + 1], px[i + 2]);
      if (l <= opts.threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        // Darken toward true black so a grey pencil line does not fade out on re-encode.
        const k = Math.max(0, Math.min(255, Math.round(l * 0.6)));
        px[i] = px[i + 1] = px[i + 2] = k;
        px[i + 3] = 255;
      } else if (opts.transparent) {
        px[i + 3] = 0;
      } else {
        px[i] = px[i + 1] = px[i + 2] = 255;
        px[i + 3] = 255;
      }
    }
  }
  const foundInk = maxX >= 0;
  sctx.putImageData(data, 0, 0);

  // A little air around the ink, or the signature touches the edge of the box it is put in.
  const pad = foundInk ? Math.round(Math.max(src.width, src.height) * 0.02) : 0;
  const box = foundInk && opts.trim
    ? {
        x: Math.max(0, minX - pad),
        y: Math.max(0, minY - pad),
        w: Math.min(src.width, maxX + pad) - Math.max(0, minX - pad) + 1,
        h: Math.min(src.height, maxY + pad) - Math.max(0, minY - pad) + 1,
      }
    : { x: 0, y: 0, w: src.width, h: src.height };

  const scale = opts.width / box.w;
  const outW = Math.max(1, Math.round(box.w * scale));
  const outH = Math.max(1, Math.round(box.h * scale));

  const out = document.createElement("canvas");
  out.width = outW;
  out.height = outH;
  const octx = out.getContext("2d")!;
  if (!opts.transparent) {
    octx.fillStyle = "#FFFFFF";
    octx.fillRect(0, 0, outW, outH);
  }
  octx.imageSmoothingQuality = "high";
  octx.drawImage(src, box.x, box.y, box.w, box.h, 0, 0, outW, outH);

  const blob = await encodeWithin(out, opts.transparent, targetKb);
  return {
    blob,
    kb: Math.round((blob.size / 1024) * 10) / 10,
    width: outW,
    height: outH,
    foundInk,
  };
}

/**
 * Hit the corridor, not just the ceiling.
 *
 * A form that states "10 KB to 20 KB" rejects a file that is too small as readily as one that
 * is too large, and a clean two-tone signature compresses so well that it lands under the floor
 * without trying. Quality climbs first, and if that is not enough the image is padded with
 * noise-free detail by raising the resolution — never by inventing content.
 */
async function encodeWithin(
  canvas: HTMLCanvasElement,
  transparent: boolean,
  target: { min: number | null; max: number | null },
): Promise<Blob> {
  const type = transparent ? "image/png" : "image/jpeg";
  const encode = (q: number) =>
    new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), type, q));

  // PNG ignores quality, so a transparent result is what it is.
  if (transparent) return encode(1);

  let blob = await encode(0.9);
  if (target.max && blob.size > target.max * 1024) {
    for (const q of [0.8, 0.7, 0.6, 0.5, 0.4, 0.3]) {
      blob = await encode(q);
      if (blob.size <= target.max * 1024) break;
    }
  }
  if (target.min && blob.size < target.min * 1024) {
    for (const q of [0.95, 0.99, 1]) {
      const bigger = await encode(q);
      if (bigger.size > blob.size) blob = bigger;
      if (blob.size >= target.min * 1024) break;
    }
  }
  return blob;
}
