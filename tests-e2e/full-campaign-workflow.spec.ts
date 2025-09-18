import { test, expect } from '@playwright/test';

test('Full Campaign Workflow Acceptance Test', async ({ page }) => {
  // El usuario inicia en la página principal
  await page.goto('/');
  await expect(page.getByText('Welcome to the Creative Universe')).toBeVisible();

  // PASO 1: El usuario, explorando, hace clic en "New Project"
  console.log("PASO 1: Probando 'New Project'...");
  await page.getByRole('button', { name: 'New Project' }).click();
  await expect(page).toHaveURL(/.*campaigns/);
  await expect(page.getByRole('button', { name: 'Add Note' })).toBeVisible();
  console.log("✅ 'New Project' funciona y navega al Campaign Canvas.");

  // PASO 2: El usuario se da cuenta que necesita activos y vuelve a la creación
  console.log("PASO 2: Regresando a la generación de ideas...");
  await page.goto('/');
  await expect(page.getByText('Welcome to the Creative Universe')).toBeVisible();

  // PASO 3: El usuario busca inspiración en el "Strategic Oracle"
  console.log("PASO 3: Usando el Strategic Oracle...");
  await page.getByRole('tab', { name: 'Trends' }).click();
  const trendButton = page.getByRole('button', { name: /Solarpunk Aesthetics/i });
  await trendButton.click();
  // El TopBar usa un placeholder en inglés ligeramente distinto
  const promptInput = page.getByPlaceholder('Describe your metaverse ad concept...');
  // La sugerencia real contiene 'bio-architecture' en mockData; verificamos parte del texto aplicado
  await expect(promptInput).toHaveValue(/bio-architecture|green|gold/i);
  console.log("✅ El Oracle de Tendencias funciona y actualiza el prompt.");

  // PASO 4: El usuario genera la creatividad
  console.log("PASO 4: Probando 'Start Creating'...");
  await page.getByRole('button', { name: 'Start Creating' }).click();
  // Esperamos que aparezca la vista de resultado único (generación simulada)
  await expect(page.getByText(/Resultado \u00danico|Resultado Único/i)).toBeVisible({ timeout: 20000 });
  console.log("✅ La generación de imágenes funciona y muestra resultados (vista de resultado único).");

  // PASO 5: El usuario guarda el mejor resultado como plantilla
  console.log("PASO 5: Guardando una plantilla...");
  const saveButton = page.getByRole('button', { name: 'Guardar como Plantilla' });
  await expect(saveButton).toBeVisible();
  await saveButton.click();
  await expect(page.getByText(/Plantilla guardada en la galer/i)).toBeVisible({ timeout: 5000 });
  console.log("✅ El guardado como plantilla funciona.");

  // Asegurarnos de que la plantilla se persistió en localStorage para que /campaigns pueda cargarla
  await page.waitForTimeout(500); // pequeño retraso para la persistencia
  const stored = await page.evaluate(() => {
    return window.localStorage.getItem('meta_ad_studio_templates_v1');
  });
  console.log('LocalStorage templates length:', stored ? stored.length : 0);
  if (!stored) throw new Error('Expected templates to be persisted to localStorage');

  // PASO 6: El usuario vuelve al "Campaign Canvas" para usar su nueva plantilla
  console.log("PASO 6: Verificando la plantilla en el Campaign Canvas...");
  // Navegar a Campaign Canvas de forma SPA usando el botón 'New Project' y comprobar la galería
  await page.getByRole('button', { name: 'New Project' }).click();
  await expect(page).toHaveURL(/.*campaigns/);
  // Esperar brevemente a que el sidebar renderice las plantillas cargadas
  await page.waitForTimeout(500);
  const anyGalleryImage = page.locator('[data-testid="gallery-card-image"]').first();
  await expect(anyGalleryImage).toBeVisible({ timeout: 5000 });
  console.log("✅ La nueva plantilla está disponible en el Campaign Canvas.");
});
