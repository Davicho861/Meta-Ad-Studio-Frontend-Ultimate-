import { test, expect } from '@playwright/test';

test('should display the user-generated video campaign', async ({ page }) => {
  test.setTimeout(60000);
  // Pre-populate localStorage before the app loads so gallery reads templates on boot.
  await page.addInitScript(() => {
    try {
      localStorage.setItem('prometeo_telemetry_consent_v1', 'granted');
      const key = 'meta_ad_studio_templates_v1';
      const newCampaign = [{ id: 'user-campaign-1758318123', type: 'uploaded', url: '/output/user-campaign-1758318123/image.jpg', previewVideoUrl: '/output/user-campaign-1758318123/video.mp4', alt: 'Campaña personalizada del usuario', credit: 'Creado por el usuario', prompt: 'Campaña personalizada creada a partir de la imagen del usuario.', timestamp: new Date() }];
      try { localStorage.setItem(key, JSON.stringify(newCampaign)); } catch (e) { /* noop */ }
    } catch (e) { /* noop */ }
  });

  // Navegar y permitir que la app cargue con los templates ya presentes
  await page.goto('/');

  // Abrir la galería (si hay botón)
  const galleryButton = page.getByRole('button', { name: /Gallery|Galería/i }).first();
  if (await galleryButton.count() > 0) {
    await galleryButton.click();
  }

  await page.waitForSelector('[data-testid="gallery-grid"]', { timeout: 15000 });
  const userImg = page.locator('img[alt="Campaña personalizada del usuario"]').first();
  await expect(userImg).toBeVisible({ timeout: 10000 });

  const userCampaignCard = userImg.locator('xpath=..');
  await userCampaignCard.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await userCampaignCard.hover({ force: true });
  const videoPlayer = userCampaignCard.locator('[data-testid="gallery-card-video"]');
  await expect(videoPlayer).toBeVisible({ timeout: 10000 });

  console.log('🎉 ¡VERIFICADO! Tu imagen convertida en video está funcionando en la galería.');
  await page.screenshot({ path: 'USER_CAMPAIGN_SUCCESS.png' });
  await page.waitForTimeout(4000);
});
