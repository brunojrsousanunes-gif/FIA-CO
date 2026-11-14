import assert from 'node:assert/strict';
import fs from 'node:fs';

const expectedMigrationFiles = [
  '20260917074223_synthetic_prepilot_operations.sql',
  '20260917074350_optimize_prepilot_rls.sql',
  '20261113212739_company_inventory_mvp.sql',
  '20261113212950_inventory_stock_view_privileges_hardening.sql',
  '20261113213334_inventory_reservation_lock_order_and_view_hardening.sql',
  '20261114004644_guard_operation_incident_resolution.sql',
  '20261114005027_bind_trust_levels_to_shared_privileges.sql'
];
const availableMigrationFiles = fs.readdirSync('supabase/migrations');
for (const file of expectedMigrationFiles) {
  assert.ok(availableMigrationFiles.includes(file), `Missing migration matching applied Supabase history: ${file}`);
}
assert.deepEqual([...expectedMigrationFiles].sort(), expectedMigrationFiles, 'Applied migrations must remain in chronological order');
assert.ok(!availableMigrationFiles.includes('20260917110000_synthetic_prepilot_operations.sql'));
assert.ok(!availableMigrationFiles.includes('20260917113000_optimize_prepilot_rls.sql'));
assert.ok(!availableMigrationFiles.includes('20261113150000_company_inventory_mvp.sql'));
assert.ok(!availableMigrationFiles.includes('20261113230000_inventory_reservation_lock_order_and_view_hardening.sql'));
assert.ok(!availableMigrationFiles.includes('20261114090000_guard_operation_incident_resolution.sql'));
assert.ok(!availableMigrationFiles.includes('20261114110000_bind_trust_levels_to_shared_privileges.sql'));

const migration = fs.readFileSync(
  'supabase/migrations/20261113212739_company_inventory_mvp.sql', 'utf8'
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


const viewHardening = fs.readFileSync(
  'supabase/migrations/20261113212950_inventory_stock_view_privileges_hardening.sql', 'utf8'
);
assert.match(viewHardening, /alter view public\.inventory_stock set \(security_invoker = true\)/i);
assert.match(viewHardening, /revoke all on public\.inventory_stock from public, anon/i);
assert.match(viewHardening, /grant select on public\.inventory_stock to authenticated/i);

console.log('company inventory MVP security contract: ok');

assert.match(migration, /Salida por cumplimiento de reserva/i);

assert.match(migration, /and request_key=p_request_key/i);
assert.match(migration, /or amount is null/i);

assert.match(migration, /inventory_items_touch_updated_at/i);
assert.match(migration, /new\.updated_at := now\(\)/i);

assert.match(migration, /create or replace function private\.touch_inventory_item_updated_at\(\)[\s\S]*?as \$function\$[\s\S]*?end;[\s\S]*?\$function\$;/i,
  'updated_at trigger function must use a valid dollar-quoted PL/pgSQL body');
assert.doesNotMatch(migration, /touch_inventory_item_updated_at\(\)[\s\S]*?as \$\s*begin/i,
  'updated_at trigger must not use a bare dollar delimiter');
