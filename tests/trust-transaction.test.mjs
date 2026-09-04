import assert from 'node:assert/strict';
import {
  DATA_CLASSES,
  createTrustTransaction,
  grantOrganizationAccess,
  revokeOrganizationAccess,
  getTrustTransactionView,
  buildWhoSeesWhat
} from '../core/trust/trust-transaction.mjs';
import {
  evaluateTrustSecurityLevel,
  TRUST_SECURITY_LEVELS
} from '../core/trust/trust-security-levels.mjs';
import { AccessDeniedError } from '../core/identity/access-control.mjs';

let seq = 0;
const deps = {
  idFactory: prefix => `${prefix}_TEST_${++seq}`,
  clock: () => '2026-09-04T21:00:00.000Z'
};

const l1Checks = {
  organizationIdentified: true,
  termsAccepted: true,
  tenantBoundaryReady: true,
  auditReady: true,
  incidentContactDefined: true
};
const l2Checks = {
  ...l1Checks,
  identityVerified: true,
  strongAuthenticationReady: true,
  secretsManaged: true,
  dataMinimizationReady: true,
  retentionPolicyReady: true,
  securityTestsPassed: true
};
const l3Checks = {
  ...l2Checks,
  dataPermitsReady: true,
  grantExpiryReady: true,
  grantRevocationReady: true,
  partnerIdentityVerified: true,
  purposeLimitationReady: true,
  crossOrgIsolationTestsPassed: true
};
const l4Checks = {
  ...l3Checks,
  legalRoleValidated: true,
  processorTermsReady: true,
  subprocessorsDocumented: true,
  personalDataWorkflowReviewed: true,
  enhancedSecurityReviewPassed: true,
  regulatedProviderGateReady: true
};
const profileL2 = evaluateTrustSecurityLevel(l2Checks);
const profileL3 = evaluateTrustSecurityLevel(l3Checks);
const profileL4 = evaluateTrustSecurityLevel(l4Checks);
assert.equal(profileL2.level, TRUST_SECURITY_LEVELS.L2_VERIFIED);
assert.equal(profileL3.level, TRUST_SECURITY_LEVELS.L3_SHARED);
assert.equal(profileL4.level, TRUST_SECURITY_LEVELS.L4_ADVANCED);

const ownerAdmin = { actorId: 'owner-admin', organizationId: 'org-anchor', role: 'ADMIN' };
const ownerViewer = { actorId: 'owner-viewer', organizationId: 'org-anchor', role: 'VIEWER' };
const partnerViewer = { actorId: 'partner-viewer', organizationId: 'org-partner', role: 'VIEWER' };
const stranger = { actorId: 'stranger', organizationId: 'org-stranger', role: 'ADMIN' };

const trust = createTrustTransaction({
  ownerOrganizationId: 'org-anchor',
  operationId: 'op-001',
  title: '<b>Venta máquina</b>',
  actor: 'owner-admin',
  fields: [
    { key: 'asset_reference', value: 'TR-8472', classification: DATA_CLASSES.INTERNAL },
    { key: 'delivery_window', value: '2026-09-15', classification: DATA_CLASSES.INTERNAL },
    { key: 'sale_price', value: 72400, classification: DATA_CLASSES.COMMERCIAL_CONFIDENTIAL },
    { key: 'customer_email', value: 'demo@example.invalid', classification: DATA_CLASSES.PERSONAL },
    { key: 'api_secret', value: 'never-share', classification: DATA_CLASSES.CRITICAL }
  ]
}, deps);

assert.equal(trust.title.includes('<'), false);
assert.equal(trust.financialBoundary.fia.custodiesClientFunds, false);

const ownerView = getTrustTransactionView(trust, ownerViewer, { now: '2026-09-04T21:00:01.000Z' });
assert.equal(ownerView.visibleFieldKeys.length, 5);

assert.throws(() => getTrustTransactionView(trust, stranger, { now: '2026-09-04T21:00:01.000Z', viewerSecurityProfile: profileL4 }), error => error instanceof AccessDeniedError);
assert.throws(() => grantOrganizationAccess(trust, ownerViewer, {
  organizationId: 'org-partner', fieldKeys: ['asset_reference'], purpose: 'coordinar preparación', expiresAt: '2026-09-10T00:00:00.000Z', approvedByHuman: true
}, { ...deps, ownerSecurityProfile: profileL3, targetSecurityProfile: profileL3 }), error => error instanceof AccessDeniedError);

assert.throws(() => grantOrganizationAccess(trust, ownerAdmin, {
  organizationId: 'org-partner', fieldKeys: ['asset_reference'], purpose: 'coordinar preparación', expiresAt: '2026-09-10T00:00:00.000Z', approvedByHuman: true
}, { ...deps, ownerSecurityProfile: profileL2, targetSecurityProfile: profileL3 }), /TRUST_CAPABILITY_REQUIRED:CROSS_ORG_SHARE/);

assert.throws(() => grantOrganizationAccess(trust, ownerAdmin, {
  organizationId: 'org-partner', fieldKeys: ['customer_email'], purpose: 'coordinar preparación', expiresAt: '2026-09-10T00:00:00.000Z', approvedByHuman: true
}, { ...deps, ownerSecurityProfile: profileL3, targetSecurityProfile: profileL3 }), /TRUST_CAPABILITY_REQUIRED:PERSONAL_DATA_WORKFLOW/);

