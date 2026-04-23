import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import partytown from '@astrojs/partytown';

export default defineConfig({
  integrations: [
    tailwind(),
    partytown({
      // Forward dataLayer.push para que gtag (main thread) llegue al worker
      config: {
        forward: ['dataLayer.push'],
        debug: false,
      },
    }),
  ],
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      target: 'es2022',
      cssCodeSplit: true,
    },
  },
});
