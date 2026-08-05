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
    id: "u2netp", name: "U2Net-P", sizeMb: 5,
    inputSize: 320, inputName: "input.1",
    url: "https://assets.superduperai.co/models/u2netp.onnx",
    quality: 1,
  },
  {
    id: "silueta", name: "Silueta", sizeMb: 43,
    inputSize: 320, inputName: "input.1",
    url: "https://assets.superduperai.co/models/silueta.onnx",
    quality: 2,
  },
  {
    id: "u2net", name: "U2Net Full", sizeMb: 176,
    inputSize: 320, inputName: "input.1",
    url: "https://assets.superduperai.co/models/u2net.onnx",
    quality: 3,
  },
  {
    id: "u2net_human_seg", name: "U2Net Human", sizeMb: 176,
    inputSize: 320, inputName: "input.1",
    url: "https://assets.superduperai.co/models/u2net_human_seg.onnx",
    quality: 4,
  },
  {
    id: "isnet", name: "ISNet General", sizeMb: 176,
    inputSize: 1024, inputName: "input_image",
    url: "https://assets.superduperai.co/models/isnet-general-use.onnx",
    quality: 3,
  },
];

// IndexedDB cache for downloaded models
const DB_NAME = "visa-photo-models";
const STORE_NAME = "models";

let dbPromise: Promise<IDBDatabase> | null = null;

/** Memoised: every call used to open its own connection, five at a time on mount. */
async function openDB(): Promise<IDBDatabase> {
  return (dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
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

async function cacheModel(id: string, data: ArrayBuffer | Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(data, id);
    tx.oncomplete = () => resolve();
    // Without this a quota-exceeded write leaves the promise pending and the download
    // spinner never stops.
    tx.onerror = tx.onabort = () => reject(tx.error ?? new Error("model cache write failed"));
  });
}

/**
 * Which models this browser holds.
 *
 * Keys only. Asking `get(id)` per model deserialises the whole stored buffer just to compare
 * it against null — for someone with three large models cached that is half a gigabyte read
 * and thrown away on every mount.
 */
export async function cachedModelIds(): Promise<Set<string>> {
  const db = await openDB();
  return new Promise((resolve) => {
    const req = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAllKeys();
    req.onsuccess = () => resolve(new Set(req.result as string[]));
    req.onerror = () => resolve(new Set());
  });
}

export async function isModelCached(id: string): Promise<boolean> {
  return (await cachedModelIds()).has(id);
}

async function deleteCachedModel(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
  });
}

/**
 * Fetch a model into the browser's storage without running it.
 *
 * Downloading and inferring used to be one step inside removeBackground, which meant a model
 * could only arrive at the moment someone needed it — a 176 MB wait in the middle of the job.
 * Pulled apart so the models page can fetch one ahead of time, over wifi, before it is needed.
 */
export async function ensureModel(
  model: BgModel,
  onProgress?: (loaded: number, total: number) => void,
): Promise<void> {
  if (await isModelCached(model.id)) return;

  const resp = await fetch(model.url);
  if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);

  const total = Number(resp.headers.get("content-length")) || model.sizeMb * 1e6;

  // Stream so the progress bar reflects bytes actually on disk, not a spinner that lies.
  if (!resp.body) {
    const buf = await resp.arrayBuffer();
    await cacheModel(model.id, buf);
    onProgress?.(total, total);
    return;
  }

  const reader = resp.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    onProgress?.(loaded, total);
  }

  // Stored as a Blob rather than a concatenated Uint8Array: merging the chunks would hold a
  // second full copy on the JS heap, so a 176 MB model peaked at 352 MB. IndexedDB stores
  // Blobs natively, and the bytes are only materialised when inference actually needs them.
  await cacheModel(model.id, new Blob(chunks as BlobPart[]));
}

