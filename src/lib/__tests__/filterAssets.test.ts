import { describe, it, expect } from 'vitest';
import { filterAssets } from '@/lib/filterAssets';
import { GeneratedImage } from '@/lib/mockData';

const assets: GeneratedImage[] = [
  { id: 'a1', url: '/a1.jpg', type: 'generated', prompt: 'Sunset city', timestamp: new Date() },
  { id: 'a2', url: '/a2.jpg', type: 'uploaded', prompt: 'Portrait of Alice', timestamp: new Date(), alt: 'Alice' },
  { id: 'a3', url: '/a3.jpg', type: 'generated', prompt: 'Mountain', timestamp: new Date() }
];

describe('filterAssets', () => {
  it('returns all when query empty and filter all', () => {
    const res = filterAssets(assets, '', 'all');
    expect(res.length).toBe(3);
  });

  it('filters by type uploaded', () => {
    const res = filterAssets(assets, '', 'uploaded');
    expect(res.length).toBe(1);
    expect(res[0].id).toBe('a2');
  });

  it('filters by query across fields', () => {
    const res = filterAssets(assets, 'alice', 'all');
    expect(res.length).toBe(1);
    expect(res[0].id).toBe('a2');
  });
});
