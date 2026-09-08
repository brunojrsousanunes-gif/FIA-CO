import fs from 'node:fs';
import assert from 'node:assert/strict';
import { runSyntheticFailureDrill, verifySyntheticDrillClosure } from '../core/pilot/synthetic-failure-drills.mjs';

const config=JSON.parse(fs.readFileSync('config/synthetic-failure-scenarios.v1.json','utf8'));
assert.equal(config.syntheticOnly,true);
assert.equal(config.scenarios.length,10);
for(const scenario of config.scenarios){
  const result=runSyntheticFailureDrill({...scenario,synthetic:true});
  assert.equal(result.decision,scenario.expectedDecision);
  assert.equal(result.syntheticOnly,true);
  assert.equal(result.realIncident,false);
  assert.equal(result.externalActionsExecuted,false);
  assert.equal(result.productionStateChanged,false);
  assert.equal(verifySyntheticDrillClosure(result,['DETECTION_RECORDED','CONTAINMENT_VERIFIED']),false);
  assert.equal(verifySyntheticDrillClosure(result,['DETECTION_RECORDED','CONTAINMENT_VERIFIED','RECOVERY_TEST_PASSED']),true);
}
const ownerCase=runSyntheticFailureDrill({type:'MISSING_OWNER_DOCUMENTATION',synthetic:true});
assert.equal(ownerCase.ownerActionRequiredNow,false);
assert.equal(ownerCase.decision,'CONTINUE_SYNTHETIC_WITH_PLACEHOLDER');
assert.throws(()=>runSyntheticFailureDrill({type:'PSP_TIMEOUT',synthetic:false}),/SYNTHETIC_DRILL_ONLY/);
console.log('synthetic-failure-drills: ok');
