import { createOperationService } from './operation-service.mjs';
import {
  moveOperation,
  setOperationCondition,
  requestRelease,
  disputeOperation
} from './operation-engine.mjs';
import { AccessDeniedError, assertOperationOrganization, assertPermission, normalizeAccessContext } from '../identity/access-control.mjs';

export function createScopedOperationService(repository, context, dependencies = {}) {
  const access = normalizeAccessContext(context);
  const service = createOperationService(repository, dependencies);
  const engineOptions = { idFactory: dependencies.idFactory, clock: dependencies.clock };

  async function loadScoped(id, permission = 'operation:read') {
    assertPermission(access, permission);
    const operation = await service.getById(id);
    assertOperationOrganization(access, operation);
    return operation;
  }

  function guardedMutate(id, permission, mutator) {
    assertPermission(access, permission);
    return service.mutate(
      id,
      mutator,
      operation => assertOperationOrganization(access, operation)
    );
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

    move: (id, nextState, meta = {}) => guardedMutate(
      id,
      'operation:update',
      op => moveOperation(op, nextState, access.actorId, meta, engineOptions)
    ),

    setCondition: (id, name, value) => guardedMutate(
      id,
      'operation:update',
      op => setOperationCondition(op, name, value, access.actorId, engineOptions)
    ),

    dispute: (id, reason = '') => guardedMutate(
      id,
      'operation:dispute',
      op => disputeOperation(op, access.actorId, reason, engineOptions)
    ),

    requestRelease: id => guardedMutate(
      id,
      'operation:release',
      op => requestRelease(op, access.actorId, engineOptions)
    ),

    context: access,
    AccessDeniedError
  });
}
