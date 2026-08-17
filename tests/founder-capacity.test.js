const assert=require('assert');
require('../frontend/js/ops-automation.js');
require('../frontend/js/founder-capacity.js');
const c=globalThis.FIACOFounderCapacity;
const items=[
 {id:'A',alias:'A',humanMinutes:12,automatedMinutes:48,pendingDocuments:1,riskCount:0,requiresHuman:false,closed:false},
 {id:'B',alias:'B',humanMinutes:18,automatedMinutes:42,pendingDocuments:0,riskCount:1,requiresHuman:true,closed:false}
];
const r=c.analyze(items,{founderOpsHoursPerMonth:40,hireThresholdPct:80});
assert.strictEqual(r.operations,2);
assert.strictEqual(r.baselineMinutes,120);
assert.strictEqual(r.humanMinutes,30);
assert.strictEqual(r.automatedMinutes,90);
assert.strictEqual(r.hoursSaved,1.5);
assert.strictEqual(r.savingsPct,75);
assert.strictEqual(r.humanMinutesPerOperation,15);
assert.strictEqual(r.capacityOperationsAt100Pct,160);
assert.strictEqual(r.safeFounderCapacityOperations,128);
assert.strictEqual(r.operationsUntilHire,126);
assert.strictEqual(r.hiringSignal,'FOUNDER_CAPACITY_OK');
assert.strictEqual(r.externalApiCostEur,0);
assert.strictEqual(r.containsPersonalData,false);
assert.strictEqual(r.financialActionAllowed,false);
const near=c.analyze(Array.from({length:128},(_,i)=>({id:String(i),alias:'X',humanMinutes:15,automatedMinutes:45,pendingDocuments:0,riskCount:0,requiresHuman:false,closed:false})),{founderOpsHoursPerMonth:40,hireThresholdPct:80});
assert.strictEqual(near.hiringSignal,'PREPARE_HIRE');
console.log('founder capacity tests passed');
