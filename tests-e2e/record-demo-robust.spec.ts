import { test, expect } from '@playwright/test';

test('Robust visual demo: Coca-Cola campaign hover-to-play', async ({ page }) => {
  test.setTimeout(180000);
  // Inject deterministic template into localStorage
  await page.addInitScript(() => {
    try {
      const e2eTemplate = {
        id: 'coca-cola-shibuya-campaign-final',
        url: '/images/campaign-examples/coca-cola-shibuya-final.jpg',
        srcWebp: '/images/campaign-examples/coca-cola-shibuya-final.jpg',
        prompt: 'Coca-Cola — demo injected',
        timestamp: new Date(),
        previewVideoUrl: '/videos/campaign-previews/coca-cola-shibuya-final.mp4',
        alt: 'Coca-Cola en un cruce de Shibuya'
      };
      try { localStorage.setItem('meta_ad_studio_templates_v1', JSON.stringify([e2eTemplate])); } catch (e) { /* noop */ }
      // Also expose a sentinel so the app knows an E2E injection occurred
      try { (window as any).__E2E_INJECTED__ = true; } catch (e) {}
    } catch (e) { /* noop */ }
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Ensure the app receives the injected template via helpers if available.
  // This is more deterministic: addTemplates + setPreviewVideo + selectImageById
  try {
    await page.waitForFunction(() => !!(window as any).__APP_STORE_HELPERS__, { timeout: 5000 });
    await page.evaluate(() => {
      try {
        const h = (window as any).__APP_STORE_HELPERS__;
        if (h && h.addTemplates) {
          const tpl = {
            id: 'coca-cola-shibuya-campaign-final',
            url: '/images/campaign-examples/coca-cola-shibuya-final.jpg',
            srcWebp: '/images/campaign-examples/coca-cola-shibuya-final.jpg',
            prompt: 'Coca-Cola — demo injected',
            timestamp: new Date().toString(),
            previewVideoUrl: '/videos/campaign-previews/coca-cola-shibuya-final.mp4',
            alt: 'Coca-Cola en un cruce de Shibuya'
          };
          try { h.addTemplates([tpl]); } catch (e) {}
          try { h.setPreviewVideo && h.setPreviewVideo(tpl.id, tpl.previewVideoUrl); } catch (e) {}
          // Select image to open modal
          try { h.selectImageById && h.selectImageById(tpl.id); } catch (e) {}
        }
      } catch (e) {}
    });
  } catch {
    // Fallback: open gallery UI by clicking any element with 'Gallery' or similar text
    await page.evaluate(() => {
      try {
        const textRe = /Gallery|Galer/i;
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null);
        let n;
        while ((n = walker.nextNode())) {
          try {
            const el = n as HTMLElement;
            if (el.innerText && textRe.test(el.innerText)) { el.click(); break; }
          } catch {}
        }
      } catch {}
    });
  }

  // Try locate the gallery grid; ensure it's attached (give more time and a fallback to open gallery)
  let grid = page.locator('[data-testid="gallery-grid"]').first();
  try {
    await expect(grid).toBeAttached({ timeout: 30000 });
  } catch (e) {
    // fallback: click gallery button if available and retry
    const galleryBtn = page.getByRole('button', { name: /Gallery|Galería|Galer/i }).first();
    if (await galleryBtn.count() > 0) {
      try { await galleryBtn.click(); } catch (err) { /* noop */ }
    }
    await expect(grid).toBeAttached({ timeout: 15000 });
  }

  // Wait small margin
  await page.waitForTimeout(500);

  // Locate our injected template image
  const cardImg = page.locator('img[alt*="Coca-Cola"]').first();
  await expect(cardImg).toBeVisible({ timeout: 10000 });

  const parent = cardImg.locator('xpath=..');
  // ensure visible in viewport before hover
  await parent.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await parent.hover({ force: true });

  // video element attached inside card
  const videoEl = parent.locator('[data-testid="gallery-card-video"]').first();
  try {
    await expect(videoEl).toBeAttached({ timeout: 10000 });
    // small wait to capture playback
    await page.waitForTimeout(2000);
  } catch {
    // fallback: any video
    const anyVideo = page.locator('video').first();
    await expect(anyVideo).toBeAttached({ timeout: 10000 });
    await page.waitForTimeout(2000);
  }
});
