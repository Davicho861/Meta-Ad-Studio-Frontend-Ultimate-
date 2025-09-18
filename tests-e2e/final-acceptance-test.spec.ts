import { test, expect } from '@playwright/test';
import path from 'path';

test('Final Acceptance Test: Should generate, import, and display the Celestia campaign', async ({ page }) => {
  // Navegamos a la raíz de la aplicación servida por 'npm run preview'
  await page.goto('/');

  // Verificar que la página principal carga
  await expect(page.getByText('Welcome to the Creative Universe')).toBeVisible();

  // Abrir el modal de plantillas usando el botón con aria-label 'Abrir plantillas'
  await page.getByRole('button', { name: 'Abrir plantillas' }).click();
  // El modal debería mostrar el título "Plantillas"
  await expect(page.getByText('Plantillas')).toBeVisible();

  // Simular la subida del archivo del plan de campaña fijando el archivo directamente
  // en el input[type=file] que está dentro del modal (oculto pero accesible para setInputFiles)
  // Esperar al modal y fijar el archivo en su input[type=file]
  const modalContainer = page.locator('div.bg-card').filter({ hasText: 'Plantillas' });
  await modalContainer.waitFor({ state: 'visible' });
  const fileInput = modalContainer.locator('input[type="file"]');
  await fileInput.setInputFiles(path.resolve(process.cwd(), 'output', 'celestia_campaign_plan.json'));

  // Verificar la notificación de éxito
  await expect(page.getByText(/¡Campaña "Celestia: El Tiempo es un Lienzo" importada!/i)).toBeVisible();

  // El modal se cierra tras importar; reabrimos y verificamos que el nuevo template aparece
  await page.getByRole('button', { name: 'Abrir plantillas' }).click();
  // Buscamos parte de la descripción de la Fase 1 que usamos en el plan
  await expect(page.getByText(/Lanzamiento de imágenes/i)).toBeVisible({ timeout: 10000 });
  console.log('✅ CERTIFIED: The Celestia campaign was successfully imported and is visible in the UI.');
});
