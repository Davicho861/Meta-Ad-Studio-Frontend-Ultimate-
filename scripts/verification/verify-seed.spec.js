const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

test('verify seed injection and capture final gallery screenshot (js)', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  const seedUrl = `${base.replace(/\/$/, '')}/seed-celestia.html`;

  await page.goto(seedUrl, { waitUntil: 'networkidle' });

  const resultPre = page.locator('pre#result');
  await expect(resultPre).toHaveText(/Seed injected to localStorage key:/, { timeout: 5000 });

  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const gallerySelectors = [
    'a:has-text("Gallery")',
    'a:has-text("Galería")',
    'a:has-text("Plantillas")',
    'button:has-text("Gallery")',
    'button:has-text("Galería")',
  ];

  for (const sel of gallerySelectors) {
    const el = page.locator(sel);
    if (await el.count() > 0) {
      try { await el.first().click(); break; } catch { }
    }
  }

  await page.waitForTimeout(1000);
  const galleryContainer = page.locator('main, [role="main"], .gallery, .templates, [data-testid="gallery"]');
  await expect(galleryContainer.first()).toBeVisible({ timeout: 5000 });

  const outPath = path.resolve(process.cwd(), 'FINAL_VERIFICATION.png');
  await page.screenshot({ path: outPath, fullPage: true });

  const seededTextLocator = page.locator('text=Celestia').first();
  const seededAltLocator = page.locator('img[alt*="Celestia"]');

  const found = (await seededTextLocator.count()) > 0 || (await seededAltLocator.count()) > 0;

  const evidence = { base, seedUrl, screenshot: outPath, found };
  fs.writeFileSync(path.resolve(process.cwd(), 'FINAL_VERIFICATION.json'), JSON.stringify(evidence, null, 2));

  expect(found).toBeTruthy();
});
