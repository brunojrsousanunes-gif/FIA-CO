export const INCIDENT_SEVERITY = Object.freeze({
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
});

export const INCIDENT_TYPES = Object.freeze({
  ACCESS_ANOMALY: 'ACCESS_ANOMALY',
  DATA_EXPOSURE: 'DATA_EXPOSURE',
  AUTH_COMPROMISE: 'AUTH_COMPROMISE',
  AI_POLICY_BREACH: 'AI_POLICY_BREACH',
  COST_SPIKE: 'COST_SPIKE',
  INTEGRATION_FAILURE: 'INTEGRATION_FAILURE',
  AVAILABILITY: 'AVAILABILITY',
  FINANCIAL_BOUNDARY: 'FINANCIAL_BOUNDARY'
});

function bool(value) {
  return value === true;
}

export function classifyIncident(input = {}) {
  if (bool(input.crossTenantExposure) || bool(input.secretExposed) || bool(input.unauthorizedFinancialInstruction)) {
    return INCIDENT_SEVERITY.CRITICAL;
  }
  if (bool(input.personalDataExposure) || bool(input.authenticationCompromise) || bool(input.criticalPolicyBypass)) {
    return INCIDENT_SEVERITY.HIGH;
  }
  if (bool(input.costSpike) || bool(input.integrationFailure) || bool(input.serviceUnavailable) || bool(input.suspiciousAccess)) {
    return INCIDENT_SEVERITY.MEDIUM;
  }
  return INCIDENT_SEVERITY.LOW;
}

function unique(values) {
  return [...new Set(values)];
}

export function buildIncidentResponsePlan(input = {}) {
  const severity = classifyIncident(input);
  const actions = ['PRESERVE_AUDIT_EVIDENCE', 'OPEN_INCIDENT_RECORD'];
  const reviewFlags = [];

  if (severity === INCIDENT_SEVERITY.CRITICAL || severity === INCIDENT_SEVERITY.HIGH) {
    actions.push('RECOMMEND_ORGANIZATION_KILL_SWITCH', 'RECOMMEND_REVOKE_ACTIVE_SESSIONS');
  }
  if (bool(input.integrationFailure) || bool(input.criticalPolicyBypass) || bool(input.aiPolicyBreach)) {
    actions.push('RECOMMEND_WORKFLOW_KILL_SWITCH');
  }
  if (bool(input.costSpike)) actions.push('RECOMMEND_COST_CIRCUIT_BREAKER');
  if (bool(input.secretExposed)) actions.push('RECOMMEND_SECRET_ROTATION');
  if (bool(input.crossTenantExposure)) actions.push('RECOMMEND_CROSS_ORG_FREEZE');
  if (bool(input.personalDataExposure) || bool(input.crossTenantExposure)) reviewFlags.push('PRIVACY_LEGAL_ASSESSMENT_REQUIRED');
  if (bool(input.unauthorizedFinancialInstruction)) reviewFlags.push('FINANCIAL_PROVIDER_AND_LEGAL_ASSESSMENT_REQUIRED');
  if (bool(input.authenticationCompromise)) reviewFlags.push('IDENTITY_SECURITY_REVIEW_REQUIRED');

  return Object.freeze({
    schemaVersion: 'incident-response-plan.v1',
    severity,
    executionMode: 'PLAN_ONLY',
    automaticExternalCommunication: false,
    automaticLegalConclusion: false,
    automaticBreachNotification: false,
    recommendedActions: Object.freeze(unique(actions)),
    reviewFlags: Object.freeze(unique(reviewFlags)),
    financialBoundary: 'NON_CUSTODIAL',
    rule: 'El motor clasifica y prepara contención; no decide obligaciones jurídicas ni envía notificaciones externas.'
  });
}

export function createSyntheticIncidentDrill(type = INCIDENT_TYPES.ACCESS_ANOMALY) {
  const templates = {
    ACCESS_ANOMALY: { suspiciousAccess: true },
    DATA_EXPOSURE: { personalDataExposure: true },
    AUTH_COMPROMISE: { authenticationCompromise: true },
    AI_POLICY_BREACH: { aiPolicyBreach: true, criticalPolicyBypass: true },
    COST_SPIKE: { costSpike: true },
    INTEGRATION_FAILURE: { integrationFailure: true },
    AVAILABILITY: { serviceUnavailable: true },
    FINANCIAL_BOUNDARY: { unauthorizedFinancialInstruction: true }
  };
  if (!templates[type]) throw new Error('UNKNOWN_INCIDENT_DRILL');
  return Object.freeze({ type, synthetic: true, ...templates[type] });
}
