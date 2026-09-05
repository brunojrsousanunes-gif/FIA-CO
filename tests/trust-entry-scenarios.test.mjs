import assert from 'node:assert/strict';
import fs from 'node:fs';

const config = JSON.parse(fs.readFileSync('config/trust-entry-scenarios.v1.json', 'utf8'));
assert.equal(config.syntheticOnly, true);
assert.equal(config.scenarios.length, 3);
assert.deepEqual(config.scenarios.map(item => item.entry).sort(), ['DOCUMENT_FLOW', 'QUOTE_RECOVERY', 'TRUST_TRANSACTION']);
assert.ok(config.scenarios.every(item => item.realDataRequiredForDemo === false));
assert.ok(config.scenarios.every(item => Array.isArray(item.valueMetrics) && item.valueMetrics.length >= 3));

const text = JSON.stringify(config);
assert.equal(/Magrino|Rubio|TMC|Recalvi|Infra|Frain/i.test(text), false);

console.log('FIA diversified synthetic Trust Entry scenarios OK');
