# RELEASE CERTIFICATE v1.1 — Meta Ad Studio

Date: 2025-09-17

Product: Meta Ad Studio (local prototype -> release candidate)

Summary:
This certificate confirms that Meta Ad Studio has completed the final content integration and verification process described in the Release Mandate.

Checks performed (all passed):
- TypeScript typecheck: npx tsc --noEmit (PASS)
- Lint: npm run lint (PASS)
- Unit Tests: npm test (Vitest) (PASS)
- Production Build: npm run build (PASS)
- Playwright E2E + Accessibility: npx playwright test (PASS)
- Asset Checker: checkCampaignAssetsReport executed in CI script and local headless validation (PASS)

Assets integrated:
- Replaced campaign placeholders with final assets under public/images/campaign-examples/
- Generated 2x variants for WebP and JPG formats
- Updated src/lib/mockData.ts with accurate srcSet, srcJpg, srcWebp, alt and credit metadata

CI Changes:
- Added `scripts/ci-check-assets.cjs` to run asset integrity check in CI and exit non-zero if missing assets are detected
- Modified `.github/workflows/ci.yml` to execute asset integrity check after dependencies installation

Tests added:
- src/utils/__tests__/checkAssets.test.ts — unit tests for checkCampaignAssetsReport (success and failure cases mocked)

Artifacts produced:
- /tmp/asset-checker.png (screenshot of dev UI showing asset checker banner during validation)
- public/images/campaign-examples/*-2x.jpg and *-2x.webp (generated variants)

Operator notes:
- The CI step will fail if any asset referenced in mockData.ts is missing or inaccessible.
- The production build shows some large chunks; consider code-splitting if bundle size is a concern.

Certification:
I hereby certify that, according to the Release Mandate, the product has been validated and is ready for release.

Signed: Lead Integration & Release Engineer (automated run)
