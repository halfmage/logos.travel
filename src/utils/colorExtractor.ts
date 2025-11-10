import { XMLParser } from 'fast-xml-parser';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Converts various color formats to hex
 */
function normalizeColor(color: string): string | null {
  if (!color || color === 'none' || color === 'transparent') {
    return null;
  }

  // Remove whitespace
  color = color.trim();

  // Already hex format (#RRGGBB or #RGB)
  if (color.startsWith('#')) {
    if (color.length === 4) {
      // Convert #RGB to #RRGGBB
      return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toUpperCase();
    }
    if (color.length === 7) {
      return color.toUpperCase();
    }
    return null;
  }

  // RGB/RGBA format: rgb(255, 0, 0) or rgba(255, 0, 0, 1)
  if (color.startsWith('rgb')) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]).toString(16).padStart(2, '0');
      const g = parseInt(match[2]).toString(16).padStart(2, '0');
      const b = parseInt(match[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`.toUpperCase();
    }
  }

  // Named colors (basic set)
  const namedColors: Record<string, string> = {
    black: '#000000',
    white: '#FFFFFF',
    red: '#FF0000',
    green: '#00FF00',
    blue: '#0000FF',
    yellow: '#FFFF00',
    cyan: '#00FFFF',
    magenta: '#FF00FF',
    gray: '#808080',
    grey: '#808080',
    silver: '#C0C0C0',
    maroon: '#800000',
    olive: '#808000',
    lime: '#00FF00',
    aqua: '#00FFFF',
    teal: '#008080',
    navy: '#000080',
    fuchsia: '#FF00FF',
    purple: '#800080',
  };

  const lowerColor = color.toLowerCase();
  if (namedColors[lowerColor]) {
    return namedColors[lowerColor];
  }

  return null;
}

/**
 * Extracts gradient ID from a URL reference (e.g., "url(#gradientId)" -> "gradientId")
 */
function extractGradientId(urlValue: string): string | null {
  if (!urlValue || typeof urlValue !== 'string') {
    return null;
  }
  const match = urlValue.match(/url\(#([^)]+)\)/);
  return match ? match[1] : null;
}

/**
 * Extracts colors from gradient definitions (linearGradient, radialGradient)
 */
function extractColorsFromGradient(gradient: any, colors: Set<string>): void {
  if (!gradient || typeof gradient !== 'object') {
    return;
  }

  // Handle array of stops
  if (Array.isArray(gradient.stop)) {
    gradient.stop.forEach((stop: any) => {
      if (stop['@_stop-color']) {
        const color = normalizeColor(stop['@_stop-color']);
        if (color) {
          colors.add(color);
        }
      }
    });
  } else if (gradient.stop) {
    // Single stop
    if (gradient.stop['@_stop-color']) {
      const color = normalizeColor(gradient.stop['@_stop-color']);
      if (color) {
        colors.add(color);
      }
    }
  }
}

/**
 * Finds and extracts colors from gradients in the SVG defs section
 */
function extractGradientColors(svgRoot: any, gradientIds: Set<string>, colors: Set<string>): void {
  if (!svgRoot || typeof svgRoot !== 'object') {
    return;
  }

  // Look for defs section
  const defs = svgRoot.svg?.defs || svgRoot.defs;
  if (!defs) {
    return;
  }

  // Process linearGradient
  if (defs.linearGradient) {
    const gradients = Array.isArray(defs.linearGradient) 
      ? defs.linearGradient 
      : [defs.linearGradient];
    
    gradients.forEach((gradient: any) => {
      const gradientId = gradient['@_id'];
      if (gradientId && gradientIds.has(gradientId)) {
        extractColorsFromGradient(gradient, colors);
      }
    });
  }

  // Process radialGradient
  if (defs.radialGradient) {
    const gradients = Array.isArray(defs.radialGradient) 
      ? defs.radialGradient 
      : [defs.radialGradient];
    
    gradients.forEach((gradient: any) => {
      const gradientId = gradient['@_id'];
      if (gradientId && gradientIds.has(gradientId)) {
        extractColorsFromGradient(gradient, colors);
      }
    });
  }
}

/**
 * Recursively extracts colors from SVG elements
 */
function extractColorsFromElement(element: any, colors: Set<string>, gradientIds: Set<string>): void {
  if (!element || typeof element !== 'object') {
    return;
  }

  // Extract fill and stroke attributes
  if (element['@_fill']) {
    const fillValue = element['@_fill'];
    const gradientId = extractGradientId(fillValue);
    if (gradientId) {
      gradientIds.add(gradientId);
    } else {
      const color = normalizeColor(fillValue);
      if (color) {
        colors.add(color);
      }
    }
  }

  if (element['@_stroke']) {
    const strokeValue = element['@_stroke'];
    const gradientId = extractGradientId(strokeValue);
    if (gradientId) {
      gradientIds.add(gradientId);
    } else {
      const color = normalizeColor(strokeValue);
      if (color) {
        colors.add(color);
      }
    }
  }

  // Recursively process child elements
  if (Array.isArray(element)) {
    element.forEach((item) => extractColorsFromElement(item, colors, gradientIds));
  } else {
    // Process all object properties
    for (const key in element) {
      if (key === '@_fill' || key === '@_stroke') {
        // Already processed above
        continue;
      }
      const value = element[key];
      if (typeof value === 'object' && value !== null) {
        extractColorsFromElement(value, colors, gradientIds);
      }
    }
  }
}

/**
 * Extracts unique colors from an SVG file
 */
export function extractColorsFromSVG(svgPath: string): string[] {
  try {
    const svgContent = readFileSync(svgPath, 'utf-8');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });

    const parsed = parser.parse(svgContent);
    const colors = new Set<string>();
    const gradientIds = new Set<string>();

    // Extract colors from the SVG structure and collect gradient references
    extractColorsFromElement(parsed, colors, gradientIds);

    // Extract colors from gradient definitions
    if (gradientIds.size > 0) {
      extractGradientColors(parsed, gradientIds, colors);
    }

    // Sort colors (put black/white at the end, others by brightness)
    const colorArray = Array.from(colors);
    return colorArray.sort((a, b) => {
      // Put black and white at the end
      if (a === '#000000') return 1;
      if (b === '#000000') return -1;
      if (a === '#FFFFFF') return 1;
      if (b === '#FFFFFF') return -1;

      // Sort others by brightness (simple heuristic)
      const brightnessA = getBrightness(a);
      const brightnessB = getBrightness(b);
      return brightnessB - brightnessA; // Brightest first
    });
  } catch (error) {
    console.error(`Error extracting colors from ${svgPath}:`, error);
    return [];
  }
}

/**
 * Calculate relative brightness of a color (0-255)
 */
function getBrightness(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Using relative luminance formula
  return (r * 299 + g * 587 + b * 114) / 1000;
}

