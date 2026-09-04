import assert from 'node:assert/strict';
import { createOperation } from '../core/operations/operation-engine.mjs';
import { createMemoryAuditLog } from '../core/audit/audit-log.mjs';
import { AccessDeniedError } from '../core/identity/access-control.mjs';
import {
  createTrustTransaction,
  grantOrganizationAccess
} from '../core/trust/trust-transaction.mjs';
import { buildTrustClientSnapshot } from '../core/trust/trust-client-snapshot.mjs';
import {
  createTrustSecurityReceipt,
  verifyTrustSecurityReceipt
} from '../core/trust/trust-security-receipt.mjs';
import { evaluateTrustSecurityLevel } from '../core/trust/trust-security-levels.mjs';

let seq = 0;
const idFactory = prefix => `${prefix}_CLIENT_${++seq}`;
let tick = 0;
const clock = () => `2026-09-04T21:30:${String(tick++).padStart(2, '0')}Z`;
const deps = { idFactory, clock };
const owner = { actorId: 'owner-a', organizationId: 'org-a', role: 'OWNER' };
const ownerViewer = { actorId: 'viewer-a', organizationId: 'org-a', role: 'VIEWER' };
const partner = { actorId: 'viewer-b', organizationId: 'org-b', role: 'VIEWER' };
const outsider = { actorId: 'viewer-c', organizationId: 'org-c', role: 'VIEWER' };

const l3Profile = evaluateTrustSecurityLevel({
  organizationIdentified: true,
  termsAccepted: true,
  tenantBoundaryReady: true,
  auditReady: true,
  incidentContactDefined: true,
  identityVerified: true,
  strongAuthenticationReady: true,
  secretsManaged: true,
  dataMinimizationReady: true,
  retentionPolicyReady: true,
  securityTestsPassed: true,
  dataPermitsReady: true,
  grantExpiryReady: true,
  grantRevocationReady: true,
  partnerIdentityVerified: true,
  purposeLimitationReady: true,
  crossOrgIsolationTestsPassed: true
});

const operation = createOperation({
  organizationId: 'org-a',
  amount: 12500,
  kind: 'machinery-sale',
  buyer: 'buyer-demo',
  seller: 'seller-demo',
  actor: 'owner-a'
}, deps);

const transaction = createTrustTransaction({
  ownerOrganizationId: 'org-a',
  operationId: operation.id,
  title: 'Operación de maquinaria',
  actor: 'owner-a',
  fields: [
    { key: 'reference', label: 'Referencia', value: 'Q-2026-001', classification: 'INTERNAL', sourceOrganizationId: 'org-a' },
    { key: 'amount', label: 'Importe', value: 12500, classification: 'COMMERCIAL_CONFIDENTIAL', sourceOrganizationId: 'org-a' },
    { key: 'clientEmail', label: 'Email cliente', value: 'demo@example.invalid', classification: 'PERSONAL', sourceOrganizationId: 'org-a' }
  ]
}, deps);

grantOrganizationAccess(transaction, owner, {
  organizationId: 'org-b',
  fieldKeys: ['reference'],
  purpose: 'Coordinar preparación de la operación',
  expiresAt: '2026-09-10T00:00:00Z',
  approvedByHuman: true
}, { ...deps, ownerSecurityProfile: l3Profile, targetSecurityProfile: l3Profile });

const audit = createMemoryAuditLog(deps);
await audit.append({
  organizationId: 'org-a',
  actorId: 'owner-a',
  operationId: operation.id,
  action: 'TRUST_TRANSACTION_CREATED',
  state: operation.state,
  version: operation.version
});
await audit.append({
  organizationId: 'org-a',
  actorId: 'owner-a',
  operationId: operation.id,
  action: 'PARTNER_ACCESS_GRANTED',
  state: operation.state,
  version: operation.version
});
assert.equal(await audit.verify('org-a'), true);
const auditEvents = await audit.list({ organizationId: 'org-a', operationId: operation.id });

