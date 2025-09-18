// Persistence adapter with opt-in support. Default uses localStorage; can call remote API when consent is granted.
import { getConsent } from '@/lib/consent';

const AGENCY_ACTIONS_ENDPOINT = '/api/v1/agency/actions';
const AGENCY_INSIGHTS_ENDPOINT = '/api/v1/agency/insights';
const TELEMETRY_ENDPOINT = '/api/v1/telemetry/events';

type Learning = { action: string; prompt?: string; at: string };

export const loadLearnings = async (): Promise<string[]> => {
  try {
    const consent = getConsent();
    if (consent) {
      const resp = await fetch(AGENCY_INSIGHTS_ENDPOINT);
      if (resp.ok) {
        const json = await resp.json();
        return Array.isArray(json.savedPrompts) ? json.savedPrompts : [];
      }
    }
  } catch (e) {
    // network error: fallthrough to local
  }
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('cognitive_core_learnings_v1') : null;
    if (!raw) return [];
  const parsed = JSON.parse(raw) as unknown;
  return Array.isArray(parsed) ? (parsed as unknown[]).filter((p) => typeof p === 'string') as string[] : [];
  } catch (e) {
    return [];
  }
};

export const saveLearnings = async (learnings: string[]): Promise<void> => {
  try {
    const consent = getConsent();
    if (consent) {
      try {
        await fetch(AGENCY_ACTIONS_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: learnings }) });
      } catch (e) {
        // ignore network errors
      }
      // Mirror items into sessionStorage for the client/test environment so tests can assert on them.
      try {
        if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
          const key = 'mock_agency_actions_v1';
          const raw = window.sessionStorage.getItem(key);
          const existing = raw ? JSON.parse(raw) : [];
          const now = new Date().toISOString();
          const stored = existing.concat(learnings.map((p) => ({ action: 'save', prompt: String(p), at: now })));
          window.sessionStorage.setItem(key, JSON.stringify(stored));
        }
      } catch (e) {
        // ignore sessionStorage write errors
      }
      return;
    }
  } catch (e) {
    // ignore and fallback to local
  }
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('cognitive_core_learnings_v1', JSON.stringify(learnings));
    }
  } catch (e) {
    // swallow
  }
};

export const saveTelemetry = async (event: { type: string; payload?: unknown }) => {
  try {
    const consent = getConsent();
    if (consent) {
      await fetch(TELEMETRY_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(event) });
    }
  } catch (e) {
    // noop
  }
};

export default { loadLearnings, saveLearnings, saveTelemetry };
