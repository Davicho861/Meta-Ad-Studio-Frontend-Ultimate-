import { GeneratedImage } from './mockData';

export type TypeFilter = 'all' | 'generated' | 'uploaded';

export function filterAssets(assets: GeneratedImage[], query: string, typeFilter: TypeFilter) {
  const q = (query || '').trim().toLowerCase();
  return (assets || []).filter(a => {
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    if (!q) return true;
    const haystack = `${a.alt || ''} ${a.prompt || ''} ${a.id || ''} ${a.url || ''}`.toLowerCase();
    return haystack.includes(q);
  });
}

export default filterAssets;
