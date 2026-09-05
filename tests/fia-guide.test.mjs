import assert from 'node:assert/strict';
import fs from 'node:fs';

const web = fs.readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../frontend/beta-mobile.html', import.meta.url), 'utf8');
const guide = fs.readFileSync(new URL('../frontend/js/fia-guide.js', import.meta.url), 'utf8');
const securitySearch = fs.readFileSync(new URL('../frontend/js/fia-security-search.js', import.meta.url), 'utf8');
const purchaseSearch = fs.readFileSync(new URL('../frontend/js/fia-purchase-search.js', import.meta.url), 'utf8');
const humanPresence = fs.readFileSync(new URL('../frontend/js/fia-human-presence.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../frontend/css/fia-guide.css', import.meta.url), 'utf8');
const purchaseCss = fs.readFileSync(new URL('../frontend/css/fia-purchase-search.css', import.meta.url), 'utf8');
const humanPresenceCss = fs.readFileSync(new URL('../frontend/css/fia-human-presence.css', import.meta.url), 'utf8');
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
assert.match(guide, /fia-purchase-search\.js/);
assert.doesNotMatch(guide, /localStorage\.setItem\([^)]*fia-guide-search/i);

assert.match(securitySearch, /L0_DEMO/);
assert.match(securitySearch, /L1_ISOLATED/);
assert.match(securitySearch, /L2_VERIFIED/);
assert.match(securitySearch, /L3_SHARED/);
assert.match(securitySearch, /L4_ADVANCED/);
assert.match(securitySearch, /datos personales interempresa L4/);
assert.match(securitySearch, /purchaseIntent/);
assert.match(securitySearch, /queryStored:false/);
assert.match(securitySearch, /fiaFundCustody:false/);
assert.match(securitySearch, /crossOrganizationCriticalData:false/);

assert.match(purchaseSearch, /I0_PUBLIC/);
assert.match(purchaseSearch, /I1_ISOLATED_BUSINESS/);
assert.match(purchaseSearch, /I2_CONNECTED_INTERNAL/);
assert.match(purchaseSearch, /I3_SHARED_BUSINESS/);
assert.match(purchaseSearch, /I4_REVIEWED_PERSONAL/);
assert.match(purchaseSearch, /Solo los criterios escritos en esta búsqueda/);
assert.match(purchaseSearch, /Subir de nivel no autoriza a FIA a usar todo/);
assert.match(purchaseSearch, /patrocinio aporta 0 puntos/);
assert.match(purchaseSearch, /DEMO · SIN OFERTAS REALES/);
assert.match(purchaseSearch, /fia-human-presence\.js/);
assert.match(purchaseSearch, /queryStored:false/);
assert.match(purchaseSearch, /fiaFundCustody:false/);

assert.match(humanPresence, /HUMAN_LIKELY/);
assert.match(humanPresence, /AUTOMATION_SUSPECTED/);
assert.match(humanPresence, /Toca a FIA una vez/);
assert.match(humanPresence, /identityVerified:false/);
assert.match(humanPresence, /trustLevelElevated:false/);
assert.match(humanPresence, /rawInteractionEventsStored:false/);
assert.doesNotMatch(humanPresence, /localStorage/);
assert.match(humanPresenceCss, /fia-human-challenge-ready/);

assert.match(css, /fia-guide-level-meta/);
assert.match(purchaseCss, /fia-purchase-result-card/);
assert.match(allowlist, /css\/fia-guide\.css/);
assert.match(allowlist, /css\/fia-purchase-search\.css/);
assert.match(allowlist, /css\/fia-human-presence\.css/);
assert.match(allowlist, /js\/fia-guide\.js/);
assert.match(allowlist, /js\/fia-security-search\.js/);
assert.match(allowlist, /js\/fia-purchase-search\.js/);
assert.match(allowlist, /js\/fia-human-presence\.js/);

console.log('fia-guide.test.mjs passed');
