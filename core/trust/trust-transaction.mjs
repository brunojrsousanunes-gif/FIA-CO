import crypto from 'node:crypto';
import { AccessDeniedError, normalizeAccessContext } from '../identity/access-control.mjs';
import { buildFinancialBoundaryView } from '../finance/financial-boundary.mjs';
import {
  TRUST_CAPABILITIES,
  assertTrustCapability,
  hasTrustCapability
} from './trust-security-levels.mjs';

export const DATA_CLASSES = Object.freeze({
  PUBLIC: 'PUBLIC',
  INTERNAL: 'INTERNAL',
  COMMERCIAL_CONFIDENTIAL: 'COMMERCIAL_CONFIDENTIAL',
  PERSONAL: 'PERSONAL',
  CRITICAL: 'CRITICAL'
});

const BASIC_SHAREABLE = new Set([
  DATA_CLASSES.PUBLIC,
  DATA_CLASSES.INTERNAL,
  DATA_CLASSES.COMMERCIAL_CONFIDENTIAL
]);

const GRANT_ROLES = new Set(['OWNER', 'ADMIN']);

function clean(value, max = 180) {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .slice(0, max);
}

function defaultIdFactory(prefix = 'trust') {
  return `${prefix}_${crypto.randomUUID()}`;
}

function defaultClock() {
  return new Date().toISOString();
}

