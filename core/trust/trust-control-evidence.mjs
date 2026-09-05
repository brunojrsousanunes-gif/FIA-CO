import crypto from 'node:crypto';
import {
  TRUST_SECURITY_LEVELS,
  evaluateTrustSecurityLevel,
  getTrustLevelDefinition
} from './trust-security-levels.mjs';

export const TRUST_EVIDENCE_VERSION = 'trust-control-evidence.v1';

export const TRUST_EVIDENCE_SOURCES = Object.freeze({
  AUTOMATED_TEST: 'AUTOMATED_TEST',
  SYSTEM_CONFIG: 'SYSTEM_CONFIG',
  STATIC_POLICY: 'STATIC_POLICY',
  RUNTIME_OBSERVATION: 'RUNTIME_OBSERVATION',
  HUMAN_ATTESTATION: 'HUMAN_ATTESTATION',
  EXTERNAL_VERIFICATION: 'EXTERNAL_VERIFICATION'
});

export const TRUST_EVIDENCE_STATUS = Object.freeze({
  PASS: 'PASS',
  FAIL: 'FAIL',
  UNKNOWN: 'UNKNOWN'
});

const AUTOMATED_SOURCES = new Set([
  TRUST_EVIDENCE_SOURCES.AUTOMATED_TEST,
  TRUST_EVIDENCE_SOURCES.SYSTEM_CONFIG,
  TRUST_EVIDENCE_SOURCES.STATIC_POLICY,
  TRUST_EVIDENCE_SOURCES.RUNTIME_OBSERVATION
]);

const HUMAN_OR_EXTERNAL_SOURCES = new Set([
  TRUST_EVIDENCE_SOURCES.HUMAN_ATTESTATION,
  TRUST_EVIDENCE_SOURCES.EXTERNAL_VERIFICATION
]);

export const NON_AUTOMATABLE_TRUST_CONTROLS = Object.freeze([
  'organizationIdentified',
  'termsAccepted',
  'incidentContactDefined',
  'identityVerified',
  'partnerIdentityVerified',
  'legalRoleValidated',
  'processorTermsReady',
  'subprocessorsDocumented',
  'personalDataWorkflowReviewed',
  'enhancedSecurityReviewPassed',
  'regulatedProviderGateReady'
]);

const NON_AUTOMATABLE = new Set(NON_AUTOMATABLE_TRUST_CONTROLS);

const LEVEL_ORDER = Object.freeze([
  TRUST_SECURITY_LEVELS.L1_ISOLATED,
  TRUST_SECURITY_LEVELS.L2_VERIFIED,
  TRUST_SECURITY_LEVELS.L3_SHARED,
  TRUST_SECURITY_LEVELS.L4_ADVANCED
]);

function clean(value, max = 160) {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .slice(0, max);
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  }
  return value;
}

function digest(payload) {
  return crypto.createHash('sha256').update(JSON.stringify(canonical(payload))).digest('hex');
}

function iso(value, fallback = null) {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.getTime()) ? date.toISOString() : fallback;
}

export function createControlEvidence(input = {}, options = {}) {
  const controlId = clean(input.controlId, 100);
  const sourceType = clean(input.sourceType, 40);
  const status = clean(input.status || TRUST_EVIDENCE_STATUS.UNKNOWN, 20);
  if (!controlId) throw new Error('CONTROL_ID_REQUIRED');
  if (!Object.values(TRUST_EVIDENCE_SOURCES).includes(sourceType)) throw new Error('INVALID_EVIDENCE_SOURCE');
  if (!Object.values(TRUST_EVIDENCE_STATUS).includes(status)) throw new Error('INVALID_EVIDENCE_STATUS');

  const observedAt = iso(input.observedAt || options.now || new Date().toISOString());
  const expiresAt = input.expiresAt ? iso(input.expiresAt) : null;
  if (input.expiresAt && !expiresAt) throw new Error('INVALID_EVIDENCE_EXPIRY');
  if (expiresAt && new Date(expiresAt) <= new Date(observedAt)) throw new Error('EVIDENCE_EXPIRY_NOT_AFTER_OBSERVATION');

  const body = Object.freeze({
    schemaVersion: TRUST_EVIDENCE_VERSION,
    evidenceId: clean(input.evidenceId || `ev_${digest(`${controlId}:${sourceType}:${observedAt}`).slice(0, 20)}`, 80),
    controlId,
    status,
    sourceType,
    sourceRef: clean(input.sourceRef, 180) || null,
    observedAt,
    expiresAt,
    policyVersion: clean(input.policyVersion, 100) || null,
    automated: AUTOMATED_SOURCES.has(sourceType),
    metadata: Object.freeze({ ...(input.metadata || {}) })
  });

  return Object.freeze({ ...body, evidenceDigest: digest(body) });
}

