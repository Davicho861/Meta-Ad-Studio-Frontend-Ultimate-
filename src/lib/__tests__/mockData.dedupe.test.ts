import { addTemplate, loadTemplatesFromStorage } from '@/lib/mockData.ts';
import type { GeneratedImage } from '@/lib/mockData.ts';

describe('mockData deduplication', () => {
  beforeEach(() => { localStorage.clear(); });

  it('does not duplicate identical templates', () => {
    const img: GeneratedImage = { id: 'dedupe_1', url: '/images/campaign-examples/aura_times_square.webp', prompt: 'dupe prompt', timestamp: new Date() } as GeneratedImage;
    addTemplate(img);
    addTemplate(img);

    const loaded = loadTemplatesFromStorage();
    const matches = loaded?.filter(i => i.id === 'dedupe_1' || (i.url === img.url && i.prompt === img.prompt));
    expect(matches?.length).toBe(1);
  });
});
