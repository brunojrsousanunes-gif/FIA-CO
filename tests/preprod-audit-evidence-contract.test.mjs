import assert from 'node:assert/strict';
import { createMemoryOperationRepository } from '../core/repositories/operation-repository.mjs';
import { createScopedOperationService } from '../core/operations/scoped-operation-service.mjs';
import { createAuditedOperationService } from '../core/operations/audited-operation-service.mjs';
import { createMemoryAuditLog } from '../core/audit/audit-log.mjs';

let seq = 0;
const deps = {
  idFactory: prefix => `${prefix}_audit_${++seq}`,
  clock: (() => { let tick = 0; return () => `2026-08-21T02:00:${String(tick++).padStart(2, '0')}Z`; })()
};

const repository = createMemoryOperationRepository();
const auditLog = createMemoryAuditLog({ idFactory: deps.idFactory, clock: deps.clock });
const alphaScoped = createScopedOperationService(repository, { actorId: 'alpha-admin', organizationId: 'org-alpha', role: 'ADMIN' }, deps);
const betaScoped = createScopedOperationService(repository, { actorId: 'beta-admin', organizationId: 'org-beta', role: 'ADMIN' }, deps);
const alpha = createAuditedOperationService(alphaScoped, auditLog);
const beta = createAuditedOperationService(betaScoped, auditLog);

const alphaOp = await alpha.create({ amount: 120, buyer: 'buyer-a', seller: 'seller-a' });
await alpha.move(alphaOp.id, 'AWAITING_ACCEPTANCE');
const betaOp = await beta.create({ amount: 60, buyer: 'buyer-b', seller: 'seller-b' });

const alphaEvents = await auditLog.list({ organizationId: 'org-alpha' });
const betaEvents = await auditLog.list({ organizationId: 'org-beta' });

assert.equal(alphaEvents.length, 2);
assert.equal(betaEvents.length, 1);
assert.deepEqual(alphaEvents.map(event => event.seq), [1, 2]);
assert.equal(alphaEvents[0].prevHash, 'GENESIS');
assert.equal(alphaEvents[1].prevHash, alphaEvents[0].hash);
assert.equal(alphaEvents[1].operationId, alphaOp.id);
assert.equal(betaEvents[0].operationId, betaOp.id);
assert.equal(await auditLog.verify('org-alpha'), true);
assert.equal(await auditLog.verify('org-beta'), true);

const beforeFailure = (await auditLog.list({ organizationId: 'org-alpha' })).length;
await assert.rejects(() => alpha.move(alphaOp.id, 'CLOSED'));
const afterFailure = (await auditLog.list({ organizationId: 'org-alpha' })).length;
assert.equal(afterFailure, beforeFailure, 'failed domain mutations must not produce successful audit events');

console.log('Preproduction audit/evidence contract OK');
