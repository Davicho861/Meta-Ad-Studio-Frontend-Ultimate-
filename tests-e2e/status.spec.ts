import { test, expect } from '@playwright/test';

test.describe('SDLC Mission Control /status', () => {
  test('renders widgets and assets download link', async ({ page }) => {
  // Use relative path so Playwright's baseURL from config is used
  await page.goto('/status');
    await expect(page.locator('text=Quality Metrics')).toBeVisible();
    await expect(page.locator('text=SDLC Progress')).toBeVisible();
    await expect(page.locator('text=Release Assets')).toBeVisible();
    // If a download link exists, it should have an href
    const download = page.locator('text=Download').first();
    if (await download.count() > 0) {
      const href = await download.getAttribute('href');
      expect(href).not.toBeNull();
    }
  });
});
