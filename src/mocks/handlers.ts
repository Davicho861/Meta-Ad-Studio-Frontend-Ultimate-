/* eslint-disable @typescript-eslint/no-explicit-any */
import * as msw from 'msw';

const rest = (msw as any).rest;
const http = (msw as any).http;

// provider adapters (simulated)
import GeminiProvider from '@/lib/ai-providers/gemini.provider';
import OpenAIProvider from '@/lib/ai-providers/openai.provider';
import StabilityProvider from '@/lib/ai-providers/stability.provider';
// Runway provider removed in local-first release
import { getServerCredits, setServerCredits, setLastRequest } from './server-store';

const providerMap: Record<string, any> = {
  gemini: GeminiProvider,
  openai: OpenAIProvider,
  stability: StabilityProvider,
};

const AGENCY_ACTIONS = 'mock_agency_actions_v1';

const readSession = (): Array<{ action: string; prompt?: string; at?: string }> => {
  try {
    const raw = typeof window !== 'undefined' ? window.sessionStorage.getItem(AGENCY_ACTIONS) : null;
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    void e;
    return [];
  }
};

const writeSession = (arr: Array<{ action: string; prompt?: string; at?: string }>) => {
  try {
    if (typeof window !== 'undefined') window.sessionStorage.setItem(AGENCY_ACTIONS, JSON.stringify(arr));
  } catch (e) {
    void e; // ignore storage errors
  }
};

let handlers: any[] = [];

