import { test, expect } from '@playwright/test';
import path from 'path';

test('campaign command center full flow: upload, drag, persist canvas state', async ({ page }) => {
  // Dump browser console and page errors to help debug mounting issues
    // Keep console listeners minimal for CI (errors still surface in Playwright reports)
  // Ensure server is available (retry a few times)
  const maxAttempts = 8;
  let ok = false;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await page.request.get('/');
      if (res.ok()) { ok = true; break; }
    } catch (e) { /* retry */ }
    await new Promise(r => setTimeout(r, 500));
  }
  expect(ok).toBe(true);

  // Prepare localStorage before loading the app so fetchTemplates reads the templates on mount.
  const tinyPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
  // Ensure templates are present before the app bootstraps by using addInitScript
  await page.addInitScript(({ tiny }) => {
    try {
      // signal app to expose E2E helpers
      (window as any).__E2E__ = true;
      window.localStorage.setItem('meta_ad_studio_templates_v1', JSON.stringify([{
        id: 'uploaded_test_shibuya',
        url: tiny,
        type: 'uploaded',
        alt: 'shibuya.png',
        prompt: 'injected test',
        timestamp: new Date().toString()
      }]));
    } catch (e) { /* noop */ }
  }, { tiny: tinyPixel });

  // Prefer runtime override via PREVIEW_URL; fallback to the serve:dist port 5178 used by scripts/run-e2e.sh
  const preview = process.env.PREVIEW_URL || 'http://localhost:5178';
  // Load the built index so client-side app boots, then use the New Project button to navigate
  await page.goto(`${preview}/`);
  // dump visible body text for debugging
  await page.waitForTimeout(500);
    // allow app to bootstrap
    await page.waitForTimeout(500);
  const newProjectBtn = page.getByRole('button', { name: /New Project/i });
  await expect(newProjectBtn).toBeVisible({ timeout: 7000 });
  await newProjectBtn.click();
  // wait for campaigns page to load (sidebar presence)
  await page.waitForTimeout(500);
  const afterClickBody = await page.evaluate(() => document.body.innerText);
    // minimal wait to let navigation happen
    await page.waitForTimeout(300);
  await page.waitForSelector('#canvas-drop-area', { timeout: 7000 });

  // Wait for the asset to appear
  const uploadedImg = page.locator('img[alt="shibuya.png"]');
  await expect(uploadedImg).toBeVisible({ timeout: 5000 });

  // Compute canvas center coordinates
  const canvas = page.locator('#canvas-drop-area');
  const canvasBox = await canvas.boundingBox();
  expect(canvasBox).toBeTruthy();
  const targetX = Math.round((canvasBox!.x + canvasBox!.x + canvasBox!.width) / 2);
  const targetY = Math.round((canvasBox!.y + canvasBox!.y + canvasBox!.height) / 2);

  // Drag using mouse events: move to source center, mousedown, move to target, mouseup
  const srcBox = await uploadedImg.first().boundingBox();
  expect(srcBox).toBeTruthy();
  const startX = Math.round(srcBox!.x + srcBox!.width / 2);
  const startY = Math.round(srcBox!.y + srcBox!.height / 2);

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  // small pause to let DnD begin
  await page.waitForTimeout(100);
  await page.mouse.move(targetX, targetY, { steps: 12 });
  await page.waitForTimeout(50);
  await page.mouse.up();

  // After drop, expect an instance rendered inside the canvas area
  const canvasInstance = page.locator('#canvas-drop-area img[alt="shibuya.png"]');
  await expect(canvasInstance).toBeVisible({ timeout: 5000 });

  // Assert position within tolerance
  const instBox = await canvasInstance.boundingBox();
  expect(instBox).toBeTruthy();
  const tolerance = 30; // px
  const instCenterX = Math.round(instBox!.x + instBox!.width / 2);
  const instCenterY = Math.round(instBox!.y + instBox!.height / 2);
  expect(Math.abs(instCenterX - targetX)).toBeLessThanOrEqual(tolerance);
  expect(Math.abs(instCenterY - targetY)).toBeLessThanOrEqual(tolerance);

  // Verify canvas state persisted: presence of campaign_canvas_state_v1 with an instance
  const canvasStateRaw = await page.evaluate(() => localStorage.getItem('campaign_canvas_state_v1'));
  // eslint-disable-next-line no-console
  console.log('[LOCALSTORAGE BEFORE RELOAD]', canvasStateRaw);
  expect(canvasStateRaw).toBeTruthy();
  const canvasState = JSON.parse(canvasStateRaw || '[]');
  expect(Array.isArray(canvasState)).toBe(true);
  expect(canvasState.length).toBeGreaterThan(0);

  // Simulate a reload that avoids server 404: navigate to root and re-open campaigns client-side
  await page.goto(`${preview}/`);
  const newProjectBtn2 = page.getByRole('button', { name: /New Project/i });
  await expect(newProjectBtn2).toBeVisible({ timeout: 7000 });
  await newProjectBtn2.click();
  // wait for campaigns page to load and for persisted instance to render
  await page.waitForSelector('#canvas-drop-area img[alt="shibuya.png"]', { timeout: 7000 });
  const persisted = page.locator('#canvas-drop-area img[alt="shibuya.png"]');
  await expect(persisted).toBeVisible({ timeout: 5000 });
  const persistedBox = await persisted.boundingBox();
  expect(persistedBox).toBeTruthy();
  const persistedCenterX = Math.round(persistedBox!.x + persistedBox!.width / 2);
  const persistedCenterY = Math.round(persistedBox!.y + persistedBox!.height / 2);
  expect(Math.abs(persistedCenterX - targetX)).toBeLessThanOrEqual(tolerance + 10);
  expect(Math.abs(persistedCenterY - targetY)).toBeLessThanOrEqual(tolerance + 10);
});
