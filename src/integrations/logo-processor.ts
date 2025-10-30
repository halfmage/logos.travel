import type { AstroIntegration } from 'astro';
import { readdirSync, statSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';
import { processLogoVariants } from '../utils/logo-processor';

/**
 * Astro integration that processes logo SVGs and generates variants
 */
export function logoProcessor(): AstroIntegration {
  const processLogos = async () => {
    const logosDir = join(process.cwd(), 'src/content/logos');
    const outputDir = join(process.cwd(), 'public/logos');

    if (!existsSync(logosDir)) {
      return;
    }

    // Process each company folder
    const companyFolders = readdirSync(logosDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const companyFolder of companyFolders) {
      const companyPath = join(logosDir, companyFolder);
      const files = readdirSync(companyPath);
      
      // Find the main SVG file (same name as folder)
      const svgFile = files.find(file => file === `${companyFolder}.svg`);
      
      if (svgFile) {
        const svgPath = join(companyPath, svgFile);
        console.log(`Processing logo: ${companyFolder}`);
        
        // Copy original SVG to public
        const originalOutputPath = join(outputDir, `${companyFolder}.svg`);
        if (!existsSync(outputDir)) {
          mkdirSync(outputDir, { recursive: true });
        }
        copyFileSync(svgPath, originalOutputPath);
        
        // Generate variants
        processLogoVariants(svgPath, outputDir);
      }
    }
  };

  return {
    name: 'logo-processor',
    hooks: {
      'astro:config:setup': async () => {
        await processLogos();
      },
      'astro:build:start': async () => {
        await processLogos();
      },
    },
  };
}
