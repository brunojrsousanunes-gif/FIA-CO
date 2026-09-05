import { AccessDeniedError } from '../identity/access-control.mjs';
import { verifyPreprodSession } from '../identity/preprod-session-token.mjs';
import { buildTrustClientSnapshot } from '../trust/trust-client-snapshot.mjs';

export function createPreprodClientService(input = {}) {
  const operationRepository = input.operationRepository;
  const trustRepository = input.trustRepository;
  const sessionSecret = input.sessionSecret;
  if (!operationRepository || typeof operationRepository.getById !== 'function') throw new Error('OPERATION_REPOSITORY_REQUIRED');
  if (!trustRepository || typeof trustRepository.getById !== 'function') throw new Error('TRUST_REPOSITORY_REQUIRED');

  async function getSnapshot(request = {}, options = {}) {
    const context = verifyPreprodSession(request.sessionToken, {
      secret: sessionSecret,
      now: options.now
    });
    if (!context.preproductionOnly) throw new AccessDeniedError('PREPRODUCTION_SESSION_REQUIRED');

    const operation = await operationRepository.getById(request.operationId);
    if (!operation) throw new Error('OPERATION_NOT_FOUND');
    const transaction = await trustRepository.getById(request.transactionId);
    if (!transaction) throw new Error('TRUST_TRANSACTION_NOT_FOUND');

    if (operation.organizationId !== context.organizationId) throw new AccessDeniedError();
    if (transaction.ownerOrganizationId !== operation.organizationId) throw new AccessDeniedError('TRUST_OWNER_MISMATCH');
    if (transaction.operationId !== operation.id) throw new Error('TRUST_OPERATION_MISMATCH');

    const viewerSecurityProfile = typeof input.securityProfileResolver === 'function'
      ? await input.securityProfileResolver(context, { operation, transaction })
      : null;
    const evidenceBackedTrust = typeof input.evidenceResolver === 'function'
      ? await input.evidenceResolver(context, { operation, transaction })
      : null;
    const auditEvents = typeof input.auditResolver === 'function'
      ? await input.auditResolver(context, { operation, transaction })
      : [];
    const auditIntegrityVerified = typeof input.auditIntegrityResolver === 'function'
      ? await input.auditIntegrityResolver(context, { operation, transaction })
      : false;

    return buildTrustClientSnapshot({
      operation,
      transaction,
      context,
      auditEvents,
      auditIntegrityVerified
    }, {
      now: options.now,
      viewerSecurityProfile,
      evidenceBackedTrust
    });
  }

  return Object.freeze({
    mode: 'PREPRODUCTION_ONLY',
    realUserVerification: false,
    productionActivation: false,
    clientSideHidingIsSecurityBoundary: false,
    getSnapshot
  });
}
