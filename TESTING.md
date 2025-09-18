TESTING.md

E2E Strategy
------------

Goal: Keep all deterministic test data and test-only wiring out of production source files. Use Playwright to inject deterministic templates into localStorage before the app boots.

Why: This ensures the production codebase (src/) has no test scaffolding or console.debug calls, while tests can still control app state deterministically.

How Playwright injects templates
--------------------------------

In Playwright tests use page.addInitScript to set localStorage before the app mounts. Example (TypeScript):

await page.addInitScript(() => {
  const templatesJSON = JSON.stringify([
    { id: 'test-1', title: 'Test 1', preview: '/videos/campaign-previews/aura_preview.mp4', /* ... */ },
    // add other templates as needed
  ]);
  localStorage.setItem('templates', templatesJSON);
});

Notes
-----

- Tests should use data-testid attributes added to gallery elements (e.g., `data-testid="gallery-grid"`) to avoid brittle selectors.
- Avoid adding console.log/debug code to src/ to keep output clean and ensure lint rules pass.

MSW (Mock Service Worker) notes
-------------------------------

This project uses MSW to mock backend APIs during tests. There are two different execution environments to be aware of:

- Browser (Playwright / browser dev): uses `setupWorker` (src/mocks/browser.ts) and the handlers are written for the browser runtime. These handlers intercept fetch/XHR from the page context.
- Node (unit/integration tests): uses `setupServer` (src/mocks/server.ts) via `msw/node`. This runs inside the Node test process (Vitest) and intercepts network requests made by server-side code or JSDOM tests.

Key practical differences:

- Browser worker must be started from the page (dev preview or Playwright) to intercept page fetches. The app's `src/main.tsx` attempts to start the worker in DEV, but the production preview used by Playwright may not run the worker — tests should not assume browser MSW is always active in preview.
- Node server is started in the Vitest setup (`src/tests/setupTests.ts`) using `server.listen()` so unit/integration tests reliably use the mocked endpoints.

Testing guidance:

- Write Playwright tests to be resilient if the browser MSW worker is not present in preview mode. Prefer asserting on client-side state (local/sessionStorage) or use Playwright to inject the expected session state where appropriate.
- Keep handlers in `src/mocks/handlers.ts` compatible with both environments where possible; the file exports handlers usable by both `setupWorker` and `setupServer`.


Commands
--------

- Lint: npm run lint
- Unit tests: npm test
- Build: npm run build
- Playwright tests: npx playwright test

Maintenance
-----------

If tests need more complex fixtures, create them under `tests-e2e/fixtures` and load them in the Playwright test setup using page.addInitScript or test fixtures.
