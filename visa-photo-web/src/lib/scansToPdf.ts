const loadJsPdf = () => import("jspdf").then((m) => m.jsPDF);

/** A4 at 72 points to the inch, which is the unit a PDF page is measured in. */
const A4 = { w: 595.28, h: 841.89 };

export type PageFit = "fit" | "a4";

export interface ScanPdfResult {
  blob: Blob;
  mb: number;
  pages: number;
}

interface Drawn {
  dataUrl: string;
  w: number;
  h: number;
}

/** Decode, cap the long side, re-encode. The cap is what actually controls the file size. */
async function prepare(file: File, quality: number, maxSide: number): Promise<Drawn> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  // A scan with transparency would otherwise land on black once it is inside a PDF.
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  return { dataUrl: canvas.toDataURL("image/jpeg", quality), w, h };
}

/**
 * Put the images on pages.
 *
 * Two shapes, and both are asked for. "fit" gives every page the proportions of its own image,
 * which is what a photographed page wants — no borders, nothing cropped. "a4" puts each image
 * on a sheet of the size a printer and most upload forms expect, centred with a small margin,
 * which is what a form asking for "a scan of your passport, A4" means.
 */
async function assemble(
  files: File[],
  fit: PageFit,
  quality: number,
  maxSide: number,
  onProgress?: (done: number, total: number) => void,
): Promise<Blob> {
  const JsPDF = await loadJsPdf();
  let doc: InstanceType<typeof JsPDF> | null = null;

  for (let i = 0; i < files.length; i++) {
    onProgress?.(i + 1, files.length);
    const img = await prepare(files[i], quality, maxSide);

    if (fit === "fit") {
      // Points at 150 dpi: a page that is neither absurdly large on screen nor coarse in print.
      const pw = (img.w / 150) * 72;
      const ph = (img.h / 150) * 72;
      const orientation = pw > ph ? "landscape" : "portrait";
      if (!doc) doc = new JsPDF({ unit: "pt", format: [pw, ph], orientation });
      else doc.addPage([pw, ph], orientation);
      doc.addImage(img.dataUrl, "JPEG", 0, 0, pw, ph);
    } else {
      if (!doc) doc = new JsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
      else doc.addPage("a4", "portrait");
      const margin = 24;
      const boxW = A4.w - margin * 2;
      const boxH = A4.h - margin * 2;
      const s = Math.min(boxW / img.w, boxH / img.h);
      const dw = img.w * s;
      const dh = img.h * s;
      doc.addImage(img.dataUrl, "JPEG", (A4.w - dw) / 2, (A4.h - dh) / 2, dw, dh);
    }
  }

  return doc!.output("blob");
}

/** Progressively harder, and only as hard as it has to be. */
const LADDER: [quality: number, maxSide: number][] = [
  [0.85, 2400],
  [0.75, 2000],
  [0.65, 1600],
  [0.55, 1300],
  [0.45, 1000],
];

/**
 * Several scans into one PDF, under a stated size.
 *
 * The reason to have this here rather than send people to a converter is what the files are:
 * an application wants one PDF holding a passport, a bank statement and a birth certificate,
 * and every tool that offers to combine them asks for exactly those to be uploaded first.
 */
export async function scansToPdf(
  files: File[],
  fit: PageFit,
  targetMb: number | null,
  onProgress?: (message: string) => void,
): Promise<ScanPdfResult> {
  const report = (n: number, total: number) => onProgress?.(`${n} / ${total}`);

  if (targetMb === null) {
    const blob = await assemble(files, fit, LADDER[0][0], LADDER[0][1], report);
    return { blob, mb: Math.round((blob.size / 1024 / 1024) * 100) / 100, pages: files.length };
  }

  const limit = targetMb * 1024 * 1024;
  let best: Blob | null = null;

  for (const [quality, maxSide] of LADDER) {
    const blob = await assemble(files, fit, quality, maxSide, report);
    if (!best || blob.size < best.size) best = blob;
    if (blob.size <= limit) break;
  }

  return {
    blob: best!,
    mb: Math.round((best!.size / 1024 / 1024) * 100) / 100,
    pages: files.length,
  };
}
