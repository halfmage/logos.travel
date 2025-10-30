import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

interface ProcessSvgOptions {
  inputPath: string;
  outputDir: string;
  variant: 'black' | 'white';
}

/**
 * Converts colored SVG to black or white variant
 */
function convertSvgColor(svgContent: string, variant: 'black' | 'white'): string {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseAttributeValue: true,
  });
  
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true,
  });

  const svgObj = parser.parse(svgContent);
  const targetColor = variant === 'black' ? '#000000' : '#FFFFFF';

  // Recursively process all elements to replace fill and stroke colors
  function processElement(element: any): any {
    if (typeof element !== 'object' || element === null) {
      return element;
    }

    if (Array.isArray(element)) {
      return element.map(processElement);
    }

    const processed: any = {};

    for (const [key, value] of Object.entries(element)) {
      if (key === '@_fill' && value && value !== 'none' && value !== 'transparent') {
        processed[key] = targetColor;
      } else if (key === '@_stroke' && value && value !== 'none' && value !== 'transparent') {
        processed[key] = targetColor;
      } else if (typeof value === 'object') {
        processed[key] = processElement(value);
      } else {
        processed[key] = value;
      }
    }

    return processed;
  }

  const processedSvg = processElement(svgObj);
  return builder.build(processedSvg);
}

/**
 * Process an SVG file and generate black/white variants
 */
export function processSvg({ inputPath, outputDir, variant }: ProcessSvgOptions): string {
  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Read original SVG
  const svgContent = readFileSync(inputPath, 'utf-8');

  // Convert colors
  const convertedSvg = convertSvgColor(svgContent, variant);

  // Generate output filename
  const filename = inputPath.split('/').pop()?.replace('.svg', '') || 'logo';
  const outputFilename = `${filename}-${variant}.svg`;
  const outputPath = join(outputDir, outputFilename);

  // Write converted SVG
  writeFileSync(outputPath, convertedSvg, 'utf-8');

  return outputPath;
}

/**
 * Process all SVG variants for a logo
 */
export function processLogoVariants(originalSvgPath: string, outputDir: string) {
  const variants = ['black', 'white'] as const;
  const results: Record<string, string> = {};

  for (const variant of variants) {
    const outputPath = processSvg({
      inputPath: originalSvgPath,
      outputDir,
      variant: variant as 'black' | 'white',
    });
    results[variant] = outputPath;
  }

  return results;
}
