const fs=require('fs');
const assert=require('assert');

const cfg=JSON.parse(fs.readFileSync('config/integration-readiness.json','utf8'));
const page=fs.readFileSync('frontend/integration-readiness.html','utf8');
const integrations=fs.readFileSync('frontend/integrations.html','utf8');
const allowlist=fs.readFileSync('config/pages-public-allowlist.txt','utf8');

assert.strictEqual(cfg.mode,'DEMO_ONLY');
assert.strictEqual(cfg.productionActivationAllowed,false);
assert.strictEqual(cfg.realCredentialsAllowed,false);
assert.strictEqual(cfg.realPiiAllowed,false);
assert.strictEqual(cfg.realFundsAllowed,false);
assert.strictEqual(cfg.capabilities.length,6);
assert(cfg.capabilities.some(x=>x.id==='payments'&&x.contract==='PaymentProviderAdapter'&&x.status==='READY_TO_EVALUATE'));
assert(cfg.capabilities.some(x=>x.id==='fraud'&&x.status==='SHADOW_ONLY'));
assert(cfg.capabilities.some(x=>x.id==='cloud'&&x.status==='BLOCKED_BY_PRODUCTION_GATE'));
assert(page.includes('Integration Readiness'));
assert(page.includes('READY_TO_EVALUATE'));
assert(page.includes('SHADOW_ONLY'));
assert(page.includes('BLOCKED_BY_PRODUCTION_GATE'));
assert(!/href=["']https?:\/\//i.test(page));
assert(integrations.includes('href="integration-readiness.html"'));
assert(allowlist.includes('\nintegration-readiness.html\n'));

console.log('integration readiness tests passed');
