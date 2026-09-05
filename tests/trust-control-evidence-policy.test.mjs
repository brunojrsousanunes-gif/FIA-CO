import assert from 'node:assert/strict';
import fs from 'node:fs';
import { TRUST_SECURITY_LEVELS, getTrustLevelDefinition } from '../core/trust/trust-security-levels.mjs';

const policy = JSON.parse(fs.readFileSync('config/trust-control-evidence-policy.v1.json', 'utf8'));
const all = new Set([
  ...policy.automatedEvidenceCanSatisfy,
  ...policy.requiresUserHumanOrExternalEvidenceLater
]);

for (const level of [
  TRUST_SECURITY_LEVELS.L1_ISOLATED,
  TRUST_SECURITY_LEVELS.L2_VERIFIED,
  TRUST_SECURITY_LEVELS.L3_SHARED,
  TRUST_SECURITY_LEVELS.L4_ADVANCED
]) {
  for (const control of getTrustLevelDefinition(level).requirements) {
    assert.equal(all.has(control), true, `missing evidence classification for ${control}`);
  }
}

const overlap = policy.automatedEvidenceCanSatisfy.filter(item => policy.requiresUserHumanOrExternalEvidenceLater.includes(item));
assert.deepEqual(overlap, []);
assert.equal(policy.rules.humanOrExternalEvidenceAutoElevatesByDefault, false);
assert.equal(policy.rules.selfDeclaredExternalVerificationAccepted, false);

console.log('FIA trust evidence policy coverage OK');
