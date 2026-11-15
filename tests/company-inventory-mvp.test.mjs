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
  '20261114240000_create_three_party_operation_draft.sql',
  '20261115000000_owner_membership_access_hardening.sql',
  '20261115010000_make_l3_authorization_retry_idempotent.sql',
  '20261115020000_harden_operation_rpc_idempotency.sql',
  '20261115040000_harden_l3_revocation_and_reservation_retries.sql',
  '20261115050000_harden_logistics_quote_selection.sql',
  '20261115060000_harden_logistics_quote_deletion.sql',
  '20261115070000_minimize_company_verification_column_visibility.sql',
  '20261115080000_authorize_carrier_logistics_quote_submission.sql'
];
const operationRpcHardening = fs.readFileSync(
  'supabase/migrations/20261115020000_harden_operation_rpc_idempotency.sql', 'utf8'
);
assert.match(operationRpcHardening, /create or replace function public\.accept_operation_invitation[\s\S]*?security definer[\s\S]*?set search_path to ''/i);
assert.match(operationRpcHardening, /create or replace function public\.create_operation_draft[\s\S]*?security definer[\s\S]*?set search_path to ''/i);
assert.match(operationRpcHardening, /create or replace function public\.create_synthetic_part_recovery[\s\S]*?security definer[\s\S]*?set search_path to ''/i);
assert.match(operationRpcHardening, /request_key is null/i);
assert.match(operationRpcHardening, /IDEMPOTENCY_KEY_REUSED/i);
assert.match(operationRpcHardening, /pg_advisory_xact_lock/i);
assert.match(operationRpcHardening, /recovery\.created/i);
assert.match(operationRpcHardening, /recovery\.linked/i);
assert.match(operationRpcHardening, /three_distinct_synthetic_organizations_required/i);

const l3AndReservationHardening = fs.readFileSync(
  'supabase/migrations/20261115040000_harden_l3_revocation_and_reservation_retries.sql', 'utf8'
);
assert.match(l3AndReservationHardening, /create or replace function public\.revoke_organization_l3_authorization[\s\S]*?authority_verification_id is distinct from authority\.id/i);
assert.match(l3AndReservationHardening, /create or replace function public\.release_inventory_reservation[\s\S]*?reservation_row\.status=final_status[\s\S]*?return reservation_row/i);

const logisticsQuoteDeletion = fs.readFileSync(
  'supabase/migrations/20261115060000_harden_logistics_quote_deletion.sql', 'utf8'
);
assert.match(logisticsQuoteDeletion, /create or replace function public\.delete_logistics_quote[\s\S]*?security definer[\s\S]*?set search_path = ''/i);
assert.match(logisticsQuoteDeletion, /pg_advisory_xact_lock/i);
assert.match(logisticsQuoteDeletion, /QUOTE_SELECTED_CANNOT_DELETE/i);
assert.match(logisticsQuoteDeletion, /revoke delete on public\.logistics_quotes from public, anon, authenticated/i);

