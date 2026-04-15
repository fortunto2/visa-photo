// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  integrations: [preact()],
  vite: {
    plugins: [
      tailwindcss(),
      viteStaticCopy({
        targets: [{
          src: 'node_modules/onnxruntime-web/dist/*.wasm',
          dest: '.'
        }]
      })
    ],
    optimizeDeps: {
      exclude: ['onnxruntime-web']
    }
  }
});
