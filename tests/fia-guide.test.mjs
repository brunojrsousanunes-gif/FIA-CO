import assert from 'node:assert/strict';
import fs from 'node:fs';

const web = fs.readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../frontend/beta-mobile.html', import.meta.url), 'utf8');
const guide = fs.readFileSync(new URL('../frontend/js/fia-guide.js', import.meta.url), 'utf8');
const securitySearch = fs.readFileSync(new URL('../frontend/js/fia-security-search.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../frontend/css/fia-guide.css', import.meta.url), 'utf8');
const allowlist = fs.readFileSync(new URL('../config/pages-public-allowlist.txt', import.meta.url), 'utf8');

for (const html of [web, app]) {
  assert.match(html, /css\/fia-guide\.css/);
  assert.match(html, /js\/fia-guide\.js/);
  assert.match(html, /js\/fia-security-search\.js/);
}

assert.match(guide, /Explora, no te interroga/);
assert.match(guide, /REAL_SENSITIVE_VALUE_DETECTED/);
assert.match(guide, /COMPLETED_WITH_OPEN_INCIDENT/);
assert.match(guide, /aria-live="assertive"/);
assert.match(guide, /query|buscar|conversar/i);
assert.doesNotMatch(guide, /localStorage\.setItem\([^)]*fia-guide-search/i);

assert.match(securitySearch, /L0_DEMO/);
assert.match(securitySearch, /L1_ISOLATED/);
assert.match(securitySearch, /L2_VERIFIED/);
assert.match(securitySearch, /L3_SHARED/);
assert.match(securitySearch, /L4_ADVANCED/);
assert.match(securitySearch, /datos personales interempresa L4/);
assert.match(securitySearch, /queryStored:false/);
assert.match(securitySearch, /fiaFundCustody:false/);
assert.match(securitySearch, /crossOrganizationCriticalData:false/);
assert.match(css, /fia-guide-level-meta/);

assert.match(allowlist, /css\/fia-guide\.css/);
assert.match(allowlist, /js\/fia-guide\.js/);
assert.match(allowlist, /js\/fia-security-search\.js/);

console.log('fia-guide.test.mjs passed');
