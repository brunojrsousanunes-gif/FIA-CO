const fs=require('fs');const vm=require('vm');const assert=require('assert');
const code=fs.readFileSync('frontend/js/shadow-risk-engine.js','utf8');const sandbox={globalThis:{}};vm.createContext(sandbox);vm.runInContext(code,sandbox);const e=sandbox.globalThis.FIACOShadowRiskEngine;
assert.strictEqual(e.mode,'SHADOW_READ_ONLY');assert.deepStrictEqual(Array.from(e.ALLOWED_RESULTS),['OBSERVE_ONLY','SUGGEST_REVIEW','SUGGEST_BLOCK']);
const source={amount:500,criticalEvidenceComplete:true,identityConsistent:true,hasDispute:false,confidence:.95};const before=JSON.stringify(source);const ok=e.evaluate(source);assert.strictEqual(ok.result,'OBSERVE_ONLY');assert.strictEqual(ok.enforcement,false);assert.deepStrictEqual(Array.from(ok.writeCapabilities),[]);assert.strictEqual(JSON.stringify(source),before);
const missing=e.evaluate({...source,criticalEvidenceComplete:false});assert.strictEqual(missing.result,'SUGGEST_BLOCK');assert.ok(Array.from(missing.reasons).includes('MISSING_CRITICAL_EVIDENCE'));assert.strictEqual(missing.enforcement,false);
const high=e.evaluate({...source,amount:3500});assert.strictEqual(high.result,'SUGGEST_REVIEW');assert.ok(Array.from(high.reasons).includes('HIGH_VALUE'));
assert.strictEqual(typeof e.block,'undefined');assert.strictEqual(typeof e.pause,'undefined');assert.strictEqual(typeof e.authorize,'undefined');assert.strictEqual(typeof e.write,'undefined');
console.log('shadow risk engine tests passed');
