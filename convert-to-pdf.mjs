import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'index.html');
const pdfPath = path.join(__dirname, 'cv-galih-prasetyo.pdf');

async function main() {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  
  const browser = await chromium.launch({ headless: true });
  
  // A4 exact dimensions
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12; // mm

  const page = await browser.newPage({
    viewport: {
      width: Math.round((pageWidth - margin * 2) * 3.78), // mm to px at 96dpi
      height: Math.round((pageHeight - margin * 2) * 3.78),
    },
    deviceScaleFactor: 2,
  });
  
  await page.setContent(html, { waitUntil: 'networkidle', timeout: 15000 });
  
  // Wait a bit for fonts and batik SVGs to render
  await page.waitForTimeout(1000);
  
  await page.pdf({
    path: pdfPath,
    width: `${pageWidth}mm`,
    height: `${pageHeight}mm`,
    printBackground: true,
    margin: {
      top: `${margin}mm`,
      bottom: `${margin}mm`,
      left: `${margin}mm`,
      right: `${margin}mm`,
    },
    displayHeaderFooter: false,
    preferCSSPageSize: false,
  });
  
  await browser.close();
  
  const stats = fs.statSync(pdfPath);
  console.log(`✅ PDF generated: cv-galih-prasetyo.pdf`);
  console.log(`   Size: ${(stats.size / 1024).toFixed(1)} KB`);
  console.log(`   Dimensions: ${pageWidth}mm × ${pageHeight}mm (A4)`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
