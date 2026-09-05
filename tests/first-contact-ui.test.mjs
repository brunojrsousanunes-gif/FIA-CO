import assert from 'node:assert/strict';
import fs from 'node:fs';

const firstContact = fs.readFileSync(new URL('../frontend/js/fia-first-contact.js', import.meta.url), 'utf8');
const publicGuide = fs.readFileSync(new URL('../frontend/js/fia-public-guide.js', import.meta.url), 'utf8');
const allowlist = fs.readFileSync(new URL('../config/pages-public-allowlist.txt', import.meta.url), 'utf8');

assert.match(firstContact, /OWNER_APPROVAL=false/);
assert.match(firstContact, /PROFILE_TTL_MS=14\*24\*60\*60\*1000/);
assert.match(firstContact, /rawQueryStored:false/);
assert.match(firstContact, /freeTextNotesStored:false/);
assert.match(firstContact, /personalDataStored:false/);
assert.match(firstContact, /Olvidar preferencias/);
assert.match(firstContact, /firstContactLocked='true'/);
assert.match(firstContact, /localStorage\.setItem\(PROFILE_KEY/);
assert.match(firstContact, /localStorage\.removeItem\(PROFILE_KEY/);
assert.doesNotMatch(firstContact, /localStorage\.setItem\([^\n]*raw/i);
assert.doesNotMatch(firstContact, /PRIMER CONTACTO · L0 \/ I0/);
assert.doesNotMatch(firstContact, /meta\('Nivel','L0_DEMO'\)/);
assert.match(firstContact, /Información','Pública/);

assert.match(publicGuide, /publicSurface:true/);
assert.doesNotMatch(publicGuide, /beta-mobile\.html/);
assert.doesNotMatch(publicGuide, /fia-purchase-search\.js/);
assert.doesNotMatch(publicGuide, /fia-security-search\.js/);

assert.match(allowlist, /js\/fia-public-guide\.js/);
assert.match(allowlist, /js\/fia-first-contact\.js/);
assert.match(allowlist, /js\/fia-human-presence\.js/);
assert.match(allowlist, /css\/fia-first-contact\.css/);
assert.doesNotMatch(allowlist, /beta-mobile\.html/);
assert.doesNotMatch(allowlist, /js\/fia-guide\.js/);
assert.doesNotMatch(allowlist, /js\/fia-security-search\.js/);
assert.doesNotMatch(allowlist, /js\/fia-purchase-search\.js/);

console.log('first-contact minimal public surface test passed');
