import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests-e2e',
  timeout: 120_000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
  baseURL: 'http://localhost:5174',
  headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 0,
    ignoreHTTPSErrors: true,
    // Ensure the app runs in E2E test mode: page script sets window.__E2E__ early
    launchOptions: {
      // empty for now
    },
    // Inject a script before any other scripts to flag E2E mode for the app
    // Note: using addInitScript in the test runner is done via the test setup; include here for global effect
    contextOptions: {
      // see Playwright docs: addInitScript is applied per page via fixtures; we'll add it via projects setup in tests
    },
  // Habilitar video condicionalmente si la variable de entorno PLAYWRIGHT_RECORD_VIDEO está establecida a "1"
  video: process.env.PLAYWRIGHT_RECORD_VIDEO === '1' ? 'on' : undefined,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
  // Build first so preview serves the production bundle (more deterministic)
  command: 'npm run build && npm run preview -- --port 5174',
    port: 5174,
    reuseExistingServer: true,
    timeout: 120000,
  },
});
