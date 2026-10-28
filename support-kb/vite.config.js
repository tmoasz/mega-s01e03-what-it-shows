import { fileURLToPath } from 'node:url';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: { alias: { '#lib': fileURLToPath(new URL('./src/lib', import.meta.url)) } },
  plugins: [
    sveltekit({
      extensions: ['.svelte', '.svx'],
      preprocess: [
        vitePreprocess(),
        mdsvex({
          extensions: ['.svx'],
          layout: {
            runbook: fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url))
          }
        })
      ],
      adapter: adapter({ pages: 'build', assets: 'build', strict: true })
    })
  ]
});
