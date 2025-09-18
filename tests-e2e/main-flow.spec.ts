 
import { test, expect } from '@playwright/test';

test('should allow a user to complete the main creative flow', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load', timeout: 120000 });

  // 1. Verificar estado inicial
  await expect(page.getByText('Welcome to the Creative Universe')).toBeVisible({ timeout: 15000 });

  // Log console errors to aid debugging
  page.on('console', msg => {
    if (msg.type() === 'error') console.error('PAGE ERROR:', msg.text());
  });

  // 2. Escribir un prompt en el TopBar y verificar
  const promptInput = page.getByPlaceholder('Describe your metaverse ad concept...');
  await promptInput.fill('Solarpunk aesthetics for VR fashion');
  await expect(promptInput).toHaveValue(/Solarpunk/i);

  // 3. Iniciar la creación por UI: hacer click en el botón Start Creating y esperar la vista generando
  // Prefer the primary large button labeled "Start Creating" when available
  const startButton = page.getByText('Start Creating').first();
  await startButton.click();

  // 4. Esperar indicador de generación visible
  await page.waitForSelector('[data-testid="generating-indicator"]', { timeout: 60000 });
});