function deps(options = {}) {
  return {
    idFactory: options.idFactory || defaultIdFactory,
    clock: options.clock || defaultClock
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertOwnerManager(transaction, context) {
  const access = normalizeAccessContext(context);
  if (access.organizationId !== transaction.ownerOrganizationId || !GRANT_ROLES.has(access.role)) {
    throw new AccessDeniedError();
  }
  return access;
}

function normalizeField(input = {}) {
  const key = clean(input.key, 80);
  const classification = clean(input.classification || DATA_CLASSES.INTERNAL, 40).toUpperCase();
  if (!key || !Object.values(DATA_CLASSES).includes(classification)) throw new Error('INVALID_TRUST_FIELD');
  return Object.freeze({
    key,
    label: clean(input.label || key, 100),
    value: input.value == null ? null : clone(input.value),
    classification,
    sourceOrganizationId: clean(input.sourceOrganizationId, 80) || null
  });
}

function activeGrant(grant, now) {
  if (!grant || grant.revokedAt) return false;
  if (!grant.expiresAt) return true;
  const current = Date.parse(now);
  const expiry = Date.parse(grant.expiresAt);
  return Number.isFinite(current) && Number.isFinite(expiry) && current < expiry;
}

function assertCrossOrganizationSecurity(options = {}) {
  const ownerProfile = options.ownerSecurityProfile;
  const targetProfile = options.targetSecurityProfile;
  assertTrustCapability(ownerProfile, TRUST_CAPABILITIES.CROSS_ORG_SHARE);
  assertTrustCapability(targetProfile, TRUST_CAPABILITIES.CROSS_ORG_SHARE);
  return { ownerProfile, targetProfile };
}

function requiredCapabilityForFields(transaction, fieldKeys, input, securityProfiles) {
  let requiredCapability = TRUST_CAPABILITIES.CROSS_ORG_SHARE;

  for (const key of fieldKeys) {
    const field = transaction.fields[key];
    if (!field) throw new Error(`UNKNOWN_TRUST_FIELD:${key}`);
    if (field.classification === DATA_CLASSES.CRITICAL) {
      throw new Error('FIELD_CLASS_NEVER_SHAREABLE:CRITICAL');
    }
    if (BASIC_SHAREABLE.has(field.classification)) continue;
    if (field.classification === DATA_CLASSES.PERSONAL) {
      assertTrustCapability(securityProfiles.ownerProfile, TRUST_CAPABILITIES.PERSONAL_DATA_WORKFLOW);
      assertTrustCapability(securityProfiles.targetProfile, TRUST_CAPABILITIES.PERSONAL_DATA_WORKFLOW);
      if (input.personalDataReviewed !== true) throw new Error('PERSONAL_DATA_REVIEW_REQUIRED');
      if (!clean(input.legalReviewRef, 120)) throw new Error('LEGAL_REVIEW_REFERENCE_REQUIRED');
      requiredCapability = TRUST_CAPABILITIES.PERSONAL_DATA_WORKFLOW;
      continue;
    }
    throw new Error(`FIELD_CLASS_NOT_SHAREABLE:${field.classification}`);
  }

  return requiredCapability;
}

function grantEligibleForViewer(grant, profile) {
  const capability = grant.requiredCapability || TRUST_CAPABILITIES.CROSS_ORG_SHARE;
  return hasTrustCapability(profile, capability);
}

export function createTrustTransaction(input = {}, options = {}) {
  const d = deps(options);
  const ownerOrganizationId = clean(input.ownerOrganizationId, 80);
  const operationId = clean(input.operationId, 120);
  if (!ownerOrganizationId || !operationId) throw new Error('INVALID_TRUST_TRANSACTION');

  const fieldEntries = (input.fields || []).map(normalizeField);
  const seen = new Set();
  for (const field of fieldEntries) {
    if (seen.has(field.key)) throw new Error('DUPLICATE_TRUST_FIELD');
    seen.add(field.key);
  }

  return {
    id: d.idFactory('trust'),
    ownerOrganizationId,
    operationId,
    title: clean(input.title || 'Operación FIA', 140),
    state: clean(input.state || 'DRAFT', 40).toUpperCase(),
    fields: Object.fromEntries(fieldEntries.map(field => [field.key, field])),
    grants: [],
    createdAt: d.clock(),
    createdBy: clean(input.actor || 'system', 80),
    version: 1,
    financialBoundary: buildFinancialBoundaryView(input.paymentProvider || null)
  };
}

export function grantOrganizationAccess(transaction, context, input = {}, options = {}) {
  const access = assertOwnerManager(transaction, context);
  if (input.approvedByHuman !== true) throw new Error('HUMAN_APPROVAL_REQUIRED');

  const targetOrganizationId = clean(input.organizationId, 80);
  if (!targetOrganizationId || targetOrganizationId === transaction.ownerOrganizationId) {
    throw new Error('INVALID_TARGET_ORGANIZATION');
  }

  const securityProfiles = assertCrossOrganizationSecurity(options);
  const fieldKeys = [...new Set((input.fieldKeys || []).map(value => clean(value, 80)).filter(Boolean))];
  if (!fieldKeys.length) throw new Error('NO_FIELDS_SELECTED');
  const requiredCapability = requiredCapabilityForFields(transaction, fieldKeys, input, securityProfiles);

  const purpose = clean(input.purpose, 180);
  if (!purpose) throw new Error('PURPOSE_REQUIRED');
  const expiresAt = clean(input.expiresAt, 40);
  if (!expiresAt || Number.isNaN(Date.parse(expiresAt))) throw new Error('VALID_EXPIRY_REQUIRED');
  const current = Date.parse(deps(options).clock());
  if (Date.parse(expiresAt) <= current) throw new Error('EXPIRY_MUST_BE_FUTURE');

  const d = deps(options);
  const grant = {
    id: d.idFactory('grant'),
    organizationId: targetOrganizationId,
    fieldKeys,
    purpose,
    expiresAt: new Date(expiresAt).toISOString(),
    createdAt: d.clock(),
    createdBy: access.actorId,
    approvedByHuman: true,
    requiredCapability,
    ownerSecurityLevelAtGrant: securityProfiles.ownerProfile.level,
    targetSecurityLevelAtGrant: securityProfiles.targetProfile.level,
    legalReviewRef: clean(input.legalReviewRef, 120) || null,
    personalDataReviewed: input.personalDataReviewed === true,
    revokedAt: null,
    revokedBy: null
  };

  transaction.grants.push(grant);
  transaction.version += 1;
  return clone(grant);
}

export function revokeOrganizationAccess(transaction, context, grantId, options = {}) {
  const access = assertOwnerManager(transaction, context);
  const grant = transaction.grants.find(item => item.id === String(grantId));
  if (!grant) throw new Error('GRANT_NOT_FOUND');
  if (grant.revokedAt) return clone(grant);
  const d = deps(options);
  grant.revokedAt = d.clock();
  grant.revokedBy = access.actorId;
  transaction.version += 1;
  return clone(grant);
}

export function getTrustTransactionView(transaction, context, options = {}) {
  const access = normalizeAccessContext(context);
  const now = options.now || deps(options).clock();
  const owner = access.organizationId === transaction.ownerOrganizationId;

  let permittedKeys;
  if (owner) {
    permittedKeys = Object.keys(transaction.fields);
  } else {
    assertTrustCapability(options.viewerSecurityProfile, TRUST_CAPABILITIES.CROSS_ORG_SHARE);
    const grants = transaction.grants.filter(grant =>
      grant.organizationId === access.organizationId
      && activeGrant(grant, now)
      && grantEligibleForViewer(grant, options.viewerSecurityProfile)
    );
    if (!grants.length) throw new AccessDeniedError();
    permittedKeys = [...new Set(grants.flatMap(grant => grant.fieldKeys))];
  }

  const visibleFields = Object.fromEntries(
    permittedKeys
      .filter(key => transaction.fields[key])
      .map(key => [key, clone(transaction.fields[key])])
  );

  return Object.freeze({
    id: transaction.id,
    operationId: transaction.operationId,
    title: transaction.title,
    state: transaction.state,
    version: transaction.version,
    ownerOrganizationId: owner ? transaction.ownerOrganizationId : null,
    viewerOrganizationId: access.organizationId,
    viewerRole: access.role,
    viewerSecurityLevel: options.viewerSecurityProfile?.level || (owner ? 'OWNER_INTERNAL' : null),
    fields: visibleFields,
    visibleFieldKeys: Object.keys(visibleFields),
    financialBoundary: clone(transaction.financialBoundary),
    security: Object.freeze({
      ownerView: owner,
      crossOrganizationDataDefault: 'DENY',
      securityLevelGatedAccess: true,
      personalDataSharingRequiresAdvancedLevel: true,
      criticalDataSharing: false
    })
  });
}

export function buildWhoSeesWhat(transaction, context, options = {}) {
  assertOwnerManager(transaction, context);
  const now = options.now || deps(options).clock();
  const active = transaction.grants.filter(grant => activeGrant(grant, now));
  const organizations = new Map();
  organizations.set(transaction.ownerOrganizationId, {
    organizationId: transaction.ownerOrganizationId,
    relationship: 'OWNER',
    fieldKeys: Object.keys(transaction.fields),
    expiresAt: null,
    requiredCapabilities: []
  });
  for (const grant of active) {
    const current = organizations.get(grant.organizationId) || {
      organizationId: grant.organizationId,
      relationship: 'GRANTEE',
      fieldKeys: [],
      expiresAt: grant.expiresAt,
      requiredCapabilities: []
    };
    current.fieldKeys = [...new Set([...current.fieldKeys, ...grant.fieldKeys])];
    current.requiredCapabilities = [...new Set([...current.requiredCapabilities, grant.requiredCapability || TRUST_CAPABILITIES.CROSS_ORG_SHARE])];
    if (!current.expiresAt || Date.parse(grant.expiresAt) < Date.parse(current.expiresAt)) current.expiresAt = grant.expiresAt;
    organizations.set(grant.organizationId, current);
  }
  return [...organizations.values()].map(clone);
}

export function snapshotTrustTransaction(transaction) {
  return clone(transaction);
}
