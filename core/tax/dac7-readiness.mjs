const REQUIRED_SELLER_FIELDS = ['sellerReference','legalName','primaryAddressCountry','taxResidenceCountry','taxIdentifierReference'];

export function evaluateDac7Readiness(input = {}) {
  const missingFields = REQUIRED_SELLER_FIELDS.filter(field => !String(input.seller?.[field] || '').trim());
  const operatorScope = input.operatorInScope;
  if (operatorScope !== true && operatorScope !== false) {
    return Object.freeze({
      schemaVersion: 'dac7-readiness.v1',
      decision: 'PROFESSIONAL_SCOPE_REVIEW_REQUIRED',
      reportingAllowed: false,
      missingFields,
      taxDataStoredInPublicFrontend: false
    });
  }
  const validated = Boolean(input.professionalValidationReference);
  return Object.freeze({
    schemaVersion: 'dac7-readiness.v1',
    decision: operatorScope ? (missingFields.length ? 'SELLER_DUE_DILIGENCE_INCOMPLETE' : 'READY_FOR_CONTROLLED_REPORTING_PIPELINE') : 'OUT_OF_SCOPE_RECORDED',
    reportingAllowed: operatorScope === true && missingFields.length === 0 && validated,
    missingFields,
    professionalValidationReference: input.professionalValidationReference || null,
    taxDataStoredInPublicFrontend: false,
    note: 'Este control no determina por sí solo la obligación fiscal ni presenta declaraciones.'
  });
}
