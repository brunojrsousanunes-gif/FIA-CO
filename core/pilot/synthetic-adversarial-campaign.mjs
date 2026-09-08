import { createMemoryAuditLog, verifyAuditSnapshot, AuditIntegrityError } from '../audit/audit-log.mjs';
import { createTrustEvidenceManifest, verifyTrustEvidenceManifest } from '../trust/trust-evidence-manifest.mjs';
import { runSyntheticFailureDrill } from './synthetic-failure-drills.mjs';

function assertSynthetic(input){
  if(input?.syntheticOnly!==true) throw new Error('SYNTHETIC_CAMPAIGN_ONLY');
}

function evaluateRecovery(attempts=[]){
  const ordered=[...attempts].sort((a,b)=>a.attempt-b.attempt);
  const recovered=ordered.find(item=>item.status==='RECOVERED'&&Array.isArray(item.evidence)&&item.evidence.length>0);
  return Object.freeze({
    attempts:ordered.length,
    failedAttempts:ordered.filter(item=>item.status==='FAILED').length,
    recovered:Boolean(recovered),
    recoveryEvidence:Object.freeze(recovered?.evidence||[]),
    decision:recovered?'RECOVERY_VERIFIED':'KEEP_BLOCKED'
  });
}

export function classifyMissingDocumentation(stage='SYNTHETIC_DEVELOPMENT'){
  const normalized=String(stage).toUpperCase();
  if(normalized==='PRODUCTION_ACTIVATION') return Object.freeze({severity:'CRITICAL',decision:'BLOCK_ACTIVATION'});
  if(normalized==='CONTROLLED_PREPILOT') return Object.freeze({severity:'HIGH',decision:'BLOCK_PREPILOT'});
  return Object.freeze({severity:'LOW',decision:'CONTINUE_WITH_SYNTHETIC_PLACEHOLDER'});
}

export async function runSyntheticAdversarialCampaign(input={}){
  assertSynthetic(input);
  const drills=(input.faults||[]).map((type,index)=>runSyntheticFailureDrill({
    id:`${input.id}-${index+1}`,type,synthetic:true
  }));
  const recovery=evaluateRecovery(input.recoveryAttempts);

  let sequence=0;
  const audit=createMemoryAuditLog({
    idFactory:()=>`audit-synthetic-${++sequence}`,
    clock:()=>`2026-09-09T00:0${sequence}:00.000Z`
  });
  await audit.append({organizationId:'org-synthetic',operationId:input.id,actorId:'synthetic-system',action:'CAMPAIGN_STARTED',state:'ACTIVE',version:1});
  await audit.append({organizationId:'org-synthetic',operationId:input.id,actorId:'synthetic-reviewer',action:'RECOVERY_REVIEWED',state:recovery.recovered?'RECOVERED':'BLOCKED',version:2});
  const validAudit=await audit.list({organizationId:'org-synthetic'});
  const alteredAudit=structuredClone(validAudit);
  alteredAudit[0].action='TAMPERED_ACTION';
  let auditTamperDetected=false;
  try{verifyAuditSnapshot(alteredAudit,'org-synthetic');}catch(error){
    if(!(error instanceof AuditIntegrityError)) throw error;
    auditTamperDetected=true;
  }
  const missingAudit=validAudit.slice(1);
  let auditDeletionDetected=false;
  try{verifyAuditSnapshot(missingAudit,'org-synthetic');}catch(error){
    if(!(error instanceof AuditIntegrityError)) throw error;
    auditDeletionDetected=true;
  }

  const manifest=createTrustEvidenceManifest({
    operationId:input.id,organizationId:'org-synthetic',
    artifacts:[{id:'campaign-result',kind:'synthetic',digest:'a'.repeat(64)}]
  },{now:'2026-09-09T00:10:00.000Z'});
  const alteredManifest={...manifest,operationId:'tampered-operation'};
  const evidenceTamperDetected=!verifyTrustEvidenceManifest(alteredManifest);

  const blockingReasons=[];
  if(!recovery.recovered) blockingReasons.push('RECOVERY_NOT_VERIFIED');
  if(!auditTamperDetected) blockingReasons.push('AUDIT_TAMPER_NOT_DETECTED');
  if(!auditDeletionDetected) blockingReasons.push('AUDIT_DELETION_NOT_DETECTED');
  if(!evidenceTamperDetected) blockingReasons.push('EVIDENCE_TAMPER_NOT_DETECTED');

  return Object.freeze({
    schemaVersion:'synthetic-adversarial-campaign.v1',
    campaignId:String(input.id),
    syntheticOnly:true,
    faultsInjected:drills.length,
    drills:Object.freeze(drills),
    recovery,
    integrity:Object.freeze({
      validAuditVerified:verifyAuditSnapshot(validAudit,'org-synthetic'),
      auditTamperDetected,
      auditDeletionDetected,
      evidenceTamperDetected
    }),
    decision:blockingReasons.length?'BLOCK':'PASS_ADVERSARIAL',
    blockingReasons:Object.freeze(blockingReasons),
    realDataUsed:false,
    realMoneyMoved:false,
    externalActionsExecuted:false,
    productionReady:false
  });
}

export function summarizeAdversarialCampaign(results=[]){
  const passed=results.filter(item=>item.decision==='PASS_ADVERSARIAL').length;
  const failedRecoveryAttempts=results.reduce((sum,item)=>sum+item.recovery.failedAttempts,0);
  return Object.freeze({
    schemaVersion:'synthetic-adversarial-summary.v1',
    campaigns:results.length,
    passed,
    blocked:results.length-passed,
    faultsInjected:results.reduce((sum,item)=>sum+item.faultsInjected,0),
    failedRecoveryAttempts,
    tamperChecksPassed:results.every(item=>
      item.integrity.auditTamperDetected&&item.integrity.auditDeletionDetected&&item.integrity.evidenceTamperDetected
    ),
    decision:passed===results.length?'PASS_SYNTHETIC_ONLY':'BLOCK',
    productionReady:false
  });
}
