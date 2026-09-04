export const FINANCIAL_BOUNDARY_VERSION = 'financial-boundary.v1';

export const FIA_FINANCIAL_CAPABILITIES = Object.freeze({
  receivesClientFunds: false,
  custodiesClientFunds: false,
  movesClientFunds: false,
  holdsClientBalances: false,
  issuesPaymentAccounts: false,
  guaranteesSettlement: false
});

export const SHORT_FINANCIAL_DISCLOSURE = 'FIA no recibe, custodia ni mueve fondos. Los pagos reales se ejecutan mediante un proveedor de servicios de pago o entidad financiera legalmente habilitada.';

export const EXTENDED_FINANCIAL_DISCLOSURE = 'FIA coordina estados, autorizaciones, evidencias y trazabilidad de la operación, pero no actúa como banco, entidad de pago ni custodio de fondos. Cuando una operación requiera un pago real, la ejecución y, cuando corresponda, la protección de los fondos corresponden al proveedor financiero o de pagos legalmente habilitado seleccionado para la operación.';

const ALLOWED_PROVIDER_TYPES = new Set([
  'CREDIT_INSTITUTION',
  'PAYMENT_INSTITUTION',
  'E_MONEY_INSTITUTION',
  'OTHER_LEGALLY_AUTHORIZED_PSP'
]);

function clean(value, max = 180) {
  return String(value ?? '').replace(/[<>]/g, '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
}

export function evaluatePaymentProvider(provider = {}) {
  const providerType = clean(provider.providerType, 50).toUpperCase();
  const legalName = clean(provider.legalName, 160);
  const registerReference = clean(provider.registerReference, 180);
  const authorizationReference = clean(provider.authorizationReference, 180);
  const legalTermsReference = clean(provider.legalTermsReference, 180);
  const verifiedAt = clean(provider.verifiedAt, 40);
  const verifiedBy = clean(provider.verifiedBy, 120);

  const checks = Object.freeze({
    legalNamePresent: Boolean(legalName),
    providerTypeAllowed: ALLOWED_PROVIDER_TYPES.has(providerType),
    officialEvidencePresent: Boolean(registerReference || authorizationReference),
    legalTermsPresent: Boolean(legalTermsReference),
    verificationRecorded: Boolean(verifiedAt && verifiedBy)
  });

  const missing = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
  return Object.freeze({
    allowedForProduction: missing.length === 0,
    providerType: providerType || null,
    legalName: legalName || null,
    missing,
    checks,
    policyVersion: FINANCIAL_BOUNDARY_VERSION
  });
}

export function assertPaymentProviderReady(provider = {}) {
  const result = evaluatePaymentProvider(provider);
  if (!result.allowedForProduction) {
    const error = new Error(`PAYMENT_PROVIDER_NOT_READY:${result.missing.join(',')}`);
    error.name = 'PaymentProviderNotReadyError';
    error.details = result;
    throw error;
  }
  return result;
}

export function buildFinancialBoundaryView(provider = null) {
  return Object.freeze({
    policyVersion: FINANCIAL_BOUNDARY_VERSION,
    mode: 'NON_CUSTODIAL',
    fia: FIA_FINANCIAL_CAPABILITIES,
    disclosure: SHORT_FINANCIAL_DISCLOSURE,
    provider: provider ? evaluatePaymentProvider(provider) : Object.freeze({ allowedForProduction: false, reason: 'NO_PROVIDER_SELECTED' })
  });
}
