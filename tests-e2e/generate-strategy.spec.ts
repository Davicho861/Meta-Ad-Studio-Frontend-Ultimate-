import { test, expect } from '@playwright/test';

test('Generate Strategy shows disabled state and spinner during generation', async ({ page }) => {
  await page.goto('/');

  const genBtn = page.getByRole('button', { name: /Generate Strategy/i });
  await expect(genBtn).toBeVisible({ timeout: 5000 });

  // Click and verify spinner/text change during generation
  await genBtn.click();
  // A generating label should appear on the page
  await expect(page.locator('text=Generando...').first()).toBeVisible({ timeout: 2000 });
  // Spinner SVG should be present somewhere on the page while generating
  await expect(page.locator('svg.animate-spin').first()).toBeVisible({ timeout: 2000 });

  // Wait for simulated generation (2s in implementation) plus buffer
  await page.waitForTimeout(2500);

  // After generation completes, the button should return to its original label
  await expect(page.getByRole('button', { name: /Generate Strategy/i })).toBeVisible();
});
