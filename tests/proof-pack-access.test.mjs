import assert from 'node:assert/strict';
import {
  PROOF_VISIBILITY,
  PROOF_CHANNELS,
  PROOF_VIEWER_ROLES,
  canViewProofPack,
  buildProofPackAccessEvent
} from '../core/proof/proof-pack-access.mjs';

const publicDenied = canViewProofPack({
  visibility: PROOF_VISIBILITY.GATED_ANONYMIZED,
  channel: PROOF_CHANNELS.PUBLIC_WEB,
  viewerRole: PROOF_VIEWER_ROLES.PUBLIC,
  customerReuseAuthorization: true
});
assert.equal(publicDenied.allowed, false);
assert.equal(publicDenied.reason, 'PUBLIC_FULL_PROOF_PACK_DENIED');

const prospectAllowed = canViewProofPack({
  visibility: PROOF_VISIBILITY.GATED_ANONYMIZED,
  channel: PROOF_CHANNELS.PRIVATE_WEB,
  viewerRole: PROOF_VIEWER_ROLES.PROSPECT_AUTHORIZED,
  customerReuseAuthorization: true
});
assert.equal(prospectAllowed.allowed, true);

const prospectNoConsent = canViewProofPack({
  visibility: PROOF_VISIBILITY.GATED_IDENTIFIED,
  channel: PROOF_CHANNELS.PRIVATE_WEB,
  viewerRole: PROOF_VIEWER_ROLES.PROSPECT_AUTHORIZED,
  explicitCustomerAuthorization: false
});
assert.equal(prospectNoConsent.allowed, false);
assert.equal(prospectNoConsent.reason, 'EXPLICIT_CUSTOMER_AUTHORIZATION_REQUIRED');

const clientAllowed = canViewProofPack({
  visibility: PROOF_VISIBILITY.CLIENT_ONLY,
  channel: PROOF_CHANNELS.APP,
  viewerRole: PROOF_VIEWER_ROLES.CLIENT
});
assert.equal(clientAllowed.allowed, true);

const prospectClientOnlyDenied = canViewProofPack({
  visibility: PROOF_VISIBILITY.CLIENT_ONLY,
  channel: PROOF_CHANNELS.APP,
  viewerRole: PROOF_VIEWER_ROLES.PROSPECT_AUTHORIZED
});
assert.equal(prospectClientOnlyDenied.allowed, false);

const privateStaffAllowed = canViewProofPack({
  visibility: PROOF_VISIBILITY.PRIVATE,
  channel: PROOF_CHANNELS.INTERNAL,
  viewerRole: PROOF_VIEWER_ROLES.FIA_STAFF
});
assert.equal(privateStaffAllowed.allowed, true);

const privateClientDenied = canViewProofPack({
  visibility: PROOF_VISIBILITY.PRIVATE,
  channel: PROOF_CHANNELS.APP,
  viewerRole: PROOF_VIEWER_ROLES.CLIENT
});
assert.equal(privateClientDenied.allowed, false);

const event = buildProofPackAccessEvent({
  viewerId: 'viewer-1',
  viewerRole: PROOF_VIEWER_ROLES.PROSPECT_AUTHORIZED,
  proofPackId: 'proof-1',
  timestamp: '2026-09-04T18:00:00.000Z',
  decision: prospectAllowed
});
assert.equal(event.accessDecision, 'ALLOW');
assert.equal(event.proofPackId, 'proof-1');
assert.equal(event.policyVersion, 'proof-pack-access.v1');

assert.throws(() => buildProofPackAccessEvent({}), /INVALID_ACCESS_DECISION/);

console.log('Proof Pack access contract OK');
