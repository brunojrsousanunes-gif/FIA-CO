import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../frontend/js/operation-center-private.js', import.meta.url), 'utf8');

assert.ok(
  source.includes('/rest/v1/operations?select=id,reference,title,status,version,operation_type,parent_operation_id,item_description,updated_at,is_synthetic&is_synthetic=eq.true'),
  'El centro privado solo debe consultar operaciones sintéticas.'
);
assert.ok(
  source.includes('/rest/v1/organization_members?select=organization_id,status,member_role,organizations!inner(is_synthetic)&organizations.is_synthetic=eq.true'),
  'Las pertenencias visibles en el entorno privado deben pertenecer a organizaciones sintéticas.'
);
assert.ok(
  source.includes('/rest/v1/pilot_access_requests?select=id,status,created_at,updated_at,organizations!inner(name,demo_code,is_synthetic)&organizations.is_synthetic=eq.true'),
  'Las solicitudes del entorno privado deben limitarse a organizaciones sintéticas.'
);

assert.ok(source.includes('JSON.stringify({userId:state.user?.id||null,payload})'), 'pending keys must be isolated between accounts using the same browser tab');
assert.match(source, /async function getPendingRequestKey\(scope,payload\)[\s\S]*?crypto\.subtle\.digest[\s\S]*?sessionStorage\.setItem/i,
  'retry keys must be persisted without storing request payloads or session credentials');
for (const action of [
  'accept_operation_invitation',
  'select_logistics_quote',
  'operation_confirmation',
  'create_synthetic_part_recovery',
  'record_inventory_movement',
  'reserve_inventory_item'
]) {
  assert.ok(source.includes(`getPendingRequestKey('${action}'`),
    `the ${action} action must reuse its idempotency key after an uncertain response`);
}
assert.match(source, /async function confirmAction\([\s\S]*?resolution=ignore-duplicates,return=representation[\s\S]*?IDEMPOTENCY_KEY_REUSED[\s\S]*?clearPendingRequestKey\(pending\.storageKey\)/,
  'a confirmation retry must verify the original row and return success without creating a duplicate');

assert.match(source, /async function mutate\([\s\S]*?pendingStorageKey=null\)[\s\S]*?await api\([\s\S]*?clearPendingRequestKey\(pendingStorageKey\)/,
  'a pending key must only be cleared after the server confirms the mutation');

const detailStart = source.indexOf('function renderDetail()');
const detailEnd = source.indexOf('function renderConfirmationActions()', detailStart);
assert.ok(detailStart >= 0 && detailEnd > detailStart, 'Debe existir el renderizado del detalle.');
const detail = source.slice(detailStart, detailEnd);
const financeDeclaration = detail.indexOf('const finance=d.financials[0]');
const financeUse = detail.indexOf("$('[data-total]')");
assert.ok(financeDeclaration >= 0 && financeUse >= 0 && financeDeclaration < financeUse,
  'finance debe inicializarse antes de utilizarse al renderizar el detalle.');

console.log('PRIVATE OPERATION CENTER SYNTHETIC ISOLATION + DETAIL RENDER: PASS');
