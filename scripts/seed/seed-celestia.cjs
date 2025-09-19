#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const outDir = path.join(__dirname, '..', '..', 'public', 'seed')
const outFile = path.join(outDir, 'celestia-campaign-seed.json')

const campaign = {
  id: 'celestia-el-brindis-sincronizado',
  title: 'El Brindis Sincronizado',
  source: 'seed-celestia',
  thumbnail: '/images/campaign-examples/coca-cola-drones-paris.jpg',
  preview: '/images/campaign-examples/coca-cola-drones-paris.jpg',
  provider: 'celestia',
  createdAt: new Date().toISOString(),
  prompt: 'Fotografía hiperrealista cinematográfica, vista de dron al atardecer sobre París, múltiples drones formando el logo de Coca-Cola en el cielo, tonos cálidos, luces de ciudad, bokeh, ultra-detailed, 8k',
  tags: ['coca-cola', 'drones', 'fotografía', 'parís', 'campaña'],
  metadata: {
    author: 'Meta Ad Studio Seed',
    license: 'internal-seed'
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

ensureDir(outDir)
fs.writeFileSync(outFile, JSON.stringify({ templates: [campaign] }, null, 2), 'utf8')
console.log('Wrote seed to', outFile)
/**
 * Seed script (CommonJS) para generar una plantilla "Celestia".
 * Uso propuesto:
 * - node scripts/seed/seed-celestia.cjs > seed-celestia.json
 * - Abrir la app en el navegador y ejecutar en la consola del DevTools:
 *   localStorage.setItem('meta_ad_studio_templates_v1', document.querySelector('pre#seed')?.textContent || '...');
 * Alternativamente ejecutar con Playwright para inyectar directamente.
 */

const celestiaTemplate = {
  id: 'celestia_campaign_001',
  url: '/images/campaign-examples/aura_times_square.webp',
  srcWebp: '/images/campaign-examples/aura_times_square.webp',
  srcJpg: '/images/campaign-examples/aura_times_square.jpg',
  srcSet: { webp: '/images/campaign-examples/aura_times_square.webp', webp2x: '/images/campaign-examples/aura_times_square-2x.webp', jpg: '/images/campaign-examples/aura_times_square.jpg', jpg2x: '/images/campaign-examples/aura_times_square-2x.jpg' },
  alt: 'Celestia — Advertising Launch',
  credit: 'Meta Ad Studio — seeded',
  prompt: 'Celestia — immersive bioluminescent metaverse launch with interactive holograms',
  timestamp: new Date(),
  engagement: 95,
  ctr: 6,
  reach: 300000
};

// Produce un array con las plantillas actuales por defecto y la plantilla Celestia al inicio
const seed = [celestiaTemplate];

// Output JSON serializable con timestamps como ISO strings
const out = JSON.stringify(seed.map(s => ({ ...s, timestamp: s.timestamp.toISOString() })), null, 2);
process.stdout.write(out);
