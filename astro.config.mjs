import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import { logoProcessor } from './src/integrations/logo-processor';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind({applyBaseStyles: false,}), logoProcessor(), react(), sitemap()],
  output: 'static',
  site: 'https://logos.travel',
  trailingSlash: 'always',
});