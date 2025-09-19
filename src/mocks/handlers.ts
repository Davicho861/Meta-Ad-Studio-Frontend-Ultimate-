/* eslint-disable @typescript-eslint/no-explicit-any */
import * as msw from 'msw';

const http = (msw as any).http;

const AGENCY_ACTIONS = 'mock_agency_actions_v1';

const readSession = (): Array<{ action: string; prompt?: string; at?: string }> => {
  try {
    const raw = typeof window !== 'undefined' ? window.sessionStorage.getItem(AGENCY_ACTIONS) : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeSession = (arr: Array<{ action: string; prompt?: string; at?: string }>) => {
  try {
    if (typeof window !== 'undefined') window.sessionStorage.setItem(AGENCY_ACTIONS, JSON.stringify(arr));
  } catch {
    // ignore storage errors
  }
};

export const handlers = [
  http.post('/api/v1/agency/actions', async (req, res, ctx) => {
    try {
  // msw handler invoked for /api/v1/agency/actions
      let body: any = {};
      try {
        body = await req.json();
      } catch (e) {
        // try text fallback
        try {
          const txt = await req.text();
          if (txt) {
            try {
              body = JSON.parse(txt);
            } catch {
              body = txt;
            }
          } else {
            body = (req as any).body || {};
          }
        } catch {
          body = (req as any).body || {};
        }
      }
  // body received in handler
  const items = Array.isArray(body && body.items) ? body.items : (Array.isArray(body) ? body : []);
      const existing = readSession();
      const now = new Date().toISOString();
      const stored = existing.concat(items.map((i: unknown) => ({ action: 'save', prompt: String(i), at: now })));
  writeSession(stored);
  return res({ status: 200, body: JSON.stringify({ ok: true }) });
    } catch (err) {
  // error handling /api/v1/agency/actions
      try {
        return res({ status: 200, body: JSON.stringify({ ok: false }) });
      } catch {
        // last resort
        return res({ status: 500 });
      }
    }
  }),

  http.get('/api/v1/agency/insights', (req, res, ctx) => {
  const existing = readSession();
  const savedPrompts = existing.map((x) => x.prompt).filter((p): p is string => typeof p === 'string');
  return res({ status: 200, body: JSON.stringify({ savedPrompts, count: savedPrompts.length }) });
  }),

  http.post('/api/v1/telemetry/events', async (req, res, ctx) => {
    try {
      const body = await req.json();
  // telemetry event (msw)
  return res({ status: 200, body: JSON.stringify({ ok: true }) });
    } catch {
  return res({ status: 400, body: JSON.stringify({ ok: false }) });
    }
  }),
];

export default handlers;
