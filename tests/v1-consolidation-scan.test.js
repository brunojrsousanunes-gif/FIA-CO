const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const frontend = path.join(root, 'frontend');
const allowlistPath = path.join(root, 'config/pages-public-allowlist.txt');
const scriptScheme = 'java' + 'script:';

const entries = fs.readFileSync(allowlistPath, 'utf8')
  .split(/\r?\n/)
  .map(x => x.trim())
  .filter(x => x && !x.startsWith('#'));

for (const rel of entries) {
  assert(fs.existsSync(path.join(frontend, rel)), `Allowlisted public file missing: ${rel}`);
}

const publicHtml = entries.filter(x => x.endsWith('.html'));
const localRefs = [];

for (const rel of publicHtml) {
  const html = fs.readFileSync(path.join(frontend, rel), 'utf8');
  const re = /(?:href|src)=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(html))) {
    const ref = m[1];
    if (!ref || ref.startsWith('#') || ref.startsWith('http://') || ref.startsWith('https://') || ref.startsWith('mailto:') || ref.startsWith('tel:') || ref.startsWith('data:') || ref.startsWith(scriptScheme)) continue;
    const clean = ref.split('#')[0].split('?')[0];
    if (!clean) continue;
    const normalized = clean.startsWith('/')
      ? clean.slice(1)
      : path.posix.normalize(path.posix.join(path.posix.dirname(rel), clean));
    localRefs.push({ from: rel, ref, normalized });
  }
}

for (const item of localRefs) {
  assert(fs.existsSync(path.join(frontend, item.normalized)), `Broken local reference from ${item.from}: ${item.ref} -> ${item.normalized}`);
}

const v1 = JSON.parse(fs.readFileSync(path.join(root, 'config/v1-technical-authorization.json'), 'utf8'));
assert.strictEqual(v1.productionExecutionEnabled, false, 'Production execution must remain disabled during V1 consolidation');
assert.strictEqual(v1.realFundsEnabled, false, 'Real funds must remain disabled during V1 consolidation');
assert.strictEqual(v1.realPiiEnabled, false, 'Real PII must remain disabled during V1 consolidation');

const security = JSON.parse(fs.readFileSync(path.join(root, 'config/security-provider-strategy.json'), 'utf8'));
assert.strictEqual(security.automaticEnforcementAllowed, false, 'Automatic security enforcement must remain disabled');
assert.strictEqual(security.realCredentialsAllowed, false, 'Real security credentials must remain disabled');

console.log(`V1 consolidation scan OK: ${entries.length} public files, ${publicHtml.length} HTML routes, ${localRefs.length} local references checked.`);