assert.throws(() => grantOrganizationAccess(trust, ownerAdmin, {
  organizationId: 'org-partner', fieldKeys: ['api_secret'], purpose: 'coordinar preparación', expiresAt: '2026-09-10T00:00:00.000Z', approvedByHuman: true
}, { ...deps, ownerSecurityProfile: profileL4, targetSecurityProfile: profileL4 }), /FIELD_CLASS_NEVER_SHAREABLE:CRITICAL/);

assert.throws(() => grantOrganizationAccess(trust, ownerAdmin, {
  organizationId: 'org-partner', fieldKeys: ['asset_reference'], purpose: 'coordinar preparación', expiresAt: '2026-09-10T00:00:00.000Z', approvedByHuman: false
}, { ...deps, ownerSecurityProfile: profileL3, targetSecurityProfile: profileL3 }), /HUMAN_APPROVAL_REQUIRED/);

const grant = grantOrganizationAccess(trust, ownerAdmin, {
  organizationId: 'org-partner',
  fieldKeys: ['asset_reference', 'delivery_window'],
  purpose: 'preparación y entrega de la máquina',
  expiresAt: '2026-09-10T00:00:00.000Z',
  approvedByHuman: true
}, { ...deps, ownerSecurityProfile: profileL3, targetSecurityProfile: profileL3 });

assert.equal(grant.ownerSecurityLevelAtGrant, 'L3_SHARED');
assert.equal(grant.targetSecurityLevelAtGrant, 'L3_SHARED');

assert.throws(() => getTrustTransactionView(trust, partnerViewer, { now: '2026-09-05T09:00:00.000Z' }), /TRUST_CAPABILITY_REQUIRED:CROSS_ORG_SHARE/);
assert.throws(() => getTrustTransactionView(trust, partnerViewer, { now: '2026-09-05T09:00:00.000Z', viewerSecurityProfile: profileL2 }), /TRUST_CAPABILITY_REQUIRED:CROSS_ORG_SHARE/);

const partnerView = getTrustTransactionView(trust, partnerViewer, { now: '2026-09-05T09:00:00.000Z', viewerSecurityProfile: profileL3 });
assert.deepEqual(partnerView.visibleFieldKeys.sort(), ['asset_reference', 'delivery_window']);
assert.equal('sale_price' in partnerView.fields, false);
assert.equal('customer_email' in partnerView.fields, false);
assert.equal(partnerView.ownerOrganizationId, null);
assert.equal(partnerView.viewerSecurityLevel, 'L3_SHARED');
assert.equal(partnerView.security.crossOrganizationDataDefault, 'DENY');

assert.throws(() => grantOrganizationAccess(trust, ownerAdmin, {
  organizationId: 'org-partner',
  fieldKeys: ['customer_email'],
  purpose: 'comunicación necesaria para la operación',
  expiresAt: '2026-09-10T00:00:00.000Z',
  approvedByHuman: true,
  personalDataReviewed: false,
  legalReviewRef: 'LEGAL-001'
}, { ...deps, ownerSecurityProfile: profileL4, targetSecurityProfile: profileL4 }), /PERSONAL_DATA_REVIEW_REQUIRED/);

const personalGrant = grantOrganizationAccess(trust, ownerAdmin, {
  organizationId: 'org-partner',
  fieldKeys: ['customer_email'],
  purpose: 'comunicación necesaria para la operación',
  expiresAt: '2026-09-10T00:00:00.000Z',
  approvedByHuman: true,
  personalDataReviewed: true,
  legalReviewRef: 'LEGAL-001'
}, { ...deps, ownerSecurityProfile: profileL4, targetSecurityProfile: profileL4 });
assert.equal(personalGrant.requiredCapability, 'PERSONAL_DATA_WORKFLOW');

const partnerL3AfterPersonalGrant = getTrustTransactionView(trust, partnerViewer, { now: '2026-09-05T09:00:00.000Z', viewerSecurityProfile: profileL3 });
assert.equal('customer_email' in partnerL3AfterPersonalGrant.fields, false);
const partnerL4 = getTrustTransactionView(trust, partnerViewer, { now: '2026-09-05T09:00:00.000Z', viewerSecurityProfile: profileL4 });
assert.equal(partnerL4.fields.customer_email.value, 'demo@example.invalid');

const who = buildWhoSeesWhat(trust, ownerAdmin, { now: '2026-09-05T09:00:00.000Z' });
assert.equal(who.length, 2);
assert.equal(who.find(item => item.organizationId === 'org-partner').fieldKeys.length, 3);
assert.deepEqual(who.find(item => item.organizationId === 'org-partner').requiredCapabilities.sort(), ['CROSS_ORG_SHARE', 'PERSONAL_DATA_WORKFLOW']);

assert.throws(() => getTrustTransactionView(trust, partnerViewer, { now: '2026-09-11T09:00:00.000Z', viewerSecurityProfile: profileL4 }), error => error instanceof AccessDeniedError);

revokeOrganizationAccess(trust, ownerAdmin, grant.id, deps);
revokeOrganizationAccess(trust, ownerAdmin, personalGrant.id, deps);
assert.throws(() => getTrustTransactionView(trust, partnerViewer, { now: '2026-09-05T09:00:00.000Z', viewerSecurityProfile: profileL4 }), error => error instanceof AccessDeniedError);

console.log('FIA Trust Transaction contract OK');
