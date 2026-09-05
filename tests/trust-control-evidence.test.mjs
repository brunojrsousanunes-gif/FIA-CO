import assert from 'node:assert/strict';
import {
  TRUST_EVIDENCE_SOURCES,
  TRUST_EVIDENCE_STATUS,
  createControlEvidence,
  verifyControlEvidence,
  isControlEvidenceCurrent,
  evaluateEvidenceBackedTrust
} from '../core/trust/trust-control-evidence.mjs';

const now = '2026-09-05T01:30:00Z';

const tenant = createControlEvidence({
  controlId: 'tenantBoundaryReady',
  sourceType: TRUST_EVIDENCE_SOURCES.AUTOMATED_TEST,
  status: TRUST_EVIDENCE_STATUS.PASS,
  sourceRef: 'tests/preprod-org-access-boundary.test.mjs',
  observedAt: now,
  expiresAt: '2026-10-05T01:30:00Z'
});
assert.equal(verifyControlEvidence(tenant), true);
assert.equal(isControlEvidenceCurrent(tenant, { now: '2026-09-06T01:30:00Z' }), true);
assert.equal(isControlEvidenceCurrent(tenant, { now: '2026-10-06T01:30:00Z' }), false);

const tampered = { ...tenant, status: 'FAIL' };
assert.equal(verifyControlEvidence(tampered), false);

const fakeAutomatedIdentity = createControlEvidence({
  controlId: 'organizationIdentified',
  sourceType: TRUST_EVIDENCE_SOURCES.AUTOMATED_TEST,
  status: TRUST_EVIDENCE_STATUS.PASS,
  observedAt: now
});
const blocked = evaluateEvidenceBackedTrust([tenant, fakeAutomatedIdentity], { now });
assert.equal(blocked.profile.level, 'L0_DEMO');
assert.equal(blocked.checks.organizationIdentified, false);
assert.equal(blocked.controlStatus.find(item => item.controlId === 'organizationIdentified').evidencePresentButWithheld, true);

const l1Evidence = [
  createControlEvidence({ controlId: 'organizationIdentified', sourceType: TRUST_EVIDENCE_SOURCES.EXTERNAL_VERIFICATION, status: 'PASS', observedAt: now }),
  createControlEvidence({ controlId: 'termsAccepted', sourceType: TRUST_EVIDENCE_SOURCES.HUMAN_ATTESTATION, status: 'PASS', observedAt: now }),
  createControlEvidence({ controlId: 'tenantBoundaryReady', sourceType: TRUST_EVIDENCE_SOURCES.AUTOMATED_TEST, status: 'PASS', observedAt: now }),
  createControlEvidence({ controlId: 'auditReady', sourceType: TRUST_EVIDENCE_SOURCES.AUTOMATED_TEST, status: 'PASS', observedAt: now }),
  createControlEvidence({ controlId: 'incidentContactDefined', sourceType: TRUST_EVIDENCE_SOURCES.HUMAN_ATTESTATION, status: 'PASS', observedAt: now })
];
const automatedOnly = evaluateEvidenceBackedTrust(l1Evidence, { now });
assert.equal(automatedOnly.profile.level, 'L0_DEMO');
assert.equal(automatedOnly.humanOrExternalEvidenceDoesNotAutoElevate, true);

const l1 = evaluateEvidenceBackedTrust(l1Evidence, { now, allowHumanOrExternalEvidence: true });
assert.equal(l1.profile.level, 'L1_ISOLATED');
assert.equal(l1.checks.organizationIdentified, true);
assert.equal(l1.checks.tenantBoundaryReady, true);

console.log('FIA evidence-backed trust controls OK');
