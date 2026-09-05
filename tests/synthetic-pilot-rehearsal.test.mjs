import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  runSyntheticPilotRehearsal,
  summarizeSyntheticRehearsalSet
} from '../core/pilot/synthetic-pilot-rehearsal.mjs';
import { verifyTrustEvidenceManifest } from '../core/trust/trust-evidence-manifest.mjs';

const config = JSON.parse(fs.readFileSync('config/synthetic-pilot-rehearsals.v1.json', 'utf8'));
assert.equal(config.syntheticOnly, true);
assert.equal(config.cases.length, 4);

const results = config.cases.map(item => runSyntheticPilotRehearsal(item, { humanHourlyCost: 0 }));
const summary = summarizeSyntheticRehearsalSet(results);

assert.equal(summary.total, 4);
assert.equal(summary.passed, 3);
assert.equal(summary.expectedSecurityBlocks, 1);
assert.equal(summary.failed, 0);
assert.equal(summary.safeToUseForInternalRehearsal, true);
assert.equal(summary.marketValidated, false);
assert.equal(summary.productionReady, false);
assert.deepEqual(new Set(summary.entriesCovered), new Set([
  'TRUST_TRANSACTION',
  'QUOTE_RECOVERY',
  'DOCUMENT_FLOW',
  'PARTNER_COORDINATION'
]));

for (const result of results) {
  assert.equal(result.syntheticOnly, true);
  assert.equal(result.realDataUsed, false);
  assert.equal(result.productionActivation, false);
  assert.equal(result.externalActionsExecuted, false);
  assert.equal(result.paymentExecution, false);
  assert.equal(result.nonCustodial, true);
  assert.equal(result.evidencePolicy.realOutcomeClaimsAllowed, false);
  assert.equal(result.evidencePolicy.marketValidationClaimAllowed, false);

  if (result.status === 'REHEARSAL_PASS') {
    assert.equal(result.minimumTrustLevel, 'L1_ISOLATED');
    assert.equal(result.l1Preparation.activationStatus, 'PREPARATION_ONLY');
    assert.equal(result.l1Preparation.realDataIncluded, false);
    assert.equal(result.l1Preparation.dataPermitDraft.crossOrganizationSharing, false);
    assert.equal(result.l1Preparation.dataPermitDraft.paymentExecutionAllowed, false);
    assert.equal(result.clientSnapshot.security.sourceDataFilteredBeforeClient, true);
    assert.equal(result.clientSnapshot.security.clientSideHidingIsSecurityBoundary, false);
    assert.equal(verifyTrustEvidenceManifest(result.evidenceManifest), true);
    assert.ok(result.unresolvedActivationRequirements.includes('applicableLegalPrivacyReview'));
  }
}

const partner = results.find(result => result.expectedEntry === 'PARTNER_COORDINATION');
assert.equal(partner.status, 'REHEARSAL_BLOCKED_EXPECTED');
assert.equal(partner.blockedBy, 'TRUST_LEVEL_L3_REQUIRED');
assert.equal(partner.minimumTrustLevel, 'L3_SHARED');
assert.equal(partner.l1Preparation, null);
assert.equal(partner.operation, null);
assert.equal(partner.clientSnapshot, null);
assert.ok(partner.unresolvedActivationRequirements.includes('partnerIdentityVerified'));

assert.throws(() => runSyntheticPilotRehearsal({
  ...config.cases[0],
  realData: true
}), /SYNTHETIC_REHEARSAL_CANNOT_ENABLE_REAL_EXECUTION/);

const mismatch = runSyntheticPilotRehearsal({
  ...config.cases[0],
  expectedEntry: 'QUOTE_RECOVERY'
});
assert.equal(mismatch.status, 'REHEARSAL_FAIL');
assert.equal(mismatch.failureReason, 'ENTRY_SELECTOR_MISMATCH');
assert.equal(mismatch.productionActivation, false);

console.log('FIA end-to-end synthetic pilot rehearsal contract OK');
