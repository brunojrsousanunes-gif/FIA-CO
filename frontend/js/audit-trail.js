(function(global){'use strict';
const VERSION='0.1-demo';
const TYPES=['FLOW_CREATED','CLASSIFIED','TASK_DRAFTED','ESCALATED','METRIC_SNAPSHOT','CAPITAL_PACK_PREPARED','PROVIDER_POLICY_CHECKED','PILOT_GATE_CHECKED','PRODUCTION_GATE_CHECKED'];
const STATUSES=['SIMULATED','DRAFTED','QUEUED','ESCALATED','CHECKED','BLOCKED','READY'];
const FORBIDDEN=['company','description','email','phone','iban','card','token','secret','password','candidate','personaldata','pii'];
function clean(v,max){return String(v||'').replace(/[<>]/g,'').trim().slice(0,max||80);}
function hasForbidden(input){return Object.keys(input||{}).some(k=>FORBIDDEN.some(x=>String(k).toLowerCase().includes(x)));}
function event(input){input=input||{};if(hasForbidden(input))throw new Error('El evento contiene un campo no permitido para auditoría segura');const type=clean(input.type,40).toUpperCase(),status=clean(input.status,30).toUpperCase();if(!TYPES.includes(type))throw new Error('Tipo de evento no permitido');if(!STATUSES.includes(status))throw new Error('Estado de auditoría no permitido');const timestamp=Number(input.timestamp);return {version:VERSION,timestamp:Number.isFinite(timestamp)&&timestamp>0?Math.floor(timestamp):Date.now(),entityId:clean(input.entityId,50),type,status,reasonCode:clean(input.reasonCode,60).toUpperCase(),actor:input.actor==='FOUNDER'?'FOUNDER':'SYSTEM_DEMO',containsPersonalData:false,persistentStorage:false,remoteLogging:false};}
function append(list,input,max){const next=(Array.isArray(list)?list:[]).slice();next.push(event(input));const limit=Math.max(1,Math.min(1000,Number(max)||500));return next.slice(-limit);}
function summarize(list){const events=Array.isArray(list)?list:[],byType={},byStatus={};events.forEach(e=>{byType[e.type]=(byType[e.type]||0)+1;byStatus[e.status]=(byStatus[e.status]||0)+1;});return {count:events.length,byType,byStatus,containsPersonalData:false,persistentStorage:false,remoteLogging:false};}
global.FIACOAuditTrail={version:VERSION,types:TYPES,statuses:STATUSES,event,append,summarize};
})(typeof window!=='undefined'?window:globalThis);
