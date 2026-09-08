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

  for (const operation of backup.operations) {
    if (backup.organizationId !== null && operation.organizationId !== backup.organizationId) {
      throw new Error('BACKUP_ORGANIZATION_MISMATCH');
    }
    await target.save(operation, { expectedVersion: 0 });
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
  if (!backup || !backup.integrityDigest) throw new Error('BACKUP_INTEGRITY_REQUIRED');
  const { integrityDigest, ...body } = backup;
  if (backupDigest(body) !== integrityDigest) throw new Error('BACKUP_INTEGRITY_FAILED');
  const compatible = { version: body.version, organizationId: body.organizationId, operations: body.operations };
  return restoreOperationBackup(compatible, options);
}
