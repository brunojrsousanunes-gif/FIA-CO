import assert from 'node:assert/strict';
import { createHierarchyScopedOperationService } from '../core/operations/hierarchy-scoped-operation-service.mjs';

function fake(role='OPERATOR') {
  const calls=[];
  const service={
    context:{actorId:`actor-${role.toLowerCase()}`,organizationId:'org-1',role},
    getById:id=>{calls.push(['getById',id]);return {id};},
    list:filters=>{calls.push(['list',filters]);return [];},
    create:payload=>{calls.push(['create',payload]);return payload;},
    move:(id,state,meta)=>{calls.push(['move',id,state,meta]);return {id,state};},
    setCondition:(id,name,value)=>{calls.push(['setCondition',id,name,value]);return {id};},
    dispute:(id,reason)=>{calls.push(['dispute',id,reason]);return {id};},
    requestRelease:id=>{calls.push(['requestRelease',id]);return {id};}
  };
  return {service,calls};
}

{
  const {service,calls}=fake('OPERATOR');
  const guarded=createHierarchyScopedOperationService(service,{level:'L4_ADVANCED'});
  assert.equal(guarded.accessDecision.effectiveSecurityLevel,'L2_VERIFIED');
  guarded.getById('op-1');
  guarded.create({reference:'A'});
  assert.deepEqual(calls.map(x=>x[0]),['getById','create']);
  assert.throws(()=>guarded.requestRelease('op-1'),/HIERARCHY_CAPABILITY_DENIED:APPROVE_HIGH_RISK_ACTION/);
}

{
  const {service,calls}=fake('OWNER');
  const guarded=createHierarchyScopedOperationService(service,{level:'L2_VERIFIED'});
  assert.equal(guarded.accessDecision.effectiveSecurityLevel,'L2_VERIFIED');
  assert.throws(()=>guarded.requestRelease('op-2'),/HIERARCHY_CAPABILITY_DENIED:APPROVE_HIGH_RISK_ACTION/);
  assert.equal(calls.length,0);
}

{
  const {service,calls}=fake('OWNER');
  const guarded=createHierarchyScopedOperationService(service,{level:'L4_ADVANCED'});
  guarded.requestRelease('op-3');
  assert.deepEqual(calls,[['requestRelease','op-3']]);
}

{
  const {service,calls}=fake('VIEWER');
  const guarded=createHierarchyScopedOperationService(service,{level:'L4_ADVANCED'});
  guarded.getById('op-4');
  assert.throws(()=>guarded.create({reference:'B'}),/HIERARCHY_CAPABILITY_DENIED:MANAGE_OPERATIONS/);
  assert.deepEqual(calls.map(x=>x[0]),['getById']);
}

console.log('hierarchy-scoped-operation-service.test.mjs passed');
