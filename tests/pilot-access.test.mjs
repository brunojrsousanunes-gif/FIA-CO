import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql=fs.readFileSync('supabase/migrations/20260917123141_pilot_access_requests.sql','utf8');
const html=fs.readFileSync('frontend/operation-center-private.html','utf8');
const app=fs.readFileSync('frontend/js/operation-center-private.js','utf8');
const client=fs.readFileSync('frontend/js/supabase-browser-client.js','utf8');

assert.match(sql,/create table public\.pilot_access_requests/);
assert.match(sql,/enable row level security/);
assert.match(sql,/security invoker/);
assert.match(sql,/revoke all on public\.pilot_access_requests from anon/);
assert.match(sql,/requested_member_role='member'/);
assert.doesNotMatch(sql,/security definer|service_role|sb_secret_/);
assert.match(client,/function signUp/);
assert.match(app,/request_pilot_access/);
assert.match(app,/fia_pending_pilot_access/);
assert.match(html,/Crear la cuenta no concede acceso operativo/);
assert.match(html,/pilot-security-v2/);
console.log('pilot access request contract: ok');
