import assert from 'node:assert/strict';
import {
  clientViewerFromAccessContext,
  authorizedProspectViewer,
  ProofViewerAccessError
} from '../core/proof/proof-pack-viewer-context.mjs';

const clientViewer = clientViewerFromAccessContext({
  actorId: 'user-1',
  organizationId: 'org-1',
  role: 'viewer'
});
assert.equal(clientViewer.viewerId, 'user-1');
assert.equal(clientViewer.organizationId, 'org-1');
assert.equal(clientViewer.viewerRole, 'CLIENT');
assert.equal(clientViewer.authSource, 'FIA_CLIENT_ACCESS_CONTEXT');

assert.throws(
  () => clientViewerFromAccessContext({ actorId: 'user-1', organizationId: '', role: 'viewer' }),
  /INVALID_ACCESS_CONTEXT/
);

const prospectViewer = authorizedProspectViewer({
  prospectId: 'prospect-1',
  grantId: 'grant-1',
  expiresAt: '2026-09-10T00:00:00.000Z'
}, { now: '2026-09-04T18:00:00.000Z' });
assert.equal(prospectViewer.viewerRole, 'PROSPECT_AUTHORIZED');
assert.equal(prospectViewer.grantId, 'grant-1');
assert.equal(prospectViewer.authSource, 'TEMPORARY_COMMERCIAL_GRANT');

assert.throws(
  () => authorizedProspectViewer({
    prospectId: 'prospect-1',
    grantId: 'grant-1',
    expiresAt: '2026-09-01T00:00:00.000Z'
  }, { now: '2026-09-04T18:00:00.000Z' }),
  error => error instanceof ProofViewerAccessError && error.message === 'PROSPECT_GRANT_EXPIRED'
);

assert.throws(
  () => authorizedProspectViewer({
    prospectId: 'prospect-1',
    grantId: 'grant-1',
    expiresAt: '2026-09-10T00:00:00.000Z',
    revoked: true
  }, { now: '2026-09-04T18:00:00.000Z' }),
  error => error instanceof ProofViewerAccessError && error.message === 'PROSPECT_GRANT_REVOKED'
);

console.log('Proof Pack viewer context contract OK');
