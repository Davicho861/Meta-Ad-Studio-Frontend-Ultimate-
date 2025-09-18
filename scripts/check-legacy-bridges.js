const { execSync } = require('child_process');

try {
  const result = execSync("git ls-files 'src/lib/mockData.*' || true", { encoding: 'utf8' }).trim();
  const lines = result.split('\n').filter(Boolean);
  const legacy = lines.filter(l => /mockData\.(cjs|js)$/.test(l));
  if (legacy.length) {
    console.error('Found legacy mockData bridge files:\n' + legacy.join('\n'));
    process.exit(1);
  }
  const hasIndex = lines.includes('src/lib/mockData/index.cjs');
  const hasPkg = lines.includes('src/lib/mockData/package.json');
  if (hasIndex || hasPkg) {
    console.error('Found legacy package bridge in src/lib/mockData/: index.cjs or package.json');
    process.exit(1);
  }
  console.log('No legacy bridges found.');
  process.exit(0);
} catch (e) {
  console.error('Error running legacy check', e);
  process.exit(2);
}
