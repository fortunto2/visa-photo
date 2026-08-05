import { copyFile, mkdir, readdir, rm, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Copy exactly the onnxruntime-web files the site loads at runtime into public/.
 *
 * This used to be vite-plugin-static-copy. Astro runs Vite more than once, and on a later
 * pass the plugin's glob resolved against a different root, so the entire package was written
 * to dist/node_modules — 79 MB, including a 26 MB file. Cloudflare Pages rejects any single
 * file above 25 MB, so the deploy failed on an artefact no code referenced.
 *
 * Doing the copy here instead means the file list is explicit and the build cannot surprise us.
 * The background remover asks for `executionProviders: ["wasm"]`, so the jsep (WebGPU, 25 MB),
 * asyncify (27 MB) and jspi (17 MB) binaries are all dead weight and stay out.
 */

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const from = join(root, "node_modules", "onnxruntime-web", "dist");
const to = join(root, "public");

const WANTED = [
  "ort.wasm.bundle.min.mjs",   // the ESM entry the app imports by URL
  "ort-wasm-simd-threaded.mjs", // loader the entry pulls in
  "ort-wasm-simd-threaded.wasm", // the only binary the wasm backend needs
];

/** Anything ort-shaped that is not wanted was left by an older build; remove it. */
async function pruneStale() {
  let entries = [];
  try {
    entries = await readdir(to);
  } catch {
    return;
  }
  const stale = entries.filter(
    (name) => /^ort[.-]/.test(name) && !WANTED.includes(name),
  );
  for (const name of stale) {
    await rm(join(to, name), { force: true });
    console.log(`  removed stale ${name}`);
  }
}

await mkdir(to, { recursive: true });
await pruneStale();

let total = 0;
for (const name of WANTED) {
  const src = join(from, name);
  const info = await stat(src).catch(() => null);
  if (!info) {
    console.error(`sync-ort: ${name} missing from onnxruntime-web — did the package change?`);
    process.exit(1);
  }
  await copyFile(src, join(to, name));
  total += info.size;
  console.log(`  ${name} (${(info.size / 1e6).toFixed(1)} MB)`);
}

console.log(`sync-ort: ${WANTED.length} files, ${(total / 1e6).toFixed(1)} MB total`);
