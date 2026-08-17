const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const code = fs.readFileSync('frontend/js/pricing.js', 'utf8');
const sandbox = { globalThis: {} };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const pricing = sandbox.globalThis.FIACOPricing;

assert.strictEqual(pricing.version, 'beta-2026-08-v1');
assert.strictEqual(pricing.quote(10).fee, 0.99);
assert.strictEqual(pricing.quote(100).fee, 0.99);
assert.strictEqual(pricing.quote(250).fee, 2.13);
assert.strictEqual(pricing.quote(500).fee, 4.25);
assert.strictEqual(pricing.quote(1000).fee, 8.50);
assert.strictEqual(pricing.quote(2000).fee, 12.90);
assert.strictEqual(pricing.quote(10000).fee, 12.90);
assert.strictEqual(pricing.quote(1000).tier, 'STANDARD');
assert.strictEqual(pricing.quote(1000).enhancedControls, false);

assert.strictEqual(pricing.quote(100, { controlPlus: true }).fee, 1.15);
assert.strictEqual(pricing.quote(1000, { controlPlus: true }).fee, 11.50);
assert.strictEqual(pricing.quote(2000, { controlPlus: true }).fee, 19.90);
assert.strictEqual(pricing.quote(10000, { controlPlus: true }).fee, 19.90);
assert.strictEqual(pricing.quote(1000, { controlPlus: true }).tier, 'CONTROL_PLUS');
assert.strictEqual(pricing.quote(1000, { controlPlus: true }).enhancedControls, true);

const cancelled = pricing.quote(1000, { cancelledBeforeExecution: true });
assert.strictEqual(cancelled.fee, 0);
assert.strictEqual(cancelled.tier, 'CANCELLED');

const healthy = pricing.economics(1000, { variable: 2, support: 1, security: 1, paymentRate: 0.015, paymentFixed: 0.25 });
assert.strictEqual(healthy.profitable, true);
assert(healthy.contribution > 0);

const loss = pricing.economics(100, { variable: 1, support: 1, security: 1, paymentRate: 0.015, paymentFixed: 0.25 });
assert.strictEqual(loss.profitable, false);
assert(loss.contribution < 0);

console.log('pricing tests passed');
