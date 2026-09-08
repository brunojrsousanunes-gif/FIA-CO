import {
  createOperation,
  moveOperation,
  setOperationCondition,
  requestRelease,
  disputeOperation,
  snapshotOperation
} from '../operations/operation-engine.mjs';
import { runSyntheticFailureDrill, verifySyntheticDrillClosure } from './synthetic-failure-drills.mjs';

function deterministicDeps() {
  let id=0;
  let minute=0;
  return {
    idFactory(prefix='id'){id+=1;return `${prefix}_synthetic_${String(id).padStart(3,'0')}`;},
    clock(){minute+=1;return new Date(Date.UTC(2026,8,8,10,minute)).toISOString();}
  };
}

function recordStage(timeline, operation, stage, outcome='PASS') {
  timeline.push(Object.freeze({
    stage,
    outcome,
    operationState:operation.state,
    operationVersion:operation.version,
    synthetic:true
  }));
}

function executeFaults(types, timeline) {
  return types.map((type,index)=>{
    const drill=runSyntheticFailureDrill({id:`LIFECYCLE-FAULT-${index+1}`,type,synthetic:true});
    const evidence=['DETECTION_RECORDED','CONTAINMENT_VERIFIED','RECOVERY_TEST_PASSED'];
    if (!verifySyntheticDrillClosure(drill,evidence)) throw new Error('SYNTHETIC_DRILL_NOT_CLOSED');
    timeline.push(Object.freeze({stage:'FAULT_INJECTION',outcome:drill.decision,type:drill.type,synthetic:true}));
    return drill;
  });
}

export function runSyntheticOperationLifecycle(input = {}) {
  if (input.synthetic !== true) throw new Error('SYNTHETIC_LIFECYCLE_ONLY');
  if (input.realData === true || input.realMoney === true || input.externalActions === true) {
    throw new Error('REAL_EXECUTION_FORBIDDEN');
  }
  const deps=deterministicDeps();
  const timeline=[];
  const operation=createOperation({
    organizationId:'org-synthetic-lifecycle',
    kind:input.kind || 'synthetic-sale',
    amount:Number(input.syntheticAmount || 100),
    currency:'EUR',
    buyer:'synthetic-buyer',
    seller:'synthetic-seller',
    actor:'synthetic-system'
  },deps);
  recordStage(timeline,operation,'CREATION');

  moveOperation(operation,'AWAITING_ACCEPTANCE','synthetic-system',{},deps);
  setOperationCondition(operation,'sellerAccepted',true,'synthetic-seller',deps);
  moveOperation(operation,'CONDITIONED','synthetic-system',{},deps);
  recordStage(timeline,operation,'AGREEMENT');

  moveOperation(operation,'IN_PROGRESS','synthetic-system',{},deps);
  setOperationCondition(operation,'courierVerified',true,'synthetic-courier',deps);
  recordStage(timeline,operation,'TRACKING');

  const faultDrills=executeFaults(input.injectFaults || [],timeline);

  if (input.includeDispute === true) {
    disputeOperation(operation,'synthetic-buyer','Incidencia ficticia de entrega',deps);
    recordStage(timeline,operation,'INCIDENT_OPENED','BLOCKED_FOR_REVIEW');
    setOperationCondition(operation,'noOpenDispute',true,'synthetic-reviewer',deps);
    moveOperation(operation,'IN_PROGRESS','synthetic-reviewer',{resolution:'SYNTHETIC_REMEDIATION'},deps);
    recordStage(timeline,operation,'INCIDENT_RESOLVED');
  }

  moveOperation(operation,'DELIVERED','synthetic-courier',{},deps);
  setOperationCondition(operation,'delivered',true,'synthetic-courier',deps);
  recordStage(timeline,operation,'DELIVERY');

  setOperationCondition(operation,'buyerAccepted',true,'synthetic-buyer',deps);
  moveOperation(operation,'ACCEPTED','synthetic-buyer',{},deps);
  recordStage(timeline,operation,'ACCEPTANCE');

  requestRelease(operation,'synthetic-system',deps);
  recordStage(timeline,operation,'SIMULATED_PSP_INSTRUCTION');
  moveOperation(operation,'CLOSED','synthetic-system',{providerStatus:'SYNTHETIC_CONFIRMED',moneyMoved:false},deps);
  recordStage(timeline,operation,'CLOSURE');

  return Object.freeze({
    schemaVersion:'synthetic-operation-lifecycle.v1',
    lifecycleId:String(input.id || 'SYNTHETIC-LIFECYCLE'),
    status:'LIFECYCLE_PASS',
    syntheticOnly:true,
    realDataUsed:false,
    realMoneyMoved:false,
    externalActionsExecuted:false,
    nonCustodial:true,
    finalOperation:Object.freeze(snapshotOperation(operation)),
    timeline:Object.freeze(timeline),
    faultDrills:Object.freeze(faultDrills),
    productionReady:false
  });
}
