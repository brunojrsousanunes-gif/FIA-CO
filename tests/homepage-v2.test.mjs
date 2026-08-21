import fs from 'node:fs';
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
function ok(v,m){if(!v)throw new Error(m)}
ok(html.includes('name="viewport"'),'homepage must be mobile ready');
ok(html.includes('Content-Security-Policy'),'homepage must define CSP');
ok(!/<script(?![^>]*src=)[^>]*>/i.test(html),'homepage must not contain inline scripts');
ok(html.includes('id="inicio"'),'homepage must expose the approved hero');
ok(html.includes('id="servicios"'),'homepage must expose services');
ok(html.includes('id="participantes"'),'homepage must expose participant roles');
ok(html.includes('id="confianza"'),'homepage must expose trust section');
ok(html.includes('Conecta.')&&html.includes('Acuerda.')&&html.includes('Gestiona.')&&html.includes('Comprueba.'),'homepage must use approved hero copy');
ok(html.includes('assets/fia-co-office-approved.jpg'),'homepage must use approved office visual');
ok(html.includes('tx-advanced.html'),'homepage must link operation creation');
ok(html.includes('beta-mobile.html'),'homepage must link the mobile beta');
ok(html.includes('sin fondos reales')&&html.includes('sin PII real'),'homepage must communicate demo boundaries');
ok(!html.includes('PREVIEW VISUAL · no sustituye aún la portada actual'),'production homepage must not show preview-only notice');
console.log('PASS approved homepage production gate');
