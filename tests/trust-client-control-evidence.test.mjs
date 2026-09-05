import assert from 'node:assert/strict';
import { createOperation } from '../core/operations/operation-engine.mjs';
import { createTrustTransaction } from '../core/trust/trust-transaction.mjs';
import { buildTrustClientSnapshot } from '../core/trust/trust-client-snapshot.mjs';
import { createControlEvidence, evaluateEvidenceBackedTrust } from '../core/trust/trust-control-evidence.mjs';

let seq = 0;
const deps = {
  idFactory: prefix => `${prefix}_EVIDENCE_${++seq}`,
  clock: () => '2026-09-05T01:30:00Z'
};
const owner = { actorId: 'owner-a', organizationId: 'org-a', role: 'OWNER' };
const viewer = { actorId: 'viewer-a', organizationId: 'org-a', role: 'VIEWER' };

const operation = createOperation({
  organizationId: 'org-a',
  amount: 1000,
  kind: 'synthetic-test',
  buyer: 'buyer-demo',
  seller: 'seller-demo',
  actor: 'owner-a'
}, deps);

const transaction = createTrustTransaction({
  ownerOrganizationId: 'org-a',
  operationId: operation.id,
  title: 'Synthetic evidence test',
  actor: 'owner-a',
  fields: [{ key: 'reference', label: 'Reference', value: 'SYN-1', classification: 'INTERNAL', sourceOrganizationId: 'org-a' }]
}, deps);

const evidenceBackedTrust = evaluateEvidenceBackedTrust([
  createControlEvidence({
    controlId: 'tenantBoundaryReady',
    sourceType: 'AUTOMATED_TEST',
    status: 'PASS',
    observedAt: '2026-09-05T01:30:00Z'
  })
], { now: '2026-09-05T01:30:00Z' });

const ownerSnapshot = buildTrustClientSnapshot({ operation, transaction, context: owner }, {
  now: '2026-09-05T01:31:00Z',
  evidenceBackedTrust
});
assert.equal(ownerSnapshot.security.controlEvidence.automatedOnly, true);
assert.equal(ownerSnapshot.security.controlEvidence.validEvidenceCount, 1);
assert.ok(ownerSnapshot.security.controlEvidence.controls.some(item => item.controlId === 'tenantBoundaryReady' && item.satisfied));
assert.equal('sourceRef' in ownerSnapshot.security.controlEvidence.controls[0], false);
assert.equal('evidenceDigest' in ownerSnapshot.security.controlEvidence.controls[0], false);

const viewerSnapshot = buildTrustClientSnapshot({ operation, transaction, context: viewer }, {
  now: '2026-09-05T01:31:00Z',
  evidenceBackedTrust
});
assert.equal(viewerSnapshot.security.controlEvidence, null);

console.log('FIA client control evidence visibility contract OK');
