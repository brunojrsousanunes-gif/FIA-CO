const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const code = fs.readFileSync('frontend/js/pricing.js', 'utf8');
const sandbox = { globalThis: {} };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const pricing = sandbox.globalThis.FIACOPricing;

assert.strictEqual(pricing.quote(10).fee, 0.99);
assert.strictEqual(pricing.quote(350).fee, 10.15);
assert.strictEqual(pricing.quote(1500).fee, 19.90);
assert.strictEqual(pricing.quote(2999).tier, 'BASE');
assert.strictEqual(pricing.quote(3000).tier, 'PLUS');
assert.strictEqual(pricing.quote(3000).fee, 28.50);
assert.strictEqual(pricing.quote(4000).fee, 38.00);
assert.strictEqual(pricing.quote(8000).fee, 59.90);
assert.strictEqual(pricing.quote(15000).fee, 82.50);
assert.strictEqual(pricing.quote(30000).fee, 105.00);
assert.strictEqual(pricing.quote(100000).fee, 199.90);
assert.strictEqual(pricing.quote(3000).enhancedControls, true);

const healthy = pricing.economics(4000, { variable: 8, support: 5, security: 4, paymentRate: 0.015, paymentFixed: 0.25 });
assert.strictEqual(healthy.profitable, true);
assert(healthy.contribution > 0);

const loss = pricing.economics(350, { variable: 10, support: 5, security: 3, paymentRate: 0.015, paymentFixed: 0.25 });
assert.strictEqual(loss.profitable, false);
assert(loss.contribution < 0);

console.log('pricing tests passed');
