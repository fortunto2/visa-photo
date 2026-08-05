import { dpiOf, type Preset } from "./presets";

/**
 * jspdf and browser-image-compression are loaded on demand.
 *
 * As static imports they landed in the island's entry chunk, so every country page shipped
 * 156 KB gzip of JS before anyone had picked a photo — 125 KB of it jsPDF, which is only
 * reachable from the "A4 sheet" button. Compression only runs when a JPEG overshoots the
 * preset's size limit.
 */
const loadPdf = () => import("jspdf").then((m) => m.jsPDF);
const loadCompressor = () => import("browser-image-compression").then((m) => m.default);

import { withJpegDpi } from "./jpegDpi";

export interface Levels {
  brightness: number;
  contrast: number;
  shadows: number;
}

/**
 * The CSS filter for a set of levels.
 *
 * Shared because the preview and the export must agree: the same formula was written out in
 * the canvas export, in App.tsx and in PhotoTool.tsx, so tweaking the shadow coefficient in
 * one place silently made the preview lie about the file.
 */
export function levelsFilter({ brightness, contrast, shadows }: Levels): string {
  const bright = 1 + brightness / 100 + (shadows / 100) * 0.3;
  const contrastValue = 1 + contrast / 100;
  return `brightness(${bright.toFixed(2)}) contrast(${contrastValue.toFixed(2)})`;
}

/** Save a blob to the user's downloads. */
export function download(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  // Deferred: revoking straight after click() races the download in Firefox.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Crop + resize image on canvas, return as Blob */
export async function cropAndExport(
  img: HTMLImageElement,
  preset: Preset,
  cx: number, cy: number,
  scale: number,
  brightness: number,
  contrast: number,
  shadows: number,
  asPng: boolean,
  rotation: number = 0,
): Promise<Blob> {
  let srcW = img.naturalWidth;
  let srcH = img.naturalHeight;
  let sourceCanvas: HTMLCanvasElement | HTMLImageElement = img;

  if (rotation !== 0) {
    const rotCanvas = document.createElement("canvas");
    const swapped = rotation === 90 || rotation === 270;
    rotCanvas.width = swapped ? srcH : srcW;
    rotCanvas.height = swapped ? srcW : srcH;
    const rCtx = rotCanvas.getContext("2d")!;
    rCtx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
    rCtx.rotate((rotation * Math.PI) / 180);
    rCtx.drawImage(img, -srcW / 2, -srcH / 2);
    srcW = rotCanvas.width;
    srcH = rotCanvas.height;
    sourceCanvas = rotCanvas;
  }

  const targetRatio = preset.digital_width / preset.digital_height;
  const srcRatio = srcW / srcH;
  const [maxW, maxH] = srcRatio > targetRatio
    ? [srcH * targetRatio, srcH]
    : [srcW, srcW / targetRatio];

  const cropW = maxW * scale;
  const cropH = maxH * scale;
  const centerX = cx * srcW;
  const centerY = cy * srcH;
  const x = Math.max(0, Math.min(centerX - cropW / 2, srcW - cropW));
  const y = Math.max(0, Math.min(centerY - cropH / 2, srcH - cropH));

  const canvas = document.createElement("canvas");
  canvas.width = preset.digital_width;
  canvas.height = preset.digital_height;
  const ctx = canvas.getContext("2d")!;

  ctx.filter = levelsFilter({ brightness, contrast, shadows });

  ctx.drawImage(sourceCanvas, x, y, cropW, cropH, 0, 0, preset.digital_width, preset.digital_height);

  if (asPng) {
    return new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b!), "image/png");
    });
  }

  const encode = (quality: number) =>
    new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/jpeg", quality));

  let blob = await encode(0.95);

  /**
   * Aim for the corridor, not just under the ceiling.
   *
   * Some authorities set a minimum file size as well as a maximum — a heavily compressed photo
   * is evidence of a heavily processed one. Quality is raised until the file is big enough,
   * which costs nothing in fidelity because it only ever adds detail back.
   */
  if (preset.min_file_size_kb) {
    for (const quality of [1, 0.99, 0.98]) {
      if (blob.size >= preset.min_file_size_kb * 1024) break;
      blob = await encode(quality);
    }
  }

  // The pixel count was always right; the metadata said 72 dpi, which some forms read as
  // "8 inches wide". Stamped from the preset's own print size.
  const dpi = dpiOf(preset);

  if (blob.size <= preset.max_file_size_kb * 1024) return withJpegDpi(blob, dpi);

  const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
  const imageCompression = await loadCompressor();
  const compressed = await imageCompression(file, {
    maxSizeMB: preset.max_file_size_kb / 1024,
    maxWidthOrHeight: Math.max(preset.digital_width, preset.digital_height),
    useWebWorker: true,
  });
  return withJpegDpi(compressed, dpi);
}

