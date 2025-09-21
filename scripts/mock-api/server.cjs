#!/usr/bin/env node
/* Minimal mock API server for E2E tests
   POST /api/save-video accepts multipart/form-data and returns a deterministic URL
*/
const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();
const upload = multer(); // memory storage

const PORT = process.env.MOCK_API_PORT || 3001;

app.use(cors());

app.post('/api/save-video', upload.single('file'), (req, res) => {
  try {
    // req.file available; we don't need to persist it to disk for tests
    const file = req.file;
    // simple validation
    if (!file) {
      return res.status(400).json({ error: 'no file' });
    }
    // return deterministic persistent URL
    const outUrl = '/output/generated-videos/final-campaign-video.mp4';
    return res.status(200).json({ url: outUrl });
  } catch (err) {
    return res.status(500).json({ error: 'internal' });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Mock API server listening on http://localhost:${PORT}`);
  }
});
