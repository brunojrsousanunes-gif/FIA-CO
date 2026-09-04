import crypto from 'node:crypto';
import { normalizeAccessContext, AccessDeniedError } from '../identity/access-control.mjs';

const OWNER_ROLES = new Set(['OWNER', 'ADMIN']);

function clean(value, max = 160) {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .slice(0, max);
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map(key => [key, canonicalize(value[key])])
  );
}

function digestPayload(payload) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(canonicalize(payload)))
    .digest('hex');
}

function isActiveGrant(grant, now) {
  if (!grant || grant.revokedAt) return false;
  if (!grant.expiresAt) return true;
  const current = Date.parse(now);
  const expiry = Date.parse(grant.expiresAt);
  return Number.isFinite(current) && Number.isFinite(expiry) && current < expiry;
}

function assertOwner(transaction, context) {
  const access = normalizeAccessContext(context);
  if (access.organizationId !== transaction.ownerOrganizationId || !OWNER_ROLES.has(access.role)) {
    throw new AccessDeniedError();
  }
  return access;
}

function providerStatus(boundary = {}) {
  const provider = boundary.provider;
  if (!provider) return 'NOT_CONFIGURED';
  if (provider.allowedForProduction === true) return 'VERIFIED_FOR_PRODUCTION';
  if (provider.reason === 'NO_PROVIDER_SELECTED') return 'NOT_CONFIGURED';
  return 'NOT_READY';
}

export function createTrustSecurityReceipt(input = {}, options = {}) {
  const { operation, transaction, context } = input;
  if (!operation || !transaction) throw new Error('SECURITY_RECEIPT_INPUT_REQUIRED');
  if (operation.id !== transaction.operationId) throw new Error('TRUST_OPERATION_MISMATCH');
  if (operation.organizationId !== transaction.ownerOrganizationId) throw new Error('TRUST_OWNER_MISMATCH');
  const access = assertOwner(transaction, context);
  const generatedAt = clean(options.now || new Date().toISOString(), 40);
  const securityProfile = input.securityProfile || null;

  const auditEvents = (input.auditEvents || []).filter(event => !event.operationId || event.operationId === operation.id);
  const grants = transaction.grants || [];
  const activeGrants = grants.filter(grant => isActiveGrant(grant, generatedAt));
  const revokedGrants = grants.filter(grant => Boolean(grant.revokedAt));
  const expiredGrants = grants.filter(grant => !grant.revokedAt && grant.expiresAt && Date.parse(grant.expiresAt) <= Date.parse(generatedAt));

  const payload = {
    schemaVersion: 'trust-security-receipt.v1',
    generatedAt,
    operation: {
      id: operation.id,
      state: operation.state,
      version: operation.version,
      kind: clean(operation.kind, 40)
    },
    trustTransaction: {
      id: transaction.id,
      version: transaction.version,
      state: transaction.state,
      ownerOrganizationId: transaction.ownerOrganizationId,
      fieldCount: Object.keys(transaction.fields || {}).length,
      activeGrantCount: activeGrants.length,
      revokedGrantCount: revokedGrants.length,
      expiredGrantCount: expiredGrants.length
    },
    traceability: {
      operationEvidenceEvents: Array.isArray(operation.evidence) ? operation.evidence.length : 0,
      auditEvents: auditEvents.length,
      auditIntegrity: input.auditIntegrityVerified === true ? 'VERIFIED' : 'NOT_VERIFIED',
      latestAuditHash: auditEvents.at(-1)?.hash || null
    },
    dataControl: {
      securityLevel: clean(securityProfile?.level || 'NOT_ASSESSED', 40),
      securityPolicyVersion: clean(securityProfile?.policyVersion || '', 80) || null,
      unlockedCapabilities: Array.isArray(securityProfile?.capabilities) ? [...securityProfile.capabilities].sort() : [],
      defaultCrossOrganizationAccess: 'DENY',
      minimumCrossOrganizationLevel: 'L3_SHARED',
      personalDataSharingMinimumLevel: 'L4_ADVANCED',
      criticalDataSharing: false,
      activeSharedOrganizations: [...new Set(activeGrants.map(grant => grant.organizationId))].sort(),
      activeSharedFieldCount: new Set(activeGrants.flatMap(grant => grant.fieldKeys || [])).size,
      revocationSupported: true,
      expiryRequiredForCrossOrganizationGrant: true
    },
    finance: {
      mode: transaction.financialBoundary?.mode || 'NON_CUSTODIAL',
      fiaReceivesFunds: false,
      fiaCustodiesFunds: false,
      fiaMovesFunds: false,
      paymentProviderStatus: providerStatus(transaction.financialBoundary)
    },
    issuedBy: {
      actorId: access.actorId,
      role: access.role
    },
    assurance: {
      digestAlgorithm: 'SHA-256',
      qualifiedElectronicSignature: false,
      statement: 'Este recibo resume controles y trazabilidad técnica. No constituye una firma electrónica cualificada ni una garantía financiera.'
    }
  };

  return Object.freeze({
    ...payload,
    digest: digestPayload(payload)
  });
}

export function verifyTrustSecurityReceipt(receipt = {}) {
  const { digest, ...payload } = receipt;
  if (!digest || typeof digest !== 'string') return false;
  return digestPayload(payload) === digest;
}
