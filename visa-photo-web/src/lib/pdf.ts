/**
 * Squeezing a PDF under a stated number of megabytes, in the tab.
 *
 * The method is the honest one to describe: every page is rendered to a canvas and re-encoded
 * as a JPEG, and a new PDF is assembled from those. That is what actually removes weight from
 * the files people are trying to upload, which are almost always scans — a scanned page is
 * already a photograph, so re-encoding it loses nothing it had. What it does cost is real and
 * has to be said out loud: a PDF that contained selectable text stops containing it. The text
 * is still legible; it is no longer text.
 *
 * Both libraries are loaded only when someone asks for a PDF, so the pages that do not need
 * them never pay for them.
 */

/** Both dependencies are pulled in on demand — together they are larger than the site. */
const loadPdfJs = async () => {
  const pdfjs = await import("pdfjs-dist");
  // The worker ships with the package and is bundled locally; nothing is fetched from a CDN,
  // which is also what the site's own privacy claim requires.
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  return pdfjs;
};

const loadJsPdf = () => import("jspdf").then((m) => m.jsPDF);

export interface PdfResult {
  blob: Blob;
  mb: number;
  pages: number;
  /**
   * Which method got there. "images" kept the text as text; "raster" redrew the pages and did
   * not. The caller shows the warning only for the second, because only the second earns it.
   */
  method: "images" | "raster";
}

/**
 * Render every page at `scale` and re-encode at `quality`, then assemble.
 *
 * Kept separate from the search loop so the loop can call it repeatedly with different
 * settings without re-reading the document each time.
 */
async function rebuild(
  pdfjs: Awaited<ReturnType<typeof loadPdfJs>>,
  JsPDF: Awaited<ReturnType<typeof loadJsPdf>>,
  data: ArrayBuffer,
  scale: number,
  quality: number,
  onPage?: (page: number, total: number) => void,
): Promise<{ blob: Blob; pages: number }> {
  // pdf.js takes ownership of the buffer it is given, so each pass gets its own copy.
  const doc = await pdfjs.getDocument({ data: data.slice(0) }).promise;
  let out: InstanceType<typeof JsPDF> | null = null;

  for (let n = 1; n <= doc.numPages; n++) {
    onPage?.(n, doc.numPages);
    const page = await doc.getPage(n);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const ctx = canvas.getContext("2d")!;
    // A scan with no background of its own would otherwise come out on black.
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;

    const jpeg = canvas.toDataURL("image/jpeg", quality);
    // Points, at 72 per inch, so the rebuilt page keeps the original's physical size.
    const size = page.getViewport({ scale: 1 });
    const w = size.width;
    const h = size.height;

    if (!out) {
      out = new JsPDF({ unit: "pt", format: [w, h], orientation: w > h ? "landscape" : "portrait" });
    } else {
      out.addPage([w, h], w > h ? "landscape" : "portrait");
    }
    out.addImage(jpeg, "JPEG", 0, 0, w, h);
  }

  const pages = doc.numPages;
  // Release the worker's copy between passes; the ladder can open the same document seven times.
  await doc.cleanup();
  return { blob: out!.output("blob"), pages };
}

/**
 * Try progressively harder settings until the file fits, and stop at the first one that does.
 *
 * Quality is given up before resolution: a slightly softer JPEG is less noticeable on a scan
 * than a page rendered at half the pixels. The last pair is the floor — past it the page stops
 * being readable, and returning something illegible under the limit would be worse than
 * returning something honest over it.
 */
const LADDER: [scale: number, quality: number][] = [
  [2, 0.85],
  [2, 0.7],
  [1.5, 0.7],
  [1.5, 0.55],
  [1.2, 0.5],
  [1, 0.45],
  [0.8, 0.4],
];

/** The gentle ladder: quality and pixel cap for the images, document untouched otherwise. */
const IMAGE_LADDER: [quality: number, maxSide: number][] = [
  [0.82, 2400],
  [0.7, 1800],
  [0.6, 1400],
  [0.5, 1100],
  [0.42, 900],
];

/**
 * Two methods, gentlest first.
 *
 * The pictures inside a PDF are almost always where its weight is, and re-encoding only those
 * leaves the text as text — fonts, vectors, links and any OCR layer survive untouched. That is
 * tried first, at five decreasing settings, along with throwing away the metadata junk editors
 * leave behind.
 *
 * Only when that cannot reach the limit — a file whose images are JBIG2, or one that is all
 * fonts and vectors — does it fall back to redrawing every page as a picture. That always gets
 * smaller, and it always costs the text. Which method was used comes back in the result so the
 * page can say so rather than warn about a cost that was never paid.
 */
export async function compressPdfToMb(
  file: File,
  targetMb: number,
  onProgress?: (message: string) => void,
): Promise<PdfResult> {
  const data = await file.arrayBuffer();
  const limit = targetMb * 1024 * 1024;

  const { recompressImages } = await import("./pdfImages");
  let bestImages: { blob: Blob; bytes: number } | null = null;

  for (const [quality, maxSide] of IMAGE_LADDER) {
    const pass = await recompressImages(data.slice(0), quality, maxSide, (n, total) =>
      onProgress?.(`${n} / ${total}`));
    const blob = new Blob([pass.bytes as unknown as BlobPart], { type: "application/pdf" });
    if (!bestImages || blob.size < bestImages.bytes) bestImages = { blob, bytes: blob.size };
    if (blob.size <= limit) {
      return {
        blob, mb: Math.round((blob.size / 1024 / 1024) * 100) / 100,
        pages: 0, method: "images",
      };
    }
    // Nothing to squeeze: further passes would repeat the same no-op.
    if (pass.replaced === 0) break;
  }

  const [pdfjs, JsPDF] = await Promise.all([loadPdfJs(), loadJsPdf()]);
  let best: { blob: Blob; pages: number } | null = null;

  for (const [scale, quality] of LADDER) {
    const attempt = await rebuild(pdfjs, JsPDF, data, scale, quality, (n, total) =>
      onProgress?.(`${n} / ${total}`));
    // Keep the smallest seen, so a document that never fits still comes back as small as we
    // could honestly make it rather than as the last attempt.
    if (!best || attempt.blob.size < best.blob.size) best = attempt;
    if (attempt.blob.size <= limit) break;
  }

  // If redrawing the pages did not beat the gentle pass, keep the one that preserved the text.
  if (bestImages && bestImages.bytes <= best!.blob.size) {
    return {
      blob: bestImages.blob,
      mb: Math.round((bestImages.bytes / 1024 / 1024) * 100) / 100,
      pages: 0, method: "images",
    };
  }

  return {
    blob: best!.blob,
    mb: Math.round((best!.blob.size / 1024 / 1024) * 100) / 100,
    pages: best!.pages,
    method: "raster",
  };
}
