import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../frontend/js/operation-center-private.js', import.meta.url), 'utf8');

assert.match(
  source,
  /operations\?select=[^']*is_synthetic=eq\\.true/,
  'El centro privado solo debe consultar operaciones sintéticas.'
);
assert.match(
  source,
  /organization_members\?select=[^']*organizations!inner\(is_synthetic\)&organizations\.is_synthetic=eq\\.true/,
  'Las pertenencias visibles en el entorno privado deben pertenecer a organizaciones sintéticas.'
);
assert.match(
  source,
  /pilot_access_requests\?select=[^']*organizations!inner\(name,demo_code,is_synthetic\)&organizations\.is_synthetic=eq\\.true/,
  'Las solicitudes del entorno privado deben limitarse a organizaciones sintéticas.'
);

const detailStart = source.indexOf('function renderDetail()');
const detailEnd = source.indexOf('function renderConfirmationActions()', detailStart);
assert.ok(detailStart >= 0 && detailEnd > detailStart, 'Debe existir el renderizado del detalle.');
const detail = source.slice(detailStart, detailEnd);
const financeDeclaration = detail.indexOf('const finance=d.financials[0]');
const financeUse = detail.indexOf("$('[data-total]')");
assert.ok(financeDeclaration >= 0 && financeUse >= 0 && financeDeclaration < financeUse,
  'finance debe inicializarse antes de utilizarse al renderizar el detalle.');

console.log('PRIVATE OPERATION CENTER SYNTHETIC ISOLATION + DETAIL RENDER: PASS');
