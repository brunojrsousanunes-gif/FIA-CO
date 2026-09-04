import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('frontend/trust-transaction-private-demo.html', 'utf8');
const allowlist = fs.readFileSync('config/pages-public-allowlist.txt', 'utf8');

assert.match(html, /noindex,nofollow,noarchive/i);
assert.match(html, /connect-src 'none'/i);
assert.match(html, /FIA no recibe, custodia ni mueve fondos/i);
assert.match(html, /Cross-organization default/i);
assert.match(html, /L3_SHARED/i);
assert.match(html, /L4_ADVANCED/i);
assert.match(html, /Datos críticos interempresa/i);
assert.match(html, /DATOS SINTÉTICOS/i);
assert.equal(allowlist.includes('trust-transaction-private-demo.html'), false);
assert.equal(allowlist.includes('trust-transaction-private-demo.css'), false);
assert.equal(allowlist.includes('trust-transaction-private-demo.js'), false);

console.log('FIA Trust Transaction private demo contract OK');
