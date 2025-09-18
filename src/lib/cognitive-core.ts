// Simulated Cognitive Core for Project Prometeo
// This module provides deterministic, simulated "insights" and actions
// used by the UI to demonstrate a proactive, auto-evolving layer.

type AppState = {
  prompt?: string;
  assets?: Array<{ id: string; name: string; tags?: string[]; aesthetics?: string }>; 
  campaignPlan?: string[];
};

type Suggestion = {
  id: string;
  title: string;
  description: string;
  confidence: number; // 0-100
};

const uuid = (prefix = 's') => `${prefix}_${Math.random().toString(36).slice(2,9)}`;

export const analyzeState = (state: AppState): Suggestion[] => {
  const out: Suggestion[] = [];
  const assets = state.assets || [];
  if (assets.length === 0) {
    out.push({ id: uuid('ins'), title: 'Agregar Activos', description: 'No hay activos detectados en este lienzo. Considera subir imágenes o vídeos para comenzar.', confidence: 85 });
  } else {
    out.push({ id: uuid('ins'), title: 'Revisar Secuencia', description: `Detectados ${assets.length} activos. Recomiendo crear una segunda fase para activación social.`, confidence: 78 });
  }
  if (state.prompt && state.prompt.length < 20) {
    out.push({ id: uuid('ins'), title: 'Enriquecer Prompt', description: 'Tu prompt es corto; añade contexto de estilo, público y objetivo para mejores resultados.', confidence: 88 });
  }
  return out;
};

export const suggestNextSteps = (assetId: string, state: AppState): Suggestion[] => {
  // Simula sugerencias basadas en etiquetas estéticas
  const asset = (state.assets || []).find(a => a.id === assetId);
  const base: Suggestion[] = [];
  base.push({ id: uuid('step'), title: 'Fase 2: Evento de lanzamiento', description: 'Plan: Evento de lanzamiento en Decentraland Art Week.', confidence: 72 });
  base.push({ id: uuid('step'), title: 'Crear Copy de Anuncio', description: 'Propuesta: Texto corto (20-40 caracteres) que resalta la experiencia inmersiva.', confidence: 80 });
  base.push({ id: uuid('step'), title: 'Identificar Audiencia', description: "Sugerencia: Público: coleccionistas de NFT y asistentes a arte digital 25-45 años.", confidence: 75 });
  if (asset?.aesthetics?.toLowerCase().includes('solarpunk')) {
    base.push({ id: uuid('step'), title: 'Sincronizar Estética', description: "Recomendación: Alinea la ambientación del evento con estética 'Solarpunk' para coherencia.", confidence: 82 });
  }
  return base;
};

export const evaluatePrompt = (prompt?: string) => {
  // Simula una puntuación y sugerencias
  const length = (prompt || '').trim().length;
  let score = 50;
  if (length > 120) score = 95;
  else if (length > 60) score = 80;
  else if (length > 30) score = 70;
  else if (length > 10) score = 60;
  // pequeños boosts por palabras clave
  const suggestions: string[] = [];
  if (!prompt) suggestions.push('Añade objetivos y público objetivo.');
  if (prompt && !/luz|iluminación|hora dorada|cinematográfica|cinemática/i.test(prompt)) {
    suggestions.push("Sugerencia: Añade detalles sobre la iluminación (p.ej. 'hora dorada', 'cinemática') y tipo de lente.");
  }
  if (prompt && !/lente|foco|bokeh|contraste|saturación/i.test(prompt)) {
    suggestions.push('Sugerencia: Indica tipo de lente o tratamiento de color para más impacto visual.');
  }
  return { score, suggestions };
};

export const checkCoherence = (assetA: { aesthetics?: string }, noteText: string) => {
  // Simula verificación entre estética y texto
  const a = assetA?.aesthetics || '';
  const conflict = /solarpunk/i.test(a) && /cyberpunk|oscuro|nocturno/i.test(noteText);
  if (conflict) {
    return { level: 'warning', message: "Alerta de Coherencia: La estética 'Solarpunk' del activo puede chocar con el tema 'Cyberpunk' del evento. Considerar ajustar uno de los dos." };
  }
  return { level: 'ok' };
};

export const optimizeAsset = (assetId: string) => {
  // Simula cambios aplicados: retorna un diff leve
  return { id: assetId, changes: { contrast: '+4%', saturation: '+3%', crop: 'center 2%'}, message: 'Optimización de IA aplicada. Contraste y saturación ajustados para una predicción de +5% de engagement.' };
};

// Persistence via adapter (localStorage fallback or remote when consented)
import adapter from '@/lib/persistence-adapter';
import { saveTelemetry } from '@/lib/persistence-adapter';

let savedPrompts: string[] = [];

const init = async () => {
  try {
    const loaded = await adapter.loadLearnings();
    if (Array.isArray(loaded)) savedPrompts = loaded;
  } catch (e) {
    // ignore
  }
};

// initialize in background
void init();

export const recordTemplateAction = async (action: 'save'|'delete', prompt?: string) => {
  try {
    if (action === 'save' && prompt) savedPrompts.push(prompt);
    if (action === 'delete' && prompt) {
      const idx = savedPrompts.indexOf(prompt);
      if (idx >= 0) savedPrompts.splice(idx,1);
    }
    // persist via adapter
    try {
      await adapter.saveLearnings(savedPrompts);
      // send telemetry event
      await adapter.saveTelemetry({ type: 'template_action', payload: { action, prompt } });
    } catch (e) {
      // ignore network or storage errors
    }
  } catch (e) {
    // swallow to keep UI stable
  }
};

export const getAgencyInsights = () => {
  const count = savedPrompts.length;
  const sample = savedPrompts.slice(-3);

  // derive simple patterns by scanning for keywords (simulado)
  const patterns: Array<{ pattern: string; uplift: string; examples: string[] }> = [];
  const joined = savedPrompts.join(' ').toLowerCase();
  if (/iluminaci(ó|o)n|cinemat/i.test(joined)) {
    patterns.push({ pattern: 'iluminación cinematográfica', uplift: '30%', examples: sample });
  }
  if (/hora dorada|golden hour/i.test(joined)) {
    patterns.push({ pattern: 'hora dorada', uplift: '12%', examples: sample });
  }
  if (patterns.length === 0) {
    // fallback generic pattern
    patterns.push({ pattern: 'Preferencias visuales detectadas', uplift: '10%', examples: sample });
  }

  return { savedCount: count, patterns };
};

export default {
  analyzeState,
  suggestNextSteps,
  evaluatePrompt,
  checkCoherence,
  optimizeAsset,
  recordTemplateAction,
  getAgencyInsights,
};
