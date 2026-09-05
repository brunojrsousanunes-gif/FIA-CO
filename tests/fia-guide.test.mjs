import assert from 'node:assert/strict';
import fs from 'node:fs';

const web = fs.readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../frontend/beta-mobile.html', import.meta.url), 'utf8');
const publicGuide = fs.readFileSync(new URL('../frontend/js/fia-public-guide.js', import.meta.url), 'utf8');
const internalGuide = fs.readFileSync(new URL('../frontend/js/fia-guide.js', import.meta.url), 'utf8');
const securitySearch = fs.readFileSync(new URL('../frontend/js/fia-security-search.js', import.meta.url), 'utf8');
const purchaseSearch = fs.readFileSync(new URL('../frontend/js/fia-purchase-search.js', import.meta.url), 'utf8');
const humanPresence = fs.readFileSync(new URL('../frontend/js/fia-human-presence.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../frontend/css/fia-guide.css', import.meta.url), 'utf8');
const humanPresenceCss = fs.readFileSync(new URL('../frontend/css/fia-human-presence.css', import.meta.url), 'utf8');
const allowlist = fs.readFileSync(new URL('../config/pages-public-allowlist.txt', import.meta.url), 'utf8');

assert.match(web, /css\/fia-guide\.css/);
assert.match(web, /js\/fia-public-guide\.js/);
assert.match(web, /js\/fia-first-contact\.js/);
assert.match(web, /js\/fia-human-presence\.js/);
assert.doesNotMatch(web, /js\/fia-guide\.js/);
assert.doesNotMatch(web, /js\/fia-security-search\.js/);
assert.doesNotMatch(web, /js\/fia-purchase-search\.js/);
assert.doesNotMatch(app, /js\/fia-guide\.js/);
assert.doesNotMatch(app, /js\/fia-security-search\.js/);
assert.doesNotMatch(app, /js\/fia-purchase-search\.js/);

assert.match(publicGuide, /Primer contacto FIA/);
assert.match(publicGuide, /publicSurface:true/);
assert.doesNotMatch(publicGuide, /navigate\(/);
assert.doesNotMatch(publicGuide, /beta-mobile\.html/);
assert.doesNotMatch(publicGuide, /fia-purchase-search\.js/);

// Internal engines remain testable in the repository but are not shipped in Pages.
assert.match(internalGuide, /REAL_SENSITIVE_VALUE_DETECTED/);
assert.match(internalGuide, /COMPLETED_WITH_OPEN_INCIDENT/);
assert.match(securitySearch, /L0_DEMO/);
assert.match(securitySearch, /L4_ADVANCED/);
assert.match(securitySearch, /queryStored:false/);
assert.match(purchaseSearch, /I0_PUBLIC/);
assert.match(purchaseSearch, /I4_REVIEWED_PERSONAL/);
assert.match(purchaseSearch, /patrocinio aporta 0 puntos/);
assert.match(purchaseSearch, /fiaFundCustody:false/);

assert.match(humanPresence, /HUMAN_LIKELY/);
assert.match(humanPresence, /AUTOMATION_SUSPECTED/);
assert.match(humanPresence, /identityVerified:false/);
assert.match(humanPresence, /trustLevelElevated:false/);
assert.match(humanPresence, /rawInteractionEventsStored:false/);
assert.doesNotMatch(humanPresence, /localStorage/);
assert.match(humanPresenceCss, /fia-human-challenge-ready/);
assert.match(css, /fia-guide-level-meta/);

assert.match(allowlist, /css\/fia-guide\.css/);
assert.match(allowlist, /css\/fia-human-presence\.css/);
assert.match(allowlist, /js\/fia-public-guide\.js/);
assert.match(allowlist, /js\/fia-human-presence\.js/);
assert.doesNotMatch(allowlist, /js\/fia-guide\.js/);
assert.doesNotMatch(allowlist, /js\/fia-security-search\.js/);
assert.doesNotMatch(allowlist, /js\/fia-purchase-search\.js/);
assert.doesNotMatch(allowlist, /css\/fia-purchase-search\.css/);

console.log('public/internal FIA guide separation test passed');
