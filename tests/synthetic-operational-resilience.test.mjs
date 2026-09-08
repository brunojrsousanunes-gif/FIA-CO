import fs from 'node:fs';
import assert from 'node:assert/strict';
import { runSyntheticOperationalResilience,normalizeSyntheticEvents,evaluateHumanReviewDelay } from '../core/pilot/synthetic-operational-resilience.mjs';

const config=JSON.parse(fs.readFileSync('config/synthetic-resilience-campaign.v1.json','utf8'));
const result=await runSyntheticOperationalResilience(config);
assert.equal(result.decision,'PASS_RESILIENCE');
assert.deepEqual(result.regressions,[]);
assert.deepEqual(result.metrics,config.baseline);
assert.deepEqual(result.normalizedEvents.ordered.map(item=>item.sequence),[1,2,3]);
assert.equal(result.normalizedEvents.duplicatesIgnored,1);
assert.equal(result.stalledOperationIds.length,1);
assert.equal(result.humanReview.breached,true);
assert.equal(result.realMoneyMoved,false);
assert.equal(result.externalActionsExecuted,false);

const gap=normalizeSyntheticEvents([{id:'e1',sequence:1},{id:'e3',sequence:3}]);
assert.equal(gap.decision,'BLOCK_MISSING_EVENT');
assert.equal(evaluateHumanReviewDelay('2026-09-09T01:00:00Z','2026-09-09T01:20:00Z',30).breached,false);
await assert.rejects(()=>runSyntheticOperationalResilience({...config,syntheticOnly:false}),/SYNTHETIC_RESILIENCE_ONLY/);
console.log('synthetic-operational-resilience: ok');
