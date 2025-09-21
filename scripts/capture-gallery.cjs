// simple Playwright screenshot script (CommonJS)
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/tmp/gallery.png', fullPage: true });
  await browser.close();
  console.log('saved /tmp/gallery.png');
})();
