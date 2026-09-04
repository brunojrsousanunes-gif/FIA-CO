import { normalizeAccessContext } from '../identity/access-control.mjs';
import { getTrustTransactionView, buildWhoSeesWhat } from './trust-transaction.mjs';

const OWNER_ROLES = new Set(['OWNER', 'ADMIN']);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function clean(value, max = 160) {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .slice(0, max);
}

function safeAuditEvent(event = {}) {
  return Object.freeze({
    seq: Number.isInteger(event.seq) ? event.seq : null,
    eventId: clean(event.eventId, 120) || null,
    action: clean(event.action, 80) || null,
    state: clean(event.state, 40) || null,
    version: Number.isInteger(event.version) ? event.version : null,
    at: clean(event.at, 40) || null,
    hash: clean(event.hash, 128) || null,
    prevHash: clean(event.prevHash, 128) || null
  });
}

function ownerSecuritySummary(transaction, context, options = {}) {
  const access = normalizeAccessContext(context);
  if (access.organizationId !== transaction.ownerOrganizationId || !OWNER_ROLES.has(access.role)) {
    return null;
  }

  const matrix = buildWhoSeesWhat(transaction, access, options);
  return Object.freeze({
    organizations: matrix.map(item => Object.freeze({
      organizationId: item.organizationId,
      relationship: item.relationship,
      fieldKeys: [...item.fieldKeys],
      expiresAt: item.expiresAt || null,
      requiredCapabilities: [...(item.requiredCapabilities || [])]
    })),
    defaultCrossOrganizationAccess: 'DENY',
    personalDataSharingRequiresAdvancedLevel: true,
    criticalDataSharing: false
  });
}

function securityProgress(profile) {
  if (!profile) {
    return Object.freeze({
      level: 'NOT_ASSESSED',
      policyVersion: null,
      capabilities: Object.freeze([]),
      missingForNextLevel: Object.freeze([])
    });
  }
  return Object.freeze({
    level: clean(profile.level, 40),
    policyVersion: clean(profile.policyVersion, 80) || null,
    capabilities: Object.freeze([...(profile.capabilities || [])]),
    missingForNextLevel: Object.freeze([...(profile.missingForNextLevel || [])])
  });
}

export function buildTrustClientSnapshot(input = {}, options = {}) {
  const { operation, transaction, context } = input;
  if (!operation || !transaction) throw new Error('TRUST_SNAPSHOT_INPUT_REQUIRED');
  if (operation.id !== transaction.operationId) throw new Error('TRUST_OPERATION_MISMATCH');
  if (operation.organizationId !== transaction.ownerOrganizationId) throw new Error('TRUST_OWNER_MISMATCH');

  const access = normalizeAccessContext(context);
  const trustView = getTrustTransactionView(transaction, access, options);
  const isOwnerOrganization = access.organizationId === transaction.ownerOrganizationId;

  const auditEvents = isOwnerOrganization
    ? (input.auditEvents || [])
        .filter(event => !event.operationId || event.operationId === operation.id)
        .map(safeAuditEvent)
    : [];

  return Object.freeze({
    schemaVersion: 'trust-client-snapshot.v1',
    generatedAt: clean(options.now || new Date().toISOString(), 40),
    viewer: Object.freeze({
      organizationId: access.organizationId,
      role: access.role,
      ownerOrganization: isOwnerOrganization
    }),
    operation: Object.freeze({
      id: operation.id,
      state: operation.state,
      version: operation.version,
      kind: clean(operation.kind, 40)
    }),
    transaction: clone(trustView),
    security: Object.freeze({
      progress: securityProgress(options.viewerSecurityProfile),
      whoSeesWhat: ownerSecuritySummary(transaction, access, options),
      auditTimelineVisible: isOwnerOrganization,
      auditIntegrityStatus: input.auditIntegrityVerified === true ? 'VERIFIED' : 'NOT_VERIFIED',
      sourceDataFilteredBeforeClient: true,
      clientSideHidingIsSecurityBoundary: false
    }),
    auditTimeline: auditEvents,
    financialBoundary: clone(trustView.financialBoundary)
  });
}
