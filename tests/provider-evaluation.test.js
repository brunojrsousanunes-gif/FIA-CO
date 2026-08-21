const fs=require('fs');
const assert=require('assert');

const cfg=JSON.parse(fs.readFileSync('config/provider-evaluation.json','utf8'));
const page=fs.readFileSync('frontend/provider-evaluation.html','utf8');
const docs=fs.readFileSync('docs/FOUNDER-ACTIONS-V1.md','utf8');

assert.strictEqual(cfg.mode,'DEMO_ONLY');
assert.strictEqual(cfg.decisionAuthority,'FOUNDER');
assert.strictEqual(cfg.automaticSelectionAllowed,false);
assert.strictEqual(cfg.realCredentialsAllowed,false);
assert.strictEqual(cfg.realContractsAllowed,false);
assert.strictEqual(cfg.criteria.reduce((sum,x)=>sum+x.weight,0),100);
assert.strictEqual(cfg.gates.explicitAuthorizationRequiredBeforeIntegration,true);
for(const capability of cfg.capabilities){
  for(const candidate of capability.candidates){
    assert.strictEqual(candidate.score,null,'No debe existir puntuación final sin evidencia suficiente');
    assert(candidate.founderAction,'Cada candidato pendiente debe declarar acción del Founder');
  }
}
assert(page.includes('FOUNDER_ACTION_REQUIRED'));
assert(page.includes('NO AUTO-SELECTION'));
assert(page.includes('No se asigna puntuación si faltan'));
assert(!/<a[^>]+href=["']https?:\/\//i.test(page),'El panel interno no debe enlazar proveedores externos aún');
assert(docs.includes('Decisiones que nunca se automatizan'));
assert(docs.includes('selección final de proveedor'));

console.log('provider evaluation tests passed');
