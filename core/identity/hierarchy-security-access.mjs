import { normalizeAccessContext, AccessDeniedError } from './access-control.mjs';
import { TRUST_SECURITY_LEVELS } from '../trust/trust-security-levels.mjs';

const LEVEL_ORDER = Object.freeze([
  TRUST_SECURITY_LEVELS.L0_DEMO,
  TRUST_SECURITY_LEVELS.L1_ISOLATED,
  TRUST_SECURITY_LEVELS.L2_VERIFIED,
  TRUST_SECURITY_LEVELS.L3_SHARED,
  TRUST_SECURITY_LEVELS.L4_ADVANCED
]);

export const HIERARCHY_SECURITY_CEILING = Object.freeze({
  OWNER: TRUST_SECURITY_LEVELS.L4_ADVANCED,
  ADMIN: TRUST_SECURITY_LEVELS.L3_SHARED,
  OPERATOR: TRUST_SECURITY_LEVELS.L2_VERIFIED,
  VIEWER: TRUST_SECURITY_LEVELS.L1_ISOLATED
});

export const USER_CAPABILITIES = Object.freeze({
  VIEW_OVERVIEW: 'VIEW_OVERVIEW',
  VIEW_OPPORTUNITIES: 'VIEW_OPPORTUNITIES',
  VIEW_OPERATIONS: 'VIEW_OPERATIONS',
  MANAGE_OPERATIONS: 'MANAGE_OPERATIONS',
  VIEW_DOCUMENTS: 'VIEW_DOCUMENTS',
  MANAGE_DOCUMENTS: 'MANAGE_DOCUMENTS',
  VIEW_SECURITY: 'VIEW_SECURITY',
  REQUEST_PURCHASE_SEARCH: 'REQUEST_PURCHASE_SEARCH',
  CROSS_ORG_COORDINATION: 'CROSS_ORG_COORDINATION',
  MANAGE_TEAM: 'MANAGE_TEAM',
  MANAGE_SECURITY_POLICY: 'MANAGE_SECURITY_POLICY',
  APPROVE_HIGH_RISK_ACTION: 'APPROVE_HIGH_RISK_ACTION'
});

const ROLE_CAPABILITIES = Object.freeze({
  OWNER: Object.freeze(Object.values(USER_CAPABILITIES)),
  ADMIN: Object.freeze([
    USER_CAPABILITIES.VIEW_OVERVIEW,
    USER_CAPABILITIES.VIEW_OPPORTUNITIES,
    USER_CAPABILITIES.VIEW_OPERATIONS,
    USER_CAPABILITIES.MANAGE_OPERATIONS,
    USER_CAPABILITIES.VIEW_DOCUMENTS,
    USER_CAPABILITIES.MANAGE_DOCUMENTS,
    USER_CAPABILITIES.VIEW_SECURITY,
    USER_CAPABILITIES.REQUEST_PURCHASE_SEARCH,
    USER_CAPABILITIES.CROSS_ORG_COORDINATION
  ]),
  OPERATOR: Object.freeze([
    USER_CAPABILITIES.VIEW_OVERVIEW,
    USER_CAPABILITIES.VIEW_OPPORTUNITIES,
    USER_CAPABILITIES.VIEW_OPERATIONS,
    USER_CAPABILITIES.MANAGE_OPERATIONS,
    USER_CAPABILITIES.VIEW_DOCUMENTS,
    USER_CAPABILITIES.MANAGE_DOCUMENTS,
    USER_CAPABILITIES.VIEW_SECURITY,
    USER_CAPABILITIES.REQUEST_PURCHASE_SEARCH
  ]),
  VIEWER: Object.freeze([
    USER_CAPABILITIES.VIEW_OVERVIEW,
    USER_CAPABILITIES.VIEW_OPPORTUNITIES,
    USER_CAPABILITIES.VIEW_OPERATIONS,
    USER_CAPABILITIES.VIEW_DOCUMENTS,
    USER_CAPABILITIES.VIEW_SECURITY
  ])
});

