function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export class TrustTransactionConflictError extends Error {
  constructor(message = 'TRUST_TRANSACTION_CONFLICT') {
    super(message);
    this.name = 'TrustTransactionConflictError';
  }
}

export function createMemoryTrustTransactionRepository(initial = []) {
  const records = new Map();
  for (const transaction of initial) {
    if (!transaction?.id) throw new Error('INVALID_TRUST_TRANSACTION');
    records.set(String(transaction.id), clone(transaction));
  }

  async function getById(id) {
    const value = records.get(String(id));
    return value ? clone(value) : null;
  }

  async function save(transaction, { expectedVersion } = {}) {
    if (!transaction?.id) throw new Error('INVALID_TRUST_TRANSACTION');
    const current = records.get(String(transaction.id));
    if (expectedVersion !== undefined) {
      if (!current && expectedVersion !== 0) throw new TrustTransactionConflictError();
      if (current && current.version !== expectedVersion) throw new TrustTransactionConflictError();
    }
    records.set(String(transaction.id), clone(transaction));
    return clone(transaction);
  }

  async function list({ ownerOrganizationId, operationId, limit = 100, offset = 0 } = {}) {
    return [...records.values()]
      .filter(item => ownerOrganizationId === undefined || item.ownerOrganizationId === ownerOrganizationId)
      .filter(item => operationId === undefined || item.operationId === operationId)
      .slice(Math.max(0, Number(offset) || 0), Math.max(0, Number(offset) || 0) + Math.max(1, Math.min(Number(limit) || 100, 500)))
      .map(clone);
  }

  return Object.freeze({ getById, save, list, kind: 'memory' });
}
