const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const code = fs.readFileSync('frontend/js/commercial-dashboard.js', 'utf8');
const sandbox = { globalThis: {} }; vm.createContext(sandbox); vm.runInContext(code, sandbox);
const c = sandbox.globalThis.FIACOCommercial;

const good = c.normalize({state:'OPPORTUNITY',segment:'TRANSPORT',amount:8000,fee:59.9,externalCost:15,founderHours:0.5,founderHourlyValue:25});
assert.strictEqual(good.cashContribution, 44.9);
assert.strictEqual(good.economicContribution, 32.4);
assert.strictEqual(good.scaleDecision, 'VALIDATE');

const bad = c.normalize({state:'LEAD',segment:'CONSTRUCTION',amount:350,fee:10.15,externalCost:8,founderHours:1,founderHourlyValue:25});
assert.strictEqual(bad.scaleDecision, 'NO_SCALE');

const summary = c.summarize([good,bad]);
assert.strictEqual(summary.count, 2);
assert.strictEqual(summary.bySegment.TRANSPORT, 1);
assert.strictEqual(summary.noScaleCount, 1);
assert.strictEqual(summary.gmv, 8350);
console.log('commercial dashboard tests passed');
