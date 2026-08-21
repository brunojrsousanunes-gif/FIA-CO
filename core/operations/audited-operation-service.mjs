export function createAuditedOperationService(service, auditLog) {
  if (!service || !service.context) throw new Error('SCOPED_SERVICE_REQUIRED');
  if (!auditLog || typeof auditLog.append !== 'function') throw new Error('AUDIT_LOG_REQUIRED');

  const context = service.context;

  async function record(action, operation) {
    await auditLog.append({
      organizationId: context.organizationId,
      actorId: context.actorId,
      action,
      operationId: operation?.id || null,
      state: operation?.state || null,
      version: operation?.version ?? null
    });
    return operation;
  }

  return Object.freeze({
    context,
    getById: id => service.getById(id),
    list: filters => service.list(filters),
    create: input => service.create(input).then(operation => record('OPERATION_CREATED', operation)),
    move: (id, nextState, meta = {}) => service.move(id, nextState, meta).then(operation => record(`OPERATION_MOVED_${nextState}`, operation)),
    setCondition: (id, name, value) => service.setCondition(id, name, value).then(operation => record(`CONDITION_${name.toUpperCase()}_${Boolean(value)}`, operation)),
    dispute: (id, reason = '') => service.dispute(id, reason).then(operation => record('OPERATION_DISPUTED', operation)),
    requestRelease: id => service.requestRelease(id).then(operation => record('RELEASE_REQUESTED_PSP_ONLY', operation))
  });
}
