/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from '@playwright/test';

test('flujo activo a campaña: subir, editar y animar (determinista)', async ({ page }) => {
  // Flag E2E mode before app loads so main.tsx attaches helpers and disables animations
  await page.addInitScript(() => { (window as any).__E2E__ = true; });
  await page.goto('/');

  // Helper: wait until the app has signaled the E2E bridge is ready
  const waitE2EReady = async () => {
    const ready = await page.evaluate(() => !!(window as any).__E2E_READY__);
    if (ready) return;
    await page.evaluate(() => new Promise<void>((res) => {
      const onReady = () => { try { window.removeEventListener('e2e-ready', onReady); } catch (e) {} res(); };
      window.addEventListener('e2e-ready', onReady);
    }));
  };

  // Helper: send a command and wait for e2e-response. Accepts command and payload.
  const sendE2ECommand = async (command: string, payload?: any) => {
    await waitE2EReady();
    return page.evaluate((data) => {
      return new Promise<any>((res) => {
        const onResp = (ev: Event) => {
          try { window.removeEventListener('e2e-response', onResp); } catch (e) { /* noop */ }
          // @ts-ignore
          res((ev as CustomEvent).detail);
        };
        window.addEventListener('e2e-response', onResp);
        window.dispatchEvent(new CustomEvent('e2e-command', { detail: { command: data.command, payload: data.payload } }));
      });
    }, { command, payload });
  };

  // Prepare deterministic template and insert via exposed helpers
  const uploadedId = `uploaded_test_${Date.now()}`;
  const template = {
    id: uploadedId,
    type: 'uploaded',
    url: '/images/campaign-examples/nexus_arena_shibuya.webp',
    prompt: 'Activo subido por el usuario',
    timestamp: new Date().toISOString(),
    alt: 'nexus_shibuya'
  };

  // Use event-bus helper to add templates deterministically via app helpers
  await sendE2ECommand('addTemplates', [template]);

  // Reload to ensure app reads persisted templates
  await page.reload();

  // Re-add templates in the freshly loaded app to ensure runtime store is populated
  await sendE2ECommand('addTemplates', [template]);

  // Diagnostic: inspect root element and DOM structure after reload
  const domDiag = await page.evaluate(() => {
    try {
      const root = document.getElementById('root');
      return {
        rootExists: !!root,
        rootInnerHTMLLength: root ? (root.innerHTML || '').length : 0,
        bodyChildren: document.body ? document.body.children.length : 0,
        htmlLength: document.documentElement ? (document.documentElement.innerHTML || '').length : 0
      };
    } catch (e) { return { error: String(e) }; }
  });
  // eslint-disable-next-line no-console
  console.log('E2E DOM DIAG:', JSON.stringify(domDiag));

  // Ensure runtime store has templates; if not, force fetchTemplates
  const generatedCount = await page.evaluate(() => {
    try { const s = (window as any).__APP_STORE__ ? (window as any).__APP_STORE__() : null; return s ? (s.getState().generatedAssets || []).length : 0; } catch (e) { return 0; }
  });
  if (!generatedCount || generatedCount === 0) {
    await sendE2ECommand('fetchTemplates');
    // give time for store update
    await page.waitForTimeout(200);
  }

  // Open modal programmatically via event-bus selectImageById
  const respSelect = await sendE2ECommand('selectImageById', uploadedId);
  expect(respSelect?.status === 'success' || respSelect === true).toBeTruthy();

  // Wait until the runtime store reports the selectedImage to ensure the modal can render
  await page.waitForFunction((expectedId) => {
    try {
      // __APP_STORE__ may be either the hook (useStore) or the hook invoked (state object)
      // Try multiple access patterns safely.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const globalStore = (window as any).__APP_STORE__;
      if (!globalStore) return false;
      // If it's the hook factory with getState
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof globalStore.getState === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const state = globalStore.getState();
        return !!(state && state.selectedImage && state.selectedImage.id === expectedId);
      }
      // If it's a function that returns the state
      if (typeof globalStore === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const s = globalStore();
        return !!(s && s.selectedImage && s.selectedImage.id === expectedId);
      }
      // If it's already the state object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (globalStore && (globalStore as any).selectedImage) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return !!((globalStore as any).selectedImage && (globalStore as any).selectedImage.id === expectedId);
      }
    } catch (e) { /* noop */ }
    return false;
  }, uploadedId, { timeout: 5000 });

  // Verify modal opened
  await expect(page.getByText('Creative Lab')).toBeVisible();

  // Simulate contextual edit result by inserting a generated template programmatically
  const generatedId = `gen_after_edit_${Date.now()}`;
  // Insert generated template via event-bus
  await sendE2ECommand('addTemplates', [{ id: generatedId, type: 'generated', url: '/images/campaign-examples/aura_times_square.webp', prompt: 'Edición contextual: Anuncio de Coca-Cola', timestamp: new Date().toISOString(), alt: 'edited_coke' }]);

  // Programmatically set preview video on the selected item to simulate animation result
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Use the guaranteed global setter which is attached early in main.tsx in DEV/E2E
    // Try multiple strategies to attach a preview video for the uploaded asset.
    // Use event-bus to set preview video on selected image deterministically
  const respPreview = await sendE2ECommand('setPreviewVideo', { args: [uploadedId, '/videos/campaign-previews/nexus_preview.mp4'] });
  // normalize success response
  const attached = (respPreview?.status === 'success') || respPreview === true;
  expect(attached).toBeTruthy();

  // give React a moment to re-render
  await page.waitForTimeout(300);

  // debug: capture video elements and snapshot helper state for diagnostics
  const debugInfo = await page.evaluate(() => {
    const videos = Array.from(document.querySelectorAll('video')).map(v => ({ src: (v as HTMLVideoElement).currentSrc || (v as HTMLVideoElement).src, dataset: (v as HTMLElement).dataset }));
    let ls: string | null = null;
    try { ls = window.localStorage.getItem('meta_ad_studio_templates_v1'); } catch { ls = null; }
    return { videos, ls };
  });
  // eslint-disable-next-line no-console
  console.log('E2E POST-ATTACH DEBUG:', JSON.stringify(debugInfo));

  // Verify video preview is present via the E2E-only test id
  // Wait for the app to render the preview video element
  await page.waitForSelector('[data-testid="e2e-preview-video"]', { timeout: 10000 });
  const video = await page.$('[data-testid="e2e-preview-video"]');
  expect(video).not.toBeNull();
});


