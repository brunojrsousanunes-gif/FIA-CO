import fs from 'node:fs';
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
function ok(v,m){if(!v)throw new Error(m)}
ok(html.includes('name="viewport"'),'homepage must be mobile ready');
ok(html.includes('Content-Security-Policy'),'homepage must define CSP');
ok(!/<script(?![^>]*src=)[^>]*>/i.test(html),'homepage must not contain inline scripts');
ok(html.includes('id="como-funciona"'),'homepage must explain the product');
ok(html.includes('id="acciones"'),'homepage must expose action entry points');
ok(html.includes('SOLUCIONES EN UNA ÚNICA APP'),'homepage must present the consolidated app');
ok(html.includes('Agente Premium'),'homepage must expose Premium as an app capability');
ok(html.includes('Cartera &amp;<br>Pagos'),'homepage must expose the demo payments capability');
ok(html.includes('beta-mobile.html'),'homepage must link the unified mobile beta');
ok(html.includes('legal-center.html'),'homepage must link legal center');
ok(html.includes('SIN DINERO REAL')&&html.includes('DATOS DEMO'),'homepage must communicate demo boundaries');
ok(html.includes('OPERA CON')&&html.includes('CRECE CON'),'homepage must preserve the approved corporate hero');
ok(html.includes('css/home-production.css'),'homepage must use the corporate production stylesheet');
console.log('PASS homepage corporate structure/security gate');
