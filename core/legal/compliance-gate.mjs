const PRODUCTION_CAPABILITIES = new Set([
  'REAL_MONEY',
  'REAL_PII',
  'PRODUCTION_MARKETPLACE',
  'PRODUCTION_EVIDENCE_UPLOAD',
  'PRODUCTION_AI_ACTIONS'
]);

const NEVER_ALLOWED = new Set([
  'CLIENT_FUNDS_CUSTODY',
  'BIOMETRICS',
  'BINDING_AUTOMATED_DECISION'
]);

export class ComplianceGateError extends Error {
  constructor(code, details = {}) {
    super(code);
    this.name = 'ComplianceGateError';
    this.code = code;
    this.details = details;
  }
}

export function evaluateComplianceGate(policy = {}, request = {}) {
  const capability = String(request.capability || '').trim().toUpperCase();
  if (!capability) throw new ComplianceGateError('CAPABILITY_REQUIRED');
  if (NEVER_ALLOWED.has(capability)) {
    return Object.freeze({allowed:false, capability, reason:'PERMANENT_BOUNDARY'});
  }
  if (!PRODUCTION_CAPABILITIES.has(capability)) {
    return Object.freeze({allowed:false, capability, reason:'UNKNOWN_CAPABILITY'});
  }
  const missing = [];
  if (policy.legalReadyForPilot !== true) missing.push('LEGAL_READY_FOR_PILOT');
  if (policy.externalLegalReviewCompleted !== true) missing.push('EXTERNAL_LEGAL_REVIEW');
  if (policy.jurisdictionValidated !== true) missing.push('JURISDICTION_VALIDATION');
  if (policy.productionInfrastructureReady !== true) missing.push('PRODUCTION_INFRASTRUCTURE');
  if (policy.capabilities?.[capability] !== true) missing.push(`CAPABILITY_${capability}`);
  return Object.freeze({
    allowed: missing.length === 0,
    capability,
    reason: missing.length ? 'COMPLIANCE_EVIDENCE_MISSING' : 'ALL_GATES_VERIFIED',
    missing: Object.freeze(missing)
  });
}

export function assertComplianceGate(policy, request) {
  const result = evaluateComplianceGate(policy, request);
  if (!result.allowed) throw new ComplianceGateError(result.reason, result);
  return result;
}
