import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createDemoServer,resetDemoState} from '../server/demo-api.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const failures=[];
const forbidden=[/\beval\s*\(/,/\bnew\s+Function\b/,/document\.write\s*\(/,/insertAdjacentHTML\s*\(/,/\.outerHTML\s*=/,/javascript\s*:/i];
const secretPatterns=[/AKIA[0-9A-Z]{16}/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/sk_live_[0-9A-Za-z]{16,}/];
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);if(e.isDirectory()){if(['.git','node_modules'].includes(e.name))return [];return walk(p)}return [p]})}
for(const file of walk(root)){
  const rel=path.relative(root,file).replaceAll('\\','/');
  if(!/\.(?:js|mjs|html|md|yml|yaml)$/.test(rel))continue;
  const text=fs.readFileSync(file,'utf8');
  if(/\.(?:js|mjs|html)$/.test(rel))for(const re of forbidden)if(re.test(text)&&rel!=='tests/security-sec2.test.mjs')failures.push(`${rel}: patrón peligroso ${re}`);
  for(const re of secretPatterns)if(re.test(text)&&rel!=='tests/security-sec2.test.mjs')failures.push(`${rel}: posible secreto ${re}`);
}
if(failures.length)throw new Error(`SEC-2 gate falló:\n${failures.join('\n')}`);

const identity=fs.readFileSync(path.join(root,'frontend/identity.html'),'utf8');
if(!identity.includes('Content-Security-Policy')||!identity.includes("script-src 'self'"))throw new Error('identity.html perdió CSP estricta');
if(/<script(?![^>]*\bsrc=)[^>]*>/i.test(identity))throw new Error('identity.html reintrodujo script inline');

const productionGate=fs.readFileSync(path.join(root,'frontend/production-gate.html'),'utf8');
for(const re of [/insertAdjacentHTML\s*\(/,/\.innerHTML\s*=/,/\.outerHTML\s*=/])if(re.test(productionGate))throw new Error(`production-gate.html reintrodujo sink HTML: ${re}`);

process.env.FIA_DEMO_SECRET_A='sec2-test-secret-a';
process.env.FIA_DEMO_SECRET_B='sec2-test-secret-b';
process.env.FIA_DEMO_ALLOWED_ORIGINS='https://demo.example';
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'fia-sec2-'));
const stateFile=path.join(tmp,'state.json');
const server=await createDemoServer({stateFile});
await resetDemoState(server);
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const headers={'content-type':'application/json','origin':'https://demo.example'};
async function login(){const r=await fetch(base+'/session',{method:'POST',headers,body:JSON.stringify({clientId:'A',secret:process.env.FIA_DEMO_SECRET_A})});if(r.status!==201)throw new Error('login demo falló');return (await r.json()).token}
const first=await login();
const second=await login();
if(first===second)throw new Error('la rotación de sesión reutilizó token');
const old=await fetch(base+'/state',{headers:{origin:'https://demo.example',authorization:`Bearer ${first}`}});
if(old.status!==401)throw new Error(`la sesión anterior sigue activa (${old.status})`);
const current=await fetch(base+'/state',{headers:{origin:'https://demo.example',authorization:`Bearer ${second}`}});
if(current.status!==200)throw new Error(`la sesión rotada no funciona (${current.status})`);
await new Promise(r=>server.close(r));
fs.rmSync(tmp,{recursive:true,force:true});
console.log('PASS SEC-2 security regression gate');
