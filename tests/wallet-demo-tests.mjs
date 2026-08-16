import fs from 'node:fs';

let passed=0,failed=0;
function test(name,fn){try{fn();console.log(`PASS ${name}`);passed++}catch(e){console.error(`FAIL ${name}: ${e.message}`);failed++}}
function ok(v,m='condición no cumplida'){if(!v)throw new Error(m)}
const html=fs.readFileSync(new URL('../frontend/wallet.html',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('../frontend/js/wallet-demo.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../frontend/app-beta.html',import.meta.url),'utf8');

test('wallet es móvil',()=>ok(html.includes('name="viewport"')));
test('wallet declara modo demo',()=>{ok(html.includes('SIN FONDOS REALES'));ok(html.includes('no se transmite una orden'))});
test('wallet distingue FIA&CO, proveedor cripto y banco',()=>{ok(html.includes('Proveedor cripto autorizado'));ok(html.includes('Entidad bancaria depositaria'));ok(html.includes('FIA&CO'))});
test('calculadora muestra importe bruto, comisión y neto',()=>{ok(html.includes('Importe bruto'));ok(html.includes('Comisión estimada'));ok(html.includes('Abono estimado'))});
test('no solicita claves privadas ni frases semilla',()=>{const lower=html.toLowerCase();ok(!lower.includes('private-key'));ok(!lower.includes('seed-phrase'));ok(!lower.includes('frase semilla'))});
test('demo no hace llamadas de red',()=>{ok(!/\bfetch\s*\(/.test(js));ok(!/XMLHttpRequest|WebSocket/.test(js))});
test('referencias usan aleatoriedad criptográfica',()=>ok(js.includes('crypto.getRandomValues')));
test('la app beta enlaza la cartera',()=>ok(app.includes('href="wallet.html"')));
test('no se cargan scripts remotos',()=>ok(!/<script[^>]+src=["']https?:\/\//i.test(html)));

console.log(`\n${passed} pruebas de cartera superadas, ${failed} fallidas`);
if(failed)process.exit(1);