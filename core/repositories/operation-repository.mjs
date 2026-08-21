import { snapshotOperation } from '../operations/operation-engine.mjs';

export class RepositoryConflictError extends Error {
  constructor(message = 'REPOSITORY_CONFLICT') {
    super(message);
    this.name = 'RepositoryConflictError';
  }
}

export class RepositoryNotFoundError extends Error {
  constructor(message = 'REPOSITORY_NOT_FOUND') {
    super(message);
    this.name = 'RepositoryNotFoundError';
  }
}

export function assertOperationRepository(repository) {
  for (const method of ['getById', 'save', 'list']) {
    if (!repository || typeof repository[method] !== 'function') {
      throw new Error(`INVALID_OPERATION_REPOSITORY:${method}`);
    }
  }
  return repository;
}

export function createMemoryOperationRepository(initialOperations = []) {
  const records = new Map();

  for (const operation of initialOperations) {
    const snapshot = snapshotOperation(operation);
    records.set(snapshot.id, snapshot);
  }

  async function getById(id) {
    const record = records.get(String(id));
    return record ? snapshotOperation(record) : null;
  }

  async function save(operation, { expectedVersion } = {}) {
    if (!operation || typeof operation !== 'object' || !operation.id) {
      throw new Error('INVALID_OPERATION');
    }

    const current = records.get(operation.id);
    if (expectedVersion !== undefined) {
      if (!current && expectedVersion !== 0) throw new RepositoryConflictError();
      if (current && current.version !== expectedVersion) throw new RepositoryConflictError();
    }

    const snapshot = snapshotOperation(operation);
    records.set(snapshot.id, snapshot);
    return snapshotOperation(snapshot);
  }

  async function list({ limit = 100, state } = {}) {
    const normalizedLimit = Math.max(1, Math.min(Number(limit) || 100, 500));
    const values = [...records.values()]
      .filter(operation => !state || operation.state === state)
      .slice(0, normalizedLimit)
      .map(snapshotOperation);
    return values;
  }

  async function remove(id, { expectedVersion } = {}) {
    const current = records.get(String(id));
    if (!current) throw new RepositoryNotFoundError();
    if (expectedVersion !== undefined && current.version !== expectedVersion) {
      throw new RepositoryConflictError();
    }
    records.delete(String(id));
  }

  return Object.freeze({ getById, save, list, remove, kind: 'memory' });
}
