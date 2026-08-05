// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import { SITE } from './src/lib/site.ts';

export default defineConfig({
  site: SITE.origin,
  integrations: [preact()],

  // onnxruntime-web is never imported by package name — src/lib/background.ts loads it by URL
  // from public/, filled by `npm run sync-ort` (see scripts/sync-ort.mjs for why).
  // So the bundler needs no configuration for it at all.
  vite: {
    plugins: [tailwindcss()],
  },
});
