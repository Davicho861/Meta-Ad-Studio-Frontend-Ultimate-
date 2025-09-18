import { mockImages } from '@/lib/mockData.ts';

type AssetEntry = { url: string; field: string };

export async function checkCampaignAssets(): Promise<void> {
  // Only run in a browser environment and during development
  if (typeof window === 'undefined' || !('fetch' in window) || process.env.NODE_ENV === 'production') return;

  const campaignImages = mockImages.filter(img => img.id.startsWith('campaign_'));

  const toCheck: AssetEntry[] = [];

  for (const img of campaignImages) {
    if (img.url) toCheck.push({ url: img.url, field: 'url' });
    if (img.srcWebp) toCheck.push({ url: img.srcWebp, field: 'srcWebp' });
    if (img.srcJpg) toCheck.push({ url: img.srcJpg, field: 'srcJpg' });
    if (img.srcSet) {
      if (img.srcSet.webp) toCheck.push({ url: img.srcSet.webp, field: 'srcSet.webp' });
      if (img.srcSet.webp2x) toCheck.push({ url: img.srcSet.webp2x, field: 'srcSet.webp2x' });
      if (img.srcSet.jpg) toCheck.push({ url: img.srcSet.jpg, field: 'srcSet.jpg' });
      if (img.srcSet.jpg2x) toCheck.push({ url: img.srcSet.jpg2x, field: 'srcSet.jpg2x' });
    }
  }

  await Promise.all(toCheck.map(async (entry) => {
    try {
      const res = await fetch(entry.url, { method: 'HEAD' });
      if (!res.ok) {
        console.warn(`Asset missing or inaccessible (${entry.field}): ${entry.url} (status ${res.status})`);
      }
    } catch (e) {
      console.warn(`Asset check failed for ${entry.field}: ${entry.url}`, e);
    }
  }));
}

export default checkCampaignAssets;

export type AssetReport = {
  ok: AssetEntry[];
  missing: Array<{ entry: AssetEntry; status?: number | string }>;
};

export async function checkCampaignAssetsReport(): Promise<AssetReport | null> {
  if (typeof window === 'undefined' || !('fetch' in window) || process.env.NODE_ENV === 'production') return null;

  const campaignImages = mockImages.filter(img => img.id.startsWith('campaign_'));
  const toCheck: AssetEntry[] = [];

  for (const img of campaignImages) {
    if (img.url) toCheck.push({ url: img.url, field: 'url' });
    if (img.srcWebp) toCheck.push({ url: img.srcWebp, field: 'srcWebp' });
    if (img.srcJpg) toCheck.push({ url: img.srcJpg, field: 'srcJpg' });
    if (img.srcSet) {
      if (img.srcSet.webp) toCheck.push({ url: img.srcSet.webp, field: 'srcSet.webp' });
      if (img.srcSet.webp2x) toCheck.push({ url: img.srcSet.webp2x, field: 'srcSet.webp2x' });
      if (img.srcSet.jpg) toCheck.push({ url: img.srcSet.jpg, field: 'srcSet.jpg' });
      if (img.srcSet.jpg2x) toCheck.push({ url: img.srcSet.jpg2x, field: 'srcSet.jpg2x' });
    }
  }

  const ok: AssetEntry[] = [];
  const missing: Array<{ entry: AssetEntry; status?: number | string }> = [];

  await Promise.all(toCheck.map(async (entry) => {
    try {
      const res = await fetch(entry.url, { method: 'HEAD' });
      if (res.ok) ok.push(entry);
      else missing.push({ entry, status: res.status });
    } catch (e) {
      missing.push({ entry, status: (e && (e as Error).message) || 'error' });
    }
  }));

  return { ok, missing };
}
