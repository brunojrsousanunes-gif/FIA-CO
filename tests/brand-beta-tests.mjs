import fs from 'node:fs';
function ok(v,m){if(!v)throw new Error(m)}
const index=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../frontend/app-beta.html',import.meta.url),'utf8');
const identity=fs.readFileSync(new URL('../frontend/identity.html',import.meta.url),'utf8');
const identityLower=identity.toLowerCase();
const logo=fs.readFileSync(new URL('../frontend/assets/fia-co-trust-compute.svg',import.meta.url),'utf8');
ok(index.includes('app-beta.html'),'la portada debe enlazar la app beta');
ok(index.includes('fia-co-trust-compute.svg'),'la portada debe usar la identidad Trust Infrastructure de FIA&CO');
ok(app.includes('name="viewport"'),'la app beta debe ser móvil');
ok(app.includes('SIN DINERO REAL'),'la app beta debe declarar el modo demo');
ok(app.includes('identity.html')&&app.includes('Biometría simulada'),'la app beta debe enlazar y describir la identidad avanzada simulada');
ok(identityLower.includes('huella dactilar')&&identityLower.includes('reconocimiento facial')&&identityLower.includes('biometría de voz'),'la pantalla de identidad debe conservar las modalidades biométricas simuladas');
ok(app.includes('two-clients.html')&&app.includes('backend HTTPS separado'),'la app beta debe enlazar y aislar la demo multiusuario');
ok(!/card-number|cvv|private-key|seed-phrase|iban-input/i.test(app),'la app beta no debe pedir secretos financieros');
ok(logo.includes('FIA')&&logo.includes('CO')&&logo.includes('&amp;'),'el logo debe contener FIA, ampersand y CO');
ok(logo.includes('INFRAESTRUCTURA')&&logo.includes('CONFIANZA')&&logo.includes('VALOR'),'el logo debe conservar el posicionamiento visual aprobado');
console.log('PASS branding y beta móvil: 10 comprobaciones');
