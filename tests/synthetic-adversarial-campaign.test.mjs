import fs from 'node:fs';
import assert from 'node:assert/strict';
import { runSyntheticAdversarialCampaign, summarizeAdversarialCampaign, classifyMissingDocumentation } from '../core/pilot/synthetic-adversarial-campaign.mjs';

const config=JSON.parse(fs.readFileSync('config/synthetic-adversarial-campaign.v1.json','utf8'));
const results=[];
for(const campaign of config.campaigns) results.push(await runSyntheticAdversarialCampaign({...campaign,syntheticOnly:true}));
const summary=summarizeAdversarialCampaign(results);
assert.equal(summary.campaigns,3);
assert.equal(summary.passed,3);
assert.equal(summary.blocked,0);
assert.equal(summary.faultsInjected,8);
assert.equal(summary.failedRecoveryAttempts,3);
assert.equal(summary.tamperChecksPassed,true);
assert.equal(summary.decision,'PASS_SYNTHETIC_ONLY');
for(const result of results){
  assert.equal(result.recovery.failedAttempts,1);
  assert.equal(result.recovery.recovered,true);
  assert.equal(result.integrity.auditTamperDetected,true);
  assert.equal(result.integrity.auditDeletionDetected,true);
  assert.equal(result.integrity.evidenceTamperDetected,true);
  assert.equal(result.realMoneyMoved,false);
  assert.equal(result.externalActionsExecuted,false);
}
assert.deepEqual(classifyMissingDocumentation('SYNTHETIC_DEVELOPMENT'),{severity:'LOW',decision:'CONTINUE_WITH_SYNTHETIC_PLACEHOLDER'});
assert.deepEqual(classifyMissingDocumentation('CONTROLLED_PREPILOT'),{severity:'HIGH',decision:'BLOCK_PREPILOT'});
assert.deepEqual(classifyMissingDocumentation('PRODUCTION_ACTIVATION'),{severity:'CRITICAL',decision:'BLOCK_ACTIVATION'});
await assert.rejects(()=>runSyntheticAdversarialCampaign({...config.campaigns[0],syntheticOnly:false}),/SYNTHETIC_CAMPAIGN_ONLY/);
console.log('synthetic-adversarial-campaign: ok');
