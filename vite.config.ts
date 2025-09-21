import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { statSync, createReadStream } from 'fs';
import { extname } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Proxy API calls in dev to the local mock API server (port 3001)
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
    port: 5173,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Serve the output/ folder as static so generated artifacts are reachable at /output/*
  configureServer: (server: any) => {
    // The dev server type isn't critical here; suppress `any` complaints for middleware wiring
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { middlewares } = server as any;
    try {
      const outDir = path.resolve(__dirname, 'output');
      statSync(outDir);
      // simple static handler for /output
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      middlewares.use('/output', (req: any, res: any, next: any) => {
        try {
          const urlPath = decodeURIComponent(req.url || req.path || '');
          // normalize and prevent path traversal
          if (urlPath.includes('..')) return next();
          const filePath = path.join(outDir, urlPath.replace(/^\//, ''));
          try { statSync(filePath); } catch (e) { return next(); }
          const stream = createReadStream(filePath);
          const ext = extname(filePath).toLowerCase();
          const mime = ext === '.mp4' ? 'video/mp4' : ext === '.png' ? 'image/png' : 'application/octet-stream';
          res.setHeader('Content-Type', mime);
          stream.pipe(res);
        } catch (e) { return next(); }
      });
    } catch (e) {
      // no output dir yet; ignore
    }
  },
}));
