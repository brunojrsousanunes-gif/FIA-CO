import fs from 'node:fs';
import assert from 'node:assert/strict';
import { evaluateSyntheticFraudDispute,summarizeSyntheticFraudDisputes } from '../core/pilot/synthetic-fraud-dispute.mjs';

const config=JSON.parse(fs.readFileSync('config/synthetic-fraud-dispute-cases.v1.json','utf8'));
const results=config.cases.map(item=>evaluateSyntheticFraudDispute({...item,synthetic:true}));
const summary=summarizeSyntheticFraudDisputes(results);
assert.equal(summary.total,12);
assert.equal(summary.bySeverity.CRITICAL,3);
assert.equal(summary.bySeverity.HIGH,5);
assert.equal(summary.bySeverity.MEDIUM,4);
assert.equal(summary.byDecision.BLOCK_OPERATION,4);
assert.equal(summary.byDecision.OPEN_DISPUTE,2);
assert.equal(summary.byDecision.HUMAN_REVIEW_REQUIRED,5);
assert.equal(summary.byDecision.REQUEST_MORE_EVIDENCE,1);
assert.equal(summary.humanReviews,7);
assert.equal(summary.frozenOperations,11);
assert.equal(summary.unsafeOutcomes,0);
assert.equal(summary.decision,'PASS_SYNTHETIC_DISPUTES');
for(const result of results){
  assert.equal(result.automaticWinnerSelected,false);
  assert.equal(result.legalConclusionProduced,false);
  assert.equal(result.financialInstructionCreated,false);
  assert.equal(result.externalActionsExecuted,false);
  assert.ok(result.evidenceRequired.length>0);
}
assert.throws(()=>evaluateSyntheticFraudDispute({...config.cases[0],synthetic:false}),/SYNTHETIC_FRAUD_CASE_ONLY/);
console.log('synthetic-fraud-dispute: ok');
