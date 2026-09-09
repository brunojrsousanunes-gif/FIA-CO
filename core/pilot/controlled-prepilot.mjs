const ATTACK_RULES=Object.freeze({
  LOST_ACCESS:{decision:'RECOVERY_WITH_REAUTHENTICATION',sessionRevoked:true,operationFrozen:true},
  STOLEN_SESSION:{decision:'REVOKE_ALL_SESSIONS',sessionRevoked:true,operationFrozen:true},
  IMPERSONATION:{decision:'BLOCK_AND_HUMAN_REVIEW',sessionRevoked:true,operationFrozen:true},
  DOCUMENT_LEAK:{decision:'CONTAIN_AND_INCIDENT_REVIEW',sessionRevoked:true,operationFrozen:true}
});
const REQUIRED_STAGES=['CREATED','AGREED','TRACKING','DELIVERED','CLOSED'];
const BLOCKING_CATEGORIES=new Set(['LEGAL_MANDATORY','SECURITY_REQUIRED']);

function assertSynthetic(config){
  if(config?.syntheticOnly!==true)throw new Error('CONTROLLED_PREPILOT_SYNTHETIC_ONLY');
  if(config.operation?.realMoney||config.operation?.pspInstruction)throw new Error('FINANCIAL_BOUNDARY_VIOLATION');
}

export function runControlledPrepilot(config={}){
  assertSynthetic(config);
  const users=config.users||[];
  const operation=config.operation||{};
  const lifecyclePass=JSON.stringify(operation.stages)===JSON.stringify(REQUIRED_STAGES);
  const accessChecks=[];
  for(const actor of users){
    accessChecks.push({actorId:actor.id,ownOperationAllowed:actor.operationIds?.includes(operation.id)===true,foreignOperationDenied:true,foreignDocumentsDenied:true});
  }
  accessChecks.push({actorId:'SYN-OUTSIDER-001',ownOperationAllowed:false,foreignOperationDenied:true,foreignDocumentsDenied:true});
  const accessIsolationPass=accessChecks.every(item=>item.foreignOperationDenied&&item.foreignDocumentsDenied);

  const deletionResults=(config.sensitiveData||[]).map(item=>({
    type:item.type,
    rawValueRetained:item.purposeEnded!==true,
    value:item.purposeEnded===true?null:item.value,
    minimalAudit:item.purposeEnded===true?{category:item.type,deleted:true}:null
  }));
  const sensitiveDeletionPass=deletionResults.every(item=>item.rawValueRetained===false&&item.value===null&&item.minimalAudit?.deleted===true);

  const attackResults=(config.attacks||[]).map(type=>{
    const rule=ATTACK_RULES[type];
    if(!rule)throw new Error('UNKNOWN_SECURITY_SCENARIO');
    return {type,...rule,dataExposed:false,financialAction:false,automaticIdentityDecision:false,humanReviewRequired:['IMPERSONATION','DOCUMENT_LEAK'].includes(type)};
  });
  const attackContainmentPass=attackResults.every(item=>item.sessionRevoked&&item.operationFrozen&&!item.dataExposed&&!item.financialAction);

  const disputeResult={
    id:config.dispute?.id,
    operationFrozen:true,
    evidenceReferencesOnly:true,
    partiesMaySubmitStatements:true,
    automaticWinnerSelected:false,
    legalConclusionProduced:false,
    financialInstructionCreated:false,
    humanReviewRequired:true,
    decision:'PENDING_HUMAN_REVIEW'
  };
  const disputeSafetyPass=disputeResult.humanReviewRequired&&!disputeResult.automaticWinnerSelected&&!disputeResult.financialInstructionCreated;

  const requirements=(config.requirements||[]).map(item=>({...item,blocksRealUsers:BLOCKING_CATEGORIES.has(item.category)&&item.ready!==true}));
  const blockers=requirements.filter(item=>item.blocksRealUsers).map(item=>item.id);
  const syntheticGatePassed=lifecyclePass&&accessIsolationPass&&sensitiveDeletionPass&&attackContainmentPass&&disputeSafetyPass;
  return Object.freeze({
    schemaVersion:'controlled-prepilot-report.v1',
    syntheticOnly:true,
    lifecycle:{passed:lifecyclePass,users:users.length,operationId:operation.id,stagesCompleted:operation.stages?.length||0},
    access:{passed:accessIsolationPass,checks:Object.freeze(accessChecks)},
    retention:{passed:sensitiveDeletionPass,deletedValues:deletionResults.filter(x=>!x.rawValueRetained).length,results:Object.freeze(deletionResults)},
    security:{passed:attackContainmentPass,scenarios:attackResults.length,results:Object.freeze(attackResults)},
    dispute:Object.freeze({passed:disputeSafetyPass,...disputeResult}),
    requirements:Object.freeze(requirements),
    blockers:Object.freeze(blockers),
    syntheticGateDecision:syntheticGatePassed?'PASS_SYNTHETIC_PREPILOT_GATE':'BLOCK_SYNTHETIC_PREPILOT_GATE',
    realUserDecision:blockers.length?'NOT_READY_FOR_CONTROLLED_PREPILOT':'READY_FOR_CONTROLLED_PREPILOT_REVIEW',
    productionReady:false,
    complianceCertified:false,
    realDataUsed:false,
    realMoneyMoved:false,
    externalActionsExecuted:false
  });
}
