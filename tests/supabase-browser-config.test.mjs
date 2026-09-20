import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validatePublicConfig } from '../frontend/js/supabase-browser-client.js';

const valid=validatePublicConfig('https://example.supabase.co','sb_publishable_12345678901234567890');
assert.equal(valid.url,'https://example.supabase.co');
assert.throws(()=>validatePublicConfig('http://example.supabase.co','sb_publishable_12345678901234567890'),/SUPABASE_URL_INVALID/);
assert.throws(()=>validatePublicConfig('https://example.invalid','sb_publishable_12345678901234567890'),/SUPABASE_URL_INVALID/);
assert.throws(()=>validatePublicConfig('https://example.supabase.co','sb_secret_12345678901234567890'),/SUPABASE_SECRET_KEY_FORBIDDEN_IN_BROWSER/);
assert.throws(()=>validatePublicConfig('https://example.supabase.co','service_role_12345678901234567890'),/SUPABASE_SECRET_KEY_FORBIDDEN_IN_BROWSER/);

const privateClient=fs.readFileSync('frontend/js/operation-center-private.js','utf8');
const html=fs.readFileSync('frontend/operation-center-private.html','utf8');
const build=fs.readFileSync('scripts/render-supabase-public-config.mjs','utf8');
assert.match(privateClient,/createSupabaseBrowserClient/);
assert.match(privateClient,/supabase\.signInWithPassword/);
assert.match(privateClient,/supabase\.signUp/);
assert.doesNotMatch(privateClient,/function headers\(/);
assert.match(html,/operation-center-private\.js\?v=pilot-security-v3/);
assert.match(build,/SUPABASE_PUBLISHABLE_KEY/);
assert.match(build,/secret\/service_role key must never be emitted/);

console.log('supabase browser configuration: ok');
