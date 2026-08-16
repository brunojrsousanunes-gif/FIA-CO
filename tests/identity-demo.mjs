import fs from 'node:fs';

let failed=0;
function check(name,condition){
  if(condition) console.log(`PASS ${name}`);
  else { console.error(`FAIL ${name}`); failed++; }
}

const source=fs.readFileSync(new URL('../frontend/identity.html',import.meta.url),'utf8');
const lower=source.toLowerCase();

check('identity.html declara viewport móvil',source.includes('name="viewport"'));
check('demo informa que la biometría es simulada',lower.includes('biometría simulada') || lower.includes('biometría real'));
check('demo no solicita acceso a cámara o micrófono',!lower.includes('getusermedia'));
check('demo no contiene captura de credenciales biométricas',!lower.includes('mediadevices'));
check('demo contempla huella',lower.includes('huella dactilar'));
check('demo contempla reconocimiento facial',lower.includes('reconocimiento facial'));
check('demo contempla biometría de voz',lower.includes('biometría de voz'));
check('demo deja claro que no mueve fondos',lower.includes('no hay movimiento de fondos') || lower.includes('no se ha enviado dinero'));
check('autorización empieza deshabilitada',source.includes('id="authorize-demo" class="btn" disabled'));
check('demo no carga scripts remotos',!/<script[^>]+src=["']https?:\/\//i.test(source));

console.log(`\nDemo biométrica: ${10-failed} pruebas superadas, ${failed} fallidas`);
if(failed) process.exit(1);
