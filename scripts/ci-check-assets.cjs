const { checkCampaignAssetsReport } = require('../src/utils/checkAssets');

(async () => {
  try {
    const report = await checkCampaignAssetsReport();
    if (report === null) {
      console.log('Asset checker skipped in non-dev/unsupported environment.');
      process.exit(0);
    }
    const missing = report.missing;
    console.log(`Assets OK: ${report.ok.length}, Missing: ${missing.length}`);
    if (missing.length > 0) {
      console.error('Missing assets detected:');
      for (const m of missing) console.error(`${m.entry.field}: ${m.entry.url} ${m.status ? `(${m.status})` : ''}`);
      process.exit(2);
    }
    process.exit(0);
  } catch (e) {
    console.error('Asset check failed', e);
    process.exit(3);
  }
})();
