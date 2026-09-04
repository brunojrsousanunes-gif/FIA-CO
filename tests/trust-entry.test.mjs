import assert from 'node:assert/strict';
import { evaluateTrustSecurityLevel, TRUST_SECURITY_LEVELS } from '../core/trust/trust-security-levels.mjs';
import {
  TRUST_ENTRY_MODES,
  buildTrustEntryOffer,
  evaluateFirstOperationReadiness,
  assertFirstOperationReady
} from '../core/trust/trust-entry.mjs';

const l0 = evaluateTrustSecurityLevel({});
const demoOffer = buildTrustEntryOffer(l0, { useCase: 'TRUST_TRANSACTION', operationKind: '<tractor>' });
assert.equal(demoOffer.level, TRUST_SECURITY_LEVELS.L0_DEMO);
assert.equal(demoOffer.mode, TRUST_ENTRY_MODES.SYNTHETIC_DEMO);
assert.equal(demoOffer.access.realDataRequested, false);
assert.equal(demoOffer.access.integrationsRequested, false);
assert.equal(demoOffer.access.crossOrganizationSharing, false);
assert.equal(demoOffer.access.externalActions, false);
assert.equal(demoOffer.access.paymentExecution, false);
assert.equal(demoOffer.nonCustodial, true);
assert.equal(demoOffer.operationKind.includes('<'), false);

const notReady = evaluateFirstOperationReadiness(l0, {});
assert.equal(notReady.ready, false);
assert.ok(notReady.missing.includes('trustLevelAtLeastL1'));
assert.equal(notReady.restrictions.oneOperationOnly, true);
assert.equal(notReady.restrictions.crossOrganizationSharing, false);
assert.equal(notReady.restrictions.paymentExecution, false);

const l1 = evaluateTrustSecurityLevel({
  organizationIdentified: true,
  termsAccepted: true,
  tenantBoundaryReady: true,
  auditReady: true,
  incidentContactDefined: true
});
assert.equal(l1.level, TRUST_SECURITY_LEVELS.L1_ISOLATED);

const l1Offer = buildTrustEntryOffer(l1, { operationKind: 'maquinaria agrícola' });
assert.equal(l1Offer.mode, TRUST_ENTRY_MODES.ISOLATED_TRIAL);
assert.equal(l1Offer.access.realDataRequested, true);
assert.equal(l1Offer.access.integrationsRequested, false);
assert.equal(l1Offer.access.crossOrganizationSharing, false);
assert.equal(l1Offer.access.externalActions, false);
assert.equal(l1Offer.access.paymentExecution, false);

const firstOperationChecks = {
  managerSponsorConfirmed: true,
  singleOperationSelected: true,
  pilotScopeDefined: true,
  measurementPlanDefined: true,
  dataInventoryReviewed: true,
  dataPermitPrepared: true,
  retentionDefined: true,
  incidentContactDefined: true,
  nonCustodialDisclosureAccepted: true,
  noCrossOrganizationSharing: true,
  noExternalActions: true,
  noPaymentExecution: true,
  noCriticalDataRequired: true
};

const ready = evaluateFirstOperationReadiness(l1, firstOperationChecks);
assert.equal(ready.ready, true);
assert.equal(ready.nextAction, 'CREATE_ISOLATED_TRUST_TRANSACTION');
assert.doesNotThrow(() => assertFirstOperationReady(l1, firstOperationChecks));

const unsafe = { ...firstOperationChecks, noPaymentExecution: false };
assert.equal(evaluateFirstOperationReadiness(l1, unsafe).ready, false);
assert.throws(() => assertFirstOperationReady(l1, unsafe), /TRUST_ENTRY_NOT_READY:noPaymentExecution/);

console.log('FIA Trust Entry contract OK');
