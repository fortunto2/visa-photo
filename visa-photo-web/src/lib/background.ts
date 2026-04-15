export interface BgModel {
  id: string;
  name: string;
  sizeMb: number;
  inputSize: number;
  inputName: string;
  url: string;
  quality: number;
}

export const MODELS: BgModel[] = [
  {
    id: "silueta", name: "Silueta", sizeMb: 43,
    inputSize: 320, inputName: "input.1",
    url: "https://assets.superduperai.co/models/silueta.onnx",
    quality: 2,
  },
  {
    id: "u2netp", name: "U2Net-P", sizeMb: 5,
    inputSize: 320, inputName: "input.1",
    url: "https://github.com/nicjac/silueta-onnx/releases/download/v0.1/u2netp.onnx",
    quality: 1,
  },
  {
    id: "u2net_human_seg", name: "U2Net Human", sizeMb: 176,
    inputSize: 320, inputName: "input.1",
    url: "https://assets.superduperai.co/models/u2net_human_seg.onnx",
    quality: 4,
  },
];

// IndexedDB cache for downloaded models
const DB_NAME = "visa-photo-models";
const STORE_NAME = "models";

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getCachedModel(id: string): Promise<ArrayBuffer | null> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
}

async function cacheModel(id: string, data: ArrayBuffer): Promise<void> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(data, id);
    tx.oncomplete = () => resolve();
  });
}

export async function isModelCached(id: string): Promise<boolean> {
  const data = await getCachedModel(id);
  return data !== null;
}

let session: any = null;
let loadedModelId: string | null = null;

export async function removeBackground(
  img: HTMLImageElement,
  model: BgModel,
  onProgress?: (msg: string) => void,
): Promise<Blob> {
  const ort = await import("onnxruntime-web");
  ort.env.wasm.wasmPaths = "/";

  if (!session || loadedModelId !== model.id) {
    // Try IndexedDB cache first
    let buf = await getCachedModel(model.id);
    if (buf) {
      onProgress?.(`Loading ${model.name} from cache...`);
    } else {
      onProgress?.(`Downloading ${model.name} (${model.sizeMb}MB)...`);
      const resp = await fetch(model.url);
      if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
      buf = await resp.arrayBuffer();
      // Cache for next time
      await cacheModel(model.id, buf);
      onProgress?.("Cached for offline use");
    }
    onProgress?.("Loading model...");
    session = await ort.InferenceSession.create(buf, {
      executionProviders: ["wasm"],
    });
    loadedModelId = model.id;
  }

  const sz = model.inputSize;
  const origW = img.naturalWidth;
  const origH = img.naturalHeight;

  const inCanvas = document.createElement("canvas");
  inCanvas.width = sz;
  inCanvas.height = sz;
  inCanvas.getContext("2d")!.drawImage(img, 0, 0, sz, sz);
  const pixels = inCanvas.getContext("2d")!.getImageData(0, 0, sz, sz).data;

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
  const results = await session.run({ [model.inputName]: tensor });
  const maskData = results[Object.keys(results)[0]].data as Float32Array;

  let min = Infinity, max = -Infinity;
  for (const v of maskData) { if (v < min) min = v; if (v > max) max = v; }
  const range = Math.max(max - min, 1e-6);

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

  onProgress?.("Compositing...");
  const outCanvas = document.createElement("canvas");
  outCanvas.width = origW;
  outCanvas.height = origH;
  const outCtx = outCanvas.getContext("2d")!;
  outCtx.fillStyle = "white";
  outCtx.fillRect(0, 0, origW, origH);

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = origW;
  tempCanvas.height = origH;
  tempCanvas.getContext("2d")!.drawImage(img, 0, 0);

  const maskScaled = document.createElement("canvas");
  maskScaled.width = origW;
  maskScaled.height = origH;
  maskScaled.getContext("2d")!.drawImage(maskCanvas, 0, 0, origW, origH);

  const origData = tempCanvas.getContext("2d")!.getImageData(0, 0, origW, origH);
  const maskPixels = maskScaled.getContext("2d")!.getImageData(0, 0, origW, origH).data;
  const outData = outCtx.getImageData(0, 0, origW, origH);

  for (let i = 0; i < origData.data.length; i += 4) {
    const a = maskPixels[i] / 255;
    outData.data[i] = Math.round(origData.data[i] * a + 255 * (1 - a));
    outData.data[i + 1] = Math.round(origData.data[i + 1] * a + 255 * (1 - a));
    outData.data[i + 2] = Math.round(origData.data[i + 2] * a + 255 * (1 - a));
    outData.data[i + 3] = 255;
  }
  outCtx.putImageData(outData, 0, 0);

  onProgress?.("Done!");
  return new Promise((resolve) => {
    outCanvas.toBlob((b) => resolve(b!), "image/png");
  });
}
