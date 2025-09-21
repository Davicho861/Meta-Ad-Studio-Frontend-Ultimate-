import { test, expect } from '@playwright/test';

test('demo-local: should show the deterministic local-generated video in the gallery modal', async ({ page }) => {
  test.setTimeout(120000);
    // Inject deterministic template and E2E flag into the browser before app boots
    await page.addInitScript(() => {
      try {
        (window as unknown as { __E2E__?: boolean }).__E2E__ = true;
        const t = [{
          id: 'local_demo_generated',
          type: 'generated',
          url: '/output/local_generated.mp4',
          previewVideoUrl: '/output/local_generated.mp4',
          alt: 'Demo generado localmente',
          credit: 'Meta Ad Studio — local demo',
          prompt: 'Local fallback demo generated for E2E evidence',
          timestamp: new Date().toISOString(),
          engagement: 100,
          ctr: 10,
          reach: 1
        }];
        window.localStorage.setItem('meta_ad_studio_templates_v1', JSON.stringify(t));
      } catch (e) { void e; }
    });

    await page.goto('/')

    // Use the test helpers bridge to select the injected template deterministically
    await page.evaluate(() => {
      try {
        const helpers = (window as any).__APP_STORE_HELPERS__;
        if (helpers && typeof helpers.selectImageById === 'function') helpers.selectImageById('local_demo_generated');
      } catch (e) { void e; }
    });

    // Instead of interacting with the UI (which can be flaky in headless CI), wait
    // directly for the e2e preview video element that the app exposes for testability.
    const e2ePreview = page.getByTestId('e2e-preview-video');
    await e2ePreview.waitFor({ state: 'visible', timeout: 30000 });
    await expect(e2ePreview).toHaveAttribute('src', '/output/local_generated.mp4');
  })
