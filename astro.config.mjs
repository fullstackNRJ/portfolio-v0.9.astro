// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import mdx from "@astrojs/mdx";
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: "https://neerajmukta.com", //critical for sitemap and RSS
  integrations: [
    tailwind(),
    react(),
    mdx(),
    sitemap(),
  ],
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),
});