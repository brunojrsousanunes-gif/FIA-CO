const FORBIDDEN=new Set(['REAL_PERSONAL_DATA','REAL_MONEY','BIOMETRICS','PRODUCTION_SECRETS','AUTOMATIC_DISPUTE_VERDICT','EXTERNAL_ACTION']);

export function attemptPrepilotBlockerResolution(config={}){
  if(config.syntheticOnly!==true||config.zeroCost!==true)throw new Error('SYNTHETIC_ZERO_COST_ONLY');
  for(const item of config.forbidden||[])if(!FORBIDDEN.has(item))throw new Error('UNKNOWN_BOUNDARY');
  const project=config.project||{};
  const attempts=(config.controls||[]).map(control=>{
    const missing=control.requires.filter(key=>project[key]==null);
    return Object.freeze({
      id:control.id,category:control.category,status:'PREPARED_SYNTHETIC',
      preparedArtifacts:Object.freeze([...control.preparedArtifacts]),
      missingRealInputs:Object.freeze(missing),
      externalDependency:control.externalDependency===true,
      resolvedForRealUsers:false,safeToImplementNow:true
    });
  });
  const artifactsPrepared=attempts.reduce((sum,x)=>sum+x.preparedArtifacts.length,0);
  const externalDependencies=attempts.filter(x=>x.externalDependency).length;
  return Object.freeze({
    schemaVersion:'prepilot-blocker-resolution-report.v1',syntheticOnly:true,zeroCost:true,
    blockersAttempted:attempts.length,
    blockersPrepared:attempts.filter(x=>x.status==='PREPARED_SYNTHETIC').length,
    blockersResolvedForRealUsers:attempts.filter(x=>x.resolvedForRealUsers).length,
    blockersRemaining:attempts.filter(x=>!x.resolvedForRealUsers).length,
    artifactsPrepared,externalDependencies,attempts:Object.freeze(attempts),
    decision:attempts.every(x=>x.status==='PREPARED_SYNTHETIC')?'PASS_SYNTHETIC_PREPARATION':'BLOCK_SYNTHETIC_PREPARATION',
    realUserDecision:'NOT_READY_FOR_REAL_USERS',
    automaticLegalApproval:false,automaticDisputeVerdict:false,productionSecretsUsed:false,
    biometricsUsed:false,realDataUsed:false,realMoneyMoved:false,externalActionsExecuted:false,
    complianceCertified:false,productionReady:false
  });
}
