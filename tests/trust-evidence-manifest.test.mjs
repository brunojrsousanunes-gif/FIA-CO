import assert from 'node:assert/strict';
import { createTrustEvidenceManifest, verifyTrustEvidenceManifest, verifyTrustEvidenceChain } from '../core/trust/trust-evidence-manifest.mjs';

const first = createTrustEvidenceManifest({
  organizationId: 'org-demo',
  operationId: 'op-demo',
  artifacts: [
    { id: 'ev-1', kind: 'CONTROL_EVIDENCE', digest: 'a'.repeat(64), policyVersion: 'v1' },
    { id: 'receipt-1', kind: 'SECURITY_RECEIPT', digest: 'b'.repeat(64), policyVersion: 'v1' }
  ]
}, { now: '2026-09-05T01:30:00Z' });

assert.equal(verifyTrustEvidenceManifest(first), true);
assert.equal(first.assurance.cryptographicSignature, false);
assert.equal(first.assurance.qualifiedElectronicSignature, false);

const second = createTrustEvidenceManifest({
  organizationId: 'org-demo',
  operationId: 'op-demo',
  previousManifestDigest: first.manifestDigest,
  artifacts: [{ id: 'ev-2', kind: 'CONTROL_EVIDENCE', digest: 'c'.repeat(64) }]
}, { now: '2026-09-05T01:31:00Z' });

assert.equal(verifyTrustEvidenceChain([first, second]), true);
const tampered = JSON.parse(JSON.stringify(second));
tampered.artifacts[0].digest = 'd'.repeat(64);
assert.equal(verifyTrustEvidenceManifest(tampered), false);
assert.equal(verifyTrustEvidenceChain([first, tampered]), false);

console.log('FIA trust evidence manifest contract OK');
