import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql=fs.readFileSync('supabase/migrations/20260917195000_pilot_security_hardening.sql','utf8');
const app=fs.readFileSync('frontend/js/operation-center-private.js','utf8');
const html=fs.readFileSync('frontend/operation-center-private.html','utf8');
const headers=fs.readFileSync('frontend/_headers','utf8');
const allowlist=fs.readFileSync('config/pages-public-allowlist.txt','utf8');

assert.match(sql,/accepted_by uuid references auth\.users/);
assert.match(sql,/op\.status = 'accepted'/);
assert.match(sql,/op\.accepted_by = \(select auth\.uid\(\)\)/);
assert.match(sql,/revoke insert,update,delete on public\.operations from authenticated/);
assert.match(sql,/revoke insert,update,delete on public\.operation_participants from authenticated/);
assert.match(sql,/confirmations_bound_account_insert/);
assert.doesNotMatch(app,/fia_demo_session/);
assert.doesNotMatch(app,/sessionStorage\.setItem\([^\n]*access_token/);
assert.match(html,/únicamente en memoria/);
assert.match(headers,/Content-Security-Policy:.*frame-ancestors 'none'/);
assert.match(headers,/X-Frame-Options: DENY/);
assert.match(headers,/Permissions-Policy:/);
assert.match(allowlist,/^_headers$/m);

console.log('pilot security hardening contract: ok');
