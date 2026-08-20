(function(global){'use strict';
const DEMO_ONLY=true;
function frozenResult(provider,action,payload){return Object.freeze({provider,action,status:'MOCK_ONLY',demo:true,receivedFields:Object.keys(payload||{}),message:'Adaptador demostrativo: no se ha contactado ningún proveedor externo.'});}
function makeAdapter(name,allowed,meta={}){return Object.freeze({name,mode:'MOCK_ONLY',capabilities:Object.freeze([...allowed]),meta:Object.freeze({...meta}),async execute(action,payload={}){if(!DEMO_ONLY)throw new Error('Provider adapters are locked to demo mode');if(!allowed.includes(action))throw new Error('Action not allowed by demo adapter');return frozenResult(name,action,payload);}});}
const adapters=Object.freeze({
 payments:makeAdapter('LOCAL_PAYMENT_MOCK',['quote','validate','prepare','status'],{custodyDefault:'non-custodial',productionEnabled:false}),
 identity:makeAdapter('LOCAL_IDENTITY_MOCK',['check_requirements','validate_shape','status','explain'],{kycKybPrepared:true,productionEnabled:false}),
 fraud:makeAdapter('LOCAL_FRAUD_MOCK',['observe','score','explain'],{directEnforcementAllowed:false}),
 securityTelemetry:makeAdapter('LOCAL_SECURITY_TELEMETRY_MOCK',['normalize','preview_export'],{fortinetPrepared:true,externalExportEnabled:false}),
 premiumAgent:makeAdapter('LOCAL_PREMIUM_AGENT_MOCK',['observe','recommend'],{mode:'shadow-read-only',executionEnabled:false}),
 humanReview:makeAdapter('LOCAL_HUMAN_REVIEW_MOCK',['create_demo_request','status'],{requiredForSensitiveFutureActions:true})
});
global.FIAProviderAdapters=Object.freeze({DEMO_ONLY,productionEnabled:false,networkCallsEnabled:false,adapters,get(type){return adapters[type]||null;}});
})(window);