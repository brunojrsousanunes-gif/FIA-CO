export const ROLES = Object.freeze({
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  OPERATOR: 'OPERATOR',
  VIEWER: 'VIEWER'
});

const permissions = Object.freeze({
  OWNER: new Set(['operation:create', 'operation:read', 'operation:update', 'operation:dispute', 'operation:release']),
  ADMIN: new Set(['operation:create', 'operation:read', 'operation:update', 'operation:dispute', 'operation:release']),
  OPERATOR: new Set(['operation:create', 'operation:read', 'operation:update', 'operation:dispute']),
  VIEWER: new Set(['operation:read'])
});

export class AccessDeniedError extends Error {
  constructor(message = 'ACCESS_DENIED') {
    super(message);
    this.name = 'AccessDeniedError';
  }
}

export function normalizeAccessContext(context = {}) {
  const actorId = String(context.actorId || '').trim();
  const organizationId = String(context.organizationId || '').trim();
  const role = String(context.role || '').trim().toUpperCase();
  if (!actorId || !organizationId || !permissions[role]) throw new AccessDeniedError('INVALID_ACCESS_CONTEXT');
  return Object.freeze({ actorId, organizationId, role });
}

export function assertPermission(context, permission) {
  const normalized = normalizeAccessContext(context);
  if (!permissions[normalized.role].has(permission)) throw new AccessDeniedError();
  return normalized;
}

export function assertOperationOrganization(context, operation) {
  const normalized = normalizeAccessContext(context);
  if (!operation || operation.organizationId !== normalized.organizationId) throw new AccessDeniedError();
  return normalized;
}
