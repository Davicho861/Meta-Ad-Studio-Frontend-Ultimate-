import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// This test is designed to run against the local dev server started separately.
// It visits the seed page which injects templates into localStorage and then
// navigates to the app gallery to capture a screenshot that proves the
// "Celestia" campaign is visible.

test('verify seed injection and capture final gallery screenshot', async ({ page, browser }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  const seedUrl = `${base.replace(/\/$/, '')}/seed-celestia.html`;

  // Visit seed page which injects into localStorage and redirects back to / or /campaigns
  await page.goto(seedUrl, { waitUntil: 'networkidle' });

  // Wait for the seed page to write result element
  const resultPre = page.locator('pre#result');
  await expect(resultPre).toHaveText(/Seed injected to localStorage key:/, { timeout: 5000 });

  // After injection the seed page triggers a redirect; navigate to the gallery root
  await page.goto(base + '/', { waitUntil: 'networkidle' });

  // Give the app a moment to read localStorage and render templates
  await page.waitForTimeout(1500);

  // Try to click the Gallery or Templates navigation. We try multiple selectors
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
      try { await el.first().click(); break; } catch { /* ignore */ }
    }
  }

  // Wait for gallery modal or grid to appear; heuristics: an element with aria-label or heading
  await page.waitForTimeout(1000);

  // Prefer modal/gallery container selectors used in app
  const galleryContainer = page.locator('main, [role="main"], .gallery, .templates, [data-testid="gallery"]');
  await expect(galleryContainer.first()).toBeVisible({ timeout: 5000 });

  // Take a full page screenshot and also a focused clip on the gallery area
  const outPath = path.resolve(process.cwd(), 'FINAL_VERIFICATION.png');
  await page.screenshot({ path: outPath, fullPage: true });

  // Also try to assert that the seeded campaign text or alt exists
  const seededTextLocator = page.locator('text=Celestia').first();
  const seededAltLocator = page.locator('img[alt*="Celestia"]');

  const found = (await seededTextLocator.count()) > 0 || (await seededAltLocator.count()) > 0;

  // Save a simple evidence file for CI as well
  const evidence = { base, seedUrl, screenshot: outPath, found };
  fs.writeFileSync(path.resolve(process.cwd(), 'FINAL_VERIFICATION.json'), JSON.stringify(evidence, null, 2));

  // Hard assertion only if found; otherwise still leave the screenshot for manual inspection
  expect(found).toBeTruthy();
});
