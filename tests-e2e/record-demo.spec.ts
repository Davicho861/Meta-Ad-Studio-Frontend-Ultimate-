import { test, expect } from '@playwright/test';

test('Visual Demonstration of the Final Campaign', async ({ page }) => {
  // Ensure deterministic test data: inject the coca-cola template into localStorage before page loads
  await page.addInitScript(() => {
    try {
      const e2eTemplate = {
        id: 'coca-cola-shibuya-campaign-final',
        url: '/images/campaign-examples/coca-cola-shibuya-final.jpg',
        previewVideoUrl: '/videos/campaign-previews/coca-cola-shibuya-final.mp4',
        prompt: "Campaña 'El Brindis Sincronizado' para Coca-Cola en Shibuya",
        timestamp: new Date(),
        alt: 'Coca-Cola en un cruce de Shibuya',
      };
      try { localStorage.setItem('meta_ad_studio_templates_v1', JSON.stringify([e2eTemplate])); } catch (e) { /* noop */ }
    } catch (e) { /* noop */ }
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // The Gallery modal may not open automatically. Try to find the grid; if missing, open the Gallery via the UI button.
  let grid = page.locator('[data-testid="gallery-grid"]').first();
  try {
    await expect(grid).toBeAttached({ timeout: 3000 });
  } catch (e) {
    // Click the Gallery button in the header and wait for the grid.
    const galleryBtn = page.getByRole('button', { name: /Gallery|Galer/ });
    if (await galleryBtn.count() > 0) await galleryBtn.first().click();
    grid = page.locator('[data-testid="gallery-grid"]').first();
    await expect(grid).toBeAttached({ timeout: 15000 });
  }

  // Debugging info (helpful if tests fail)
  const gridCount = await page.locator('[data-testid="gallery-grid"]').count();
  const gridHtml = await page.locator('[data-testid="gallery-grid"]').first().innerHTML();
  console.log('DEBUG: gallery-grid count=', gridCount);
  console.log('DEBUG: gallery-grid innerHTML=', gridHtml.substring(0, 800));

  // Locate the coca-cola image either by alt or by src
  let cocaColaImg = page.locator('img[alt*=Coca-Cola]').first();
  if ((await cocaColaImg.count()) === 0) {
    cocaColaImg = page.locator('img[src*="coca-cola-shibuya-final"]').first();
  }
  await expect(cocaColaImg).toBeVisible({ timeout: 10000 });

  const videoEl = grid.locator('[data-testid="gallery-card-video"]').first();
  try {
    await expect(videoEl).toBeAttached({ timeout: 10000 });
  } catch {
    // fallback: any video on page
    await expect(page.locator('video').first()).toBeAttached({ timeout: 10000 });
  }

  // hover parent card to trigger playback
  const card = cocaColaImg.locator('xpath=..');
  await card.scrollIntoViewIfNeeded();
  await card.hover({ force: true });
  await page.waitForTimeout(3000);
  // Move mouse away
  await page.mouse.move(0, 0);
});
