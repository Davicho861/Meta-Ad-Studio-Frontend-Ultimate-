import { addTemplate, loadTemplatesFromStorage, saveTemplatesToStorage } from '@/lib/mockData.ts';
import type { GeneratedImage } from '@/lib/mockData.ts';

describe('mockData storage helpers', () => {
  beforeEach(() => { localStorage.clear(); });

  it('should persist a template to localStorage when addTemplate is called', () => {
    const img: GeneratedImage = {
      id: 'test_tpl_1',
      url: '/images/campaign-examples/aura_times_square.webp',
      prompt: 'test prompt',
      timestamp: new Date()
    } as GeneratedImage;

    addTemplate(img);
    const loaded = loadTemplatesFromStorage();
    expect(loaded).toBeTruthy();
    expect(Array.isArray(loaded)).toBe(true);
    expect(loaded?.find(i => i.id === 'test_tpl_1')).toBeTruthy();
  });
});
