Testing notes

This file documents the test setup used in the project and explains a few non-obvious decisions.

Why `src/tests/setupTests.ts` exists
- The test environment is Vitest + JSDOM. Several charting libraries (notably Recharts) expect browser APIs not present in JSDOM.
- To keep tests meaningful without mocking entire chart libraries, we provide two targeted mitigations:
  1. A lightweight polyfill for `ResizeObserver` so components that call it don't throw.
  2. An override for `Element.prototype.getBoundingClientRect` that returns non-zero dimensions for elements that have the `recharts-responsive-container` class. This allows Recharts' `ResponsiveContainer` to measure its parent and not log width/height 0 warnings.

Notes and alternatives
- The override is intentionally targeted to elements with class `recharts-responsive-container`. This minimizes side effects.
- Alternatives:
  - Mock `recharts` completely in tests (gives maximum control but requires maintaining the mock and may hide real regressions in charts).
  - Refactor chart components to accept `testSize` props (we added optional `testSize` props on chart widgets to make tests deterministic).

How to change behavior
- To remove overrides, update `src/tests/setupTests.ts`. If switching to a module mock, prefer Vitest's `vi.mock('recharts', ...)` in test setup instead of `jest.mock`.

CI considerations
- Ensure `src/tests/setupTests.ts` is executed in CI (Vitest loads setup files by default when configured). If CI uses a different runner, replicate these mitigations there.

Contact
- If you want the approach changed (e.g. full module mocks or visual testing instead), I can implement that next.
