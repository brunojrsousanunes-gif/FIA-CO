import fs from 'node:fs';
import assert from 'node:assert/strict';

const app=fs.readFileSync('frontend/app-beta.html','utf8');
const appJs=fs.readFileSync('frontend/js/prepilot-v2.js','utf8');
const premium=fs.readFileSync('frontend/premium-demo.html','utf8');
const premiumJs=fs.readFileSync('frontend/js/premium-demo.js','utf8');
const css=fs.readFileSync('frontend/css/prepilot-v2.css','utf8');

assert(app.includes('Prueba FIA&CO en menos de 2 minutos'),'onboarding visible');
assert(app.includes('Estado de la operación')&&app.includes('Evidencias pendientes'),'operation status visible');
assert(app.includes('SUGGEST_REVIEW')&&app.includes('shadow/read-only'),'Premium contextual recommendation');
assert(app.includes('data-feedback="clear"')&&app.includes('data-feedback="confusing"'),'local feedback controls');
assert(appJs.includes("localStorage.setItem('fiaco.beta.feedback'")&&!/fetch\s*\(/.test(appJs),'feedback stays local and makes no network call');
assert(appJs.includes("localStorage.setItem('fiaco.beta.lastDraft'")&&appJs.includes('operationStatus.hidden=false'),'guided draft reveals status');
assert(css.includes('min-height:44px')&&css.includes(':focus-visible'),'mobile accessibility gate');
assert(premium.includes("Content-Security-Policy")&&!premium.includes('<script>'),'Premium uses strict CSP and no inline script');
assert(premium.includes('PREMIUM_AGENT_READY=false')&&premium.includes('enforcement=false')&&premium.includes('capacidades de escritura: 0'),'Premium remains read-only/demo');
assert(premiumJs.includes('replaceChildren')&&!premiumJs.includes('innerHTML')&&!premiumJs.includes('insertAdjacentHTML'),'Premium rendering uses safe DOM APIs');
assert(!/https?:\/\//.test(premiumJs),'Premium JS has no external calls');
assert(app.includes('ninguna acción mueve dinero')&&app.includes('PII real'),'demo limits stay explicit');
console.log('PASS pre-pilot beta v2 quality gate');
