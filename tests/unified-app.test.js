const fs=require('node:fs');
const assert=require('node:assert/strict');
const html=fs.readFileSync('frontend/beta-mobile.html','utf8');
const js=fs.readFileSync('frontend/js/unified-app.js','utf8');
const css=fs.readFileSync('frontend/css/unified-app.css','utf8');
const allowlist=fs.readFileSync('config/pages-public-allowlist.txt','utf8');

for(const view of ['overview','operations','logistics','evidence','identity','wallet','premium','dashboard']){
  assert.ok(html.includes(`data-view="${view}"`),`missing unified view: ${view}`);
}
assert.ok(html.includes('Todo FIA&CO, junto.'),'unified product message missing');
assert.ok(html.includes('SIN DINERO REAL'),'real-money guardrail missing');
assert.ok(html.includes('NO_PII'),'PII guardrail missing');
assert.ok(html.includes('SHADOW / READ-ONLY'),'Premium read-only guardrail missing');
assert.ok(html.includes('css/unified-app.css'),'unified stylesheet not referenced');
assert.ok(html.includes('js/unified-app.js'),'unified script not referenced');
assert.ok(allowlist.includes('css/unified-app.css'),'unified stylesheet not allowlisted');
assert.ok(allowlist.includes('js/unified-app.js'),'unified script not allowlisted');
assert.ok(js.includes("fia_unified_beta_v2"),'clean shared local state missing');
assert.ok(js.includes("fia_unified_beta_v1"),'legacy storage migration missing');
assert.ok(js.includes('localStorage.removeItem'),'legacy storage purge missing');
assert.ok(js.includes('operations:[]')&&js.includes('evidence:[]')&&js.includes('participants:[]'),'empty initial state missing');
for(const stale of ['ROC-4587','LOG-1932','Compradora Demo S.L.','Proveedor Demo S.A.','Transportes Demo Norte','DOC-7731']){
  assert.equal(js.includes(stale),false,`stale seeded fixture remains: ${stale}`);
}
assert.ok(js.includes("SUGGEST_REVIEW"),'Premium recommendation contract missing');
assert.equal(/\bfetch\s*\(/.test(js),false,'unified demo must not call network APIs');
assert.equal(/XMLHttpRequest|WebSocket|EventSource/.test(js),false,'unified demo must not open remote transports');
assert.ok(css.includes('@media(max-width:760px)'),'mobile navigation breakpoint missing');
console.log('unified app clean-state contract OK');
