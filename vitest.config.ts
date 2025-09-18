import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  setupFiles: ['./src/tests/setupTests.ts'],
  // Only include project tests under src/ and explicitly exclude node_modules
  include: ['src/**/*.{test,spec}.{js,ts,tsx}'],
  // Exclude E2E Playwright tests and node_modules to avoid running external test suites
  exclude: ['**/tests-e2e/**', 'tests-e2e/**', 'node_modules/**']
  }
});
