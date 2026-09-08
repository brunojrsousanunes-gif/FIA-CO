const SEVERITY_WEIGHT=Object.freeze({LOW:1,MEDIUM:2,HIGH:3,CRITICAL:4});
const CLOSURE_EVIDENCE=Object.freeze(['DETECTION_RECORDED','CONTAINMENT_VERIFIED','RECOVERY_TEST_PASSED']);

function countBy(items,key){
  return Object.freeze(items.reduce((acc,item)=>{
    const value=String(item?.[key]||'UNKNOWN');
    acc[value]=(acc[value]||0)+1;
    return acc;
  },{}));
}

function unique(values){return Object.freeze([...new Set(values.filter(Boolean))]);}

export function buildSyntheticAssuranceReport(results = []) {
  if (!Array.isArray(results)||results.length===0) throw new Error('SYNTHETIC_RESULTS_REQUIRED');
  const invalidBoundaries=results.filter(result=>
    result?.syntheticOnly!==true||
    result?.realDataUsed!==false||
    result?.realMoneyMoved!==false||
    result?.externalActionsExecuted!==false||
    result?.productionReady!==false
  );
  const drills=results.flatMap(result=>Array.isArray(result?.faultDrills)?result.faultDrills:[]);
  const invalidDrills=drills.filter(drill=>
    drill.syntheticOnly!==true||
    drill.realIncident!==false||
    drill.externalActionsExecuted!==false||
    drill.productionStateChanged!==false||
    drill.status!=='DRILL_COMPLETED'
  );
  const missingProtocols=drills.filter(drill=>
    !Array.isArray(drill.prevent)||drill.prevent.length===0||
    !Array.isArray(drill.contain)||drill.contain.length===0||
    !Array.isArray(drill.recover)||drill.recover.length===0
  );
  const incompleteClosure=drills.filter(drill=>
    !Array.isArray(drill.closureEvidenceRequired)||
    !CLOSURE_EVIDENCE.every(item=>drill.closureEvidenceRequired.includes(item))
  );
  const lifecycleFailures=results.filter(result=>
    result.status!=='LIFECYCLE_PASS'||result.finalOperation?.state!=='CLOSED'
  );
  const totalRiskWeight=drills.reduce((sum,drill)=>sum+(SEVERITY_WEIGHT[drill.severity]||4),0);
  const blockingFindings=[
    ...invalidBoundaries.map(item=>`BOUNDARY:${item.lifecycleId||'UNKNOWN'}`),
    ...invalidDrills.map(item=>`DRILL:${item.drillId||'UNKNOWN'}`),
    ...missingProtocols.map(item=>`PROTOCOL:${item.drillId||'UNKNOWN'}`),
    ...incompleteClosure.map(item=>`CLOSURE:${item.drillId||'UNKNOWN'}`),
    ...lifecycleFailures.map(item=>`LIFECYCLE:${item.lifecycleId||'UNKNOWN'}`)
  ];

  return Object.freeze({
    schemaVersion:'synthetic-assurance-report.v1',
    generatedFromSyntheticDataOnly:true,
    lifecycleCount:results.length,
    passedLifecycles:results.length-lifecycleFailures.length,
    drillCount:drills.length,
    severityCoverage:countBy(drills,'severity'),
    decisionCoverage:countBy(drills,'decision'),
    responsibleRoles:unique(drills.map(item=>item.responsibleRole)),
    totalRiskWeight,
    boundaryViolations:invalidBoundaries.length,
    protocolGaps:missingProtocols.length,
    closureGaps:incompleteClosure.length,
    blockingFindings:unique(blockingFindings),
    decision:blockingFindings.length?'BLOCK_REGRESSION':'PASS_SYNTHETIC_ASSURANCE',
    safeToContinueSynthetic:blockingFindings.length===0,
    productionReady:false,
    marketValidated:false,
    complianceCertified:false,
    residualRisk:'REAL_INFRASTRUCTURE_AND_HUMAN_PROCEDURES_UNTESTED',
    nextAction:blockingFindings.length?'FIX_AND_REPLAY':'CONTINUE_SYNTHETIC_REGRESSION'
  });
}

export function compareSyntheticAssuranceReports(previous,current){
  if(!previous||!current) throw new Error('TWO_REPORTS_REQUIRED');
  const regressions=[];
  if(current.boundaryViolations>previous.boundaryViolations) regressions.push('BOUNDARY_VIOLATIONS_INCREASED');
  if(current.protocolGaps>previous.protocolGaps) regressions.push('PROTOCOL_GAPS_INCREASED');
  if(current.closureGaps>previous.closureGaps) regressions.push('CLOSURE_GAPS_INCREASED');
  if(current.passedLifecycles<previous.passedLifecycles) regressions.push('PASSED_LIFECYCLES_DECREASED');
  return Object.freeze({
    schemaVersion:'synthetic-assurance-comparison.v1',
    decision:regressions.length?'REGRESSION':'NO_REGRESSION',
    regressions:Object.freeze(regressions),
    productionConclusionAllowed:false
  });
}
