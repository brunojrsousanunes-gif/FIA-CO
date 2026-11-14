import crypto from 'node:crypto';
import { assertOperationRepository, createMemoryOperationRepository } from '../repositories/operation-repository.mjs';

export async function exportOperationBackup(repository, { organizationId, pageSize = 200 } = {}) {
  const repo = assertOperationRepository(repository);
  const normalizedPageSize = Math.max(1, Math.min(Number(pageSize) || 200, 500));
  const operations = [];
  let offset = 0;

  while (true) {
    const page = await repo.list({ organizationId, limit: normalizedPageSize, offset });
    operations.push(...page);
    if (page.length < normalizedPageSize) break;
    offset += page.length;
  }

  return Object.freeze({
    version: 1,
    organizationId: organizationId ?? null,
    operations: Object.freeze(operations.map(operation => Object.freeze(operation)))
  });
}

export async function restoreOperationBackup(backup, { repository } = {}) {
  if (!backup || backup.version !== 1 || !Array.isArray(backup.operations)) {
    throw new Error('INVALID_OPERATION_BACKUP');
  }

  const target = repository || createMemoryOperationRepository();
  assertOperationRepository(target);
  if (typeof target.remove !== 'function') throw new Error('RESTORE_REQUIRES_ROLLBACK_CAPABILITY');

  const seen = new Set();
  for (const operation of backup.operations) {
    if (!operation || typeof operation.id !== 'string' || !operation.id) throw new Error('INVALID_BACKUP_OPERATION');
    if (seen.has(operation.id)) throw new Error('BACKUP_DUPLICATE_OPERATION');
    seen.add(operation.id);
    if (backup.organizationId !== null && operation.organizationId !== backup.organizationId) {
      throw new Error('BACKUP_ORGANIZATION_MISMATCH');
    }
    if (await target.getById(operation.id)) throw new Error('BACKUP_TARGET_CONFLICT');
  }

  const saved = [];
  try {
    for (const operation of backup.operations) {
      const restored = await target.save(operation, { expectedVersion: 0 });
      saved.push({ id: operation.id, version: restored.version });
    }
  } catch (error) {
    const rollbackErrors = [];
    for (const item of saved.reverse()) {
      try { await target.remove(item.id, { expectedVersion: item.version }); }
      catch (rollbackError) { rollbackErrors.push(rollbackError); }
    }
    if (rollbackErrors.length) {
      error.rollbackErrors = rollbackErrors;
      throw new AggregateError([error, ...rollbackErrors], 'BACKUP_RESTORE_ROLLBACK_FAILED');
    }
    throw error;
  }

  return target;
}


function backupDigest(body) {
  return crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
}

export async function exportVerifiedOperationBackup(repository, options = {}) {
  const base = await exportOperationBackup(repository, options);
  const body = { ...base, integrityVersion: 1 };
  return Object.freeze({ ...body, integrityDigest: backupDigest(body) });
}

export async function restoreVerifiedOperationBackup(backup, options = {}) {
  if (!backup || backup.integrityVersion !== 1 || !backup.integrityDigest) throw new Error('BACKUP_INTEGRITY_REQUIRED');
  const { integrityDigest, ...body } = backup;
  if (backupDigest(body) !== integrityDigest) throw new Error('BACKUP_INTEGRITY_FAILED');
  const compatible = { version: body.version, organizationId: body.organizationId, operations: body.operations };
  return restoreOperationBackup(compatible, options);
}
