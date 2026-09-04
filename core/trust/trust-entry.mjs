import { TRUST_SECURITY_LEVELS, TRUST_CAPABILITIES, hasTrustCapability } from './trust-security-levels.mjs';

export const TRUST_ENTRY_VERSION = 'trust-entry.v1';

export const TRUST_ENTRY_MODES = Object.freeze({
  SYNTHETIC_DEMO: 'SYNTHETIC_DEMO',
  ISOLATED_TRIAL: 'ISOLATED_TRIAL',
  VERIFIED_INTERNAL: 'VERIFIED_INTERNAL',
  SHARED_OPERATION: 'SHARED_OPERATION',
  ADVANCED: 'ADVANCED'
});

const LEVEL_TO_MODE = Object.freeze({
  [TRUST_SECURITY_LEVELS.L0_DEMO]: TRUST_ENTRY_MODES.SYNTHETIC_DEMO,
  [TRUST_SECURITY_LEVELS.L1_ISOLATED]: TRUST_ENTRY_MODES.ISOLATED_TRIAL,
  [TRUST_SECURITY_LEVELS.L2_VERIFIED]: TRUST_ENTRY_MODES.VERIFIED_INTERNAL,
  [TRUST_SECURITY_LEVELS.L3_SHARED]: TRUST_ENTRY_MODES.SHARED_OPERATION,
  [TRUST_SECURITY_LEVELS.L4_ADVANCED]: TRUST_ENTRY_MODES.ADVANCED
});

const MODE_ACCESS = Object.freeze({
  SYNTHETIC_DEMO: Object.freeze({
    realDataRequested: false,
    integrationsRequested: false,
    crossOrganizationSharing: false,
    externalActions: false,
    paymentExecution: false
  }),
  ISOLATED_TRIAL: Object.freeze({
    realDataRequested: true,
    integrationsRequested: false,
    crossOrganizationSharing: false,
    externalActions: false,
    paymentExecution: false
  }),
  VERIFIED_INTERNAL: Object.freeze({
    realDataRequested: true,
    integrationsRequested: true,
    crossOrganizationSharing: false,
    externalActions: false,
    paymentExecution: false
  }),
  SHARED_OPERATION: Object.freeze({
    realDataRequested: true,
    integrationsRequested: true,
    crossOrganizationSharing: true,
    externalActions: true,
    paymentExecution: false
  }),
  ADVANCED: Object.freeze({
    realDataRequested: true,
    integrationsRequested: true,
    crossOrganizationSharing: true,
    externalActions: true,
    paymentExecution: false
  })
});

const FIRST_OPERATION_CHECKS = Object.freeze([
  'managerSponsorConfirmed',
  'singleOperationSelected',
  'pilotScopeDefined',
  'measurementPlanDefined',
  'dataInventoryReviewed',
  'dataPermitPrepared',
  'retentionDefined',
  'incidentContactDefined',
  'nonCustodialDisclosureAccepted',
  'noCrossOrganizationSharing',
  'noExternalActions',
  'noPaymentExecution',
  'noCriticalDataRequired'
]);

function bool(value) {
  return value === true;
}

function clean(value, max = 140) {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .slice(0, max);
}

export function buildTrustEntryOffer(profile = {}, input = {}) {
  const level = Object.values(TRUST_SECURITY_LEVELS).includes(profile.level)
    ? profile.level
    : TRUST_SECURITY_LEVELS.L0_DEMO;
  const mode = LEVEL_TO_MODE[level];
  const access = MODE_ACCESS[mode];

  return Object.freeze({
    policyVersion: TRUST_ENTRY_VERSION,
    level,
    mode,
    useCase: clean(input.useCase || 'TRUST_TRANSACTION', 80),
    operationKind: clean(input.operationKind || 'generic', 80),
    promise: 'Demostrar valor con el mínimo acceso necesario y aumentar capacidades solo cuando aumentan los controles verificados.',
    access: Object.freeze({ ...access }),
    nonCustodial: true,
    currentCapabilities: Object.freeze([...(profile.capabilities || [])]),
    nextSecurityRequirements: Object.freeze([...(profile.missingForNextLevel || [])]),
    managerMessage: level === TRUST_SECURITY_LEVELS.L0_DEMO
      ? 'Para ver la demostración FIA no necesitamos datos reales, credenciales ni acceso a tus sistemas.'
      : 'FIA solo solicita los accesos habilitados por el nivel de seguridad actualmente verificado.'
  });
}

export function evaluateFirstOperationReadiness(profile = {}, checks = {}) {
  const missing = FIRST_OPERATION_CHECKS.filter(name => !bool(checks[name]));
  const isolatedCapability = hasTrustCapability(profile, TRUST_CAPABILITIES.REAL_DATA_ISOLATED);
  if (!isolatedCapability) missing.unshift('trustLevelAtLeastL1');

  const uniqueMissing = [...new Set(missing)];
  return Object.freeze({
    policyVersion: TRUST_ENTRY_VERSION,
    ready: uniqueMissing.length === 0,
    requiredLevel: TRUST_SECURITY_LEVELS.L1_ISOLATED,
    currentLevel: profile?.level || TRUST_SECURITY_LEVELS.L0_DEMO,
    missing: Object.freeze(uniqueMissing),
    restrictions: Object.freeze({
      oneOperationOnly: true,
      crossOrganizationSharing: false,
      externalActions: false,
      paymentExecution: false,
      criticalData: false,
      personalData: 'MINIMIZE_OR_PSEUDONYMIZE_WHEN_POSSIBLE'
    }),
    nextAction: uniqueMissing.length
      ? 'COMPLETE_TRUST_ENTRY_GATE'
      : 'CREATE_ISOLATED_TRUST_TRANSACTION'
  });
}

export function assertFirstOperationReady(profile = {}, checks = {}) {
  const result = evaluateFirstOperationReadiness(profile, checks);
  if (!result.ready) {
    const error = new Error(`TRUST_ENTRY_NOT_READY:${result.missing.join(',')}`);
    error.name = 'TrustEntryNotReadyError';
    error.details = result;
    throw error;
  }
  return result;
}
