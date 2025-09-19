const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const reportDir = path.resolve(__dirname, '..', 'test-results', 'playwright-report-live-demo-2025-09-18');
  const indexPath = 'file://' + path.join(reportDir, 'index.html');
  const outPdf = path.join(reportDir, 'report.pdf');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(indexPath, { waitUntil: 'networkidle' });
  await page.waitForTimeout(200);
  await page.pdf({ path: outPdf, format: 'A4' });
  await browser.close();
  console.log('PDF generado en:', outPdf);
})();
