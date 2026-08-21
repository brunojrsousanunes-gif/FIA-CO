import { createOperationService } from './operation-service.mjs';
import { AccessDeniedError, assertOperationOrganization, assertPermission, normalizeAccessContext } from '../identity/access-control.mjs';

export function createScopedOperationService(repository, context, dependencies = {}) {
  const access = normalizeAccessContext(context);
  const service = createOperationService(repository, dependencies);

  async function loadScoped(id, permission = 'operation:read') {
    assertPermission(access, permission);
    const operation = await service.getById(id);
    assertOperationOrganization(access, operation);
    return operation;
  }

  return Object.freeze({
    async create(input = {}) {
      assertPermission(access, 'operation:create');
      return service.create({
        ...input,
        organizationId: access.organizationId,
        actor: access.actorId
      });
    },

    getById: id => loadScoped(id, 'operation:read'),

    async list(filters = {}) {
      assertPermission(access, 'operation:read');
      return service.list({ ...filters, organizationId: access.organizationId });
    },

    async move(id, nextState, meta = {}) {
      await loadScoped(id, 'operation:update');
      return service.move(id, nextState, access.actorId, meta);
    },

    async setCondition(id, name, value) {
      await loadScoped(id, 'operation:update');
      return service.setCondition(id, name, value, access.actorId);
    },

    async dispute(id, reason = '') {
      await loadScoped(id, 'operation:dispute');
      return service.dispute(id, access.actorId, reason);
    },

    async requestRelease(id) {
      await loadScoped(id, 'operation:release');
      return service.requestRelease(id, access.actorId);
    },

    context: access,
    AccessDeniedError
  });
}
