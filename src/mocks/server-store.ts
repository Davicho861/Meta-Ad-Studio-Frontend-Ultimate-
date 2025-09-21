// Simple in-memory mock server store used by MSW handlers for tests
type LastRequest = { path: string; body?: unknown; timestamp: string } | null;

let serverCredits = 2;
let lastRequest: LastRequest = null;

export const getServerCredits = (): number => serverCredits;
export const setServerCredits = (n: number): void => { serverCredits = n; };

export const getLastRequest = (): LastRequest => lastRequest;
export const setLastRequest = (path: string, body?: unknown): void => { lastRequest = { path, body, timestamp: new Date().toISOString() }; };

export const resetServerStore = (): void => { serverCredits = 2; lastRequest = null; };

export default {
  getServerCredits,
  setServerCredits,
  getLastRequest,
  setLastRequest,
  resetServerStore,
};
