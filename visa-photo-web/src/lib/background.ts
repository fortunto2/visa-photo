// Lazy load — ort imported only when user clicks "Remove BG"
const MODEL_URL = "https://assets.superduperai.co/models/silueta.onnx";
let session: any = null;

export async function removeBackground(
  img: HTMLImageElement,
  onProgress?: (msg: string) => void,
): Promise<Blob> {
  const ort = await import("onnxruntime-web");
  ort.env.wasm.wasmPaths = "/";

  if (!session) {
    onProgress?.("Downloading model (43MB)...");
    const resp = await fetch(MODEL_URL);
    if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
    const buf = await resp.arrayBuffer();
    onProgress?.("Loading model...");
    session = await ort.InferenceSession.create(buf, {
      executionProviders: ["wasm"],
    });
  }

  const sz = 320;
  const origW = img.naturalWidth;
  const origH = img.naturalHeight;

  // Resize to 320x320
  const inCanvas = document.createElement("canvas");
  inCanvas.width = sz;
  inCanvas.height = sz;
  const inCtx = inCanvas.getContext("2d")!;
  inCtx.drawImage(img, 0, 0, sz, sz);
  const pixels = inCtx.getImageData(0, 0, sz, sz).data;

  // Build NCHW tensor with ImageNet normalization
  const mean = [0.485, 0.456, 0.406];
  const std = [0.229, 0.224, 0.225];
  const input = new Float32Array(1 * 3 * sz * sz);
  for (let y = 0; y < sz; y++) {
    for (let x = 0; x < sz; x++) {
      const i = (y * sz + x) * 4;
      for (let c = 0; c < 3; c++) {
        input[c * sz * sz + y * sz + x] = (pixels[i + c] / 255 - mean[c]) / std[c];
      }
    }
  }

  onProgress?.("Running inference...");
  const tensor = new ort.Tensor("float32", input, [1, 3, sz, sz]);
  const results = await session.run({ "input.1": tensor });
  const maskData = results[Object.keys(results)[0]].data as Float32Array;

  // Normalize mask
  let min = Infinity, max = -Infinity;
  for (const v of maskData) { if (v < min) min = v; if (v > max) max = v; }
  const range = Math.max(max - min, 1e-6);

  // Create mask at 320x320
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = sz;
  maskCanvas.height = sz;
  const maskCtx = maskCanvas.getContext("2d")!;
  const maskImg = maskCtx.createImageData(sz, sz);
  for (let i = 0; i < sz * sz; i++) {
    const v = Math.round(((maskData[i] - min) / range) * 255);
    maskImg.data[i * 4] = v;
    maskImg.data[i * 4 + 1] = v;
    maskImg.data[i * 4 + 2] = v;
    maskImg.data[i * 4 + 3] = 255;
  }
  maskCtx.putImageData(maskImg, 0, 0);

  // Composite: foreground over white using mask
  onProgress?.("Compositing...");
  const outCanvas = document.createElement("canvas");
  outCanvas.width = origW;
  outCanvas.height = origH;
  const outCtx = outCanvas.getContext("2d")!;

  // White background
  outCtx.fillStyle = "white";
  outCtx.fillRect(0, 0, origW, origH);

  // Get original pixels
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = origW;
  tempCanvas.height = origH;
  const tempCtx = tempCanvas.getContext("2d")!;
  tempCtx.drawImage(img, 0, 0);

  // Scale mask to original size
  const maskScaled = document.createElement("canvas");
  maskScaled.width = origW;
  maskScaled.height = origH;
  const msCtx = maskScaled.getContext("2d")!;
  msCtx.drawImage(maskCanvas, 0, 0, origW, origH);

  // Apply mask as alpha
  const origData = tempCtx.getImageData(0, 0, origW, origH);
  const maskPixels = msCtx.getImageData(0, 0, origW, origH).data;
  const outData = outCtx.getImageData(0, 0, origW, origH);

  for (let i = 0; i < origData.data.length; i += 4) {
    const alpha = maskPixels[i] / 255;
    outData.data[i] = Math.round(origData.data[i] * alpha + 255 * (1 - alpha));
    outData.data[i + 1] = Math.round(origData.data[i + 1] * alpha + 255 * (1 - alpha));
    outData.data[i + 2] = Math.round(origData.data[i + 2] * alpha + 255 * (1 - alpha));
    outData.data[i + 3] = 255;
  }
  outCtx.putImageData(outData, 0, 0);

  onProgress?.("Done!");
  return new Promise((resolve) => {
    outCanvas.toBlob((b) => resolve(b!), "image/png");
  });
}
