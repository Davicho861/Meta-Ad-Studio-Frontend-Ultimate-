import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkCampaignAssetsReport } from '../checkAssets';
import { mockImages } from '@/lib/mockData.ts';

type FetchResponse = { ok: boolean; status: number };

// Small helper to temporarily replace global.fetch
const makeFetchMock = (mapping: Record<string, number>) => {
  return vi.fn(async (url: string, _opts?: unknown): Promise<FetchResponse> => {
    const status = mapping[url] ?? 200;
    return { ok: status >= 200 && status < 300, status };
  });
};

describe('checkCampaignAssetsReport', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('reports all ok when fetch returns 200 for all assets', async () => {
    const map: Record<string, number> = {};
    // populate mapping with 200 for all known mock images entries
    for (const img of mockImages.filter(i => i.id.startsWith('campaign_'))) {
      if (img.url) map[img.url] = 200;
      if (img.srcWebp) map[img.srcWebp] = 200;
      if (img.srcJpg) map[img.srcJpg] = 200;
      if (img.srcSet) {
        if (img.srcSet.webp) map[img.srcSet.webp] = 200;
        if (img.srcSet.webp2x) map[img.srcSet.webp2x] = 200;
        if (img.srcSet.jpg) map[img.srcSet.jpg] = 200;
        if (img.srcSet.jpg2x) map[img.srcSet.jpg2x] = 200;
      }
    }

  (global as unknown as { fetch?: typeof fetch }).fetch = makeFetchMock(map) as unknown as typeof fetch;
    const report = await checkCampaignAssetsReport();
    expect(report).not.toBeNull();
    if (report) {
      expect(report.missing.length).toBe(0);
      expect(report.ok.length).toBeGreaterThan(0);
    }
  });

  it('reports missing assets when fetch returns 404', async () => {
    const map: Record<string, number> = {};
    // make first campaign's url 404
    const first = mockImages.filter(i => i.id.startsWith('campaign_'))[0];
    if (first && first.url) map[first.url] = 404;

  (global as unknown as { fetch?: typeof fetch }).fetch = makeFetchMock(map) as unknown as typeof fetch;
    const report = await checkCampaignAssetsReport();
    expect(report).not.toBeNull();
    if (report) {
      expect(report.missing.length).toBeGreaterThanOrEqual(1);
      const found = report.missing.find(m => m.entry.url === first.url);
      expect(found).toBeTruthy();
    }
  });
});
