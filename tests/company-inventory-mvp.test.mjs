import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync(
  'supabase/migrations/20261113150000_company_inventory_mvp.sql', 'utf8'
);

for (const table of ['inventory_items','inventory_movements','inventory_reservations']) {
  assert.match(migration, new RegExp('create table public\\.' + table, 'i'));
  assert.match(migration, new RegExp('alter table public\\.' + table + ' enable row level security', 'i'));
  assert.match(migration, new RegExp('revoke all on public\\.inventory_items, public\\.inventory_movements, public\\.inventory_reservations from anon, authenticated', 'i'));
}
assert.match(migration, /private\.is_org_member\(organization_id\)/);
assert.match(migration, /private\.is_inventory_manager\(organization_id\)/);
assert.match(migration, /for update\s*;/i, 'stock-sensitive operations lock the item row');
assert.match(migration, /INSUFFICIENT_AVAILABLE_STOCK/);
assert.match(migration, /unique \(organization_id, request_key\)/);
assert.match(migration, /record_inventory_movement/);
assert.match(migration, /reserve_inventory_item/);
assert.match(migration, /release_inventory_reservation/);
assert.match(migration, /revoke all on function public\.record_inventory_movement[^;]+ from public, anon/i);
assert.doesNotMatch(migration, /grant (?:insert|update|delete).*inventory_movements to authenticated/i);
assert.doesNotMatch(migration, /grant (?:insert|update|delete).*inventory_reservations to authenticated/i);

console.log('company inventory MVP security contract: ok');

assert.match(migration, /Salida por cumplimiento de reserva/i);

assert.match(migration, /and request_key=p_request_key/i);
assert.match(migration, /or amount is null/i);

assert.match(migration, /inventory_items_touch_updated_at/i);
assert.match(migration, /new\.updated_at := now\(\)/i);
