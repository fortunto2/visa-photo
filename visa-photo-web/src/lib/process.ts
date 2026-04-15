import type { Preset } from "./presets";
import imageCompression from "browser-image-compression";
import { jsPDF } from "jspdf";

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

  const brVal = 1 + brightness / 100;
  const ctVal = 1 + contrast / 100;
  const shVal = shadows / 100 * 0.3;
  ctx.filter = `brightness(${(brVal + shVal).toFixed(2)}) contrast(${ctVal.toFixed(2)})`;

  ctx.drawImage(sourceCanvas, x, y, cropW, cropH, 0, 0, preset.digital_width, preset.digital_height);

  if (asPng) {
    return new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b!), "image/png");
    });
  }

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.95);
  });

  if (blob.size <= preset.max_file_size_kb * 1024) return blob;

  const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
  return imageCompression(file, {
    maxSizeMB: preset.max_file_size_kb / 1024,
    maxWidthOrHeight: Math.max(preset.digital_width, preset.digital_height),
    useWebWorker: true,
  });
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
export function generatePrintPdf(
  preset: Preset,
  processedBlob: Blob,
): Promise<Blob> {
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
