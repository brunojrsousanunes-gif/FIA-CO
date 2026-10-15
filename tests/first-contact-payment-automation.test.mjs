import assert from 'node:assert/strict';
import fs from 'node:fs';

const assistant=fs.readFileSync('frontend/js/fia-first-contact.js','utf8');
assert.match(assistant,/function isPaymentAutomationRequest\(raw\)/);
assert.match(assistant,/function renderPaymentAutomation\(root,raw,step=0,answers=\{\}\)/);
assert.match(assistant,/Revisar facturas/);
assert.match(assistant,/Saber quién paga y cuándo/);
assert.match(assistant,/Enviar recordatorios/);
assert.match(assistant,/Vendedor, transportista y comprador/);
assert.match(assistant,/Con tus respuestas, esta sería una primera propuesta/);
assert.match(assistant,/No se ejecutan pagos ni se envían avisos externos/);
assert.match(assistant,/if\(isPaymentAutomationRequest\(raw\)\)\{updateProfile\(raw,false\);renderPaymentAutomation\(root,raw\);return;\}/);
assert.match(assistant,/solicitar aprobación antes de cualquier envío externo/i);
console.log('first-contact payment automation intake: ok');
