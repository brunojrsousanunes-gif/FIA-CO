import assert from 'node:assert/strict';
import { createMemoryOperationRepository } from '../core/repositories/operation-repository.mjs';
import { createOperationService } from '../core/operations/operation-service.mjs';
import { exportVerifiedOperationBackup,restoreVerifiedOperationBackup,restoreOperationBackup } from '../core/recovery/operation-backup.mjs';

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
await assert.rejects(()=>restoreVerifiedOperationBackup({...backup,integrityVersion:2}),/BACKUP_INTEGRITY_REQUIRED/);

const duplicateTarget=createMemoryOperationRepository();
const duplicateBackup={version:1,organizationId:'org-test',operations:[backup.operations[0],backup.operations[0]]};
await assert.rejects(()=>restoreOperationBackup(duplicateBackup,{repository:duplicateTarget}),/BACKUP_DUPLICATE_OPERATION/);
assert.equal((await duplicateTarget.list()).length,0);

const existingTarget=createMemoryOperationRepository([op]);
await assert.rejects(()=>restoreOperationBackup(backup,{repository:existingTarget}),/BACKUP_TARGET_CONFLICT/);
assert.equal((await existingTarget.list()).length,1);

const rollbackStore=createMemoryOperationRepository();
let saveCount=0;
const failingRepository={
  getById:rollbackStore.getById,
  list:rollbackStore.list,
  remove:rollbackStore.remove,
  save:async(operation,options)=>{
    saveCount+=1;
    if(saveCount===2)throw new Error('RESTORE_SAVE_FAILURE');
    return rollbackStore.save(operation,options);
  }
};
const secondOperation={...backup.operations[0],id:'second-operation-id'};
await assert.rejects(()=>restoreOperationBackup({
  version:1,organizationId:'org-test',operations:[backup.operations[0],secondOperation]
},{repository:failingRepository}),/RESTORE_SAVE_FAILURE/);
assert.equal((await rollbackStore.list()).length,0,'failed restore must roll back previously inserted operations');

console.log('verified-operation-backup: ok');
