const fs=require('fs');const assert=require('assert');
const index=fs.readFileSync('frontend/index.html','utf8');
const app=fs.readFileSync('frontend/beta-mobile.html','utf8');
const legal=fs.readFileSync('frontend/legal-center.html','utf8');

['id="que-resuelve"','id="seguridad"','id="contacto"','legal-center.html'].forEach(x=>assert(index.includes(x),x));
assert(!index.includes('beta-mobile.html'),'public homepage must not link app beta');
assert(!index.includes('SOLUCIONES EN UNA ÚNICA APP'),'public homepage must not expose full module map');

['data-view="HOME"','data-view="OPPORTUNITIES"','data-view="OPERATIONS"','data-view="DOCUMENTS"','data-view="SECURITY"'].forEach(x=>assert(app.includes(x),x));
assert(app.includes('js/fia-capability-shell.js'),'app must render through capability shell');
assert(!app.includes('data-view="wallet"'),'wallet surface must not remain in simplified app');
assert(!app.includes('data-view="premium"'),'premium internals must not remain in simplified app');
assert(!app.includes('js/unified-app.js'),'simplified app must not load legacy all-modules script');

['Qué hace FIA&CO y qué no hace.','Minimización y finalidad.','Acceso mínimo y progresivo.','FIA no recibe, custodia ni mueve fondos.'].forEach(x=>assert(legal.includes(x),x));
assert(!legal.includes('app-beta.html'),'public legal center must not link deep app');
assert(!legal.includes('Gate fotográfico antes de habilitar el pago'),'public legal center must not expose internal workflow strategy');
assert(/validación correspondiente|revisarse antes de activar/i.test(legal));
console.log('need-to-know app and legal surface tests passed');
