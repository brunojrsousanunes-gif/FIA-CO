import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('frontend/js/fia-skills-search.js','utf8');
const corpusSource=fs.readFileSync('frontend/js/fia-skills-corpus.js','utf8');
const context={window:{}};
vm.runInNewContext(corpusSource,context);
vm.runInNewContext(source,context);
const engine=context.window.FIASkillsSearch;
const firstContact=fs.readFileSync('frontend/js/fia-first-contact.js','utf8');
const homepage=fs.readFileSync('frontend/index.html','utf8');
const allowlist=fs.readFileSync('config/pages-public-allowlist.txt','utf8');
assert.match(firstContact,/window\.FIASkillsSearch\?\.search\(raw\)/,'first-contact answers must query the skill library');
assert.match(firstContact,/renderSkillResponse\(root,raw,skillResult\)/,'retrieved skill results must shape the answer');
assert.match(homepage,/js\/fia-skills-corpus\.js\?v=skills-corpus-v1/,'the indexed corpus must load on the public homepage');
assert.match(homepage,/js\/fia-skills-search\.js\?v=skills-index-v2/,'the skill engine must load on the public homepage');
assert.ok(homepage.indexOf('js/fia-skills-corpus.js')<homepage.indexOf('js/fia-skills-search.js'),'corpus must load before the search engine');
assert.ok(homepage.indexOf('js/fia-skills-search.js')<homepage.indexOf('js/fia-first-contact.js'),'search must load before the assistant');
assert.ok(allowlist.includes('js/fia-skills-corpus.js'),'the public build allowlist must include the corpus');
assert.ok(engine,'skill search engine is exposed');
assert.ok(engine.getCatalog().skills.length>=10,'the runtime catalog contains the main project skills');
assert.equal(engine.getCatalog().documents.length,10,'all skill manifests, references, and the master guide must be indexed');
assert.ok(engine.getCatalog().documents.every(d=>d.path&&d.sha),'every indexed document must retain source path and SHA');
for(const [query,expected] of [
 ['¿Cómo reviso la seguridad OWASP y los permisos?', 'security-owasp'],
 ['Quiero ahorrar tiempo automatizando recordatorios de pagos', 'automation'],
 ['Necesito organizar vendedor transportista y comprador con incidencias', 'b2b-operations'],
 ['¿Cómo verifico los tests y el despliegue?', 'testing-reliability'],
 ['Quiero reducir costes del piloto y no pagar servicios', 'cost-pilot'],
 ['¿Cómo debo tratar los datos personales y la retención?', 'privacy'],
 ['Necesito preparar un contrato y revisar las cláusulas', 'documents-legal'],
 ['La interfaz móvil confunde a los usuarios', 'ux-accessibility']
]) {
 const result=engine.search(query);
 assert.ok(result, 'a matching skill should be retrieved for: '+query);
 assert.equal(result.primary.id,expected,'the correct skill should rank first for: '+query+'; got '+result.primary.id);
 assert.ok(result.skills.length>=1);
 assert.ok(result.sources.length>=1,'retrieval should return indexed source documents');
 assert.ok(result.sources[0].excerpt.length>30,'retrieval should return an evidence excerpt');
 assert.ok(result.answer.length>30);
}
const vetting=engine.search('third party skill provenance license');
assert.ok(vetting,'the indexed third-party skill vetting guide should be searchable');
assert.ok(vetting.sources.some(d=>d.path.endsWith('skill-vetting.md')),'the vetting query should retrieve its source document');
assert.equal(engine.search('xyz qqq blorp'),null,'unknown terms must not trigger an invented answer');
console.log('FIA skill-aware search: ok');
