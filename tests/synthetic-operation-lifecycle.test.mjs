import fs from 'node:fs';
import assert from 'node:assert/strict';
import { runSyntheticOperationLifecycle } from '../core/pilot/synthetic-operation-lifecycle.mjs';

const config=JSON.parse(fs.readFileSync('config/synthetic-operation-lifecycle.v1.json','utf8'));
assert.equal(config.syntheticOnly,true);
const results=config.cases.map(runSyntheticOperationLifecycle);
assert.equal(results.length,3);

for(const result of results){
  assert.equal(result.status,'LIFECYCLE_PASS');
  assert.equal(result.syntheticOnly,true);
  assert.equal(result.realDataUsed,false);
  assert.equal(result.realMoneyMoved,false);
  assert.equal(result.externalActionsExecuted,false);
  assert.equal(result.nonCustodial,true);
  assert.equal(result.finalOperation.state,'CLOSED');
  assert.equal(result.productionReady,false);
  assert.deepEqual(result.timeline.filter(item=>item.stage!=='FAULT_INJECTION').map(item=>item.stage),[
    'CREATION','AGREEMENT','TRACKING',
    ...(result.lifecycleId==='STANDARD_WITH_RECOVERED_INCIDENT'?['INCIDENT_OPENED','INCIDENT_RESOLVED']:[]),
    'DELIVERY','ACCEPTANCE','SIMULATED_PSP_INSTRUCTION','CLOSURE'
  ]);
  assert.ok(result.finalOperation.evidence.every(item=>item.actor.startsWith('synthetic-')));
}

const withIncident=results[0];
assert.ok(withIncident.timeline.some(item=>item.stage==='INCIDENT_OPENED'&&item.operationState==='DISPUTED'));
assert.ok(withIncident.faultDrills.some(item=>item.type==='PSP_TIMEOUT'&&item.decision==='NO_RETRY_WITHOUT_STATUS_CHECK'));
const missingDocs=results[2].faultDrills.find(item=>item.type==='MISSING_OWNER_DOCUMENTATION');
assert.equal(missingDocs.ownerActionRequiredNow,false);
assert.equal(missingDocs.decision,'CONTINUE_SYNTHETIC_WITH_PLACEHOLDER');

assert.throws(()=>runSyntheticOperationLifecycle({synthetic:false}),/SYNTHETIC_LIFECYCLE_ONLY/);
assert.throws(()=>runSyntheticOperationLifecycle({synthetic:true,realMoney:true}),/REAL_EXECUTION_FORBIDDEN/);
console.log('synthetic-operation-lifecycle: ok');
