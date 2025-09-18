// Minimal Node-compatible implementation for scripts and tooling.
// This file intentionally provides a lightweight CommonJS API used by
// server-side scripts (for example, scripts/campaigns/create-celestia-campaign.cjs).
// It is not a full re-implementation of the browser/TypeScript runtime but
// implements the functions required by the orchestration scripts: addTemplate, exportTemplates, etc.

const mockImages = [];

function ensureTemplate(obj) {
  if (!obj) return null;
  const t = Object.assign({}, obj);
  if (!t.id) t.id = `gen_${Date.now()}`;
  if (!t.timestamp) t.timestamp = new Date().toISOString();
  return t;
}

function addTemplate(newImage) {
  const t = ensureTemplate(newImage);
  if (!t) return;
  const existsById = mockImages.some(img => img.id === t.id);
  const existsByContent = mockImages.some(img => img.url === t.url && img.prompt === t.prompt);
  if (existsById || existsByContent) return;
  mockImages.push(t);
}

function getTemplates() {
  return mockImages.slice();
}

function removeTemplate(id) {
  const idx = mockImages.findIndex(m => m.id === id);
  if (idx === -1) return false;
  mockImages.splice(idx, 1);
  return true;
}

function exportTemplates(filename) {
  // For node scripts we return a JSON string of current templates.
  try {
    return JSON.stringify(mockImages, null, 2);
  } catch (e) {
    throw e;
  }
}

function importData(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      let added = 0;
      for (const p of parsed) {
        const before = mockImages.length;
        addTemplate(p);
        if (mockImages.length > before) added++;
      }
      return { success: true, message: `${added} templates imported.`, count: added };
    }

    if (parsed && parsed.campaignName && Array.isArray(parsed.phases)) {
      let importedCount = 0;
      for (const phase of parsed.phases) {
        if (!phase || !Array.isArray(phase.assets)) continue;
        for (const assetId of phase.assets) {
          if (!assetId || typeof assetId !== 'string') continue;
          const exists = mockImages.find(m => m.id === assetId);
          if (exists) continue;
          addTemplate({ id: assetId, prompt: phase.description || parsed.campaignName, url: '/images/campaign-examples/aura_times_square.webp', alt: `${parsed.campaignName} - ${phase.name || 'asset'}`, credit: 'Generado por Meta Ad Studio', srcJpg: '/images/campaign-examples/aura_times_square.jpg', srcWebp: '/images/campaign-examples/aura_times_square.webp', srcSet: { webp: '/images/campaign-examples/aura_times_square.webp', webp2x: '/images/campaign-examples/aura_times_square-2x.webp', jpg: '/images/campaign-examples/aura_times_square.jpg', jpg2x: '/images/campaign-examples/aura_times_square-2x.jpg' } });
          // Attach a preview video where applicable (placeholder path)
          addTemplate({ id: assetId, prompt: phase.description || parsed.campaignName, url: '/images/campaign-examples/aura_times_square.webp', previewVideoUrl: '/videos/campaign-previews/aura_preview.mp4', alt: `${parsed.campaignName} - ${phase.name || 'asset'}`, credit: 'Generado por Meta Ad Studio', srcJpg: '/images/campaign-examples/aura_times_square.jpg', srcWebp: '/images/campaign-examples/aura_times_square.webp', srcSet: { webp: '/images/campaign-examples/aura_times_square.webp', webp2x: '/images/campaign-examples/aura_times_square-2x.webp', jpg: '/images/campaign-examples/aura_times_square.jpg', jpg2x: '/images/campaign-examples/aura_times_square-2x.jpg' } });
          importedCount++;
        }
      }
      if (importedCount === 0) return { success: true, message: `Campaña "${parsed.campaignName}" analizada, pero no se encontraron nuevos templates para importar.`, count: 0 };
      return { success: true, message: `¡Campaña "${parsed.campaignName}" importada! Se añadieron ${importedCount} nuevas plantillas.`, count: importedCount };
    }

    return { success: false, message: 'Formato JSON desconocido.', count: 0 };
  } catch (err) {
    return { success: false, message: String(err), count: 0 };
  }
}

module.exports = {
  getTemplates,
  addTemplate,
  removeTemplate,
  importData,
  exportTemplates,
  _internal: { mockImages }
};
