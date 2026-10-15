import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('frontend/js/fia-skills-search.js','utf8');
const context={window:{}};
vm.runInNewContext(source,context);
const engine=context.window.FIASkillsSearch;
const firstContact=fs.readFileSync('frontend/js/fia-first-contact.js','utf8');
const homepage=fs.readFileSync('frontend/index.html','utf8');
assert.match(firstContact,/window\.FIASkillsSearch\?\.search\(raw\)/,'first-contact answers must query the skill library');
assert.match(firstContact,/renderSkillResponse\(root,raw,skillResult\)/,'retrieved skill results must shape the answer');
assert.match(homepage,/js\/fia-skills-search\.js\?v=skills-router-v1/,'the skill engine must load before the first-contact assistant');
assert.ok(engine,'skill search engine is exposed');
assert.ok(engine.getCatalog().length>=10,'the runtime catalog contains the main project skills');
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
 assert.ok(result.answer.length>30);
}
assert.equal(engine.search('xyz qqq blorp'),null,'unknown terms must not trigger an invented answer');
console.log('FIA skill-aware search: ok');
