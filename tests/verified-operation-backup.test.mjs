import assert from 'node:assert/strict';
import { createMemoryOperationRepository } from '../core/repositories/operation-repository.mjs';
import { createOperationService } from '../core/operations/operation-service.mjs';
import { exportVerifiedOperationBackup,restoreVerifiedOperationBackup } from '../core/recovery/operation-backup.mjs';

let id=0;
const deps={idFactory:p=>`${p}-${++id}`,clock:()=> '2026-09-09T00:00:00.000Z'};
const repo=createMemoryOperationRepository();
const op=await createOperationService(repo,deps).create({organizationId:'org-test',amount:1,buyer:'synthetic',seller:'synthetic',actor:'synthetic'});
const backup=await exportVerifiedOperationBackup(repo,{organizationId:'org-test'});
const restored=await restoreVerifiedOperationBackup(backup);
assert.equal((await restored.getById(op.id)).id,op.id);
const altered=structuredClone(backup);altered.operations[0].amount=999;
await assert.rejects(()=>restoreVerifiedOperationBackup(altered),/BACKUP_INTEGRITY_FAILED/);
await assert.rejects(()=>restoreVerifiedOperationBackup({version:1,operations:[]}),/BACKUP_INTEGRITY_REQUIRED/);
console.log('verified-operation-backup: ok');
