import assert from 'node:assert/strict';
import {
  DATA_CLASSES,
  createTrustTransaction,
  grantOrganizationAccess,
  revokeOrganizationAccess,
  getTrustTransactionView,
  buildWhoSeesWhat
} from '../core/trust/trust-transaction.mjs';
import { AccessDeniedError } from '../core/identity/access-control.mjs';

let seq = 0;
const deps = {
  idFactory: prefix => `${prefix}_TEST_${++seq}`,
  clock: () => '2026-09-04T21:00:00.000Z'
};

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

assert.throws(() => getTrustTransactionView(trust, stranger, { now: '2026-09-04T21:00:01.000Z' }), error => error instanceof AccessDeniedError);
assert.throws(() => grantOrganizationAccess(trust, ownerViewer, {
  organizationId: 'org-partner', fieldKeys: ['asset_reference'], purpose: 'coordinar preparación', expiresAt: '2026-09-10T00:00:00.000Z', approvedByHuman: true
}, deps), error => error instanceof AccessDeniedError);

assert.throws(() => grantOrganizationAccess(trust, ownerAdmin, {
  organizationId: 'org-partner', fieldKeys: ['customer_email'], purpose: 'coordinar preparación', expiresAt: '2026-09-10T00:00:00.000Z', approvedByHuman: true
}, deps), /FIELD_CLASS_NOT_SHAREABLE_V1:PERSONAL/);

assert.throws(() => grantOrganizationAccess(trust, ownerAdmin, {
  organizationId: 'org-partner', fieldKeys: ['api_secret'], purpose: 'coordinar preparación', expiresAt: '2026-09-10T00:00:00.000Z', approvedByHuman: true
}, deps), /FIELD_CLASS_NOT_SHAREABLE_V1:CRITICAL/);

assert.throws(() => grantOrganizationAccess(trust, ownerAdmin, {
  organizationId: 'org-partner', fieldKeys: ['asset_reference'], purpose: 'coordinar preparación', expiresAt: '2026-09-10T00:00:00.000Z', approvedByHuman: false
}, deps), /HUMAN_APPROVAL_REQUIRED/);

const grant = grantOrganizationAccess(trust, ownerAdmin, {
  organizationId: 'org-partner',
  fieldKeys: ['asset_reference', 'delivery_window'],
  purpose: 'preparación y entrega de la máquina',
  expiresAt: '2026-09-10T00:00:00.000Z',
  approvedByHuman: true
}, deps);

const partnerView = getTrustTransactionView(trust, partnerViewer, { now: '2026-09-05T09:00:00.000Z' });
assert.deepEqual(partnerView.visibleFieldKeys.sort(), ['asset_reference', 'delivery_window']);
assert.equal('sale_price' in partnerView.fields, false);
assert.equal('customer_email' in partnerView.fields, false);
assert.equal(partnerView.ownerOrganizationId, null);
assert.equal(partnerView.security.crossOrganizationDataDefault, 'DENY');

const who = buildWhoSeesWhat(trust, ownerAdmin, { now: '2026-09-05T09:00:00.000Z' });
assert.equal(who.length, 2);
assert.equal(who.find(item => item.organizationId === 'org-partner').fieldKeys.length, 2);

assert.throws(() => getTrustTransactionView(trust, partnerViewer, { now: '2026-09-11T09:00:00.000Z' }), error => error instanceof AccessDeniedError);

revokeOrganizationAccess(trust, ownerAdmin, grant.id, deps);
assert.throws(() => getTrustTransactionView(trust, partnerViewer, { now: '2026-09-05T09:00:00.000Z' }), error => error instanceof AccessDeniedError);

console.log('FIA Trust Transaction contract OK');
