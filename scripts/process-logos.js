const { readdirSync, existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');

const logosDir = join(process.cwd(), 'src/content/logos');
const outputDir = join(process.cwd(), 'public/logos');

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Get all company folders
const companyFolders = readdirSync(logosDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

// Process each company folder
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
    copyFileSync(svgPath, originalOutputPath);
    
    // Generate variants
    const svgContent = readFileSync(svgPath, 'utf-8');
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
    
    // Process variants
    ['black', 'white'].forEach(variant => {
      const targetColor = variant === 'black' ? '#000000' : '#FFFFFF';
      
      function processElement(element) {
        if (typeof element !== 'object' || element === null) {
          return element;
        }
        if (Array.isArray(element)) {
          return element.map(processElement);
        }
        const processed = {};
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
      const convertedSvg = builder.build(processedSvg);
      const outputPath = join(outputDir, `${companyFolder}-${variant}.svg`);
      writeFileSync(outputPath, convertedSvg, 'utf-8');
      console.log(`  Generated ${variant} variant`);
    });
  }
  
  // Copy favicon file if it exists
  const faviconFile = files.find(file => file === `${companyFolder}-favicon.svg`);
  if (faviconFile) {
    const faviconPath = join(companyPath, faviconFile);
    const faviconOutputPath = join(outputDir, `${companyFolder}-favicon.svg`);
    copyFileSync(faviconPath, faviconOutputPath);
    console.log(`  Copied favicon`);
  }
}

console.log('Logo processing complete!');
