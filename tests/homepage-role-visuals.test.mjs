import fs from 'node:fs';
import assert from 'node:assert/strict';

const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../frontend/css/home-production.css',import.meta.url),'utf8');

for(const role of ['seller','carrier','buyer']){
  assert.ok(html.includes(`assets/fia-role-${role}.webp`),`missing ${role} role photograph`);
  assert.ok(fs.existsSync(new URL(`../frontend/assets/fia-role-${role}.webp`,import.meta.url)),`missing ${role} asset`);
}
for(const id of ['roles','proceso-publico','preguntas']) assert.ok(html.includes(`id="${id}"`),`missing ${id} public section`);
for(const label of ['VENDEDOR','TRANSPORTISTA','COMPRADOR']) assert.ok(html.includes(label),`missing ${label} role`);
assert.ok(html.includes('NO PUEDE CONFIRMAR LA RECEPCIÓN'));
assert.ok(html.includes('NO MODIFICA PRECIO NI CONDICIONES'));
assert.ok(html.includes('NO CONFIRMA ACCIONES DE OTRAS PARTES'));
assert.ok(css.includes('.role-grid'));
assert.ok(css.includes('.process-grid'));
assert.ok(css.includes('.value-grid'));
assert.ok(css.includes('@media(max-width:680px)'));

console.log('homepage role visuals: ok');
