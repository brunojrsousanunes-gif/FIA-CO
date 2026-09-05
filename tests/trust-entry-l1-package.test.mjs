import assert from 'node:assert/strict';
import { createL1PreparationPackage } from '../core/trust/trust-entry-l1-package.mjs';

const pkg = createL1PreparationPackage({
  scenario: 'QUOTE_RECOVERY',
  organizationAlias: 'prospect-a',
  operationAlias: 'quote-pilot-01',
  operationKind: 'b2b-quote',
  requestedFields: [
    { key: 'quoteReference', classification: 'INTERNAL', purpose: 'Relacionar seguimiento con una oportunidad', required: true },
    { key: 'quoteAmount', classification: 'COMMERCIAL_CONFIDENTIAL', purpose: 'Medir valor agregado', required: false }
  ],
  metricKeys: ['timeToFollowUp', 'responses', 'hoursSaved'],
  retentionDays: 30
}, { now: '2026-09-05T01:30:00Z' });

assert.equal(pkg.activationStatus, 'PREPARATION_ONLY');
assert.equal(pkg.productionActivation, false);
assert.equal(pkg.realDataIncluded, false);
assert.equal(pkg.dataPermitDraft.defaultDecision, 'DENY_UNLISTED');
assert.equal(pkg.dataPermitDraft.crossOrganizationSharing, false);
assert.equal(pkg.dataPermitDraft.criticalDataAllowed, false);
assert.equal(pkg.securityRestrictions.nonCustodial, true);
assert.ok(pkg.unresolvedActivationRequirements.includes('applicableLegalPrivacyReview'));

assert.throws(() => createL1PreparationPackage({
  scenario: 'QUOTE_RECOVERY',
  requestedFields: [{ key: 'email', purpose: 'test', classification: 'PERSONAL', value: 'real@example.com' }],
  metricKeys: ['responses']
}), /MUST_NOT_CONTAIN_REAL_VALUES/);

assert.throws(() => createL1PreparationPackage({
  scenario: 'TRUST_TRANSACTION',
  requestedFields: [{ key: 'password', purpose: 'not allowed', classification: 'CRITICAL' }],
  metricKeys: ['cycleTime']
}), /INVALID_OR_CRITICAL_FIELD_CLASSIFICATION/);

assert.throws(() => createL1PreparationPackage({
  scenario: 'PARTNER_COORDINATION',
  requestedFields: [{ key: 'reference', purpose: 'handoff', classification: 'INTERNAL' }],
  metricKeys: ['handoffTime']
}), /REQUIRES_L3_NOT_L1/);

console.log('FIA L1 preparation package contract OK');
