import {
  createOperation,
  moveOperation,
  setOperationCondition,
  requestRelease,
  disputeOperation
} from './operation-engine.mjs';
import { assertOperationRepository, RepositoryNotFoundError } from '../repositories/operation-repository.mjs';

export function createOperationService(repository, dependencies = {}) {
  const repo = assertOperationRepository(repository);
  const options = {
    idFactory: dependencies.idFactory,
    clock: dependencies.clock
  };

  async function create(input) {
    const operation = createOperation(input, options);
    return repo.save(operation, { expectedVersion: 0 });
  }

  async function load(id) {
    const operation = await repo.getById(id);
    if (!operation) throw new RepositoryNotFoundError();
    return operation;
  }

  async function mutate(id, mutator) {
    const operation = await load(id);
    const expectedVersion = operation.version;
    mutator(operation);
    return repo.save(operation, { expectedVersion });
  }

  return Object.freeze({
    create,
    getById: load,
    list: filters => repo.list(filters),
    move: (id, nextState, actor, meta = {}) => mutate(id, op => moveOperation(op, nextState, actor, meta, options)),
    setCondition: (id, name, value, actor) => mutate(id, op => setOperationCondition(op, name, value, actor, options)),
    dispute: (id, actor, reason = '') => mutate(id, op => disputeOperation(op, actor, reason, options)),
    requestRelease: (id, actor = 'system') => mutate(id, op => requestRelease(op, actor, options))
  });
}
