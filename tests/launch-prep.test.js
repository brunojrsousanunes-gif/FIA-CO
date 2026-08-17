const fs = require('fs');
const assert = require('assert');

const b2b = fs.readFileSync('frontend/b2b-pilot.html','utf8');
const backoffice = fs.readFileSync('frontend/backoffice-demo.html','utf8');
const security = fs.readFileSync('docs/SECURITY-OPERATING-BASELINE.md','utf8');

assert(b2b.includes('no custodia ni mueve fondos'));
assert(b2b.includes('pricing.js'));
assert(backoffice.includes('Datos ficticios'));
assert(backoffice.includes('commercial-dashboard.js'));
assert(security.includes('NO_SCALE'));
assert(security.includes('pentest'));
console.log('launch prep tests passed');
