export function buildConsolidatedSimulationReport(input={}){
  const checks=Object.freeze({
    operationLifecycle:input.operationAssurance?.decision==='PASS_SYNTHETIC_ASSURANCE',
    adversarialRecovery:input.adversarial?.decision==='PASS_SYNTHETIC_ONLY',
    operationalResilience:input.resilience?.decision==='PASS_RESILIENCE',
    fraudAndDisputes:input.disputes?.decision==='PASS_SYNTHETIC_DISPUTES'
  });
  const failedDomains=Object.entries(checks).filter(([,passed])=>!passed).map(([name])=>name);
  const boundaryViolations=Number(input.operationAssurance?.boundaryViolations||0)+Number(input.resilience?.metrics?.boundaryViolations||0)+Number(input.disputes?.unsafeOutcomes||0);
  if(boundaryViolations>0&&!failedDomains.includes('securityBoundaries'))failedDomains.push('securityBoundaries');
  return Object.freeze({
    schemaVersion:'consolidated-simulation-report.v1',
    syntheticOnly:true,
    domainsChecked:Object.keys(checks).length,
    domainsPassed:Object.values(checks).filter(Boolean).length,
    failedDomains:Object.freeze(failedDomains),
    statistics:Object.freeze({
      completeOperationLifecycles:Number(input.operationAssurance?.passedLifecycles||0),
      standardFailureDrills:Number(input.operationAssurance?.drillCount||0),
      adversarialCampaigns:Number(input.adversarial?.campaigns||0),
      combinedFaults:Number(input.adversarial?.faultsInjected||0),
      failedRecoveryAttempts:Number(input.adversarial?.failedRecoveryAttempts||0),
      fraudDisputeCases:Number(input.disputes?.total||0),
      humanDisputeReviews:Number(input.disputes?.humanReviews||0),
      blockedOrFrozenDisputes:Number(input.disputes?.frozenOperations||0),
      boundaryViolations
    }),
    decision:failedDomains.length?'BLOCK_SIMULATION_PROGRAM':'PASS_SIMULATION_PROGRAM',
    realDataUsed:false,
    realMoneyMoved:false,
    externalActionsExecuted:false,
    productionReady:false,
    complianceCertified:false,
    nextBoundary:'REAL_INFRASTRUCTURE_AND_HUMAN_PROCEDURES_REMAIN_UNTESTED'
  });
}
