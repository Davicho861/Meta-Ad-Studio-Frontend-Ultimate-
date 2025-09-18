import { test, expect } from '@playwright/test';

test('eliminar plantilla con confirmación', async ({ page }) => {
  // Use baseURL from playwright.config
  await page.goto('/');

  // Abrir modal de plantillas
  await page.getByRole('button', { name: 'Abrir plantillas' }).click();

  // Wait for modal to appear
  await expect(page.getByText('Plantillas')).toBeVisible();

  // Count cards and ensure at least one exists
  const cards = page.locator('div.grid > div');
  const initialCount = await cards.count();
  expect(initialCount).toBeGreaterThan(0);

  // Click Eliminar for the first card using JS click to avoid viewport issues in headless
  const firstEliminar = page.getByRole('button', { name: /eliminar/i }).first();
  await firstEliminar.evaluate((el: HTMLElement) => el.click());

  // Confirm dialog should appear and confirm
  const confirmar = page.getByRole('button', { name: /confirmar/i });
  await expect(confirmar).toBeVisible();
  // Use JS click to avoid pointer interception issues in headless mode
  await confirmar.evaluate((el: HTMLElement) => el.click());

  // Expect the number of cards to decrease by one
  await expect(page.locator('div.grid > div')).toHaveCount(initialCount - 1);

  // Check localStorage key used by mockData
  const templates = await page.evaluate(() => localStorage.getItem('meta_ad_studio_templates_v1'));
  expect(templates).not.toBeNull();
});
