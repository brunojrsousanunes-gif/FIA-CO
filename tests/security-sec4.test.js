const fs=require('fs'),assert=require('assert');
const p=JSON.parse(fs.readFileSync('config/security-prepilot.json','utf8'));
const d=fs.readFileSync('docs/security/SEC-4-PREPILOT.md','utf8');
assert.equal(p.mode,'DEMO_ONLY');
assert.equal(p.authentication.realAuthEnabled,false);
assert.equal(p.authentication.tokensInLocalStorage,false);
assert.equal(p.secrets.frontendAllowed,false);
assert.equal(p.secrets.repositoryAllowed,false);
assert.equal(p.logging.piiPayloadLoggingAllowed,false);
assert.equal(p.logging.externalExportEnabled,false);
assert.equal(p.gates.realMoney,false);
assert.equal(p.gates.realPii,false);
assert.equal(p.gates.productionProviders,false);
assert.equal(p.gates.enforcement,false);
assert.equal(p.gates.premiumMode,'shadow-read-only');
['Passkeys/WebAuthn','OIDC','Rate limiting','SIEM','Fortinet','RPO','RTO','Threat model','Pentest','PILOT_READY'].forEach(x=>assert(d.includes(x),x));
for(const file of fs.readdirSync('frontend/js').map(x=>'frontend/js/'+x)){
 const s=fs.readFileSync(file,'utf8');
 assert(!/localStorage\.setItem\([^\n]*(token|secret|password|credential)/i.test(s),`sensitive localStorage pattern: ${file}`);
}
console.log('SEC-4 pre-pilot security gate passed');
