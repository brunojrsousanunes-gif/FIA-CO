import assert from 'node:assert/strict';
import fs from 'node:fs';

const privateUi = fs.readFileSync('frontend/js/operation-center-private.js', 'utf8');
assert.match(privateUi, /\['manager','admin','ceo'\]\.includes\(m\.member_role\)/,
  'the CEO must see and use the inventory module for their own organization');

const expectedAppliedMigrations = [
  '20260917074223_synthetic_prepilot_operations.sql',
  '20260917074350_optimize_prepilot_rls.sql',
  '20260917122224_architecture_boundaries.sql',
  '20260917122344_architecture_boundaries_hardening.sql',
  '20260917122558_architecture_boundaries_anon_revoke.sql',
  '20260917123141_pilot_access_requests.sql',
  '20260917232700_pilot_security_hardening.sql',
  '20261113212739_company_inventory_mvp.sql',
  '20261113212950_inventory_stock_view_privileges_hardening.sql',
  '20261113213334_inventory_reservation_lock_order_and_view_hardening.sql',
  '20261114004644_guard_operation_incident_resolution.sql',
  '20261114005027_bind_trust_levels_to_shared_privileges.sql'
];
const expectedNewMigrations = [
  '20261114130000_prevent_legacy_participant_claim.sql',
  '20261114150000_authorize_l3_by_company_head_or_zone_manager.sql',
  '20261114170000_bind_ceo_membership_to_l3_authority.sql',
  '20261114180000_revoke_ceo_authority_when_membership_ends.sql',
  '20261114190000_company_data_isolation.sql',
  '20261114200000_index_uncovered_foreign_keys.sql',
  '20261114210000_harden_finance_definer_search_paths.sql',
  '20261114220000_harden_financial_trigger_search_path.sql',
  '20261114230000_index_l3_authority_foreign_keys.sql',
  '20261114240000_create_three_party_operation_draft.sql'
];
const expectedBaselineFiles = [
  '20260916112600_initial_multi_tenant_operations.sql',
  '20260916113200_server_validated_transitions.sql'
];
const availableMigrationFiles = fs.readdirSync('supabase/migrations').filter(file => file.endsWith('.sql')).sort();
const availableBaselineFiles = fs.readdirSync('supabase/baseline').filter(file => file.endsWith('.sql')).sort();
assert.deepEqual(availableBaselineFiles, expectedBaselineFiles,
  'Historical bootstrap SQL must remain outside the executable Supabase migration directory');
assert.deepEqual(availableMigrationFiles, [...expectedAppliedMigrations, ...expectedNewMigrations].sort(),
  'Tracked migrations must match the remote history plus the seven new additive migrations');
assert.deepEqual([...expectedAppliedMigrations].sort(), expectedAppliedMigrations,
  'Applied migration versions must remain chronological');

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


const financeHardening = fs.readFileSync(
  'supabase/migrations/20261114210000_harden_finance_definer_search_paths.sql', 'utf8'
);
assert.match(financeHardening, /alter function private\.is_org_finance_manager\(uuid\) set search_path = ''/i);
assert.match(financeHardening, /alter function private\.enforce_cost_item_company\(\) set search_path = ''/i);
assert.match(financeHardening, /alter function private\.recalculate_operation_margin\(uuid\) set search_path = ''/i);
assert.match(financeHardening, /alter view public\.operation_audit_timeline set \(security_invoker = true\)/i);
const financeTriggerHardening = fs.readFileSync(
  'supabase/migrations/20261114220000_harden_financial_trigger_search_path.sql', 'utf8'
);
assert.match(financeTriggerHardening, /alter function private\.after_financial_change\(\) set search_path = ''/i);


const companyIsolation = fs.readFileSync(
  'supabase/migrations/20261114190000_company_data_isolation.sql', 'utf8'
);
assert.match(companyIsolation, /current_setting\('fia_co\.migration_mode', true\) = 'company_data_isolation'/i,
  'historical backfill must not append audit rows with a null auth.uid()');
assert.match(companyIsolation, /set_config\('fia_co\.migration_mode', 'company_data_isolation', true\)/i,
  'audit suppression must be transaction-local and scoped to the backfill');
assert.match(companyIsolation, /set_config\('fia_co\.migration_mode', 'off', true\)/i,
  'normal trigger behavior must be restored immediately after backfill');
assert.match(companyIsolation, /rebuild_financial_summaries/i,
  'financial summaries must be rebuilt explicitly after the historical backfill');

const threePartyCreation = fs.readFileSync(
  'supabase/migrations/20261114240000_create_three_party_operation_draft.sql', 'utf8'
);
assert.match(threePartyCreation, /language plpgsql\s+security definer\s+set search_path = ''/i);
assert.match(threePartyCreation, /three_distinct_organizations_required/i);
assert.match(threePartyCreation, /all_three_real_organizations_must_be_active/i);
assert.match(threePartyCreation, /active_owner_organization_membership_required/i);
assert.match(threePartyCreation, /grant execute on function public\.create_operation_draft[^;]+ to authenticated/i);
assert.match(threePartyCreation, /revoke all on function public\.create_operation_draft[^;]+ from public, anon/i);
assert.match(threePartyCreation, /private\.append_operation_audit/i);
assert.doesNotMatch(threePartyCreation, /grant execute[^;]+ to anon/i);

const operationCenterHtml = fs.readFileSync('frontend/operation-center.html', 'utf8');
const operationCenterJs = fs.readFileSync('frontend/js/operation-center.js', 'utf8');
assert.match(operationCenterHtml, /connect-src 'self' https:\/\/etttredbkbcgqwciipls\.supabase\.co/i);
assert.match(operationCenterHtml, /data-backend-login/);
assert.match(operationCenterHtml, /data-backend-results/);
assert.match(operationCenterHtml, /data-backend-create/);
assert.match(operationCenterHtml, /Identificador del vendedor/);
assert.match(operationCenterJs, /sb_publishable_[A-Za-z0-9_-]+/);
assert.match(operationCenterJs, /rpc\/create_operation_draft/);
assert.match(operationCenterJs, /new Set\(\[sellerOrg,carrierOrg,buyerOrg\]\)\.size!==3/);
assert.match(operationCenterJs, /crypto\.randomUUID\(\)/);
assert.match(operationCenterJs, /authCall\('token\?grant_type=password'/);
assert.ok(operationCenterJs.includes('/auth/v1/${path}'));
assert.match(operationCenterJs, /organization_members\?select=organization_id,member_role/);
assert.match(operationCenterJs, /organizations\?select=id,status,is_synthetic/);
assert.match(operationCenterJs, /is_synthetic=eq\.false/);
assert.match(operationCenterJs, /Empresas reales activas/);
assert.match(operationCenterJs, /activeMemberships\.length===0/);
assert.match(operationCenterJs, /operations\?select=id,reference,title,status,operation_type,version,created_at/);
assert.doesNotMatch(operationCenterJs, /service_role|localStorage|sessionStorage|amount_cents|calculated_margin_cents|total_cost_cents/i,
  'browser integration must not use service credentials, persist sessions, or request financial columns');
assert.match(operationCenterJs, /window\.addEventListener\('pagehide',\(\)=>\{backendSession=null;\}\)/);




console.log('company inventory MVP security and migration history contract: ok');
