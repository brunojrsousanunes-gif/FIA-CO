import assert from 'node:assert/strict';
import { createMemoryOperationRepository } from '../core/repositories/operation-repository.mjs';
import { createScopedOperationService } from '../core/operations/scoped-operation-service.mjs';
import { AccessDeniedError } from '../core/identity/access-control.mjs';

let sequence = 0;
const deps = {
  idFactory: prefix => `${prefix}_org_${++sequence}`,
  clock: (() => { let tick = 0; return () => `2026-08-21T01:00:${String(tick++).padStart(2, '0')}Z`; })()
};

const repository = createMemoryOperationRepository();
const alphaAdmin = createScopedOperationService(repository, { actorId: 'alpha-admin', organizationId: 'org-alpha', role: 'ADMIN' }, deps);
const alphaViewer = createScopedOperationService(repository, { actorId: 'alpha-viewer', organizationId: 'org-alpha', role: 'VIEWER' }, deps);
const betaAdmin = createScopedOperationService(repository, { actorId: 'beta-admin', organizationId: 'org-beta', role: 'ADMIN' }, deps);
const alphaOperator = createScopedOperationService(repository, { actorId: 'alpha-operator', organizationId: 'org-alpha', role: 'OPERATOR' }, deps);

const alphaOperation = await alphaAdmin.create({ amount: 80, buyer: 'a', seller: 'b' });
const betaOperation = await betaAdmin.create({ amount: 95, buyer: 'c', seller: 'd' });

assert.equal(alphaOperation.organizationId, 'org-alpha');
assert.equal(betaOperation.organizationId, 'org-beta');
assert.deepEqual((await alphaAdmin.list()).map(x => x.id), [alphaOperation.id]);
assert.deepEqual((await betaAdmin.list()).map(x => x.id), [betaOperation.id]);

await assert.rejects(() => betaAdmin.getById(alphaOperation.id), error => error instanceof AccessDeniedError);
await assert.rejects(() => betaAdmin.move(alphaOperation.id, 'AWAITING_ACCEPTANCE'), error => error instanceof AccessDeniedError);
await assert.rejects(() => alphaViewer.move(alphaOperation.id, 'AWAITING_ACCEPTANCE'), error => error instanceof AccessDeniedError);
await assert.rejects(() => alphaViewer.create({ amount: 10 }), error => error instanceof AccessDeniedError);

const moved = await alphaOperator.move(alphaOperation.id, 'AWAITING_ACCEPTANCE');
assert.equal(moved.state, 'AWAITING_ACCEPTANCE');

await assert.rejects(() => alphaOperator.requestRelease(alphaOperation.id), error => error instanceof AccessDeniedError);
assert.equal((await betaAdmin.getById(betaOperation.id)).state, 'DRAFT');

console.log('Preproduction organization/access boundary OK');
