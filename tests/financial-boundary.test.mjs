import assert from 'node:assert/strict';
import {
  FIA_FINANCIAL_CAPABILITIES,
  SHORT_FINANCIAL_DISCLOSURE,
  evaluatePaymentProvider,
  assertPaymentProviderReady,
  buildFinancialBoundaryView
} from '../core/finance/financial-boundary.mjs';

assert.deepEqual(FIA_FINANCIAL_CAPABILITIES, {
  receivesClientFunds: false,
  custodiesClientFunds: false,
  movesClientFunds: false,
  holdsClientBalances: false,
  issuesPaymentAccounts: false,
  guaranteesSettlement: false
});
assert.match(SHORT_FINANCIAL_DISCLOSURE, /no recibe, custodia ni mueve fondos/i);
assert.doesNotMatch(SHORT_FINANCIAL_DISCLOSURE, /fondos están en el Banco de España/i);

const empty = evaluatePaymentProvider({});
assert.equal(empty.allowedForProduction, false);
assert.ok(empty.missing.includes('legalNamePresent'));
assert.ok(empty.missing.includes('officialEvidencePresent'));
assert.throws(() => assertPaymentProviderReady({}), /PAYMENT_PROVIDER_NOT_READY/);

const provider = {
  legalName: 'Proveedor Regulado Demo, S.A.',
  providerType: 'PAYMENT_INSTITUTION',
  registerReference: 'BDE-DEMO-REF',
  legalTermsReference: 'terms-v1',
  verifiedAt: '2026-09-04T20:00:00.000Z',
  verifiedBy: 'fia-compliance'
};
const ready = assertPaymentProviderReady(provider);
assert.equal(ready.allowedForProduction, true);

const view = buildFinancialBoundaryView(provider);
assert.equal(view.mode, 'NON_CUSTODIAL');
assert.equal(view.provider.allowedForProduction, true);
assert.equal(view.fia.custodiesClientFunds, false);

console.log('FIA financial boundary contract OK');
