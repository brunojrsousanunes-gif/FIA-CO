(function(global){
'use strict';
const MAX_AMOUNT=100000;
function money(v){const n=Number(v);if(!Number.isFinite(n)||n<=0||n>MAX_AMOUNT)throw new Error('Importe no válido');return Math.round(n*100)/100}
function safeText(v,max=80){const s=String(v||'').trim();if(!s||s.length>max)throw new Error('Dato no válido');return s.replace(/[<>]/g,'')}
function makeRef(){const a=new Uint32Array(2);global.crypto.getRandomValues(a);return 'FIA-P2P-'+Array.from(a,x=>x.toString(16).padStart(8,'0')).join('').toUpperCase()}
function createDemoState(){return {version:1,clients:{A:{id:'A',name:'Cliente A',balance:1250},B:{id:'B',name:'Cliente B',balance:850}},operations:[],audit:[]}}
function log(state,operationId,actor,event){state.audit.push({operationId,actor,event,at:new Date().toISOString()})}
function getClient(state,id){const c=state.clients[id];if(!c)throw new Error('Cliente no válido');return c}
function createTransfer(state,{from,to,amount,concept}){if(from===to)throw new Error('Origen y destino deben ser distintos');const sender=getClient(state,from);getClient(state,to);const value=money(amount);if(sender.balance<value)throw new Error('Saldo demo insuficiente');const op={id:makeRef(),type:'P2P_TRANSFER',from,to,amount:value,concept:safeText(concept,120),status:'PENDING_RECIPIENT',createdAt:new Date().toISOString(),acceptedAt:null};state.operations.unshift(op);log(state,op.id,from,'CREATED');return op}
function decideTransfer(state,{operationId,actor,decision}){const op=state.operations.find(x=>x.id===operationId);if(!op)throw new Error('Operación no encontrada');if(op.status!=='PENDING_RECIPIENT')throw new Error('La operación ya fue decidida');if(actor!==op.to)throw new Error('Solo el destinatario puede decidir');if(decision==='reject'){op.status='REJECTED';log(state,op.id,actor,'REJECTED');return op}if(decision!=='accept')throw new Error('Decisión no válida');const sender=getClient(state,op.from),recipient=getClient(state,op.to);if(sender.balance<op.amount)throw new Error('Saldo insuficiente al confirmar');sender.balance=Math.round((sender.balance-op.amount)*100)/100;recipient.balance=Math.round((recipient.balance+op.amount)*100)/100;op.status='CONFIRMED_DEMO';op.acceptedAt=new Date().toISOString();log(state,op.id,actor,'ACCEPTED');log(state,op.id,'SYSTEM','BALANCES_UPDATED_DEMO');return op}
function snapshotFor(state,actor){getClient(state,actor);return {client:{...state.clients[actor]},operations:state.operations.filter(o=>o.from===actor||o.to===actor).map(o=>({...o,direction:o.from===actor?'OUT':'IN'})),audit:state.audit.filter(a=>state.operations.some(o=>o.id===a.operationId&&(o.from===actor||o.to===actor))).map(a=>({...a}))}}
function reset(state){const fresh=createDemoState();Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,fresh);return state}
global.FIAP2P={createDemoState,createTransfer,decideTransfer,snapshotFor,reset,MAX_AMOUNT};
})(typeof globalThis!=='undefined'?globalThis:window);
