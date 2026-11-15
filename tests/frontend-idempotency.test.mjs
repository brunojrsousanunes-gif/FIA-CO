import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';

function storageMock(){
  const values=new Map();
  return {
    values,
    getItem(key){return values.has(key)?values.get(key):null;},
    setItem(key,value){values.set(key,String(value));},
    removeItem(key){values.delete(key);}
  };
}

function loadHelper(source,startMarker,endMarker,context){
  const start=source.indexOf(startMarker);
  const end=source.indexOf(endMarker,start);
  assert.ok(start>=0&&end>start,'idempotency helper block must exist');
  vm.runInNewContext(source.slice(start,end),context);
}

const privateSource=readFileSync('frontend/js/operation-center-private.js','utf8');
const privateStorage=storageMock();
const privateContext={
  crypto:webcrypto,TextEncoder,sessionStorage:privateStorage,
  state:{user:{id:'user-a'}}
};
loadHelper(privateSource,'const pendingRequestKeys=new Map();','function setMessage',privateContext);

const payload={operation:'op-1',amount:125};
const first=await privateContext.getPendingRequestKey('reserve_inventory_item',payload);
const retry=await privateContext.getPendingRequestKey('reserve_inventory_item',payload);
assert.equal(retry.key,first.key,'same user and payload must reuse a pending key');

const reloadedContext={
  crypto:webcrypto,TextEncoder,sessionStorage:privateStorage,
  state:{user:{id:'user-a'}}
};
loadHelper(privateSource,'const pendingRequestKeys=new Map();','function setMessage',reloadedContext);
const afterReload=await reloadedContext.getPendingRequestKey('reserve_inventory_item',payload);
assert.equal(afterReload.key,first.key,'session storage must preserve the key across a page reload');

reloadedContext.state.user.id='user-b';
const otherUser=await reloadedContext.getPendingRequestKey('reserve_inventory_item',payload);
assert.notEqual(otherUser.key,first.key,'different accounts must never share pending keys');

const changedPayload=await reloadedContext.getPendingRequestKey('reserve_inventory_item',{...payload,amount:250});
assert.notEqual(changedPayload.key,otherUser.key,'changed payloads must receive different keys');

reloadedContext.state.user.id='user-a';
reloadedContext.clearPendingRequestKey(afterReload.storageKey);
const afterSuccess=await reloadedContext.getPendingRequestKey('reserve_inventory_item',payload);
assert.notEqual(afterSuccess.key,first.key,'a confirmed action must not reuse its completed key');

const liveSource=readFileSync('frontend/js/operation-center.js','utf8');
const liveStorage=storageMock();
const liveContext={
  crypto:webcrypto,TextEncoder,sessionStorage:liveStorage,
  backendSession:{user:{id:'user-a'}}
};
loadHelper(liveSource,'const pendingBackendRequestKeys=new Map();','function backendStatus',liveContext);
const draftPayload={title:'Operación de prueba',owner:'org-1'};
const draftFirst=await liveContext.pendingBackendRequestKey('create_operation_draft',draftPayload);
const draftRetry=await liveContext.pendingBackendRequestKey('create_operation_draft',draftPayload);
assert.equal(draftRetry.key,draftFirst.key,'real draft retries must reuse the same key');
liveContext.clearBackendRequestKey(draftFirst.storageKey);
const draftAfterSuccess=await liveContext.pendingBackendRequestKey('create_operation_draft',draftPayload);
assert.notEqual(draftAfterSuccess.key,draftFirst.key,'a completed draft must use a fresh key if intentionally recreated');

console.log('frontend idempotency key lifecycle: PASS');
