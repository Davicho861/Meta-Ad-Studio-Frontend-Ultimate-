const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG>', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR>', err.toString()));

  try {
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle' });
    // wait a bit to allow client-side asset checker to run
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/asset-checker.png', fullPage: true });
  } catch (e) {
    console.error('Error navigating:', e);
  } finally {
    await browser.close();
  }
})();
