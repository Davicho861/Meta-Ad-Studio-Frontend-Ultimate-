/**
 * Injector Playwright (CommonJS).
 * Uso: node scripts/seed/seed-celestia-playwright.cjs [url]
 * Ejemplo: node scripts/seed/seed-celestia-playwright.cjs http://localhost:5173
 */

const fs = require('fs');
const path = require('path');

async function main() {
  const url = process.argv[2] || 'http://localhost:5173';
  const seedPath = path.resolve(process.cwd(), 'seed-celestia.json');
  if (!fs.existsSync(seedPath)) {
    console.error('seed-celestia.json not found. Run `npm run seed:celestia` first.');
    process.exit(1);
  }
  const payload = fs.readFileSync(seedPath, 'utf-8');

  // Use @playwright/test's chromium (available in devDependencies)
  const { chromium } = require('@playwright/test');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Opening', url);
    await page.goto(url, { timeout: 30000 }).catch(e => { throw e; });
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

    // Inject into localStorage
    await page.evaluate((key, value) => {
      window.localStorage.setItem(key, value);
    }, 'meta_ad_studio_templates_v1', payload);

    console.log('Seed injected to localStorage at', url);
  } catch (err) {
    console.error('Error navigating or injecting to', url, err && err.message ? err.message : err);
    process.exitCode = 2;
  } finally {
    try { await browser.close(); } catch (e) { /* noop */ }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
