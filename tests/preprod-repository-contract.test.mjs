import assert from 'node:assert/strict';
import { createMemoryOperationRepository, RepositoryConflictError } from '../core/repositories/operation-repository.mjs';
import { createOperationService } from '../core/operations/operation-service.mjs';

let sequence = 0;
const idFactory = prefix => `${prefix}_test_${++sequence}`;
const clock = (() => {
  let tick = 0;
  return () => `2026-08-21T00:00:${String(tick++).padStart(2, '0')}Z`;
})();

const repository = createMemoryOperationRepository();
const service = createOperationService(repository, { idFactory, clock });

const created = await service.create({ amount: 125.5, buyer: 'buyer-a', seller: 'seller-b', actor: 'founder' });
assert.equal(created.state, 'DRAFT');
assert.equal(created.version, 1);

const loaded = await service.getById(created.id);
loaded.state = 'TAMPERED';
assert.equal((await service.getById(created.id)).state, 'DRAFT', 'repository must return snapshots, not mutable references');

const moved = await service.move(created.id, 'AWAITING_ACCEPTANCE', 'buyer-a');
assert.equal(moved.state, 'AWAITING_ACCEPTANCE');
assert.equal(moved.version, 2);

const listed = await service.list({ state: 'AWAITING_ACCEPTANCE' });
assert.equal(listed.length, 1);
assert.equal(listed[0].id, created.id);

const concurrentA = await repository.getById(created.id);
const concurrentB = await repository.getById(created.id);
const versionBeforeConcurrentSave = concurrentA.version;
concurrentA.kind = 'a';
concurrentA.version += 1;
await repository.save(concurrentA, { expectedVersion: versionBeforeConcurrentSave });
concurrentB.kind = 'b';
concurrentB.version += 1;
await assert.rejects(
  () => repository.save(concurrentB, { expectedVersion: versionBeforeConcurrentSave }),
  error => error instanceof RepositoryConflictError
);

assert.equal(repository.kind, 'memory');
console.log('Preproduction repository contract OK');
