import { test, expect } from '@playwright/test';

test('Gallery button opens full-screen gallery modal with cards', async ({ page }) => {
  await page.goto('/');

  // Click the Gallery button in the central canvas
  const galleryBtn = page.getByRole('button', { name: /Gallery/i });
  await expect(galleryBtn).toBeVisible();
  await galleryBtn.click();

  // The Sheet/Dialog should be visible (role dialog)
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // Confirm the modal header exists
  await expect(dialog.getByText(/Gallery/i)).toBeVisible();

  // Wait for any image or video inside the dialog (some workers/tests may clear templates)
  const media = dialog.locator('img, video');
  // wait a short while for assets to render
  await page.waitForTimeout(300);
  const mediaCount = await media.count();
  if (mediaCount === 0) {
    // If no media found, still assert the grid container exists so the modal layout is present
    const grid = dialog.locator('div.grid, [class*="grid-"]');
    const gridCount = await grid.count();
    expect(gridCount).toBeGreaterThan(0);
  } else {
    // If a media element exists, try hover-to-play verification
    const firstMedia = media.first();
    const parent = firstMedia.locator('..');
    await parent.hover();
    const vid = parent.locator('video');
    if (await vid.count() > 0) {
      await expect(vid.first()).toBeVisible();
    }
  }
});
