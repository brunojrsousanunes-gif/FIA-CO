import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createDemoServer,resetDemoState} from '../server/demo-api.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ok=(v,m)=>{if(!v)throw new Error(m)};
const eq=(a,b,m)=>{if(a!==b)throw new Error(`${m}: esperado ${b}, obtenido ${a}`)};

// SEC-3D: supply-chain baseline. Actions must be immutable SHA pins.
const workflowsDir=path.join(root,'.github','workflows');
for(const name of fs.readdirSync(workflowsDir).filter(n=>/\.ya?ml$/.test(n))){
  const text=fs.readFileSync(path.join(workflowsDir,name),'utf8');
  const uses=[...text.matchAll(/^\s*-?\s*uses:\s*([^\s#]+)/gm)].map(m=>m[1]);
  for(const spec of uses)ok(/@[a-f0-9]{40}$/i.test(spec),`${name}: action sin pin SHA inmutable: ${spec}`);
  ok(/\bpermissions\s*:/m.test(text),`${name}: workflow sin declaración de permissions`);
}

// SEC-3E: critical security pages run without inline JS and with CSP.
for(const rel of ['frontend/identity.html','frontend/production-gate.html']){
  const html=fs.readFileSync(path.join(root,rel),'utf8');
  ok(html.includes('Content-Security-Policy'),`${rel}: falta CSP`);
  ok(html.includes("script-src 'self'"),`${rel}: script-src no está restringido a self`);
  ok(!/<script(?![^>]*\bsrc=)[^>]*>/i.test(html),`${rel}: script inline reintroducido`);
  ok(!/<script[^>]+src=["']https?:\/\//i.test(html),`${rel}: script remoto detectado`);
}

process.env.FIA_DEMO_SECRET_A='sec3-secret-a-long';
process.env.FIA_DEMO_SECRET_B='sec3-secret-b-long';
process.env.FIA_DEMO_ALLOWED_ORIGINS='https://demo.example';
const temp=await fsp.mkdtemp(path.join(os.tmpdir(),'fia-sec3-'));
const stateFile=path.join(temp,'state.json');
let server=await createDemoServer({stateFile});
await resetDemoState(server);
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let base=`http://127.0.0.1:${server.address().port}`;
const common={'content-type':'application/json','origin':'https://demo.example'};
async function login(clientId,secret){const r=await fetch(base+'/session',{method:'POST',headers:common,body:JSON.stringify({clientId,secret})});eq(r.status,201,'login');return (await r.json()).token}
const tokenA=await login('A',process.env.FIA_DEMO_SECRET_A);
const tokenB=await login('B',process.env.FIA_DEMO_SECRET_B);
const hA={...common,authorization:`Bearer ${tokenA}`};
const hB={...common,authorization:`Bearer ${tokenB}`};

// SEC-3A: actor comes only from authenticated session; body spoofing cannot change ownership.
const create=await fetch(base+'/operations',{method:'POST',headers:{...hA,'idempotency-key':'sec3-op-0001'},body:JSON.stringify({from:'B',to:'B',amount:25,concept:'Prueba autorización'})});
eq(create.status,201,'creación A→B');
const op=await create.json();
eq(op.from,'A','actor spoofing cambió remitente');
eq(op.to,'B','destinatario');
const illegalAccept=await fetch(base+`/operations/${op.id}/decision`,{method:'POST',headers:hA,body:JSON.stringify({decision:'accept'})});
eq(illegalAccept.status,403,'remitente no debe aceptar como receptor');
const malformedId=await fetch(base+'/operations/../../state/decision',{method:'POST',headers:hB,body:JSON.stringify({decision:'accept'})});
ok([400,404].includes(malformedId.status),'ID de operación malformado no fue rechazado');

// SEC-3B: replay/idempotency and balance conservation.
const replay=await fetch(base+'/operations',{method:'POST',headers:{...hA,'idempotency-key':'sec3-op-0001'},body:JSON.stringify({to:'B',amount:999,concept:'Payload distinto en replay'})});
eq(replay.status,200,'replay idempotente');
eq(replay.headers.get('idempotent-replay'),'true','header replay');
eq((await replay.json()).id,op.id,'replay creó otra operación');
const beforeA=await (await fetch(base+'/state',{headers:hA})).json();
const beforeB=await (await fetch(base+'/state',{headers:hB})).json();
const totalBefore=beforeA.client.balance+beforeB.client.balance;
const accepted=await fetch(base+`/operations/${op.id}/decision`,{method:'POST',headers:hB,body:JSON.stringify({decision:'accept'})});
eq(accepted.status,200,'aceptación receptor');
const afterA=await (await fetch(base+'/state',{headers:hA})).json();
const afterB=await (await fetch(base+'/state',{headers:hB})).json();
eq(Math.round((afterA.client.balance+afterB.client.balance)*100),Math.round(totalBefore*100),'conservación de saldo');
const secondAccept=await fetch(base+`/operations/${op.id}/decision`,{method:'POST',headers:hB,body:JSON.stringify({decision:'accept'})});
eq(secondAccept.status,409,'doble aceptación');

// SEC-3C: audit events expose correlation ids and an intact hash chain.
const audit=afterA.audit.filter(e=>e.operationId===op.id);
ok(audit.length>=3,'auditoría insuficiente');
let prev='GENESIS';
const allState=JSON.parse(await fsp.readFile(stateFile,'utf8'));
for(let i=0;i<allState.audit.length;i++){
  const event=allState.audit[i];
  eq(event.seq,i+1,'secuencia audit');
  ok(/^AUD-[A-F0-9]{24}$/.test(event.eventId),'eventId audit inválido');
  eq(event.prevHash,prev,'cadena prevHash');
  ok(/^[a-f0-9]{64}$/.test(event.hash),'hash audit inválido');
  prev=event.hash;
}

// SEC-3F: malformed structures and oversized bodies fail closed.
const arrayBody=await fetch(base+'/operations',{method:'POST',headers:hA,body:'[]'});
eq(arrayBody.status,400,'JSON array debe rechazarse');
const huge=await fetch(base+'/operations',{method:'POST',headers:hA,body:JSON.stringify({to:'B',amount:1,concept:'x'.repeat(17000)})});
eq(huge.status,413,'body oversized debe rechazarse');

await new Promise(r=>server.close(r));
const tampered=JSON.parse(await fsp.readFile(stateFile,'utf8'));
tampered.audit[0].actor='MALLORY';
await fsp.writeFile(stateFile,JSON.stringify(tampered));
let tamperRejected=false;
try{await createDemoServer({stateFile})}catch(e){tamperRejected=e.message==='BAD_AUDIT_CHAIN'}
ok(tamperRejected,'estado con auditoría manipulada no fue rechazado');
await fsp.rm(temp,{recursive:true,force:true});
console.log('PASS SEC-3 authorization, integrity, CSP and supply-chain gate');
