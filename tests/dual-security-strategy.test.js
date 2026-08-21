import fs from 'node:fs';
import assert from 'node:assert/strict';

const strategy = JSON.parse(fs.readFileSync(new URL('../config/security-provider-strategy.json', import.meta.url), 'utf8'));

assert.equal(strategy.mode, 'DEMO_ONLY');
assert.equal(strategy.architecture, 'DUAL_VENDOR_DEFENSE_IN_DEPTH');
assert.equal(strategy.singleVendorDependencyAllowed, false);
assert.equal(strategy.automaticEnforcementAllowed, false);
assert.equal(strategy.realCredentialsAllowed, false);
assert.equal(strategy.primaryCandidate.name, 'Fortinet');
assert.equal(strategy.secondarySlot.mustBeIndependent, true);
assert.equal(strategy.sharedSecurityLayer.vendorNeutralEvidenceStore, true);
assert.equal(strategy.sharedSecurityLayer.dualDeliveryCapable, true);
assert.equal(strategy.sharedSecurityLayer.correlationMode, 'SHADOW_ONLY');
assert.equal(strategy.sharedSecurityLayer.responseMode, 'HUMAN_APPROVAL_REQUIRED');
assert.ok(strategy.activationGates.includes('SECONDARY_VENDOR_EVALUATED'));
assert.ok(strategy.activationGates.includes('FOUNDER_EXPLICIT_AUTHORIZATION'));

console.log('dual-security-strategy: ok');
