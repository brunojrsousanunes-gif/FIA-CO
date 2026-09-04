export const PROOF_VISIBILITY = Object.freeze({
  GATED_IDENTIFIED: 'GATED_IDENTIFIED',
  GATED_ANONYMIZED: 'GATED_ANONYMIZED',
  CLIENT_ONLY: 'CLIENT_ONLY',
  PRIVATE: 'PRIVATE'
});

export const PROOF_CHANNELS = Object.freeze({
  PUBLIC_WEB: 'PUBLIC_WEB',
  PRIVATE_WEB: 'PRIVATE_WEB',
  APP: 'APP',
  INTERNAL: 'INTERNAL'
});

export const PROOF_VIEWER_ROLES = Object.freeze({
  PUBLIC: 'PUBLIC',
  PROSPECT_AUTHORIZED: 'PROSPECT_AUTHORIZED',
  CLIENT: 'CLIENT',
  FIA_STAFF: 'FIA_STAFF'
});

export const PROOF_POLICY_VERSION = 'proof-pack-access.v1';

const authenticatedRoles = new Set([
  PROOF_VIEWER_ROLES.PROSPECT_AUTHORIZED,
  PROOF_VIEWER_ROLES.CLIENT,
  PROOF_VIEWER_ROLES.FIA_STAFF
]);

function decision(allowed, reason, meta = {}) {
  return Object.freeze({
    allowed,
    reason,
    policyVersion: PROOF_POLICY_VERSION,
    ...meta
  });
}

export function canViewProofPack(input = {}) {
  const {
    visibility = PROOF_VISIBILITY.PRIVATE,
    channel = PROOF_CHANNELS.PUBLIC_WEB,
    viewerRole = PROOF_VIEWER_ROLES.PUBLIC,
    explicitCustomerAuthorization = false,
    customerReuseAuthorization = false
  } = input;

  if (!Object.values(PROOF_VISIBILITY).includes(visibility)) {
    return decision(false, 'UNKNOWN_VISIBILITY');
  }

  if (!Object.values(PROOF_CHANNELS).includes(channel)) {
    return decision(false, 'UNKNOWN_CHANNEL');
  }

  if (!Object.values(PROOF_VIEWER_ROLES).includes(viewerRole)) {
    return decision(false, 'UNKNOWN_VIEWER_ROLE');
  }

  // Full Proof Packs are never public by default.
  if (channel === PROOF_CHANNELS.PUBLIC_WEB || viewerRole === PROOF_VIEWER_ROLES.PUBLIC) {
    return decision(false, 'PUBLIC_FULL_PROOF_PACK_DENIED');
  }

  if (visibility === PROOF_VISIBILITY.PRIVATE) {
    return viewerRole === PROOF_VIEWER_ROLES.FIA_STAFF && channel === PROOF_CHANNELS.INTERNAL
      ? decision(true, 'PRIVATE_STAFF_INTERNAL')
      : decision(false, 'PRIVATE_RESTRICTED');
  }

  if (!authenticatedRoles.has(viewerRole)) {
    return decision(false, 'AUTH_REQUIRED');
  }

  if (![PROOF_CHANNELS.PRIVATE_WEB, PROOF_CHANNELS.APP, PROOF_CHANNELS.INTERNAL].includes(channel)) {
    return decision(false, 'CHANNEL_NOT_ALLOWED');
  }

  if (visibility === PROOF_VISIBILITY.CLIENT_ONLY) {
    return [PROOF_VIEWER_ROLES.CLIENT, PROOF_VIEWER_ROLES.FIA_STAFF].includes(viewerRole)
      ? decision(true, 'CLIENT_OR_STAFF_ALLOWED')
      : decision(false, 'CLIENT_ONLY_RESTRICTED');
  }

  if (visibility === PROOF_VISIBILITY.GATED_ANONYMIZED) {
    if (!customerReuseAuthorization) return decision(false, 'REUSE_AUTHORIZATION_REQUIRED');
    return decision(true, 'GATED_ANONYMIZED_ALLOWED');
  }

  if (visibility === PROOF_VISIBILITY.GATED_IDENTIFIED) {
    if (!explicitCustomerAuthorization) return decision(false, 'EXPLICIT_CUSTOMER_AUTHORIZATION_REQUIRED');
    return decision(true, 'GATED_IDENTIFIED_ALLOWED');
  }

  return decision(false, 'DENY_BY_DEFAULT');
}

export function buildProofPackAccessEvent(input = {}) {
  const {
    viewerId = null,
    viewerRole = PROOF_VIEWER_ROLES.PUBLIC,
    organizationId = null,
    proofPackId = null,
    timestamp = new Date().toISOString(),
    decision: accessDecision = null
  } = input;

  if (!accessDecision || typeof accessDecision.allowed !== 'boolean') {
    throw new Error('INVALID_ACCESS_DECISION');
  }

  return Object.freeze({
    viewerId,
    viewerRole,
    organizationId,
    proofPackId,
    timestamp,
    accessDecision: accessDecision.allowed ? 'ALLOW' : 'DENY',
    accessReason: accessDecision.reason,
    policyVersion: accessDecision.policyVersion || PROOF_POLICY_VERSION
  });
}
