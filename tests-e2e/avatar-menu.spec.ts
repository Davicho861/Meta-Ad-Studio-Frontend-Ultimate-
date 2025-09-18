import { test, expect } from '@playwright/test';

test('Avatar opens user menu with profile, settings and logout', async ({ page }) => {
  await page.goto('/');

  const avatarBtn = page.locator('button[aria-label="User menu"]').first();
  await expect(avatarBtn).toBeVisible({ timeout: 5000 });
  await avatarBtn.click();

  // Menu options should appear
  await expect(page.locator('text=Mi Perfil')).toBeVisible({ timeout: 3000 });
  await expect(page.locator('text=Configuración')).toBeVisible();
  await expect(page.locator('text=Cerrar Sesión')).toBeVisible();
});