const ownerSnapshot = buildTrustClientSnapshot({
  operation,
  transaction,
  context: owner,
  auditEvents,
  auditIntegrityVerified: true
}, { now: '2026-09-04T22:00:00Z', viewerSecurityProfile: l3Profile });

assert.equal(ownerSnapshot.viewer.ownerOrganization, true);
assert.equal(ownerSnapshot.transaction.viewerSecurityLevel, 'L3_SHARED');
assert.equal(ownerSnapshot.security.sourceDataFilteredBeforeClient, true);
assert.equal(ownerSnapshot.security.clientSideHidingIsSecurityBoundary, false);
assert.equal(ownerSnapshot.security.auditIntegrityStatus, 'VERIFIED');
assert.equal(ownerSnapshot.auditTimeline.length, 2);
assert.deepEqual(Object.keys(ownerSnapshot.transaction.fields).sort(), ['amount', 'clientEmail', 'reference']);
assert.ok(ownerSnapshot.security.whoSeesWhat.organizations.some(item => item.organizationId === 'org-b'));
assert.equal(ownerSnapshot.financialBoundary.mode, 'NON_CUSTODIAL');
assert.equal(ownerSnapshot.financialBoundary.fia.custodiesClientFunds, false);

const ownerViewerSnapshot = buildTrustClientSnapshot({
  operation,
  transaction,
  context: ownerViewer,
  auditEvents,
  auditIntegrityVerified: true
}, { now: '2026-09-04T22:00:00Z', viewerSecurityProfile: l3Profile });
assert.equal(ownerViewerSnapshot.auditTimeline.length, 2);
assert.equal(ownerViewerSnapshot.security.whoSeesWhat, null);

const partnerSnapshot = buildTrustClientSnapshot({
  operation,
  transaction,
  context: partner,
  auditEvents,
  auditIntegrityVerified: true
}, { now: '2026-09-04T22:00:00Z', viewerSecurityProfile: l3Profile });

assert.equal(partnerSnapshot.viewer.ownerOrganization, false);
assert.deepEqual(Object.keys(partnerSnapshot.transaction.fields), ['reference']);
assert.equal(partnerSnapshot.auditTimeline.length, 0);
assert.equal(partnerSnapshot.security.whoSeesWhat, null);
assert.equal('amount' in partnerSnapshot.transaction.fields, false);
assert.equal('clientEmail' in partnerSnapshot.transaction.fields, false);

assert.throws(() => buildTrustClientSnapshot({
  operation,
  transaction,
  context: outsider,
  auditEvents,
  auditIntegrityVerified: true
}, { now: '2026-09-04T22:00:00Z', viewerSecurityProfile: l3Profile }), error => error instanceof AccessDeniedError);

const receipt = createTrustSecurityReceipt({
  operation,
  transaction,
  context: owner,
  auditEvents,
  auditIntegrityVerified: true,
  securityProfile: l3Profile
}, { now: '2026-09-04T22:00:00Z' });

assert.equal(receipt.dataControl.securityLevel, 'L3_SHARED');
assert.equal(receipt.dataControl.minimumCrossOrganizationLevel, 'L3_SHARED');
assert.equal(receipt.dataControl.personalDataSharingMinimumLevel, 'L4_ADVANCED');
assert.equal(receipt.dataControl.criticalDataSharing, false);
assert.equal(receipt.finance.mode, 'NON_CUSTODIAL');
assert.equal(receipt.finance.fiaCustodiesFunds, false);
assert.equal(receipt.assurance.qualifiedElectronicSignature, false);
assert.equal(verifyTrustSecurityReceipt(receipt), true);

const tampered = JSON.parse(JSON.stringify(receipt));
tampered.finance.fiaCustodiesFunds = true;
assert.equal(verifyTrustSecurityReceipt(tampered), false);

assert.throws(() => createTrustSecurityReceipt({
  operation,
  transaction,
  context: partner,
  auditEvents,
  securityProfile: l3Profile
}, { now: '2026-09-04T22:00:00Z' }), error => error instanceof AccessDeniedError);

console.log('FIA Trust client snapshot + security receipt contract OK');
