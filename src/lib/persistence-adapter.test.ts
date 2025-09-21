import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import adapter, { loadLearnings, saveLearnings } from './persistence-adapter';
import * as consent from './consent';

// Mock global fetch when consent granted via MSW in other tests; here we simply test fallback behavior.

describe('persistence-adapter (fallback localStorage)', () => {
  beforeEach(() => {
    // clear localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('cognitive_core_learnings_v1');
    }
    vi.spyOn(consent, 'getConsent').mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('saves and loads learnings to localStorage when no consent', async () => {
    await saveLearnings(['a','b','c']);
    const loaded = await loadLearnings();
    expect(loaded).toEqual(['a','b','c']);
  });
});

describe('persistence-adapter (consent -> network)', () => {
  beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(consent, 'getConsent').mockReturnValue(true);
  // ensure sessionStorage empty
  if (typeof window !== 'undefined') window.sessionStorage.removeItem('mock_agency_actions_v1');
  });

  it('calls fetch when saving learnings', async () => {
  type FetchMock = (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  const fetchSpy = vi.spyOn(globalThis as unknown as { fetch: FetchMock }, 'fetch').mockResolvedValue(({ ok: true } as unknown) as Response);
  await saveLearnings(['x','y']);
  expect(fetchSpy).toHaveBeenCalled();
  // No client-side mirroring expected anymore
  const raw = typeof window !== 'undefined' ? window.sessionStorage.getItem('mock_agency_actions_v1') : null;
  expect(raw).toBeNull();
  fetchSpy.mockRestore();
  });
});
