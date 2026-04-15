import type { Preset } from "./presets";
import imageCompression from "browser-image-compression";

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
  // Apply rotation first
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

  // Crop
  const canvas = document.createElement("canvas");
  canvas.width = preset.digital_width;
  canvas.height = preset.digital_height;
  const ctx = canvas.getContext("2d")!;

  // Apply adjustments
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

  // JPEG with size limit
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.95);
  });

  if (blob.size <= preset.max_file_size_kb * 1024) return blob;

  // Compress to fit size limit
  const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
  const compressed = await imageCompression(file, {
    maxSizeMB: preset.max_file_size_kb / 1024,
    maxWidthOrHeight: Math.max(preset.digital_width, preset.digital_height),
    useWebWorker: true,
  });
  return compressed;
}

/** Generate A4 print layout with N copies */
export function generatePrintLayout(
  img: HTMLImageElement,
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
          const x = marginX + col * (photoW + 20);
          const y = marginY + row * (photoH + 20);
          ctx.drawImage(printImg, x, y, photoW, photoH);
          placed++;
        }
      }

      canvas.toBlob((b) => resolve(b!), "image/png");
    };
    printImg.src = URL.createObjectURL(processedBlob);
  });
}
