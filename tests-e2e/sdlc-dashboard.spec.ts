import { test, expect } from '@playwright/test';

test.describe('SDLC Dashboard (Mission Control)', () => {
  test('renders mission control with widgets and mock data', async ({ page }) => {
    await page.goto('/status', { waitUntil: 'load' });
    await expect(page.getByRole('heading', { name: /Meta Ad Studio Mission Control/i })).toBeVisible();

    // Check widgets presence by headings
    await expect(page.getByRole('heading', { name: /CI\/CD Pipeline/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Quality Metrics/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /SDLC Progress/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Release Assets/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Observability/i })).toBeVisible();

  // Verify CI pipeline mock shows at least one Passed stage
  await expect(page.getByText(/✅ Passed|Passed/).first()).toBeVisible();

    // Verify quality metrics numbers from mock are present
    await expect(page.getByText(/Coverage: .*%/)).toBeVisible();

  // Visual regression: full page screenshot
  await expect(page).toHaveScreenshot();
  });
});
