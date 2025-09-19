import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';

test('verify seed injection and capture final gallery screenshot (js copied)', async ({ page }) => {
  // Use relative URL so Playwright's baseURL is used reliably
  // Navigate to the seed page. The seed page may redirect after writing to localStorage;
  // tolerate an aborted navigation and continue to assert the presence/content of pre#result.
  try {
    await page.goto('/seed-celestia.html?noredirect=1', { waitUntil: 'domcontentloaded', timeout: 20000 });
  } catch (err) {
    // navigation may be aborted by the seed script redirecting; that's acceptable
  }

  // derive base for evidence from actual page URL (useful if redirect occurred)
  const base = new URL(page.url()).origin;
  const seedUrl = page.url();

  // Wait until the seed writes templates into localStorage (more robust than relying on the pre element)
  await page.waitForFunction(() => !!window.localStorage.getItem('meta_ad_studio_templates_v1'), {}, { timeout: 10000 }).catch(() => {});

  // If the pre#result exists, assert its text; otherwise continue using localStorage evidence
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

  // If no gallery link found, try opening the Templates modal via the explicit button
  if (!clicked) {
    const templatesBtn = page.getByRole('button', { name: /Abrir plantillas|Plantillas|Templates/i });
    if (await templatesBtn.count() > 0) {
      await templatesBtn.first().click();
      clicked = true;
    }
  }

  await page.waitForTimeout(1000);

  // Prefer the gallery container, otherwise fall back to the Templates modal container
  let galleryContainer = page.locator('main, [role="main"], .gallery, .templates, [data-testid="gallery"]');
  if ((await galleryContainer.first().count()) === 0) {
    const modal = page.locator('div[role="dialog"], div.bg-card').filter({ hasText: 'Plantillas' });
    if (await modal.count() > 0) galleryContainer = modal;
  }

  await expect(galleryContainer.first()).toBeVisible({ timeout: 5000 });

  const outPath = path.resolve(process.cwd(), 'FINAL_VERIFICATION.png');
  await page.screenshot({ path: outPath, fullPage: true });

  // More robust: inspect localStorage directly on the app root to find seeded templates
  await page.goto('/', { waitUntil: 'load' });
  const lsRaw = await page.evaluate(() => window.localStorage.getItem('meta_ad_studio_templates_v1'));
  let found = false;
  try {
    const parsed = JSON.parse(lsRaw || 'null');
    // support either { templates: [...] } or an array
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
