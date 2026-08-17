const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const code = fs.readFileSync('frontend/js/pricing.js', 'utf8');
const sandbox = { globalThis: {} };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const pricing = sandbox.globalThis.FIACOPricing;

assert.strictEqual(pricing.version, 'beta-2026-08-v3');
assert.strictEqual(pricing.pilot.rate, 0.029);
assert.strictEqual(pricing.pilot.min, 0.99);
assert.strictEqual(pricing.pilot.max, 19.90);
assert.strictEqual(pricing.pilot.targetMarginPct, 15);
assert.strictEqual(pricing.pilot.promotional, true);
assert.strictEqual(pricing.pilot.regulatoryMode, 'DEMO_ONLY');
assert.strictEqual(pricing.pilot.productionBillingEnabled, false);
assert.strictEqual(pricing.pilot.requiresLegalValidation, true);
assert.strictEqual(pricing.pilot.requiresLicensedPaymentPartner, true);

assert.strictEqual(pricing.quote(10).fee, 0.99);
assert.strictEqual(pricing.quote(100).fee, 2.90);
assert.strictEqual(pricing.quote(250).fee, 7.25);
assert.strictEqual(pricing.quote(500).fee, 14.50);
assert.strictEqual(pricing.quote(1000).fee, 19.90);
assert.strictEqual(pricing.quote(2000).fee, 19.90);
assert.strictEqual(pricing.quote(10000).fee, 19.90);
assert.strictEqual(pricing.quote(1000).tier, 'STANDARD');
assert.strictEqual(pricing.quote(1000).enhancedControls, false);
assert.strictEqual(pricing.quote(1000).productionBillingEnabled, false);
assert.strictEqual(pricing.quote(1000).regulatoryMode, 'DEMO_ONLY');

assert.strictEqual(pricing.quote(100, { controlPlus: true }).fee, 2.90);
assert.strictEqual(pricing.quote(1000, { controlPlus: true }).fee, 19.90);
assert.strictEqual(pricing.quote(1000, { controlPlus: true }).tier, 'CONTROL_PLUS');
assert.strictEqual(pricing.quote(1000, { controlPlus: true }).enhancedControls, true);

const cancelled = pricing.quote(1000, { cancelledBeforeExecution: true });
assert.strictEqual(cancelled.fee, 0);
assert.strictEqual(cancelled.tier, 'CANCELLED');
assert.strictEqual(cancelled.productionBillingEnabled, false);

// PSP percentage cost is applied to transaction GMV, not FIA-CO fee revenue.
const thinMargin = pricing.economics(
  1000,
  { variable: 2, support: 1, security: 1, paymentRate: 0.015, paymentFixed: 0.25 },
  { legalReady: true, licensedPaymentPartnerReady: true }
);
assert.strictEqual(thinMargin.paymentCost, 15.25);
assert.strictEqual(thinMargin.profitable, true);
assert.strictEqual(thinMargin.targetMarginMet, false);
assert.strictEqual(thinMargin.scaleEligible, false);
assert.strictEqual(thinMargin.scaleDecision, 'NO_SCALE');
assert.strictEqual(thinMargin.productionBillingEnabled, false);

const scalablePilot = pricing.economics(
  500,
  { variable: 0.5, support: 0.5, security: 0.25, compliance: 0.25, paymentRate: 0.005, paymentFixed: 0.20 },
  { legalReady: true, licensedPaymentPartnerReady: true }
);
assert.strictEqual(scalablePilot.profitable, true);
assert.strictEqual(scalablePilot.targetMarginMet, true);
assert.strictEqual(scalablePilot.capAllowsTargetMargin, true);
assert.strictEqual(scalablePilot.scaleEligible, true);
assert.strictEqual(scalablePilot.scaleDecision, 'VALIDATE_FOR_SCALE');
assert.strictEqual(scalablePilot.productionBillingEnabled, false);

const regulatoryBlocked = pricing.economics(
  500,
  { variable: 0.5, support: 0.5, security: 0.25, compliance: 0.25, paymentRate: 0.005, paymentFixed: 0.20 },
  { legalReady: false, licensedPaymentPartnerReady: true }
);
assert.strictEqual(regulatoryBlocked.profitable, true);
assert.strictEqual(regulatoryBlocked.scaleEligible, false);
assert.strictEqual(regulatoryBlocked.scaleDecision, 'NO_SCALE');

const capBlocked = pricing.economics(
  2000,
  { variable: 1, support: 1, security: 0.5, compliance: 0.5, paymentRate: 0.01, paymentFixed: 0.25 },
  { legalReady: true, licensedPaymentPartnerReady: true }
);
assert.strictEqual(capBlocked.capAllowsTargetMargin, false);
assert.strictEqual(capBlocked.scaleEligible, false);
assert.strictEqual(capBlocked.scaleDecision, 'NO_SCALE');

assert.throws(
  () => pricing.economics(100, {}, { targetMarginPct: 100 }),
  /Margen objetivo no válido/
);

console.log('pricing tests passed');
