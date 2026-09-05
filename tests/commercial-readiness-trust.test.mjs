import assert from 'node:assert/strict';
import fs from 'node:fs';

const doc = fs.readFileSync('docs/COMMERCIAL-READINESS-V1.md', 'utf8');

assert.match(doc, /Seguridad -> Utilidad -> Maximización/i);
assert.match(doc, /Trust Transaction/i);
assert.match(doc, /Quote Recovery/i);
assert.match(doc, /Document Flow/i);
assert.match(doc, /Partner Coordination/i);
assert.match(doc, /L0_DEMO/i);
assert.match(doc, /L3_SHARED/i);
assert.match(doc, /FIA no recibe, custodia ni mueve fondos/i);
assert.match(doc, /CONFIRMED/i);
assert.match(doc, /ASSISTED/i);
assert.match(doc, /ESTIMATED/i);
assert.doesNotMatch(doc, /Vinted|Milanuncios/i);
assert.doesNotMatch(doc, /Particulares y, en una fase posterior, profesionales/i);
assert.match(doc, /No publicar porcentajes de optimización o ROI sin metodología y evidencia/i);

console.log('FIA commercial readiness trust positioning OK');
