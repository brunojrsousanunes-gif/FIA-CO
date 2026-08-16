import fs from 'node:fs';
function ok(v,m){if(!v)throw new Error(m)}
const index=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../frontend/app-beta.html',import.meta.url),'utf8');
const logo=fs.readFileSync(new URL('../frontend/assets/fia-co-balance.svg',import.meta.url),'utf8');
ok(index.includes('app-beta.html'),'la portada debe enlazar la app beta');
ok(index.includes('fia-co-balance.svg'),'la portada debe usar el logo FIA&CO');
ok(app.includes('name="viewport"'),'la app beta debe ser móvil');
ok(app.includes('SIN DINERO REAL'),'la app beta debe declarar el modo demo');
ok(app.includes('Huella')&&app.includes('rostro')&&app.includes('voz'),'la app beta debe explicar biometría simulada');
ok(!/card-number|cvv|private-key|seed-phrase|iban-input/i.test(app),'la app beta no debe pedir secretos financieros');
ok(logo.includes('FIA')&&logo.includes('CO')&&logo.includes('&amp;'),'el logo debe contener FIA, ampersand y CO');
console.log('PASS branding y beta móvil: 7 comprobaciones');