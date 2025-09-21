E2E Quickstart

1) Install deps

pnpm install

2) Run full E2E flow (build, serve, run playwright)

pnpm run e2e

Notes:
- The script builds the app, serves `dist/` on port 5178 with SPA fallback, then runs the Playwright spec that validates upload, DnD and persistence.
- If port 5178 is in use, the serve tool will pick another port; set PREVIEW_URL to override the URL before running Playwright.
