export const DATA_STEWARD_TASKS = Object.freeze({
  NORMALIZE_FIELDS: 'NORMALIZE_FIELDS',
  VALIDATE_STRUCTURE: 'VALIDATE_STRUCTURE',
  PREPARE_SYNTHETIC_DEMO: 'PREPARE_SYNTHETIC_DEMO',
  REVIEW_AGGREGATE_QUALITY: 'REVIEW_AGGREGATE_QUALITY'
});

const FORBIDDEN_CLASSIFICATIONS = new Set(['CRITICAL']);
const FORBIDDEN_CAPABILITIES = new Set([
  'CHANGE_TRUST_LEVEL',
  'GRANT_CROSS_ORG_ACCESS',
  'MOVE_FUNDS',
  'CUSTODY_FUNDS',
  'EXECUTE_PAYMENT',
  'ROTATE_SECRETS',
  'APPROVE_LEGAL_STATUS',
  'ACTIVATE_PRODUCTION'
]);

function clean(value, max = 160) {
  return String(value ?? '').replace(/[<>\r\n\t]/g, ' ').trim().slice(0, max);
}

export function createDataStewardDelegation(input = {}, options = {}) {
  const task = clean(input.task, 50).toUpperCase();
  if (!Object.values(DATA_STEWARD_TASKS).includes(task)) throw new Error('INVALID_DATA_STEWARD_TASK');

  const fieldKeys = [...new Set((Array.isArray(input.fieldKeys) ? input.fieldKeys : [])
    .map(value => clean(value, 80))
    .filter(Boolean))];
  const classifications = [...new Set((Array.isArray(input.classifications) ? input.classifications : [])
    .map(value => clean(value, 40).toUpperCase())
    .filter(Boolean))];
  if (classifications.some(value => FORBIDDEN_CLASSIFICATIONS.has(value))) {
    throw new Error('CRITICAL_DATA_NOT_ALLOWED_FOR_DATA_STEWARD');
  }

  const requestedCapabilities = (Array.isArray(input.requestedCapabilities) ? input.requestedCapabilities : [])
    .map(value => clean(value, 80).toUpperCase())
    .filter(Boolean);
  if (requestedCapabilities.some(value => FORBIDDEN_CAPABILITIES.has(value))) {
    throw new Error('FORBIDDEN_DATA_STEWARD_CAPABILITY');
  }

  const now = new Date(options.now || new Date().toISOString());
  if (!Number.isFinite(now.getTime())) throw new Error('INVALID_NOW');
  const ttlMinutes = Math.max(15, Math.min(480, Math.floor(Number(input.ttlMinutes) || 120)));
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000).toISOString();

  return Object.freeze({
    schemaVersion: 'data-steward-delegation.v1',
    delegateAlias: clean(input.delegateAlias || 'data-steward', 80),
    task,
    fieldKeys: Object.freeze(fieldKeys),
    classifications: Object.freeze(classifications),
    requestedCapabilities: Object.freeze(requestedCapabilities),
    purpose: clean(input.purpose || 'Preparación y calidad de datos', 180),
    issuedAt: now.toISOString(),
    expiresAt,
    leastPrivilege: true,
    crossOrganizationAccess: false,
    criticalDataAccess: false,
    paymentAccess: false,
    trustLevelChangeAllowed: false,
    productionActivationAllowed: false,
    legalApprovalAllowed: false,
    onboardingRequired: true,
    independentReviewRequiredForSensitiveEscalation: true
  });
}

export function isDataStewardDelegationActive(delegation = {}, options = {}) {
  if (!delegation || delegation.schemaVersion !== 'data-steward-delegation.v1') return false;
  const now = new Date(options.now || new Date().toISOString());
  const expiry = new Date(delegation.expiresAt);
  return Number.isFinite(now.getTime()) && Number.isFinite(expiry.getTime()) && now < expiry;
}
