import { importData, getTemplates, _resetMockImages, addTemplate } from '../mockData.ts';

describe('importData', () => {
  beforeEach(() => {
    // reset mock images
    _resetMockImages();
  });

  test('imports campaign plan and creates templates', () => {
    const plan = {
      campaignName: 'Test Campaign',
      phases: [
        { name: 'Phase 1', description: 'Desc 1', assets: ['asset_1'] }
      ]
    };
    const res = importData(JSON.stringify(plan));
    expect(res.success).toBe(true);
    expect(res.count).toBe(1);
    const all = getTemplates();
    expect(all.find(t => t.id === 'asset_1')).toBeDefined();
  });

  test('imports array of templates', () => {
    const arr = [ { id: 't1', url: '/a.jpg', prompt: 'p', timestamp: new Date() } ];
    const res = importData(JSON.stringify(arr));
    expect(res.success).toBe(true);
    expect(res.count).toBe(1);
  });

  test('handles malformed json gracefully', () => {
    const res = importData('not a json');
    expect(res.success).toBe(false);
  });

  test('does not duplicate when asset exists', () => {
    addTemplate({ id: 'asset_2', url: '/b.jpg', prompt: 'p2', timestamp: new Date() });
    const plan = { campaignName: 'C', phases: [ { assets: ['asset_2'] } ] };
    const res = importData(JSON.stringify(plan));
    expect(res.success).toBe(true);
    // count should be 0 because asset existed
    expect(res.count).toBe(0);
  });
});
