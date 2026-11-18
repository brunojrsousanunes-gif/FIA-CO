import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sql = readFileSync(new URL('../scripts/maintenance/cleanup-synthetic-supabase.sql', import.meta.url), 'utf8');

assert.ok(sql.indexOf('BEGIN;') > sql.indexOf('-- Execute as a controlled database administrator'));
assert.match(sql, /COMMIT;\s*$/);
assert.match(sql, /private\.synthetic_cleanup_runs/);
assert.match(sql, /ALTER TABLE private\.synthetic_cleanup_runs ENABLE ROW LEVEL SECURITY/i,
  'the internal cleanup ledger must have RLS enabled with no client policies');
assert.match(sql, /actor_type, actor_label, actor_user_id/);
assert.match(sql, /'system', 'FIA&CO authorized maintenance', NULL/);
assert.match(sql, /set_config\('fia_co\.migration_mode', 'company_data_isolation', true\)/);
assert.match(sql, /-- Child operations first because parent_operation_id is ON DELETE RESTRICT/);
assert.match(sql, /array_agg\(id ORDER BY id\).*auth\.users/s);
assert.match(sql, /CLEANUP_ABORT: Auth identities changed unexpectedly/);
assert.doesNotMatch(sql, /DELETE\s+FROM\s+auth\.users/i);
assert.doesNotMatch(sql, /TRUNCATE\s+/i);
assert.doesNotMatch(sql, /DROP\s+TABLE/i);
for (const id of [
  '1f01dd2f-b1b9-45c7-b477-70273ef6cc1a',
  '0f42d46a-ec0b-48bf-add9-5ea49f64dba6',
  'f8821aa2-6c24-49a2-a899-fcd18738665e',
  '66faa8c0-1a85-494e-9d40-038d184fbea8',
  '795e4666-7ee0-4674-87ff-82ce758a4090',
  'c2dc9ffe-64aa-436c-af55-def5c497a2ab',
  '44683c5c-4453-4762-8fb3-d97960573744',
  'c2f404e6-b37c-43f7-a76a-8147f3fd44d8',
  '15fa9b78-b3d0-4c50-ade6-9a45730ca582'
]) assert.ok(sql.includes(id), `Missing pinned synthetic ID ${id}`);

console.log('Synthetic Supabase cleanup script contract passed');
