#!/usr/bin/env node
/* Simple Runway proxy for local demo
   - Reads RUNWAY_API_KEY from .env
   - Exposes a small HTTP server with POST /proxy/generate
   - Accepts JSON { task, provider, imageId, prompt }
   - Starts a runway generation and polls until complete
   Note: minimal implementation for demo purposes only.
*/
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// load .env if present
const dotenvPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(dotenvPath)) {
  const env = fs.readFileSync(dotenvPath, 'utf8');
  env.split(/\n/).forEach(line => {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/i);
    if (m) process.env[m[1]] = m[2];
  });
}

const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY || '';
if (!RUNWAY_API_KEY) {
  console.warn('Warning: RUNWAY_API_KEY not set. Proxy will reject requests.');
}

const PORT = process.env.RUNWAY_PROXY_PORT || 8890;

const json = (res, code, obj) => {
  const s = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(s);
};

// Minimal Runway client using fetch
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

// Helpers based on Runway API (public docs may change). This implementation
// assumes a typical flow: POST /v1/jobs -> poll GET /v1/jobs/:id

async function startRunwayJob(body) {
  if (!RUNWAY_API_KEY) throw new Error('RUNWAY_API_KEY missing');
  // Runway public API base (use dev host per Runway documentation for public API keys)
  const url = 'https://api.dev.runwayml.com/v1/jobs';
  // Try without version header first, if server complains about version, retry common versions
  let resp = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${RUNWAY_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  let text = '';
    if (!resp.ok) {
      try { text = await resp.text(); } catch (e) { text = ''; }
      console.error('Runway POST failed:', resp.status, text);
    // if error indicates missing/invalid version, try fallback versions
    if (/version/i.test(text) || /X-Runway-Version/i.test(text) || resp.status === 400) {
      const candidates = [process.env.RUNWAY_API_VERSION || '2024-10-01', '2024-06-01', '2024-01-01'];
      for (const v of candidates) {
        console.error('Retrying with X-Runway-Version=', v);
        resp = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${RUNWAY_API_KEY}`, 'Content-Type': 'application/json', 'X-Runway-Version': v }, body: JSON.stringify(body) });
        try { const t = await resp.text(); console.error('Retry response:', resp.status, t); } catch(e){}
        if (resp.ok) break;
      }
      if (!resp.ok) {
        const t2 = await resp.text().catch(()=>text);
        throw new Error(`Runway job start failed: ${resp.status} ${t2}`);
      }
    } else {
      throw new Error(`Runway job start failed: ${resp.status} ${text}`);
    }
  }
  return resp.json();
}

async function getRunwayJob(id) {
  if (!RUNWAY_API_KEY) throw new Error('RUNWAY_API_KEY missing');
  const url = `https://api.dev.runwayml.com/v1/jobs/${encodeURIComponent(id)}`;
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${RUNWAY_API_KEY}`, 'X-Runway-Version': process.env.RUNWAY_API_VERSION || '2024-10-01' } });
  if (!resp.ok) throw new Error(`Runway job fetch failed ${resp.status}`);
  return resp.json();
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (req.method === 'POST' && url.pathname === '/proxy/generate') {
      let body = '';
      req.on('data', c => body += c);
      await new Promise(r => req.on('end', r));
      let payload = {};
      try { payload = JSON.parse(body || '{}'); } catch (e) { payload = {}; }

      if (!RUNWAY_API_KEY) return json(res, 400, { error: 'RUNWAY_API_KEY not set on proxy' });

      // Build Runway job body - adapt per user's needs. We'll use a generic model invocation.
      const jobBody = {
        model: 'video-generator',
        inputs: {
          image: payload.imageUrl || payload.imageId || '',
          prompt: payload.prompt || ''
        },
        // optional: specify presets
      };

      let started;
      try {
        started = await startRunwayJob(jobBody);
      } catch (err) {
        return json(res, 502, { error: String(err) });
      }

      const jobId = started?.id || started?.jobId || started?.name;
      if (!jobId) return json(res, 502, { error: 'No job id from runway' });

      // poll until complete or timeout
      const timeout = Number(process.env.RUNWAY_PROXY_TIMEOUT_MS || 90000);
      const start = Date.now();
      while (Date.now() - start < timeout) {
        try {
          const info = await getRunwayJob(jobId);
          const status = info?.status || info?.state || '';
          if (status === 'succeeded' || status === 'completed' || status === 'finished') {
            // attempt to find output URL
            const outputs = info?.outputs || info?.artifacts || [];
            const first = Array.isArray(outputs) && outputs.length ? outputs[0] : info?.output || null;
            const urlOut = (first && (first.url || first.uri)) || null;
            return json(res, 200, { jobId, status: 'succeeded', output: urlOut, raw: info });
          }
          if (status === 'failed' || status === 'error') return json(res, 500, { jobId, status: 'failed', raw: info });
        } catch (err) {
          // continue polling - transient errors
        }
        await new Promise(r => setTimeout(r, 2500));
      }

      return json(res, 202, { jobId, status: 'pending', message: 'Timed out waiting for runway job', timeout: true });
    }

    json(res, 404, { error: 'not found' });
  } catch (err) {
    json(res, 500, { error: String(err) });
  }
});

server.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Runway proxy listening on http://localhost:${PORT} — RUNWAY_API_KEY set: ${!!RUNWAY_API_KEY}`);
  }
});
