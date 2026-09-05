import assert from 'node:assert/strict';
import fs from 'node:fs';

const firstContact = fs.readFileSync(new URL('../frontend/js/fia-first-contact.js', import.meta.url), 'utf8');
const securitySearch = fs.readFileSync(new URL('../frontend/js/fia-security-search.js', import.meta.url), 'utf8');
const purchaseSearch = fs.readFileSync(new URL('../frontend/js/fia-purchase-search.js', import.meta.url), 'utf8');
const allowlist = fs.readFileSync(new URL('../config/pages-public-allowlist.txt', import.meta.url), 'utf8');

assert.match(firstContact, /PRIMER CONTACTO · L0 \/ I0/);
assert.match(firstContact, /OWNER_APPROVAL=false/);
assert.match(firstContact, /rawQueryStored:false/);
assert.match(firstContact, /freeTextNotesStored:false/);
assert.match(firstContact, /personalDataStored:false/);
assert.match(firstContact, /Demos y soluciones requieren autorización FIA&Co/);
assert.match(firstContact, /no guarda lo que escribes literalmente/);
assert.match(firstContact, /firstContactLocked='true'/);
assert.match(firstContact, /localStorage\.setItem\(PROFILE_KEY/);
assert.doesNotMatch(firstContact, /localStorage\.setItem\([^\n]*raw/i);

assert.match(securitySearch, /loadFirstContact/);
assert.match(securitySearch, /firstContactLocked==='true'/);
assert.match(purchaseSearch, /firstContactLocked==='true'/);

assert.match(allowlist, /js\/fia-first-contact\.js/);
assert.match(allowlist, /css\/fia-first-contact\.css/);

console.log('first-contact-ui.test.mjs passed');
