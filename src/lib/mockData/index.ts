// Re-export TypeScript implementation to ensure both `.../mockData` and `.../mockData.ts` imports
// resolve to the same ESM module during tests and runtime.
export * from './mockData';

export { default as defaultExport } from './mockData';
