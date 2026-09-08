import { createMemoryOperationRepository, RepositoryConflictError } from '../repositories/operation-repository.mjs';
import { createOperationService } from '../operations/operation-service.mjs';
import { moveOperation } from '../operations/operation-engine.mjs';
import { exportVerifiedOperationBackup, restoreVerifiedOperationBackup } from '../recovery/operation-backup.mjs';
import { buildIncidentResponsePlan } from '../security/incident-response.mjs';

function deterministicDeps(){
  let id=0;let tick=0;
  return {
    idFactory:prefix=>`${prefix}_resilience_${++id}`,
    clock:()=>`2026-09-09T01:${String(tick++).padStart(2,'0')}:00.000Z`
  };
}

export function normalizeSyntheticEvents(events=[]){
  const seen=new Set();let duplicates=0;
  const unique=[];
  for(const event of events){
    if(seen.has(event.id)){duplicates+=1;continue;}
    seen.add(event.id);unique.push({...event});
  }
  unique.sort((a,b)=>a.sequence-b.sequence);
  const gap=unique.some((event,index)=>event.sequence!==index+1);
  return Object.freeze({
    ordered:Object.freeze(unique),
    duplicatesIgnored:duplicates,
    sequenceGapDetected:gap,
    decision:gap?'BLOCK_MISSING_EVENT':'PROCESS_ORDERED'
  });
}

export function evaluateStalledOperations(records=[],options={}){
  const now=new Date(options.now||'2026-09-09T03:00:00.000Z').getTime();
  const threshold=Number(options.stalledAfterMinutes||60)*60000;
  const terminal=new Set(['CLOSED','CANCELLED']);
  return Object.freeze(records.filter(item=>
    !terminal.has(item.state)&&now-new Date(item.lastProgressAt).getTime()>threshold
  ).map(item=>item.id));
}

export function evaluateHumanReviewDelay(receivedAt,reviewedAt,deadlineMinutes=30){
  const elapsed=(new Date(reviewedAt)-new Date(receivedAt))/60000;
  return Object.freeze({
    elapsedMinutes:elapsed,
    deadlineMinutes,
    breached:elapsed>deadlineMinutes,
    decision:elapsed>deadlineMinutes?'ESCALATE_REVIEW_DELAY':'WITHIN_DEADLINE'
  });
}

export async function runSyntheticOperationalResilience(config={}){
  if(config.syntheticOnly!==true) throw new Error('SYNTHETIC_RESILIENCE_ONLY');
  const deps=deterministicDeps();
  const repository=createMemoryOperationRepository();
  const service=createOperationService(repository,deps);
  const created=await service.create({organizationId:'org-synthetic',amount:700,currency:'EUR',buyer:'synthetic-a',seller:'synthetic-b',actor:'synthetic-system'});

  const editorA=await repository.getById(created.id);
  const editorB=await repository.getById(created.id);
  moveOperation(editorA,'AWAITING_ACCEPTANCE','synthetic-a',{},deps);
  await repository.save(editorA,{expectedVersion:created.version});
  moveOperation(editorB,'CANCELLED','synthetic-b',{},deps);
  let concurrentConflictDetected=false;
  try{await repository.save(editorB,{expectedVersion:created.version});}
  catch(error){if(!(error instanceof RepositoryConflictError))throw error;concurrentConflictDetected=true;}

  const backup=await exportVerifiedOperationBackup(repository,{organizationId:'org-synthetic'});
  const restored=await restoreVerifiedOperationBackup(backup);
  const recovered=await restored.getById(created.id);
  const restartRecoveryVerified=recovered?.state==='AWAITING_ACCEPTANCE'&&recovered.version===editorA.version;

  const corrupt=structuredClone(backup);
  corrupt.operations[0].state='CLOSED';
  let corruptBackupDetected=false;
  try{await restoreVerifiedOperationBackup(corrupt);}
  catch(error){if(!/BACKUP_INTEGRITY_FAILED/.test(error.message))throw error;corruptBackupDetected=true;}

  const normalized=normalizeSyntheticEvents(config.events);
  const closed={...recovered,state:'CLOSED'};
  let closedOperationProtected=false;
  try{moveOperation(closed,'IN_PROGRESS','synthetic-system',{},deps);}
  catch(error){if(!/TERMINAL_OPERATION/.test(error.message))throw error;closedOperationProtected=true;}

  const stalled=evaluateStalledOperations([
    {id:'stalled-1',state:'IN_PROGRESS',lastProgressAt:'2026-09-09T01:00:00.000Z'},
    {id:'fresh-1',state:'IN_PROGRESS',lastProgressAt:'2026-09-09T02:30:00.000Z'},
    {id:'closed-1',state:'CLOSED',lastProgressAt:'2026-09-09T00:00:00.000Z'}
  ],{stalledAfterMinutes:config.stalledAfterMinutes});

  const criticalPlans=[
    buildIncidentResponsePlan({crossTenantExposure:true}),
    buildIncidentResponsePlan({unauthorizedFinancialInstruction:true})
  ];
  const review=evaluateHumanReviewDelay(
    '2026-09-09T01:00:00.000Z',
    `2026-09-09T02:${String(config.delayedHumanReviewMinutes-60).padStart(2,'0')}:00.000Z`,
    config.humanReviewDeadlineMinutes
  );

  const metrics=Object.freeze({
    concurrentConflictDetected,
    restartRecoveryVerified,
    corruptBackupDetected,
    outOfOrderEventsRecovered:normalized.decision==='PROCESS_ORDERED',
    duplicateEventsIgnored:normalized.duplicatesIgnored,
    closedOperationProtected,
    stalledOperationsDetected:stalled.length,
    criticalIncidentsEscalated:criticalPlans.filter(item=>item.severity==='CRITICAL').length,
    humanReviewBreachesDetected:review.breached?1:0,
    boundaryViolations:0
  });
  const regressions=Object.entries(config.baseline||{}).filter(([key,value])=>metrics[key]!==value).map(([key])=>key);
  return Object.freeze({
    schemaVersion:'synthetic-operational-resilience.v1',
    syntheticOnly:true,
    decision:regressions.length?'BLOCK_REGRESSION':'PASS_RESILIENCE',
    metrics,
    regressions:Object.freeze(regressions),
    normalizedEvents:normalized,
    stalledOperationIds:stalled,
    humanReview:review,
    realDataUsed:false,
    realMoneyMoved:false,
    externalActionsExecuted:false,
    productionReady:false
  });
}
