import assert from 'node:assert/strict';
import { TRUST_SECURITY_LEVELS } from '../core/trust/trust-security-levels.mjs';
import { buildTrustValueProgression, getTrustValueFrame } from '../core/trust/trust-value-framework.mjs';

const l0 = getTrustValueFrame(TRUST_SECURITY_LEVELS.L0_DEMO);
assert.equal(l0.level, 'L0_DEMO');
assert.ok(l0.security.length > 0);
assert.ok(l0.utility.length > 0);
assert.ok(l0.maximization.length > 0);

const l3 = getTrustValueFrame(TRUST_SECURITY_LEVELS.L3_SHARED);
assert.match(l3.security.join(' '), /DENY|revocación|caducidad/i);
assert.match(l3.utility.join(' '), /dos empresas|Compartir/i);
assert.match(l3.maximization.join(' '), /partners|coordinación/i);

const progression = buildTrustValueProgression({
  level: TRUST_SECURITY_LEVELS.L2_VERIFIED,
  missingForNextLevel: ['dataPermitsReady', 'crossOrgIsolationTestsPassed']
});
assert.equal(progression.current.level, 'L2_VERIFIED');
assert.equal(progression.next.level, 'L3_SHARED');
assert.deepEqual(progression.missingForNextLevel, ['dataPermitsReady', 'crossOrgIsolationTestsPassed']);
assert.equal(progression.claimsPolicy.guaranteedSavings, false);
assert.equal(progression.claimsPolicy.guaranteedRevenue, false);
assert.equal(progression.claimsPolicy.inventedOptimizationPercentages, false);
assert.equal(progression.claimsPolicy.valueMustBeMeasuredAgainstBaseline, true);

const l4 = buildTrustValueProgression({ level: TRUST_SECURITY_LEVELS.L4_ADVANCED });
assert.equal(l4.next, null);
assert.match(l4.current.maximization.join(' '), /FIA en custodio financiero/i);

console.log('FIA Trust value framework contract OK');
