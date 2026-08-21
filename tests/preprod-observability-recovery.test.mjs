import assert from 'node:assert/strict';
import { createMemoryOperationRepository } from '../core/repositories/operation-repository.mjs';
import { createOperationService } from '../core/operations/operation-service.mjs';
import { exportOperationBackup, restoreOperationBackup } from '../core/recovery/operation-backup.mjs';
import { createMemoryAuditLog } from '../core/audit/audit-log.mjs';
import { createHealthReport, createTelemetryEvent } from '../core/observability/telemetry.mjs';

let seq = 0;
const deps = {
  idFactory: prefix => `${prefix}_recovery_${++seq}`,
  clock: (() => { let tick = 0; return () => `2026-08-21T03:00:${String(tick++).padStart(2, '0')}Z`; })()
};

const repository = createMemoryOperationRepository();
const service = createOperationService(repository, deps);
await service.create({ organizationId: 'org-a', amount: 10, buyer: 'a', seller: 'b', actor: 'x' });
await service.create({ organizationId: 'org-a', amount: 20, buyer: 'a', seller: 'c', actor: 'x' });
await service.create({ organizationId: 'org-b', amount: 30, buyer: 'd', seller: 'e', actor: 'y' });

const backup = await exportOperationBackup(repository, { organizationId: 'org-a', pageSize: 1 });
assert.equal(backup.operations.length, 2);
assert.ok(backup.operations.every(operation => operation.organizationId === 'org-a'));

const restored = await restoreOperationBackup(backup);
const restoredOperations = await restored.list({ organizationId: 'org-a' });
assert.equal(restoredOperations.length, 2);
assert.deepEqual(restoredOperations.map(operation => operation.amount).sort((a,b) => a-b), [10,20]);

const event = createTelemetryEvent({
  event: 'REQUEST_FAILED',
  organizationId: 'org-a',
  correlationId: 'corr-1',
  meta: {
    email: 'person@example.com',
    authorization: 'Bearer super-secret',
    nested: { token: 'abc123', safe: 'visible' }
  }
});
assert.equal(event.meta.email, '[REDACTED]');
assert.equal(event.meta.authorization, '[REDACTED]');
assert.equal(event.meta.nested.token, '[REDACTED]');
assert.equal(event.meta.nested.safe, 'visible');

const auditLog = createMemoryAuditLog({ idFactory: deps.idFactory, clock: deps.clock });
await auditLog.append({ organizationId: 'org-a', actorId: 'system', action: 'HEALTH_SEED' });
const health = await createHealthReport({ repository, auditLog, organizationId: 'org-a' });
assert.equal(health.ok, true);
assert.equal(health.realFunds, false);
assert.equal(health.realPii, false);

console.log('Preproduction observability/recovery OK');