const MINIMUM_LEVEL = Object.freeze({
  [USER_CAPABILITIES.VIEW_OVERVIEW]: TRUST_SECURITY_LEVELS.L0_DEMO,
  [USER_CAPABILITIES.VIEW_OPPORTUNITIES]: TRUST_SECURITY_LEVELS.L1_ISOLATED,
  [USER_CAPABILITIES.VIEW_OPERATIONS]: TRUST_SECURITY_LEVELS.L1_ISOLATED,
  [USER_CAPABILITIES.VIEW_DOCUMENTS]: TRUST_SECURITY_LEVELS.L1_ISOLATED,
  [USER_CAPABILITIES.VIEW_SECURITY]: TRUST_SECURITY_LEVELS.L1_ISOLATED,
  [USER_CAPABILITIES.MANAGE_OPERATIONS]: TRUST_SECURITY_LEVELS.L2_VERIFIED,
  [USER_CAPABILITIES.MANAGE_DOCUMENTS]: TRUST_SECURITY_LEVELS.L2_VERIFIED,
  [USER_CAPABILITIES.REQUEST_PURCHASE_SEARCH]: TRUST_SECURITY_LEVELS.L2_VERIFIED,
  [USER_CAPABILITIES.MANAGE_TEAM]: TRUST_SECURITY_LEVELS.L2_VERIFIED,
  [USER_CAPABILITIES.MANAGE_SECURITY_POLICY]: TRUST_SECURITY_LEVELS.L3_SHARED,
  [USER_CAPABILITIES.CROSS_ORG_COORDINATION]: TRUST_SECURITY_LEVELS.L3_SHARED,
  [USER_CAPABILITIES.APPROVE_HIGH_RISK_ACTION]: TRUST_SECURITY_LEVELS.L4_ADVANCED
});

function levelIndex(level) {
  const index = LEVEL_ORDER.indexOf(level);
  if (index < 0) throw new AccessDeniedError('INVALID_TRUST_LEVEL');
  return index;
}

function lowerLevel(a, b) {
  return levelIndex(a) <= levelIndex(b) ? a : b;
}

export function getRoleSecurityCeiling(role) {
  const key = String(role || '').trim().toUpperCase();
  const level = HIERARCHY_SECURITY_CEILING[key];
  if (!level) throw new AccessDeniedError('INVALID_HIERARCHY_ROLE');
  return level;
}

export function evaluateHierarchySecurity(input = {}) {
  const context = normalizeAccessContext(input.context || {});
  const organizationLevel = input.organizationTrustProfile?.level || TRUST_SECURITY_LEVELS.L0_DEMO;
  levelIndex(organizationLevel);
  const roleCeiling = getRoleSecurityCeiling(context.role);
  const effectiveLevel = lowerLevel(organizationLevel, roleCeiling);
  const roleCapabilities = ROLE_CAPABILITIES[context.role] || [];
  const allowedCapabilities = roleCapabilities.filter(capability => {
    const minimum = MINIMUM_LEVEL[capability];
    return minimum && levelIndex(effectiveLevel) >= levelIndex(minimum);
  });

  return Object.freeze({
    policyVersion: 'hierarchy-security-access.v1',
    actorId: context.actorId,
    organizationId: context.organizationId,
    role: context.role,
    organizationSecurityLevel: organizationLevel,
    roleSecurityCeiling: roleCeiling,
    effectiveSecurityLevel: effectiveLevel,
    capabilities: Object.freeze([...allowedCapabilities]),
    hierarchyNeverElevatesOrganizationSecurity: true,
    clientStateNeverElevatesAccess: true
  });
}

export function assertHierarchyCapability(input = {}, capability) {
  if (!Object.values(USER_CAPABILITIES).includes(capability)) throw new AccessDeniedError('UNKNOWN_USER_CAPABILITY');
  const decision = evaluateHierarchySecurity(input);
  if (!decision.capabilities.includes(capability)) throw new AccessDeniedError(`HIERARCHY_CAPABILITY_DENIED:${capability}`);
  return decision;
}

export function buildNeedToKnowManifest(input = {}) {
  const decision = evaluateHierarchySecurity(input);
  const areas = [];
  if (decision.capabilities.includes(USER_CAPABILITIES.VIEW_OVERVIEW)) areas.push('HOME');
  if (decision.capabilities.includes(USER_CAPABILITIES.VIEW_OPPORTUNITIES)) areas.push('OPPORTUNITIES');
  if (decision.capabilities.includes(USER_CAPABILITIES.VIEW_OPERATIONS)) areas.push('OPERATIONS');
  if (decision.capabilities.includes(USER_CAPABILITIES.VIEW_DOCUMENTS)) areas.push('DOCUMENTS');
  if (decision.capabilities.includes(USER_CAPABILITIES.VIEW_SECURITY)) areas.push('SECURITY');
  if (decision.capabilities.includes(USER_CAPABILITIES.REQUEST_PURCHASE_SEARCH)) areas.push('PURCHASES');
  if (decision.capabilities.includes(USER_CAPABILITIES.CROSS_ORG_COORDINATION)) areas.push('PARTNER_COORDINATION');
  if (decision.capabilities.includes(USER_CAPABILITIES.MANAGE_TEAM)) areas.push('TEAM_ADMIN');

  return Object.freeze({
    schemaVersion: 'need-to-know-manifest.v1',
    actorId: decision.actorId,
    organizationId: decision.organizationId,
    role: decision.role,
    effectiveSecurityLevel: decision.effectiveSecurityLevel,
    visibleAreas: Object.freeze(areas),
    capabilities: decision.capabilities,
    generatedServerSideRequiredForProduction: true,
    hiddenClientControlsAreNotAuthorization: true
  });
}
