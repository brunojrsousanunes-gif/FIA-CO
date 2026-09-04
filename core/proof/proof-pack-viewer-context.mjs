import { normalizeAccessContext } from '../identity/access-control.mjs';
import { PROOF_VIEWER_ROLES } from './proof-pack-access.mjs';

export class ProofViewerAccessError extends Error {
  constructor(message = 'PROOF_VIEWER_ACCESS_DENIED') {
    super(message);
    this.name = 'ProofViewerAccessError';
  }
}

export function clientViewerFromAccessContext(context = {}) {
  const normalized = normalizeAccessContext(context);
  return Object.freeze({
    viewerId: normalized.actorId,
    viewerRole: PROOF_VIEWER_ROLES.CLIENT,
    organizationId: normalized.organizationId,
    sourceRole: normalized.role,
    authSource: 'FIA_CLIENT_ACCESS_CONTEXT'
  });
}

export function authorizedProspectViewer(grant = {}, options = {}) {
  const now = options.now ? new Date(options.now) : new Date();
  const prospectId = String(grant.prospectId || '').trim();
  const grantId = String(grant.grantId || '').trim();
  const expiresAt = grant.expiresAt ? new Date(grant.expiresAt) : null;
  const revoked = Boolean(grant.revoked);

  if (!prospectId || !grantId || !expiresAt || Number.isNaN(expiresAt.getTime())) {
    throw new ProofViewerAccessError('INVALID_PROSPECT_GRANT');
  }

  if (revoked) throw new ProofViewerAccessError('PROSPECT_GRANT_REVOKED');
  if (expiresAt.getTime() <= now.getTime()) throw new ProofViewerAccessError('PROSPECT_GRANT_EXPIRED');

  return Object.freeze({
    viewerId: prospectId,
    viewerRole: PROOF_VIEWER_ROLES.PROSPECT_AUTHORIZED,
    organizationId: null,
    grantId,
    expiresAt: expiresAt.toISOString(),
    authSource: 'TEMPORARY_COMMERCIAL_GRANT'
  });
}