/** Bytes for a model, downloading it first if this browser does not have it yet. */
async function modelBytes(
  model: BgModel,
  onProgress?: (msg: string) => void,
): Promise<ArrayBuffer> {
  const cached = await getCachedModel(model.id);
  if (cached) {
    onProgress?.(`Loading ${model.name} from cache...`);
    return cached instanceof Blob ? cached.arrayBuffer() : cached;
  }

  await ensureModel(model, (loaded, total) => {
    const pct = total ? Math.round((loaded / total) * 100) : 0;
    onProgress?.(`Downloading ${model.name} (${model.sizeMb} MB) — ${pct} %`);
  });

  const stored = await getCachedModel(model.id);
  if (!stored) throw new Error(`Model ${model.id} vanished after download`);
  return stored instanceof Blob ? stored.arrayBuffer() : stored;
}

export async function removeModel(id: string): Promise<void> {
  await deleteCachedModel(id);
  // The in-memory session still holds the old weights; drop it so the next run reloads.
  if (loadedModelId === id) {
    session = null;
    loadedModelId = null;
  }
}

// Keeps the old prefix on purpose: renaming the key would silently reset the model
// every existing visitor has already chosen and downloaded.
const DEFAULT_MODEL_KEY = "visaspec:default-model";

/**
 * Which model the tool reaches for first. Stored per browser, because the answer depends on
 * the device's connection and on what the person has already downloaded — not on the site.
 */
export function getPreferredModel(): BgModel {
  if (typeof localStorage !== "undefined") {
    const id = localStorage.getItem(DEFAULT_MODEL_KEY);
    const found = MODELS.find((m) => m.id === id);
    if (found) return found;
  }
  return MODELS[0];
}

export function setPreferredModel(id: string): void {
  if (typeof localStorage === "undefined") return;
  if (id === MODELS[0].id) localStorage.removeItem(DEFAULT_MODEL_KEY);
  else localStorage.setItem(DEFAULT_MODEL_KEY, id);
}

/** Served from public/ by scripts/sync-ort.mjs; see the import site below. */
const ORT_ENTRY = "/ort.wasm.bundle.min.mjs";

let session: any = null;
let loadedModelId: string | null = null;

export async function removeBackground(
  img: HTMLImageElement,
  model: BgModel,
  transparent: boolean = false,
  onProgress?: (msg: string) => void,
): Promise<Blob> {
  // Loaded by URL from public/, not by package name. Importing "onnxruntime-web" makes the
  // bundler emit its own 24 MB copy of the wasm into _astro/ that nothing ever fetches,
  // because the runtime is told to take binaries from the site root on the next line.
  // scripts/sync-ort.mjs puts this file there.
  //
  // The path goes through a variable on purpose: a literal is resolved by Rollup at build
  // time, which fails because the file only exists in the output, not in the source tree.
  const ort = await import(/* @vite-ignore */ ORT_ENTRY);
  ort.env.wasm.wasmPaths = "/";

  if (!session || loadedModelId !== model.id) {
    // One download path shared with the models page. This used to fetch on its own, which
    // meant the progress text here was a single static line while 176 MB came down.
    const buf = await modelBytes(model, onProgress);
    onProgress?.("Loading model...");
    session = await ort.InferenceSession.create(buf, { executionProviders: ["wasm"] });
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
  const outData = outCtx.createImageData(origW, origH);

  for (let i = 0; i < origData.data.length; i += 4) {
    const a = maskPixels[i] / 255;
    if (transparent) {
      // PNG with alpha channel
      outData.data[i] = origData.data[i];
      outData.data[i + 1] = origData.data[i + 1];
      outData.data[i + 2] = origData.data[i + 2];
      outData.data[i + 3] = Math.round(a * 255);
    } else {
      // White background
      outData.data[i] = Math.round(origData.data[i] * a + 255 * (1 - a));
      outData.data[i + 1] = Math.round(origData.data[i + 1] * a + 255 * (1 - a));
      outData.data[i + 2] = Math.round(origData.data[i + 2] * a + 255 * (1 - a));
      outData.data[i + 3] = 255;
    }
  }
  outCtx.putImageData(outData, 0, 0);

  onProgress?.("Done!");
  return new Promise((resolve) => {
    outCanvas.toBlob((b) => resolve(b!), "image/png");
  });
}
