import fs from 'node:fs';
const app=fs.readFileSync(new URL('../frontend/app-beta.html',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('../frontend/js/app-beta.js',import.meta.url),'utf8');
function ok(v,m){if(!v)throw new Error(m)}
ok(app.includes('viewport-fit=cover'),'beta debe contemplar safe areas móviles');
ok(app.includes('Content-Security-Policy')&&app.includes("script-src 'self'"),'beta debe usar CSP estricta');
ok(!/<script(?![^>]*\bsrc=)[^>]*>/i.test(app),'beta no debe contener scripts inline');
ok(app.includes('premium-demo.html')&&app.includes('Agente de Transacción'),'beta debe destacar Premium sin activarlo');
ok(app.includes('SIN DINERO REAL')&&app.includes('DATOS DEMO'),'beta debe declarar límites de demo');
ok(!/innerHTML|insertAdjacentHTML|document\.write|new\s+Function|\beval\s*\(/.test(js),'lógica beta no debe usar sinks HTML peligrosos');
ok(js.includes("event.key==='Escape'"),'modal debe poder cerrarse con Escape');
ok(app.includes('aria-label="Nueva operación"')&&app.includes('aria-label="Cerrar"'),'controles críticos deben tener etiquetas accesibles');
console.log('PASS mobile beta polish security/UX gate');