const verificationVisibility = fs.readFileSync(
  'supabase/migrations/20261115070000_minimize_company_verification_column_visibility.sql', 'utf8'
);
assert.match(verificationVisibility, /revoke select on public\.organization_verifications\s+from public, anon, authenticated/i);
assert.match(verificationVisibility, /revoke select on public\.organization_provider_qualifications\s+from public, anon, authenticated/i);
assert.doesNotMatch(verificationVisibility, /grant select \([\s\S]*?\b(?:tax_id_last4|evidence_ref|verified_by)\b/i);
assert.match(verificationVisibility, /grant select \([\s\S]*?verification_status[\s\S]*?\) on public\.organization_verifications to authenticated/i);
assert.match(verificationVisibility, /grant select \([\s\S]*?qualification_status[\s\S]*?\) on public\.organization_provider_qualifications to authenticated/i);
assert.doesNotMatch(verificationVisibility, /revoke[^;]*service_role/i, 'trusted service-role grants must remain untouched');

const carrierQuoteAuthorization = fs.readFileSync(
  'supabase/migrations/20261115080000_authorize_carrier_logistics_quote_submission.sql', 'utf8'
);
assert.match(carrierQuoteAuthorization, /create or replace function private\\.can_submit_logistics_quote[\\s\\S]*?security definer[\\s\\S]*?set search_path = ''/i);
assert.match(carrierQuoteAuthorization, /participant_role = 'carrier'[\\s\\S]*?op\\.status = 'accepted'[\\s\\S]*?op\\.accepted_by = \\(select auth\\.uid\\(\\)\\)/i);
assert.match(carrierQuoteAuthorization, /om\\.status = 'active'[\\s\\S]*?org\\.status = 'active'/i);
assert.match(carrierQuoteAuthorization, /drop policy if exists logistics_quotes_creator_insert[\\s\\S]*?create policy logistics_quotes_carrier_submit/i);
assert.match(carrierQuoteAuthorization, /created_by = \\(select auth\\.uid\\(\\)\\)[\\s\\S]*?status = 'offered'[\\s\\S]*?private\\.can_submit_logistics_quote/i);
assert.match(carrierQuoteAuthorization, /revoke all on function private\\.can_submit_logistics_quote\\(uuid, uuid\\)[\\s\\S]*?from public, anon, authenticated/i);

const expectedBaselineFiles = [
  '20260916112600_initial_multi_tenant_operations.sql',
  '20260916113200_server_validated_transitions.sql'
];
const availableMigrationFiles = fs.readdirSync('supabase/migrations').filter(file => file.endsWith('.sql')).sort();
const availableBaselineFiles = fs.readdirSync('supabase/baseline').filter(file => file.endsWith('.sql')).sort();
assert.deepEqual(availableBaselineFiles, expectedBaselineFiles,
  'Historical bootstrap SQL must remain outside the executable Supabase migration directory');
assert.deepEqual(availableMigrationFiles, [...expectedAppliedMigrations, ...expectedNewMigrations].sort(),
  'Tracked migrations must match the remote history plus the additive migrations');
assert.deepEqual([...expectedAppliedMigrations].sort(), expectedAppliedMigrations,
  'Applied migration versions must remain chronological');

const migration = fs.readFileSync(
  'supabase/migrations/20261113212739_company_inventory_mvp.sql', 'utf8'
);
for (const table of ['inventory_items','inventory_movements','inventory_reservations']) {
  assert.match(migration, new RegExp('create table public\.' + table, 'i'));
  assert.match(migration, new RegExp('alter table public\.' + table + ' enable row level security', 'i'));
  assert.match(migration, new RegExp('revoke all on public\.inventory_items, public\.inventory_movements, public\.inventory_reservations from anon, authenticated', 'i'));
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


const ownerMembershipHardening = fs.readFileSync(
  'supabase/migrations/20261115000000_owner_membership_access_hardening.sql', 'utf8'
);
assert.match(ownerMembershipHardening, /create or replace function private\.can_access_operation[\s\S]*?join public\.organization_members om[\s\S]*?om\.organization_id = o\.owner_organization_id[\s\S]*?om\.status = 'active'/i,
  'creator access must require active membership in the owning organization');
assert.match(ownerMembershipHardening, /create or replace function private\.can_manage_operation[\s\S]*?join public\.organization_members om[\s\S]*?om\.organization_id = o\.owner_organization_id[\s\S]*?om\.status = 'active'/i,
  'creator management must require active membership in the owning organization');
for (const signature of [
  'private.after_confirmation_insert()',
  'private.after_incident_change()',
  'private.after_participant_acceptance()',
  'private.append_operation_audit(uuid,text,uuid,jsonb,uuid)',
  'private.enqueue_operation_notice(uuid,text,text)',
  'private.is_org_member(uuid)',
  'private.validate_evidence_role()'
]) {
  assert.ok(ownerMembershipHardening.includes(`alter function ${signature} set search_path = ''`),
    `SECURITY DEFINER search_path must be hardened for ${signature}`);
}
assert.ok(ownerMembershipHardening.includes('drop policy if exists operations_creator_draft_update on public.operations;'));
assert.ok((ownerMembershipHardening.match(/and om\.status = 'active'/g) || []).length >= 4,
  'creator access, management and draft UPDATE paths must require active owner membership');
assert.match(ownerMembershipHardening, /revoke all on function private\.can_access_operation\(uuid\) from public, anon/i);
assert.match(ownerMembershipHardening, /revoke all on function private\.can_manage_operation\(uuid\) from public, anon/i);

const privateOperationCenterJs = fs.readFileSync('frontend/js/operation-center-private.js', 'utf8');
assert.ok(privateOperationCenterJs.includes("ui.password.value='';saveSession(payload)"));
assert.ok(privateOperationCenterJs.includes("ui.registerPassword.value='';sessionStorage.removeItem('fia_pending_pilot_access')"));
assert.ok(privateOperationCenterJs.includes('async function refreshSession()'));
assert.ok(privateOperationCenterJs.includes('Promise.allSettled(['));
assert.ok(privateOperationCenterJs.includes("if(error.status!==401||!state.refreshToken)throw error;"));
assert.ok(privateOperationCenterJs.includes("error.code==='SESSION_REFRESH_FAILED'"));
assert.ok(privateOperationCenterJs.includes("if(token)fetch(\u0060\u0024{SUPABASE_URL}/auth/v1/logout\u0060"));
assert.ok(privateOperationCenterJs.includes("finance?money(finance.amount_cents):'Solo visible para la empresa titular'"));
assert.match(privateOperationCenterJs, /operations\?select=id,reference,title,status,version,operation_type/);
assert.doesNotMatch(privateOperationCenterJs, /operations\?select=[^'\u0060]*amount_cents/,
  'the general operations listing must not expose transaction amounts');

assert.ok(ownerMembershipHardening.includes('revoke select (amount_cents, currency) on public.operations from anon, authenticated;'));
assert.ok(ownerMembershipHardening.includes('drop policy if exists organizations_visible_select on public.organizations;'));
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
assert.ok(operationCenterJs.includes('let backendSession=null,backendRefreshPromise=null;'));
assert.ok(operationCenterJs.includes('const pending=backendRefreshPromise;'));
assert.ok(operationCenterJs.includes('if(backendRefreshPromise===pending)backendRefreshPromise=null;'));
assert.ok(operationCenterJs.includes("logoutBackend();\n  if(current)fetch("));
assert.ok(operationCenterJs.includes("loginForm.elements.password.value=''"));
assert.match(operationCenterJs, /authCall\('token\?grant_type=password'/);
assert.ok(operationCenterJs.includes('/auth/v1/${path}'));
assert.match(operationCenterJs, /organization_members\?select=organization_id,member_role/);
assert.match(operationCenterJs, /organizations\?select=id,status,is_synthetic/);
assert.match(operationCenterJs, /is_synthetic=eq\.false/);
assert.match(operationCenterJs, /Empresas reales activas/);
assert.match(operationCenterJs, /activeMemberships\.length===0/);
assert.match(operationCenterJs, /operations\?select=id,reference,title,status,operation_type,version,created_at/);
assert.ok(operationCenterJs.includes('JSON.stringify({userId:backendSession?.user?.id||null,payload})'), 'pending draft keys must be isolated between authenticated accounts');
assert.match(operationCenterJs, /async function pendingBackendRequestKey\(scope,payload\)[\s\S]*?crypto\.subtle\.digest[\s\S]*?sessionStorage\.setItem/i,
  'real operation creation must persist only a payload fingerprint and pending request key for safe retries');
assert.match(operationCenterJs, /pendingBackendRequestKey\('create_operation_draft',payload\)/);
assert.match(operationCenterJs, /backendPost\('rpc\/create_operation_draft',\{\.\.\.payload,request_key:pending\.key\}\)/);
assert.match(operationCenterJs, /clearBackendRequestKey\(pending\.storageKey\)/);
assert.doesNotMatch(operationCenterJs, /service_role|localStorage|sessionStorage\.setItem\([^,]*(?:access_token|refresh_token|session)/i,
  'browser integration must not use service credentials or persist authentication sessions');
assert.doesNotMatch(operationCenterJs, /amount_cents|calculated_margin_cents|total_cost_cents/i,
  'the public creation interface must not request financial columns');
assert.match(operationCenterJs, /window\.addEventListener\('pagehide',\(\)=>\{backendSession=null;backendRefreshPromise=null;\}\)/);




console.log('company inventory MVP security and migration history contract: ok');
