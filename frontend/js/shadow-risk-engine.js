(function(global){'use strict';
const ALLOWED_RESULTS=Object.freeze(['OBSERVE_ONLY','SUGGEST_REVIEW','SUGGEST_BLOCK']);
const DEFAULT_POLICY=Object.freeze({version:'b2-r-v0.1',highValueThreshold:3000,reviewOnDispute:true,reviewOnLowConfidence:true,blockSuggestionOnMissingCriticalEvidence:true});
function clonePlain(value){return JSON.parse(JSON.stringify(value||{}));}
function normalize(snapshot){const s=clonePlain(snapshot);return Object.freeze({amount:Number.isFinite(Number(s.amount))?Number(s.amount):0,criticalEvidenceComplete:s.criticalEvidenceComplete===true,identityConsistent:s.identityConsistent!==false,hasDispute:s.hasDispute===true,confidence:Number.isFinite(Number(s.confidence))?Math.max(0,Math.min(1,Number(s.confidence))):1});}
function evaluate(snapshot,policy=DEFAULT_POLICY){const s=normalize(snapshot),p=Object.freeze({...DEFAULT_POLICY,...clonePlain(policy)});const reasons=[];let result='OBSERVE_ONLY';
if(!s.criticalEvidenceComplete&&p.blockSuggestionOnMissingCriticalEvidence){result='SUGGEST_BLOCK';reasons.push('MISSING_CRITICAL_EVIDENCE');}
if(!s.identityConsistent&&result!=='SUGGEST_BLOCK'){result='SUGGEST_REVIEW';reasons.push('IDENTITY_INCONSISTENT');}
if(s.amount>=p.highValueThreshold&&result==='OBSERVE_ONLY'){result='SUGGEST_REVIEW';reasons.push('HIGH_VALUE');}
if(s.hasDispute&&p.reviewOnDispute&&result==='OBSERVE_ONLY'){result='SUGGEST_REVIEW';reasons.push('DISPUTE_PRESENT');}
if(s.confidence<0.6&&p.reviewOnLowConfidence&&result==='OBSERVE_ONLY'){result='SUGGEST_REVIEW';reasons.push('LOW_CONFIDENCE');}
if(!reasons.length)reasons.push('NO_REVIEW_SIGNAL');
if(!ALLOWED_RESULTS.includes(result))throw new Error('Unsafe shadow result');
return Object.freeze({mode:'SHADOW_READ_ONLY',result,reasons:Object.freeze(reasons),policyVersion:String(p.version||'unknown'),snapshot:Object.freeze({...s}),enforcement:false,writeCapabilities:Object.freeze([])});}
global.FIACOShadowRiskEngine=Object.freeze({mode:'SHADOW_READ_ONLY',ALLOWED_RESULTS,DEFAULT_POLICY,normalize,evaluate});
})(typeof window!=='undefined'?window:globalThis);
