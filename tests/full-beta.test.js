const fs=require('fs'),assert=require('assert');
const web=fs.readFileSync('frontend/web-beta.html','utf8');
const app=fs.readFileSync('frontend/beta-mobile.html','utf8');
['Compraventa','Venta + transporte','Porte especial','Transporte animal','Agente Premium','Marco jurídico','Panel de operaciones'].forEach(x=>assert(web.includes(x),`web ${x}`));
['Todo FIA&CO en una sola beta','Transportista externo','Porte especial','Transporte animal preparado','Identidad avanzada','Cartera demo','Página web completa'].forEach(x=>assert(app.includes(x),`app ${x}`));
assert(web.includes('no realiza transporte físico'));
assert(app.includes('El transporte físico corresponde a terceros habilitados'));
console.log('Full web/mobile beta gate passed');
