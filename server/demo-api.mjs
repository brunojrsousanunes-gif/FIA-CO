import http from 'node:http';
import crypto from 'node:crypto';
import {createDemoStore} from './demo-store.mjs';

const MAX_BODY=16_384;
const MAX_AMOUNT=100_000;
const SESSION_TTL_MS=15*60*1000;
const RATE_WINDOW_MS=60*1000;
const RATE_MAX=60;
const sessions=new Map();
const rate=new Map();
const safe=s=>String(s??'').trim().replace(/[<>]/g,'').slice(0,120);
const ref=()=>`FIA-P2P-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
const now=()=>Date.now();
const secrets=()=>({A:process.env.FIA_DEMO_SECRET_A||'',B:process.env.FIA_DEMO_SECRET_B||''});
const allowedOrigins=()=>new Set((process.env.FIA_DEMO_ALLOWED_ORIGINS||'').split(',').map(v=>v.trim()).filter(Boolean));
const same=(a,b)=>{const aa=Buffer.from(String(a)),bb=Buffer.from(String(b));return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb)};
function securityHeaders(res){res.setHeader('cache-control','no-store');res.setHeader('x-content-type-options','nosniff');res.setHeader('x-frame-options','DENY');res.setHeader('referrer-policy','no-referrer');res.setHeader('content-security-policy',"default-src 'none'; frame-ancestors 'none'; base-uri 'none'")}
function corsHeaders(req,res){const origin=req.headers.origin;if(origin&&allowedOrigins().has(origin)){res.setHeader('access-control-allow-origin',origin);res.setHeader('vary','Origin');res.setHeader('access-control-allow-methods','GET, POST, OPTIONS');res.setHeader('access-control-allow-headers','Authorization, Content-Type');res.setHeader('access-control-max-age','600')}}
const json=(res,code,data)=>{securityHeaders(res);res.setHeader('content-type','application/json; charset=utf-8');res.statusCode=code;if(code===204)return res.end();res.end(JSON.stringify(data))};
function checkOrigin(req){const origin=req.headers.origin;if(!origin)return true;const allow=allowedOrigins();return allow.size>0&&allow.has(origin)}
function throttle(req){const key=req.socket.remoteAddress||'unknown',t=now();let rec=rate.get(key);if(!rec||t-rec.start>=RATE_WINDOW_MS)rec={start:t,count:0};rec.count++;rate.set(key,rec);return rec.count<=RATE_MAX}
async function body(req){let size=0,chunks=[];for await(const c of req){size+=c.length;if(size>MAX_BODY)throw new Error('BODY_TOO_LARGE');chunks.push(c)}let parsed;try{parsed=JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}')}catch{throw new Error('BAD_JSON')}return parsed}
function client(state,id){if(!state.clients[id])throw new Error('BAD_CLIENT');return state.clients[id]}
function issueSession(id){const token=crypto.randomBytes(32).toString('base64url');sessions.set(token,{id,expiresAt:now()+SESSION_TTL_MS});return {token,expiresIn:SESSION_TTL_MS/1000}}
function auth(req){const raw=String(req.headers.authorization||'');if(!raw.startsWith('Bearer '))return null;const token=raw.slice(7);const s=sessions.get(token);if(!s)return null;if(s.expiresAt<=now()){sessions.delete(token);return null}return s.id}
function snapshot(state,id){client(state,id);return {client:{...state.clients[id]},operations:state.operations.filter(o=>o.from===id||o.to===id),audit:state.audit.filter(a=>(a.operationId===null&&a.actor===id)||state.operations.some(o=>o.id===a.operationId&&(o.from===id||o.to===id)))}}
function createOperation(state,actor,p){const to=safe(p.to);if(actor===to)throw new Error('SAME_CLIENT');client(state,to);const amount=Math.round(Number(p.amount)*100)/100;if(!Number.isFinite(amount)||amount<=0||amount>MAX_AMOUNT)throw new Error('BAD_AMOUNT');if(client(state,actor).balance<amount)throw new Error('NO_BALANCE');const concept=safe(p.concept);if(!concept)throw new Error('BAD_CONCEPT');const op={id:ref(),from:actor,to,amount,concept,status:'PENDING_RECIPIENT',createdAt:new Date().toISOString()};state.operations.unshift(op);state.audit.push({operationId:op.id,actor,event:'CREATED',at:new Date().toISOString()});return op}
function decide(state,actor,id,decision){const op=state.operations.find(o=>o.id===id);if(!op)throw new Error('NOT_FOUND');if(op.to!==actor)throw new Error('FORBIDDEN');if(op.status!=='PENDING_RECIPIENT')throw new Error('ALREADY_DECIDED');if(decision==='reject'){op.status='REJECTED';state.audit.push({operationId:id,actor,event:'REJECTED',at:new Date().toISOString()});return op}if(decision!=='accept')throw new Error('BAD_DECISION');const sender=client(state,op.from),receiver=client(state,op.to);if(sender.balance<op.amount)throw new Error('NO_BALANCE');op.status='PROCESSING_DEMO';sender.balance=Math.round((sender.balance-op.amount)*100)/100;receiver.balance=Math.round((receiver.balance+op.amount)*100)/100;op.status='CONFIRMED_DEMO';op.acceptedAt=new Date().toISOString();state.audit.push({operationId:id,actor,event:'ACCEPTED',at:new Date().toISOString()},{operationId:id,actor:'SYSTEM',event:'BALANCES_UPDATED_DEMO',at:new Date().toISOString()});return op}

export async function createDemoServer({stateFile=process.env.FIA_DEMO_STATE_FILE||''}={}){
  const store=createDemoStore(stateFile);await store.load();
  const server=http.createServer(async(req,res)=>{try{
    if(!throttle(req))return json(res,429,{error:'RATE_LIMITED'});
    if(!checkOrigin(req))return json(res,403,{error:'ORIGIN_FORBIDDEN'});
    corsHeaders(req,res);
    if(req.method==='OPTIONS')return json(res,204,{});
    if(req.method==='GET'&&req.url==='/health')return json(res,200,{ok:true,mode:'demo',realFunds:false,persistent:store.persistent});
    if(req.method==='POST'&&req.url==='/session'){
      const p=await body(req),id=safe(p.clientId),secret=String(p.secret||''),cfg=secrets(),state=store.snapshotAll();client(state,id);
      if(!cfg[id])return json(res,503,{error:'DEMO_SECRET_NOT_CONFIGURED'});
      if(!same(secret,cfg[id]))return json(res,401,{error:'UNAUTHORIZED'});
      await store.transact(s=>{s.audit.push({operationId:null,actor:id,event:'SESSION_CREATED',at:new Date().toISOString()});return null});
      return json(res,201,issueSession(id));
    }
    const actor=auth(req);if(!actor)return json(res,401,{error:'UNAUTHORIZED'});
    if(req.method==='POST'&&req.url==='/logout'){const token=String(req.headers.authorization||'').slice(7);sessions.delete(token);return json(res,204,{})}
    if(req.method==='GET'&&req.url==='/state')return json(res,200,snapshot(store.snapshotAll(),actor));
    if(req.method==='POST'&&req.url==='/operations'){const p=await body(req);return json(res,201,await store.transact(s=>createOperation(s,actor,p)))}
    const m=req.url?.match(/^\/operations\/([A-Z0-9-]+)\/decision$/);if(req.method==='POST'&&m){const p=await body(req);return json(res,200,await store.transact(s=>decide(s,actor,m[1],p.decision)))}
    return json(res,404,{error:'NOT_FOUND'});
  }catch(e){const map={BODY_TOO_LARGE:413,BAD_JSON:400,BAD_CLIENT:400,SAME_CLIENT:400,BAD_AMOUNT:400,NO_BALANCE:409,BAD_CONCEPT:400,NOT_FOUND:404,FORBIDDEN:403,ALREADY_DECIDED:409,BAD_DECISION:400,BAD_STATE_FILE:500};return json(res,map[e.message]||400,{error:e.message||'BAD_REQUEST'})}});
  server.demoStore=store;return server;
}
export async function resetDemoState(server){sessions.clear();rate.clear();if(server?.demoStore)await server.demoStore.reset()}
if(import.meta.url===`file://${process.argv[1]}`){if(!process.env.FIA_DEMO_SECRET_A||!process.env.FIA_DEMO_SECRET_B){console.error('Faltan FIA_DEMO_SECRET_A / FIA_DEMO_SECRET_B');process.exit(1)}const port=Number(process.env.PORT||8787);const server=await createDemoServer();server.listen(port,'127.0.0.1',()=>console.log(`FIA&CO hardened demo API en http://127.0.0.1:${port}`))}