if (rest) {
  handlers = [
    rest.post('/api/v1/agency/actions', async (req: any, res: any, ctx: any) => {
      try {
        let body: any = {};
        try { body = await req.json(); } catch (e) { try { const t = await req.text(); body = t ? JSON.parse(t) : {}; } catch (e2) { void e2; body = (req as any).body || {}; } }
        const items = Array.isArray(body && body.items) ? body.items : (Array.isArray(body) ? body : []);
        const existing = readSession();
        const now = new Date().toISOString();
        const stored = existing.concat(items.map((i: unknown) => ({ action: 'save', prompt: String(i), at: now })));
        writeSession(stored);
        return res(ctx.status(200), ctx.json({ ok: true }));
      } catch (err) {
        return res(ctx.status(200), ctx.json({ ok: false }));
      }
    }),

    rest.get('/api/v1/agency/insights', (req: any, res: any, ctx: any) => {
      const existing = readSession();
      const savedPrompts = existing.map((x) => x.prompt).filter((p): p is string => typeof p === 'string');
      return res(ctx.status(200), ctx.json({ savedPrompts, count: savedPrompts.length }));
    }),

    rest.post('/api/v1/telemetry/events', async (req: any, res: any, ctx: any) => {
      try { await req.json(); return res(ctx.status(200), ctx.json({ ok: true })); } catch (e) { void e; return res(ctx.status(400), ctx.json({ ok: false })); }
    }),

    rest.post('/api/generate-video', async (req: any, res: any, ctx: any) => {
      try {
        let body: any = {};
        try { body = await req.json(); } catch (e) { try { const t = await req.text(); body = t ? JSON.parse(t) : {}; } catch (e2) { void e2; body = (req as any).body || {}; } }
        try { /* debug removed */ } catch (e) { void e; }
  // Backwards compatibility: infer provider and task
  const provider = (body && (body.provider || body.engine)) || 'stability';
        const task = 'image-to-video';
        let credits = 0;
        try { credits = Number(getServerCredits() || 0); } catch (e) { void e; credits = 0; }
        try { setLastRequest('/api/generate-video', body); } catch (e) { void e; }
        if (!credits || credits <= 0) { return res(ctx.status(402), ctx.json({ error: 'Payment Required', code: 'NO_CREDITS' })); }
        // route to provider adapter simulation when available
        let videoUrl = '/videos/nexus_preview.mp4';
        try {
          const p = providerMap[provider] || providerMap['stability'];
          if (p && typeof p.generateVideo === 'function') {
            const out = await p.generateVideo((body && body.imageId) || 'img_default', body && body.prompt);
            videoUrl = out?.url || videoUrl;
          }
        } catch (err) { void err; }
  const newCredits = Math.max(0, credits - 1);
  try { setServerCredits(newCredits); } catch (err) { void err; }
        // expose for tests/debuggers so they can assert authoritative server value
        try { if (typeof window !== 'undefined') (window as any).__LAST_NEW_CREDITS__ = newCredits; else (global as any).__LAST_NEW_CREDITS__ = newCredits; } catch (err) { void err; }
        try { /* debug removed */ } catch (err) { void err; }
        return res(ctx.status(200), ctx.json({ previewVideoUrl: videoUrl, newCredits, provider }));
      } catch (err) { return res(ctx.status(500), ctx.json({ ok: false })); }
    }),

    // New universal generate endpoint: accepts { task, provider, prompt, imageId }
    rest.post('/api/generate', async (req: any, res: any, ctx: any) => {
      try {
        let body: any = {};
        try { body = await req.json(); } catch (e) { try { const t = await req.text(); body = t ? JSON.parse(t) : {}; } catch (e2) { void e2; body = (req as any).body || {}; } }
        try { /* debug removed */ } catch (e) { void e; }
  // allow headers to override when body is empty (some test runners may not populate req.json())
        let headerProvider: string | undefined = undefined;
        let headerTask: string | undefined = undefined;
        try {
          if (req.headers) {
            if (typeof req.headers.get === 'function') {
              headerProvider = req.headers.get('x-provider') || undefined;
              headerTask = req.headers.get('x-task') || undefined;
            } else if (typeof req.headers === 'object') {
              // plain object: keys may be lowercased
              headerProvider = (req.headers['x-provider'] || req.headers['X-Provider'] || req.headers['x_provider']) || undefined;
              headerTask = (req.headers['x-task'] || req.headers['X-Task'] || req.headers['x_task']) || undefined;
              // if values are arrays, take first
              if (Array.isArray(headerProvider)) headerProvider = String(headerProvider[0]);
              if (Array.isArray(headerTask)) headerTask = String(headerTask[0]);
            }
          }
        } catch (err) { void err; }
        // also try URL search params
        let urlProvider: string | undefined = undefined;
        let urlTask: string | undefined = undefined;
        try {
          if (req && req.url) {
            if (req.url.searchParams && typeof req.url.searchParams.get === 'function') {
              urlProvider = req.url.searchParams.get('provider') || undefined;
              urlTask = req.url.searchParams.get('task') || undefined;
            } else if (typeof req.url === 'string') {
              try {
                const parsed = new URL(req.url, 'http://localhost');
                urlProvider = parsed.searchParams.get('provider') || undefined;
                urlTask = parsed.searchParams.get('task') || undefined;
              } catch (err) { void err; }
            }
          }
          // msw/http in Node places the raw incoming request under req.request
          try {
            if ((!headerProvider || !headerTask) && req.request) {
              try {
                if (req.request.headers) {
                  const rh = req.request.headers;
                  const maybe = (k: string) => {
                    try {
                      // headers may be a plain object, or an array of tuples, or a Map-like
                      if (typeof rh.get === 'function') {
                        return rh.get(k) || rh.get(k.toLowerCase()) || undefined;
                      }
                      if (Array.isArray(rh)) {
                        // array of [key, value]
                        const found = rh.find((it: any) => String(it[0]).toLowerCase() === k.toLowerCase());
                        return found ? String(found[1]) : undefined;
                      }
                      if (typeof rh === 'object') {
                        const v = rh[k] || rh[k.toLowerCase()] || rh[k.toUpperCase()];
                        if (Array.isArray(v)) return String(v[0]);
                        return typeof v === 'string' ? v : undefined;
                      }
                    } catch (err) { void err; }
                    return undefined;
                  };
                  const maybeProvider = maybe('x-provider');
                  const maybeTask = maybe('x-task');
                  if (maybeProvider) headerProvider = headerProvider || maybeProvider;
                  if (maybeTask) headerTask = headerTask || maybeTask;
                }
              } catch (err) { void err; }
            }
          } catch (err) { void err; }
          try {
            if ((!urlProvider || !urlTask) && req.request && typeof req.request.url === 'string') {
              try {
                // attempt to parse request url from raw request (silent in production)
                const parsed = new URL(req.request.url, 'http://localhost');
                urlProvider = urlProvider || parsed.searchParams.get('provider') || undefined;
                urlTask = urlTask || parsed.searchParams.get('task') || undefined;
              } catch (err) { void err; }
            }
          } catch (err) { void err; }
        } catch (err) { void err; }
  const provider = headerProvider || urlProvider || (body && (body.provider || 'stability'));
        const task = headerTask || urlTask || ((body && body.task) || 'text-to-image');
        let credits = 0;
        try { credits = Number(getServerCredits() || 0); } catch (err) { void err; credits = 0; }
        try { setLastRequest('/api/generate', { ...(body || {}), provider, task }); } catch (err) { void err; }
        if (!credits || credits <= 0) { return res(ctx.status(402), ctx.json({ error: 'Payment Required', code: 'NO_CREDITS' })); }

  const p = providerMap[provider] || providerMap['stability'];
        let outputUrl = '';

        if (task === 'text-to-image' && p && typeof p.generateImage === 'function') {
          const out = await p.generateImage(body.prompt || '');
          outputUrl = out?.url;
        } else if (task === 'image-to-video' && p && typeof p.generateVideo === 'function') {
          const out = await p.generateVideo(body.imageId || 'img_default', body.prompt);
          outputUrl = out?.url;
        } else if (task === 'text-to-audio' && p && typeof p.generateAudio === 'function') {
          const out = await p.generateAudio(body.prompt || '');
          outputUrl = out?.url;
        } else {
          // unsupported task for provider
          return res(ctx.status(400), ctx.json({ error: 'Unsupported task/provider combination' }));
        }

  const newCredits = Math.max(0, credits - 1);
  try { setServerCredits(newCredits); } catch (err) { void err; }
        try { if (typeof window !== 'undefined') (window as any).__LAST_NEW_CREDITS__ = newCredits; else (global as any).__LAST_NEW_CREDITS__ = newCredits; } catch (err) { void err; }
        return res(ctx.status(200), ctx.json({ url: outputUrl, newCredits, provider, task }));
      } catch (err) { return res(ctx.status(500), ctx.json({ ok: false })); }
    }),
    // Save video endpoint used by the Director feature. Accepts FormData with a file and returns a persistent URL.
    rest.post('/api/save-video', async (req: any, res: any, ctx: any) => {
      try {
        // For browser worker, req.formData() is available
        let fd: any = {};
        try { fd = await req.formData(); } catch (e) { try { const raw = await req.json(); fd = raw || {}; } catch (e2) { fd = {}; } }
        // We don't actually write files in tests; return a deterministic persistent URL
        const outUrl = '/output/generated-videos/final-campaign-video.mp4';
        return res(ctx.status(200), ctx.json({ url: outUrl }));
      } catch (err) {
        return res(ctx.status(500), ctx.json({ error: 'failed' }));
      }
    }),
  ];
} else if (http) {
  handlers = [
    http.post('/api/v1/agency/actions', async (req: any) => {
      try {
        let body: any = {};
        try { body = await req.json(); } catch (e) { try { const t = await req.text(); body = t ? JSON.parse(t) : {}; } catch (e2) { void e2; body = (req as any).body || {}; } }
        const items = Array.isArray(body && body.items) ? body.items : (Array.isArray(body) ? body : []);
        const existing = readSession();
        const now = new Date().toISOString();
        const stored = existing.concat(items.map((i: unknown) => ({ action: 'save', prompt: String(i), at: now })));
        writeSession(stored);
        return { status: 200, body: JSON.stringify({ ok: true }), headers: { 'Content-Type': 'application/json' } };
      } catch (err) { return { status: 200, body: JSON.stringify({ ok: false }) }; }
    }),

    http.get('/api/v1/agency/insights', (req: any) => {
      const existing = readSession();
      const savedPrompts = existing.map((x) => x.prompt).filter((p): p is string => typeof p === 'string');
      return { status: 200, body: JSON.stringify({ savedPrompts, count: savedPrompts.length }), headers: { 'Content-Type': 'application/json' } };
    }),

    http.post('/api/v1/telemetry/events', async (req: any) => {
      try { await req.json(); return { status: 200, body: JSON.stringify({ ok: true }), headers: { 'Content-Type': 'application/json' } }; } catch (err) { void err; return { status: 400, body: JSON.stringify({ ok: false }), headers: { 'Content-Type': 'application/json' } }; }
    }),

    http.post('/api/generate-video', async (req: any) => {
      try {
        let body: any = {};
        try { body = await req.json(); } catch (e) { try { const t = await req.text(); body = t ? JSON.parse(t) : {}; } catch (e2) { void e2; body = (req as any).body || {}; } }
    const provider = (body && body.provider) || 'stability';
        let credits = 0;
        try { credits = Number(getServerCredits() || 0); } catch (err) { void err; credits = 0; }
        try { setLastRequest('/api/generate-video', body); } catch (err) { void err; }
        if (!credits || credits <= 0) { return { status: 402, body: JSON.stringify({ error: 'Payment Required', code: 'NO_CREDITS' }) }; }
        let videoUrl = '/videos/nexus_preview.mp4';
    if (provider === 'stability') videoUrl = '/videos/placeholders/stability_output.mp4';
        if (provider === 'stabilityai') videoUrl = '/videos/placeholders/stability_output.mp4';
        if (provider === 'huggingface') videoUrl = '/videos/placeholders/hf_output.mp4';
  const newCredits = Math.max(0, credits - 1);
  try { setServerCredits(newCredits); } catch (err) { void err; }
        // expose for tests/debuggers so they can assert authoritative server value
        try { if (typeof window !== 'undefined') (window as any).__LAST_NEW_CREDITS__ = newCredits; else (global as any).__LAST_NEW_CREDITS__ = newCredits; } catch (err) { void err; }
        // no debug logs in production handlers
        return { status: 200, body: JSON.stringify({ previewVideoUrl: videoUrl, newCredits, provider }), headers: { 'Content-Type': 'application/json' } };
      } catch (err) { return { status: 500, body: JSON.stringify({ ok: false }), headers: { 'Content-Type': 'application/json' } }; }
    }),

    // New universal generate endpoint for http handlers
    http.post('/api/generate', async (req: any) => {
      try {
        let body: any = {};
        try { body = await req.json(); } catch (e) { try { const t = await req.text(); body = t ? JSON.parse(t) : {}; } catch (e2) { void e2; body = (req as any).body || {}; } }
        // no debug logs in production handlers
        // If body is empty, msw/http may have raw payload under req.request; try to recover it
        try {
          if ((!body || Object.keys(body).length === 0) && req && req.request) {
            let raw: any = undefined;
            try { raw = req.request.body || req.request.postData || req.request.text || undefined; } catch (err) { void err; raw = undefined; }
            // If it's a ReadableStream (whatwg), read it
            try {
              if (raw && typeof raw === 'object' && typeof raw.getReader === 'function') {
                try {
                  const reader = raw.getReader();
                  const chunks: Uint8Array[] = [];
                  let doneReading = false;
                  while (!doneReading) {
                    const { value, done } = await reader.read();
                    if (value) chunks.push(value);
                    if (done) doneReading = true;
                  }
                  const total = chunks.reduce((acc, c) => acc + c.length, 0);
                  const merged = new Uint8Array(total);
                  let offset = 0;
                  for (const c of chunks) {
                    merged.set(c, offset);
                    offset += c.length;
                  }
                  const txt = new TextDecoder().decode(merged);
                  try { const parsed = JSON.parse(txt); body = parsed || body; } catch (err) { void err; }
                } catch (err) { void err; }
              } else if (raw && typeof raw === 'string') {
                try { const parsed = JSON.parse(raw); body = parsed || body; } catch (err) { void err; }
              }
            } catch (err) { void err; }
            // some msw versions store parsed JSON under req.request.body.json
            try {
              if ((!body || Object.keys(body).length === 0) && req.request && req.request.body && typeof req.request.body === 'object') {
                body = req.request.body as any;
              }
            } catch (err) { void err; }
            // recovered body (silent)
          }
        } catch (err) { void err; }
        // request keys/body/url logging removed for production
        // Normalize header extraction: support Headers-like API or plain object
        let headerProvider: string | undefined = undefined;
        let headerTask: string | undefined = undefined;
        try {
          if (req.headers) {
            if (typeof req.headers.get === 'function') {
              headerProvider = req.headers.get('x-provider') || undefined;
              headerTask = req.headers.get('x-task') || undefined;
            } else if (typeof req.headers === 'object') {
              // plain object: keys may be lowercased
              headerProvider = (req.headers['x-provider'] || req.headers['X-Provider'] || req.headers['x_provider']) || undefined;
              headerTask = (req.headers['x-task'] || req.headers['X-Task'] || req.headers['x_task']) || undefined;
              // if values are arrays, take first
              if (Array.isArray(headerProvider)) headerProvider = String(headerProvider[0]);
              if (Array.isArray(headerTask)) headerTask = String(headerTask[0]);
            }
          }
        } catch (err) { void err; }

        // also try URL search params; req.url may be a string in the http handler
        let urlProvider: string | undefined = undefined;
        let urlTask: string | undefined = undefined;
        try {
          if (req && req.url) {
            if (req.url.searchParams && typeof req.url.searchParams.get === 'function') {
              urlProvider = req.url.searchParams.get('provider') || undefined;
              urlTask = req.url.searchParams.get('task') || undefined;
            } else if (typeof req.url === 'string') {
              try {
                const parsed = new URL(req.url, 'http://localhost');
                urlProvider = parsed.searchParams.get('provider') || undefined;
                urlTask = parsed.searchParams.get('task') || undefined;
              } catch (err) { void err; }
            }
          }
        } catch (err) { void err; }

        const provider = headerProvider || urlProvider || (body && (body.provider || 'runway'));
        const task = headerTask || urlTask || ((body && body.task) || 'text-to-image');
        let credits = 0;
        try { credits = Number(getServerCredits() || 0); } catch (err) { void err; credits = 0; }
        try { setLastRequest('/api/generate', { ...(body || {}), provider, task }); } catch (err) { void err; }
        if (!credits || credits <= 0) { return { status: 402, body: JSON.stringify({ error: 'Payment Required', code: 'NO_CREDITS' }) }; }

    const p = providerMap[provider] || providerMap['stability'];
        let outputUrl = '';

        if (task === 'text-to-image' && p && typeof p.generateImage === 'function') {
          const out = await p.generateImage(body.prompt || '');
          outputUrl = out?.url;
        } else if (task === 'image-to-video' && p && typeof p.generateVideo === 'function') {
          const out = await p.generateVideo(body.imageId || 'img_default', body.prompt);
          outputUrl = out?.url;
        } else if (task === 'text-to-audio' && p && typeof p.generateAudio === 'function') {
          const out = await p.generateAudio(body.prompt || '');
          outputUrl = out?.url;
        } else {
          return { status: 400, body: JSON.stringify({ error: 'Unsupported task/provider combination' }), headers: { 'Content-Type': 'application/json' } };
        }

  const newCredits = Math.max(0, credits - 1);
  try { setServerCredits(newCredits); } catch (err) { void err; }
        try { if (typeof window !== 'undefined') (window as any).__LAST_NEW_CREDITS__ = newCredits; else (global as any).__LAST_NEW_CREDITS__ = newCredits; } catch (err) { void err; }
        return { status: 200, body: JSON.stringify({ url: outputUrl, newCredits, provider, task }), headers: { 'Content-Type': 'application/json' } };
      } catch (err) { return { status: 500, body: JSON.stringify({ ok: false }), headers: { 'Content-Type': 'application/json' } }; }
    }),
    // Save video endpoint (http handlers)
    http.post('/api/save-video', async (req: any) => {
      try {
        // msw/http raw body may be available; ignore content and return deterministic URL
        const outUrl = '/output/generated-videos/final-campaign-video.mp4';
        return { status: 200, body: JSON.stringify({ url: outUrl }), headers: { 'Content-Type': 'application/json' } };
      } catch (err) { return { status: 500, body: JSON.stringify({ error: 'failed' }), headers: { 'Content-Type': 'application/json' } }; }
    }),
  ];
}

export { handlers };
export default handlers;
