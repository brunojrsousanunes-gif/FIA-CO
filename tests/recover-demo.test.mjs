import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../frontend/recover-demo.html', import.meta.url), 'utf8');
const js = fs.readFileSync(new URL('../frontend/js/recover-demo.js', import.meta.url), 'utf8');
const allowlist = fs.readFileSync(new URL('../config/pages-public-allowlist.txt', import.meta.url), 'utf8');

assert.match(html, /DATOS SINTÉTICOS/);
assert.match(html, /SIN ENVÍOS REALES/);
assert.match(html, /connect-src 'none'/);
assert.match(html, /noindex,nofollow,noarchive/);
assert.match(html, /RESTRINGIDO EN PRODUCCIÓN/);
assert.match(html, /CONFIRMED/);
assert.match(html, /ASSISTED/);
assert.match(html, /ESTIMATED/);

assert.equal(/\bfetch\s*\(/.test(js), false);
assert.equal(/XMLHttpRequest/.test(js), false);
assert.equal(/WebSocket/.test(js), false);
assert.equal(/sendBeacon/.test(js), false);
assert.match(js, /externalAction: false/);
assert.match(js, /approvedByHuman: true/);

assert.equal(allowlist.split(/\r?\n/).some(line => line.trim() === 'recover-demo.html'), false);
assert.equal(allowlist.split(/\r?\n/).some(line => line.trim() === 'js\/recover-demo.js'), false);
assert.equal(allowlist.split(/\r?\n/).some(line => line.trim() === 'css\/recover-demo.css'), false);

console.log('FIA Recover demonstrator safety contract OK');