export function verifyControlEvidence(evidence = {}) {
  if (!evidence || typeof evidence !== 'object' || !evidence.evidenceDigest) return false;
  const { evidenceDigest, ...body } = evidence;
  return digest(body) === evidenceDigest;
}

export function isControlEvidenceCurrent(evidence = {}, options = {}) {
  if (!verifyControlEvidence(evidence)) return false;
  const now = new Date(options.now || new Date().toISOString());
  if (!Number.isFinite(now.getTime())) throw new Error('INVALID_NOW');
  if (evidence.expiresAt && new Date(evidence.expiresAt) <= now) return false;
  return true;
}

function allRequiredControls() {
  const result = [];
  for (const level of LEVEL_ORDER) {
    for (const controlId of getTrustLevelDefinition(level).requirements) {
      if (!result.includes(controlId)) result.push(controlId);
    }
  }
  return result;
}

function isEvidenceAdmissible(controlId, evidence, allowHumanOrExternalEvidence) {
  if (!evidence) return false;
  if (NON_AUTOMATABLE.has(controlId)) {
    return Boolean(allowHumanOrExternalEvidence && HUMAN_OR_EXTERNAL_SOURCES.has(evidence.sourceType));
  }
  if (AUTOMATED_SOURCES.has(evidence.sourceType)) return true;
  return Boolean(allowHumanOrExternalEvidence && HUMAN_OR_EXTERNAL_SOURCES.has(evidence.sourceType));
}

export function evaluateEvidenceBackedTrust(evidenceList = [], options = {}) {
  if (!Array.isArray(evidenceList)) throw new Error('INVALID_EVIDENCE_LIST');
  const allowHumanOrExternalEvidence = options.allowHumanOrExternalEvidence === true;
  const requiredControls = allRequiredControls();
  const latest = new Map();

  for (const evidence of evidenceList) {
    if (!isControlEvidenceCurrent(evidence, options)) continue;
    const current = latest.get(evidence.controlId);
    if (!current || new Date(evidence.observedAt) > new Date(current.observedAt)) latest.set(evidence.controlId, evidence);
  }

  const checks = {};
  const controlStatus = [];
  for (const controlId of requiredControls) {
    const evidence = latest.get(controlId) || null;
    const admissible = isEvidenceAdmissible(controlId, evidence, allowHumanOrExternalEvidence);
    checks[controlId] = Boolean(admissible && evidence.status === TRUST_EVIDENCE_STATUS.PASS);
    controlStatus.push(Object.freeze({
      controlId,
      satisfied: checks[controlId],
      evidenceId: evidence?.evidenceId || null,
      sourceType: evidence?.sourceType || null,
      automated: evidence?.automated === true,
      nonAutomatableControl: NON_AUTOMATABLE.has(controlId),
      evidencePresentButWithheld: Boolean(evidence && !admissible)
    }));
  }

  const profile = evaluateTrustSecurityLevel(checks);
  return Object.freeze({
    schemaVersion: 'evidence-backed-trust.v1',
    automatedOnly: !allowHumanOrExternalEvidence,
    profile,
    checks: Object.freeze({ ...checks }),
    controlStatus: Object.freeze(controlStatus),
    validEvidenceCount: latest.size,
    humanOrExternalEvidenceDoesNotAutoElevate: !allowHumanOrExternalEvidence,
    nonAutomatableControls: NON_AUTOMATABLE_TRUST_CONTROLS
  });
}
