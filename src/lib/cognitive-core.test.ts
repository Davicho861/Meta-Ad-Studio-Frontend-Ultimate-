import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as core from './cognitive-core';

// Mock localStorage
const storage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (k: string) => storage[k] ?? null,
  setItem: (k: string, v: string) => { storage[k] = v; },
  removeItem: (k: string) => { delete storage[k]; }
};

beforeEach(() => {
  // reset storage
  for (const k of Object.keys(storage)) delete storage[k];
  vi.stubGlobal('localStorage', mockLocalStorage as unknown as Storage);
});

describe('cognitive-core (simulado)', () => {
  it('evaluatePrompt asigna score y sugiere mejoras', () => {
    const short = core.evaluatePrompt('short');
    expect(short.score).toBeLessThan(70);
    expect(Array.isArray(short.suggestions)).toBe(true);

    const long = core.evaluatePrompt('This prompt has many words and includes cinematica y hora dorada y lente bokeh to test boosts and length > 120 characters '.repeat(2));
    expect(long.score).toBeGreaterThanOrEqual(80);
  });

  it('checkCoherence detecta conflicto Solarpunk vs Cyberpunk', () => {
  const asset: { aesthetics?: string } = { aesthetics: 'Solarpunk vibrant' };
  const note = 'Lanzar en un mundo Cyberpunk oscuro';
  const res = core.checkCoherence(asset, note) as { level?: string };
  expect(res.level).toBe('warning');

  const ok = core.checkCoherence(asset, 'Evento de jardín ecológico') as { level?: string };
  expect(ok.level === 'ok' || ok.level === undefined).toBeTruthy();
  });

  it('recordTemplateAction y getAgencyInsights persisten en localStorage', () => {
    core.recordTemplateAction('save', 'Imagen con iluminación cinematográfica');
    core.recordTemplateAction('save', 'Otra imagen con hora dorada');
    const insights = core.getAgencyInsights();
    expect(insights.savedCount).toBeGreaterThanOrEqual(2);
    expect(Array.isArray(insights.patterns)).toBeTruthy();
  });
});
