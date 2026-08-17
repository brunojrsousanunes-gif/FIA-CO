const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const code = fs.readFileSync('frontend/js/pricing.js', 'utf8');
const sandbox = { globalThis: {} };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const pricing = sandbox.globalThis.FIACOPricing;

assert.strictEqual(pricing.version, 'beta-2026-08-v2');
assert.strictEqual(pricing.pilot.rate, 0.029);
assert.strictEqual(pricing.pilot.min, 0.99);
assert.strictEqual(pricing.pilot.max, 19.90);
assert.strictEqual(pricing.pilot.promotional, true);
assert.strictEqual(pricing.pilot.productionBillingEnabled, false);

assert.strictEqual(pricing.quote(10).fee, 0.99);
assert.strictEqual(pricing.quote(100).fee, 2.90);
assert.strictEqual(pricing.quote(250).fee, 7.25);
assert.strictEqual(pricing.quote(500).fee, 14.50);
assert.strictEqual(pricing.quote(1000).fee, 19.90);
assert.strictEqual(pricing.quote(2000).fee, 19.90);
assert.strictEqual(pricing.quote(10000).fee, 19.90);
assert.strictEqual(pricing.quote(1000).tier, 'STANDARD');
assert.strictEqual(pricing.quote(1000).enhancedControls, false);
assert.strictEqual(pricing.quote(1000).pilot, true);
assert.strictEqual(pricing.quote(1000).promotional, true);
assert.strictEqual(pricing.quote(1000).productionBillingEnabled, false);

assert.strictEqual(pricing.quote(100, { controlPlus: true }).fee, 2.90);
assert.strictEqual(pricing.quote(1000, { controlPlus: true }).fee, 19.90);
assert.strictEqual(pricing.quote(2000, { controlPlus: true }).fee, 19.90);
assert.strictEqual(pricing.quote(10000, { controlPlus: true }).fee, 19.90);
assert.strictEqual(pricing.quote(1000, { controlPlus: true }).tier, 'CONTROL_PLUS');
assert.strictEqual(pricing.quote(1000, { controlPlus: true }).enhancedControls, true);
assert.strictEqual(pricing.quote(1000, { controlPlus: true }).productionBillingEnabled, false);

const cancelled = pricing.quote(1000, { cancelledBeforeExecution: true });
assert.strictEqual(cancelled.fee, 0);
assert.strictEqual(cancelled.tier, 'CANCELLED');
assert.strictEqual(cancelled.productionBillingEnabled, false);

const healthy = pricing.economics(1000, { variable: 2, support: 1, security: 1, paymentRate: 0.015, paymentFixed: 0.25 });
assert.strictEqual(healthy.profitable, true);
assert(healthy.contribution > 0);

const loss = pricing.economics(100, { variable: 1, support: 1, security: 1, paymentRate: 0.015, paymentFixed: 0.25 });
assert.strictEqual(loss.profitable, false);
assert(loss.contribution < 0);

console.log('pricing tests passed');
