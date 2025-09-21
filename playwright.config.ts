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
  baseURL: 'http://localhost:5173',
  headless: false,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 0,
    ignoreHTTPSErrors: true,
    launchOptions: {
      // empty for now
    },
    contextOptions: {
      // global context options
    },
  // Always record video for the demo
  video: 'on',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    // Orchestrate the mock API and Vite dev server in parallel for E2E
    command: 'npm run test:e2e:server',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