/** Generate A4 print layout as PNG */
export function generatePrintLayout(
  preset: Preset,
  processedBlob: Blob,
): Promise<Blob> {
  return new Promise((resolve) => {
    const printImg = new Image();
    printImg.onload = () => {
      const dpi = 300;
      const a4W = Math.round(210 / 25.4 * dpi);
      const a4H = Math.round(297 / 25.4 * dpi);
      const photoW = Math.round(preset.print_width_mm / 25.4 * dpi);
      const photoH = Math.round(preset.print_height_mm / 25.4 * dpi);

      const canvas = document.createElement("canvas");
      canvas.width = a4W;
      canvas.height = a4H;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, a4W, a4H);

      const cols = Math.floor((a4W - 40) / (photoW + 20));
      const rows = Math.floor((a4H - 40) / (photoH + 20));
      const total = Math.min(cols * rows, preset.photo_count);
      const marginX = Math.floor((a4W - cols * photoW - (cols - 1) * 20) / 2);
      const marginY = Math.floor((a4H - rows * photoH - (rows - 1) * 20) / 2);

      let placed = 0;
      for (let row = 0; row < rows && placed < total; row++) {
        for (let col = 0; col < cols && placed < total; col++) {
          ctx.drawImage(printImg, marginX + col * (photoW + 20), marginY + row * (photoH + 20), photoW, photoH);
          placed++;
        }
      }
      canvas.toBlob((b) => resolve(b!), "image/png");
    };
    printImg.src = URL.createObjectURL(processedBlob);
  });
}

/** Generate A4 print layout as PDF */
export async function generatePrintPdf(
  preset: Preset,
  processedBlob: Blob,
): Promise<Blob> {
  const jsPDF = await loadPdf();
  return new Promise((resolve) => {
    const printImg = new Image();
    printImg.onload = () => {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = 210;
      const pageH = 297;
      const pw = preset.print_width_mm;
      const ph = preset.print_height_mm;
      const gap = 5;

      const cols = Math.floor((pageW - 10) / (pw + gap));
      const rows = Math.floor((pageH - 10) / (ph + gap));
      const total = Math.min(cols * rows, preset.photo_count);
      const mx = (pageW - cols * pw - (cols - 1) * gap) / 2;
      const my = (pageH - rows * ph - (rows - 1) * gap) / 2;

      // Draw to canvas first for jsPDF
      const canvas = document.createElement("canvas");
      canvas.width = preset.digital_width;
      canvas.height = preset.digital_height;
      canvas.getContext("2d")!.drawImage(printImg, 0, 0, preset.digital_width, preset.digital_height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);

      let placed = 0;
      for (let row = 0; row < rows && placed < total; row++) {
        for (let col = 0; col < cols && placed < total; col++) {
          pdf.addImage(dataUrl, "JPEG", mx + col * (pw + gap), my + row * (ph + gap), pw, ph);
          placed++;
        }
      }

      resolve(pdf.output("blob"));
    };
    printImg.src = URL.createObjectURL(processedBlob);
  });
}

