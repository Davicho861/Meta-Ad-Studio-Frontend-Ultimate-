import { test, expect } from '@playwright/test';
import path from 'path';

test('Import campaign plan and show template in modal', async ({ page }) => {
  // Start app should be running separately (npm run dev)
  await page.goto('/');

  // Ensure topbar and templates button are present
  const templatesBtn = page.getByRole('button', { name: /Abrir plantillas/i });
  await expect(templatesBtn).toBeVisible({ timeout: 5000 });
  await templatesBtn.click();

  // Click import button inside modal (TemplatesModal doesn't use role=dialog, locate by header)
  const modalHeader = page.getByRole('heading', { name: /Plantillas/i });
  await expect(modalHeader).toBeVisible({ timeout: 5000 });
  const modalContainer = modalHeader.locator('..').locator('..');
  const importBtn = modalContainer.getByRole('button', { name: /Importar Plan de Campaña/i });
  await importBtn.scrollIntoViewIfNeeded();

  // Upload file by setting the hidden file input directly
  const filePath = path.resolve(process.cwd(), 'output/celestia_campaign_plan.json');
  const hiddenInput = modalContainer.locator('input[type="file"]');
  await hiddenInput.setInputFiles(filePath);

  // Expect success toast
  await expect(page.locator('text=importada').first()).toBeVisible({ timeout: 5000 });

  // The modal closes on success; re-open Templates and verify the imported template appears
  await page.getByRole('button', { name: /Abrir plantillas/i }).click();
  const importedImgs = page.locator('img[src*="aura_times_square"]');
  const count = await importedImgs.count();
  expect(count).toBeGreaterThan(0);
  await expect(importedImgs.first()).toBeVisible({ timeout: 5000 });
});
