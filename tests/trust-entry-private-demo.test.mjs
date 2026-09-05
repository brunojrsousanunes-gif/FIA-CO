import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('frontend/trust-entry-private-demo.html', 'utf8');
const js = fs.readFileSync('frontend/js/trust-entry-private-demo.js', 'utf8');
const allowlist = fs.readFileSync('config/pages-public-allowlist.txt', 'utf8');

assert.match(html, /noindex,nofollow,noarchive/i);
assert.match(html, /connect-src 'none'/i);
assert.match(html, /0[\s\S]*datos reales necesarios para esta demo/i);
assert.match(html, /Seguridad[\s\S]*Utilidad[\s\S]*Maximización/i);
assert.match(html, /Más seguridad verificada[\s\S]*más acceso autorizado[\s\S]*más utilidad/i);
assert.match(html, /No prometemos porcentajes de mejora sin datos/i);
assert.match(html, /FIA no recibe, custodia ni mueve fondos/i);
assert.match(html, /L0_DEMO/i);
assert.match(html, /una sola operación/i);
assert.match(html, /No conectamos Gmail, ERP ni CRM/i);
assert.match(js, /esta pantalla no concede permisos/i);
assert.equal(allowlist.includes('trust-entry-private-demo.html'), false);
assert.equal(allowlist.includes('trust-entry-private-demo.css'), false);
assert.equal(allowlist.includes('trust-entry-private-demo.js'), false);

console.log('FIA Trust Entry private demo contract OK');
