// CommonJS mirror for compatibility
const _mockImages = [];

function addTemplate(newImage) {
  if (!newImage) return;
  if (!newImage.id) newImage.id = `gen_${Date.now()}`;
  if (!newImage.timestamp) newImage.timestamp = new Date();
  const existsById = _mockImages.some(img => img.id === newImage.id);
  const existsByContent = _mockImages.some(img => img.url === newImage.url && img.prompt === newImage.prompt);
  if (existsById || existsByContent) return;
  _mockImages.push(newImage);
}

function saveTemplatesToStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem('meta_ad_studio_templates_v1', JSON.stringify(_mockImages));
  } catch (e) { /* noop */ }
}

function loadTemplatesFromStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem('meta_ad_studio_templates_v1');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    parsed.forEach(p => { if (p.timestamp && typeof p.timestamp === 'string') p.timestamp = new Date(p.timestamp); });
    return parsed;
  } catch (e) { return null; }
}

function exportTemplates() { return JSON.stringify(_mockImages, null, 2); }

function importTemplatesFromJSON(parsed) {
  if (!Array.isArray(parsed)) throw new Error('Invalid templates payload');
  const added = [];
  for (const item of parsed) {
    try {
      const candidate = item;
      if (!candidate.url || !candidate.prompt) continue;
      if (candidate.timestamp && typeof candidate.timestamp === 'string') candidate.timestamp = new Date(candidate.timestamp);
      const beforeLen = _mockImages.length;
      addTemplate(candidate);
      if (_mockImages.length > beforeLen) added.push(candidate);
    } catch (e) { }
  }
  return added;
}

function importData(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      const added = importTemplatesFromJSON(parsed);
      return { success: true, message: `${added.length} plantillas importadas.`, count: added.length };
    }
    const data = parsed;
    if (!data || !data.campaignName || !Array.isArray(data.phases)) throw new Error('Invalid campaign');
    let importedCount = 0;
    for (const phase of data.phases) {
      if (!phase || !Array.isArray(phase.assets)) continue;
      for (const assetId of phase.assets) {
        if (!assetId || typeof assetId !== 'string') continue;
        const existing = _mockImages.find(m => m.id === assetId);
        if (existing) continue;
        const newTemplate = {
          id: assetId,
          prompt: phase.description || data.campaignName,
          url: '/images/campaign-examples/aura_times_square.webp',
          alt: `${data.campaignName} - ${phase.name || 'asset'}`,
          credit: 'Generado por Meta Ad Studio',
          srcJpg: '/images/campaign-examples/aura_times_square.jpg',
          srcWebp: '/images/campaign-examples/aura_times_square.webp',
          srcSet: { webp: '/images/campaign-examples/aura_times_square.webp', webp2x: '/images/campaign-examples/aura_times_square-2x.webp', jpg: '/images/campaign-examples/aura_times_square.jpg', jpg2x: '/images/campaign-examples/aura_times_square-2x.jpg' },
          timestamp: new Date()
        };
        const beforeLen = _mockImages.length;
        addTemplate(newTemplate);
        if (_mockImages.length > beforeLen) importedCount++;
      }
    }
    return { success: true, message: `¡Campaña "${data.campaignName}" importada! Se añadieron ${importedCount} nuevas plantillas.`, count: importedCount };
  } catch (error) {
    return { success: false, message: 'Error al importar: El archivo podría estar dañado o no tener el formato correcto.', count: 0 };
  }
}

function _resetMockImages(newArr) {
  _mockImages.length = 0;
  if (newArr && Array.isArray(newArr)) for (const it of newArr) _mockImages.push(it);
}

function getTemplates() { return _mockImages.slice(); }

function removeTemplate(id) { const idx = _mockImages.findIndex(m => m.id === id); if (idx === -1) return false; _mockImages.splice(idx,1); return true; }

// Export the runtime-friendly CommonJS mirror for tooling and scripts.
// This mirrors the TypeScript implementation minimally so server-side
// scripts and the build can import `mockImages` and helper functions.
export const mockImages = _mockImages;
export { getTemplates, addTemplate, removeTemplate, importData, exportTemplates, _resetMockImages };