/** Generate A4 print layout with multiple different photos */
export function generateMultiPhotoPrintLayout(
  preset: Preset,
  processedBlobs: Blob[],
): Promise<Blob> {
  return new Promise((resolve) => {
    const dpi = 300;
    const a4W = Math.round(210 / 25.4 * dpi);
    const a4H = Math.round(297 / 25.4 * dpi);
    const photoW = Math.round(preset.print_width_mm / 25.4 * dpi);
    const photoH = Math.round(preset.print_height_mm / 25.4 * dpi);
    const gap = 20;

    const cols = Math.floor((a4W - 40) / (photoW + gap));
    const rows = Math.floor((a4H - 40) / (photoH + gap));
    const maxSlots = cols * rows;
    const marginX = Math.floor((a4W - cols * photoW - (cols - 1) * gap) / 2);
    const marginY = Math.floor((a4H - rows * photoH - (rows - 1) * gap) / 2);

    const canvas = document.createElement("canvas");
    canvas.width = a4W;
    canvas.height = a4H;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, a4W, a4H);

    // Load all images, then draw
    let loaded = 0;
    const images: HTMLImageElement[] = [];
    processedBlobs.forEach((blob, i) => {
      const img = new Image();
      img.onload = () => {
        images[i] = img;
        loaded++;
        if (loaded === processedBlobs.length) {
          // Fill slots cycling through available photos
          let placed = 0;
          for (let row = 0; row < rows && placed < maxSlots; row++) {
            for (let col = 0; col < cols && placed < maxSlots; col++) {
              const srcImg = images[placed % images.length];
              ctx.drawImage(srcImg, marginX + col * (photoW + gap), marginY + row * (photoH + gap), photoW, photoH);
              placed++;
            }
          }
          canvas.toBlob((b) => resolve(b!), "image/png");
        }
      };
      img.src = URL.createObjectURL(blob);
    });
  });
}

/** Generate A4 multi-photo PDF */
export async function generateMultiPhotoPdf(
  preset: Preset,
  processedBlobs: Blob[],
): Promise<Blob> {
  const jsPDF = await loadPdf();
  return new Promise((resolve) => {
    let loaded = 0;
    const dataUrls: string[] = [];
    processedBlobs.forEach((blob, i) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = preset.digital_width;
        c.height = preset.digital_height;
        c.getContext("2d")!.drawImage(img, 0, 0, preset.digital_width, preset.digital_height);
        dataUrls[i] = c.toDataURL("image/jpeg", 0.95);
        loaded++;
        if (loaded === processedBlobs.length) {
          const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
          const pageW = 210, pageH = 297;
          const pw = preset.print_width_mm, ph = preset.print_height_mm;
          const gap = 5;
          const cols = Math.floor((pageW - 10) / (pw + gap));
          const rows = Math.floor((pageH - 10) / (ph + gap));
          const maxSlots = cols * rows;
          const mx = (pageW - cols * pw - (cols - 1) * gap) / 2;
          const my = (pageH - rows * ph - (rows - 1) * gap) / 2;

          let placed = 0;
          for (let row = 0; row < rows && placed < maxSlots; row++) {
            for (let col = 0; col < cols && placed < maxSlots; col++) {
              const du = dataUrls[placed % dataUrls.length];
              pdf.addImage(du, "JPEG", mx + col * (pw + gap), my + row * (ph + gap), pw, ph);
              placed++;
            }
          }
          resolve(pdf.output("blob"));
        }
      };
      img.src = URL.createObjectURL(blob);
    });
  });
}

/** Auto-enhance: analyze image and return suggested adjustments */
export function autoEnhance(img: HTMLImageElement): { brightness: number; contrast: number; shadows: number } {
  const canvas = document.createElement("canvas");
  const size = 200; // sample at low res for speed
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;

  let sum = 0;
  let min = 255;
  let max = 0;
  const hist = new Array(256).fill(0);

  for (let i = 0; i < data.length; i += 4) {
    const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    sum += lum;
    if (lum < min) min = lum;
    if (lum > max) max = lum;
    hist[lum]++;
  }

  const pixels = data.length / 4;
  const avg = sum / pixels;
  const range = max - min;

  // Dark pixels (shadows) — bottom 25% of histogram
  let darkPixels = 0;
  for (let i = 0; i < 64; i++) darkPixels += hist[i];
  const darkRatio = darkPixels / pixels;

  // Brightness: target avg ~130 for passport photos (well-lit face)
  let brightness = Math.round((130 - avg) / 2.55);
  brightness = Math.max(-30, Math.min(30, brightness));

  // Contrast: boost if flat, reduce if too contrasty
  let contrast = 0;
  if (range < 150) contrast = Math.round((180 - range) / 10);
  if (range > 230) contrast = -5;
  contrast = Math.max(-20, Math.min(25, contrast));

  // Shadows: lift if many dark pixels
  let shadows = 0;
  if (darkRatio > 0.15) shadows = Math.round(darkRatio * 60);
  shadows = Math.min(50, shadows);

  return { brightness, contrast, shadows };
}
