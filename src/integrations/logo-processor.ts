import type { AstroIntegration } from 'astro';
import { readdirSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';

/**
 * Astro integration that copies logo SVG files from company folders to public/logos
 * Keeps logos organized in src/content/logos/companyNAME/ alongside JSON files
 */
export function logoProcessor(): AstroIntegration {
  const processLogos = async () => {
    const logosDir = join(process.cwd(), 'src/content/logos');
    const outputDir = join(process.cwd(), 'public/logos');

    if (!existsSync(logosDir)) {
      return;
    }

    // Ensure output directory exists
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Process each company folder
    const companyFolders = readdirSync(logosDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const companyFolder of companyFolders) {
      const companyPath = join(logosDir, companyFolder);
      const files = readdirSync(companyPath);
      
      // Copy all SVG files from the company folder to public/logos
      const svgFiles = files.filter(file => file.endsWith('.svg'));
      
      for (const svgFile of svgFiles) {
        const sourcePath = join(companyPath, svgFile);
        const destPath = join(outputDir, svgFile);
        copyFileSync(sourcePath, destPath);
      }
      
      if (svgFiles.length > 0) {
        console.log(`✓ Copied ${svgFiles.length} logo file(s) for ${companyFolder}`);
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

