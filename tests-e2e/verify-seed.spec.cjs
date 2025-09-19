const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

test('verify seed injection and capture final gallery screenshot (cjs)', async ({ page }) => {
  try {
    await page.goto('/seed-celestia.html?noredirect=1', { waitUntil: 'domcontentloaded', timeout: 20000 });
  } catch (err) {
    // allowed: seed page may redirect after injection
  }
  const base = new URL(page.url()).origin;
  const seedUrl = page.url();

  try {
    await page.waitForFunction(() => !!window.localStorage.getItem('meta_ad_studio_templates_v1'), {}, { timeout: 10000 });
  } catch (e) {
    // continue; fallback to checking element if present
  }

  const resultPre = page.locator('pre#result').first();
  if (await resultPre.count() > 0) {
    await expect(resultPre).toHaveText(/Seed injected to localStorage key:/, { timeout: 5000 });
  }

  await page.goto('/', { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  const gallerySelectors = [
    'a:has-text("Gallery")',
    'a:has-text("Galería")',
    'a:has-text("Plantillas")',
    'button:has-text("Gallery")',
    'button:has-text("Galería")',
  ];
  let clicked = false;
  for (const sel of gallerySelectors) {
    const el = page.locator(sel);
    if (await el.count() > 0) {
      try { await el.first().click(); clicked = true; break; } catch { }
    }
  }

  if (!clicked) {
    const templatesBtn = page.getByRole('button', { name: /Abrir plantillas|Plantillas|Templates/i });
    if (await templatesBtn.count() > 0) {
      await templatesBtn.first().click();
      clicked = true;
    }
  }

  await page.waitForTimeout(1000);

  let galleryContainer = page.locator('main, [role="main"], .gallery, .templates, [data-testid="gallery"]');
  if ((await galleryContainer.first().count()) === 0) {
    const modal = page.locator('div[role="dialog"], div.bg-card').filter({ hasText: 'Plantillas' });
    if (await modal.count() > 0) galleryContainer = modal;
  }

  await expect(galleryContainer.first()).toBeVisible({ timeout: 5000 });

  const outPath = path.resolve(process.cwd(), 'FINAL_VERIFICATION.png');
  await page.screenshot({ path: outPath, fullPage: true });

  await page.goto('/', { waitUntil: 'load' });
  const lsRaw = await page.evaluate(() => window.localStorage.getItem('meta_ad_studio_templates_v1'));
  let found = false;
  try {
    const parsed = JSON.parse(lsRaw || 'null');
    const arr = Array.isArray(parsed) ? parsed : (parsed && Array.isArray(parsed.templates) ? parsed.templates : []);
    found = arr.some(item => {
      const s = JSON.stringify(item).toLowerCase();
      return s.includes('celestia') || s.includes('brindis') || s.includes('el brindis');
    });
  } catch (e) {
    found = false;
  }

  const evidence = { base, seedUrl, screenshot: outPath, found };
  fs.writeFileSync(path.resolve(process.cwd(), 'FINAL_VERIFICATION.json'), JSON.stringify(evidence, null, 2));

  expect(found).toBeTruthy();
});
