import { test, expect } from '@playwright/test';

test('should allow a user to generate a new image and save it as a template', async ({ page }) => {
  await page.goto('/');

  // 1. Introducir el prompt de alto impacto
  const promptInput = page.getByPlaceholder(/Describe your metaverse ad concept/i);
  const newPrompt = "Una vista de gran angular de una calle de la ciudad por la noche, que evoca el ambiente vibrante de Times Square...";
  await promptInput.fill(newPrompt);

  // 2. Iniciar la creación usando el botón en la TopBar (aria-label)
  await page.getByLabel('Start generation').click();

  // 3. Esperar y verificar la vista de resultado único
  const saveButton = page.getByRole('button', { name: 'Guardar como Plantilla' });
  await expect(saveButton).toBeVisible({ timeout: 20000 });

  // 4. Guardar la plantilla (click the button in the single-result view)
  await saveButton.click();

  // 5. Verificar que se ha vuelto a la galería y la nueva plantilla existe
  // Esperar a que la galería (results) aparezca
  await expect(page.locator('text=Generated Campaign')).toBeVisible({ timeout: 5000 });

  // Verifica que la galería ahora contiene una imagen con el prompt como alt
  // Look for the last image with that alt (the new template should appear in the gallery)
  const galleryImage = page.locator(`img[alt="${newPrompt}"]`).last();
  await expect(galleryImage).toBeVisible({ timeout: 5000 });
});
