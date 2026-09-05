import assert from 'node:assert/strict';
import { createDataStewardDelegation, isDataStewardDelegationActive } from '../core/data/data-steward-delegation.mjs';

const delegation = createDataStewardDelegation({
  delegateAlias: 'support-data-steward',
  task: 'NORMALIZE_FIELDS',
  fieldKeys: ['quoteReference', 'status'],
  classifications: ['INTERNAL'],
  requestedCapabilities: ['NORMALIZE_FIELDS'],
  purpose: 'Preparar estructura sintética para demo',
  ttlMinutes: 60
}, { now: '2026-09-05T02:00:00Z' });

assert.equal(delegation.leastPrivilege, true);
assert.equal(delegation.crossOrganizationAccess, false);
assert.equal(delegation.criticalDataAccess, false);
assert.equal(delegation.paymentAccess, false);
assert.equal(delegation.trustLevelChangeAllowed, false);
assert.equal(delegation.productionActivationAllowed, false);
assert.equal(delegation.legalApprovalAllowed, false);
assert.equal(delegation.onboardingRequired, true);
assert.equal(isDataStewardDelegationActive(delegation, { now: '2026-09-05T02:30:00Z' }), true);
assert.equal(isDataStewardDelegationActive(delegation, { now: '2026-09-05T03:01:00Z' }), false);

assert.throws(() => createDataStewardDelegation({
  task: 'NORMALIZE_FIELDS',
  classifications: ['CRITICAL']
}), /CRITICAL_DATA_NOT_ALLOWED/);

assert.throws(() => createDataStewardDelegation({
  task: 'VALIDATE_STRUCTURE',
  requestedCapabilities: ['CHANGE_TRUST_LEVEL']
}), /FORBIDDEN_DATA_STEWARD_CAPABILITY/);

assert.throws(() => createDataStewardDelegation({
  task: 'REVIEW_AGGREGATE_QUALITY',
  requestedCapabilities: ['MOVE_FUNDS']
}), /FORBIDDEN_DATA_STEWARD_CAPABILITY/);

console.log('FIA least-privilege Data Steward delegation OK');
