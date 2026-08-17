(function(global){'use strict';
const VERSION='0.1-demo';
const MAX_INPUT=2000;
const ALLOWED_ACTIONS=['CLASSIFY','PREPARE_CHECKLIST','DRAFT_REPLY','FOLLOW_UP','ESCALATE'];
const BLOCKED_ACTIONS=['MOVE_FUNDS','APPROVE_PAYMENT','REFUND','CHANGE_IDENTITY','EXPORT_SENSITIVE_DATA','DELETE_RECORDS'];
function cleanText(value){return String(value||'').replace(/[<>]/g,'').replace(/[\u0000-\u001F\u007F]/g,' ').trim().slice(0,MAX_INPUT)}
function riskFlags(text){const t=String(text||'').toLowerCase();const flags=[];if(/ignore|olvida|system prompt|developer message|instrucciones anteriores/.test(t))flags.push('PROMPT_INJECTION');if(/password|contraseña|api[_ -]?key|secret|token|cvv|pin\b/.test(t))flags.push('SENSITIVE_DATA');if(/transfer|transferir|pagar|payment|refund|reembolso|mover fondos/.test(t))flags.push('FINANCIAL_ACTION');return flags}
function classify(text){const t=cleanText(text);const flags=riskFlags(t);let category='GENERAL';if(/document|factura|contrato|dni|identidad/.test(t.toLowerCase()))category='DOCUMENTATION';if(/estado|seguimiento|cuando|pendiente/.test(t.toLowerCase()))category='FOLLOW_UP';if(/problema|reclama|disputa|fraude|error/.test(t.toLowerCase()))category='INCIDENT';return {category,flags,requiresHuman:flags.length>0||category==='INCIDENT'} }
function authorize(action){action=String(action||'').toUpperCase();if(BLOCKED_ACTIONS.includes(action))return {allowed:false,reason:'HIGH_IMPACT_REQUIRES_HUMAN'};if(!ALLOWED_ACTIONS.includes(action))return {allowed:false,reason:'ACTION_NOT_ALLOWLISTED'};return {allowed:true,reason:'LOW_RISK_DEMO_ACTION'} }
function process(input){const text=cleanText(input);const c=classify(text);const proposed=c.requiresHuman?'ESCALATE':(c.category==='FOLLOW_UP'?'FOLLOW_UP':'PREPARE_CHECKLIST');const auth=authorize(proposed);return {version:VERSION,mode:'DEMO_ONLY',inputPreview:text.slice(0,160),category:c.category,riskFlags:c.flags,proposedAction:proposed,authorization:auth,humanApprovalRequired:c.requiresHuman,noFinancialAuthority:true,noPersistentMemory:true,productionExecutionEnabled:false};}
global.FIACOAgentSecurity={version:VERSION,allowedActions:ALLOWED_ACTIONS,blockedActions:BLOCKED_ACTIONS,cleanText,riskFlags,classify,authorize,process};
})(typeof window!=='undefined'?window:globalThis);
