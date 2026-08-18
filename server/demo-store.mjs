import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const MAX_OPERATIONS=2_000;
const MAX_AUDIT=10_000;
const INITIAL={clients:{A:{id:'A',name:'Cliente A',balance:1250},B:{id:'B',name:'Cliente B',balance:850}},operations:[],audit:[]};
const clone=v=>JSON.parse(JSON.stringify(v));
const finiteMoney=v=>Number.isFinite(v)&&v>=0&&v<=1_000_000;
const auditPayload=e=>JSON.stringify({seq:e.seq,eventId:e.eventId,operationId:e.operationId,actor:e.actor,event:e.event,at:e.at,prevHash:e.prevHash});
const auditHash=e=>crypto.createHash('sha256').update(auditPayload(e)).digest('hex');

function normalizeLegacyAudit(audit=[]){
  let prevHash='GENESIS';
  return audit.map((event,index)=>{
    const normalized={
      ...event,
      seq:index+1,
      eventId:/^AUD-[A-F0-9]{24}$/.test(String(event.eventId||''))?event.eventId:`AUD-${crypto.randomBytes(12).toString('hex').toUpperCase()}`,
      prevHash,
      integrityVersion:1
    };
    normalized.hash=auditHash(normalized);
    prevHash=normalized.hash;
    return normalized;
  });
}

function validateState(parsed){
  if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('BAD_STATE_FILE');
  if(!parsed.clients||typeof parsed.clients!=='object'||!parsed.clients.A||!parsed.clients.B)throw new Error('BAD_STATE_FILE');
  for(const id of ['A','B']){
    const c=parsed.clients[id];
    if(c.id!==id||typeof c.name!=='string'||c.name.length<1||c.name.length>120||!finiteMoney(c.balance))throw new Error('BAD_STATE_FILE');
  }
  if(!Array.isArray(parsed.operations)||parsed.operations.length>MAX_OPERATIONS)throw new Error('BAD_STATE_FILE');
  if(!Array.isArray(parsed.audit)||parsed.audit.length>MAX_AUDIT)throw new Error('BAD_STATE_FILE');
  const ids=new Set();
  for(const op of parsed.operations){
    if(!op||typeof op!=='object'||typeof op.id!=='string'||!/^FIA-P2P-[A-F0-9]{16}$/.test(op.id)||ids.has(op.id))throw new Error('BAD_STATE_FILE');
    ids.add(op.id);
    if(!['A','B'].includes(op.from)||!['A','B'].includes(op.to)||op.from===op.to||!Number.isFinite(op.amount)||op.amount<=0||op.amount>100_000)throw new Error('BAD_STATE_FILE');
    if(typeof op.concept!=='string'||op.concept.length<1||op.concept.length>120)throw new Error('BAD_STATE_FILE');
    if(!['PENDING_RECIPIENT','PROCESSING_DEMO','CONFIRMED_DEMO','REJECTED'].includes(op.status))throw new Error('BAD_STATE_FILE');
    if(op.idempotencyKey!==undefined&&!/^[A-Za-z0-9._:-]{8,80}$/.test(String(op.idempotencyKey)))throw new Error('BAD_STATE_FILE');
    if(op.status==='CONFIRMED_DEMO'&&typeof op.acceptedAt!=='string')throw new Error('BAD_STATE_FILE');
  }
  let expectedPrev='GENESIS';
  for(let index=0;index<parsed.audit.length;index++){
    const event=parsed.audit[index];
    if(!event||typeof event!=='object'||typeof event.event!=='string'||event.event.length>80||typeof event.actor!=='string'||event.actor.length>80)throw new Error('BAD_STATE_FILE');
    if(event.operationId!==null&&!ids.has(event.operationId))throw new Error('BAD_STATE_FILE');
    if(event.seq!==index+1||!/^AUD-[A-F0-9]{24}$/.test(String(event.eventId||''))||event.prevHash!==expectedPrev||event.integrityVersion!==1)throw new Error('BAD_AUDIT_CHAIN');
    if(!/^[a-f0-9]{64}$/.test(String(event.hash||''))||event.hash!==auditHash(event))throw new Error('BAD_AUDIT_CHAIN');
    expectedPrev=event.hash;
  }
  return parsed;
}

export function createDemoStore(filePath=''){
  let state=clone(INITIAL);
  let queue=Promise.resolve();
  const persistent=Boolean(filePath);

  async function load(){
    if(!persistent)return snapshotAll();
    try{
      const raw=await fs.readFile(filePath,'utf8');
      const parsed=JSON.parse(raw);
      if(Array.isArray(parsed?.audit)&&parsed.audit.some(e=>!e?.integrityVersion))parsed.audit=normalizeLegacyAudit(parsed.audit);
      state=validateState(parsed);
      await persist();
    }catch(error){
      if(error?.code!=='ENOENT')throw error;
      await persist();
    }
    return snapshotAll();
  }

  function snapshotAll(){return clone(state)}

  async function persist(){
    if(!persistent)return;
    await fs.mkdir(path.dirname(filePath),{recursive:true});
    const tmp=`${filePath}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp,JSON.stringify(state),{encoding:'utf8',mode:0o600});
    await fs.rename(tmp,filePath);
  }

  function enforceBounds(s){
    if(s.operations.length>MAX_OPERATIONS)s.operations.length=MAX_OPERATIONS;
    if(s.audit.length>MAX_AUDIT)throw new Error('AUDIT_LIMIT_REACHED');
  }

  function transact(mutator){
    const run=async()=>{
      const before=clone(state);
      try{
        const result=await mutator(state);
        enforceBounds(state);
        validateState(state);
        await persist();
        return clone(result);
      }catch(error){
        state=before;
        throw error;
      }
    };
    const next=queue.then(run,run);
    queue=next.then(()=>undefined,()=>undefined);
    return next;
  }

  async function reset(){
    return transact(s=>{
      s.clients=clone(INITIAL.clients);s.operations=[];s.audit=[];
      return s;
    });
  }

  return {load,transact,snapshotAll,reset,persistent,filePath};
}
