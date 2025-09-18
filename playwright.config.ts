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
