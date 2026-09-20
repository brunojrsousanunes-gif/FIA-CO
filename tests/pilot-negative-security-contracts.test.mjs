import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const migrationsDir='supabase/migrations';
const sql=fs.readdirSync(migrationsDir)
  .filter(name=>name.endsWith('.sql'))
  .sort()
  .map(name=>fs.readFileSync(path.join(migrationsDir,name),'utf8'))
  .join('\n');

assert.match(sql,/create or replace function public\.accept_operation_invitation/i);
assert.match(sql,/create or replace function public\.transition_operation/i);
assert.match(sql,/create or replace function public\.create_synthetic_part_recovery/i);

assert.match(sql,/if caller is null then raise exception 'AUTH_REQUIRED'/);
assert.match(sql,/private\.can_access_operation\(target_operation\)/);
assert.match(sql,/private\.has_operation_role\(target_operation,'carrier'\)/);
assert.match(sql,/private\.has_operation_role\(target_operation,'buyer'\)/);
assert.match(sql,/raise exception 'VERSION_CONFLICT'/);
assert.match(sql,/raise exception 'ROLE_ALREADY_BOUND'/);
assert.match(sql,/private\.can_manage_operation\(target_parent\)/);
assert.match(sql,/PARENT_NOT_BLOCKED_SYNTHETIC_TRACTOR/);
assert.match(sql,/on conflict \(operation_id,request_id\) do nothing/);
assert.match(sql,/revoke all on function public\.accept_operation_invitation\(uuid,text,uuid\) from public,anon/);
assert.match(sql,/grant execute on function public\.accept_operation_invitation\(uuid,text,uuid\) to authenticated/);
assert.doesNotMatch(sql,/grant execute on function public\.(?:accept_operation_invitation|transition_operation|create_synthetic_part_recovery)[^;]+ to anon/i);
assert.match(sql,/op\.accepted_by=\(select auth\.uid\(\)\)/);

console.log('pilot negative security contracts: ok');
