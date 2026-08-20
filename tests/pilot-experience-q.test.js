const fs=require('fs'),assert=require('assert');
const app=fs.readFileSync('frontend/app-beta.html','utf8');
const dash=fs.readFileSync('frontend/pilot-dashboard.html','utf8');
const telemetry=fs.readFileSync('frontend/js/pilot-telemetry.js','utf8');
['Completa una operación de principio a fin','Timeline de la operación','Centro de incidencias','pilot-dashboard.html','shadow/read-only','SIN DINERO REAL'].forEach(x=>assert(app.includes(x),x));
['Tu actividad','Centro de incidencias','Perfil y preferencias','DEMO_ONLY','SIN PII REAL','Telemetría beta'].forEach(x=>assert(dash.includes(x),x));
assert(telemetry.includes('localStorage'));assert(!telemetry.includes('fetch('));assert(!telemetry.includes('XMLHttpRequest'));assert(!telemetry.includes('sendBeacon'));
assert(!app.includes('innerHTML'));assert(!app.includes('insertAdjacentHTML'));assert(app.includes("default-src 'self'"));
console.log('pilot experience Q gate passed');
