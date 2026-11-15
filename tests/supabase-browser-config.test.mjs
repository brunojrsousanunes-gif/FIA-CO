import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createSupabaseBrowserClient, validatePublicConfig } from '../frontend/js/supabase-browser-client.js';

const valid=validatePublicConfig('https://example.supabase.co','sb_publishable_12345678901234567890');
assert.equal(valid.url,'https://example.supabase.co');
assert.throws(()=>validatePublicConfig('http://example.supabase.co','sb_publishable_12345678901234567890'),/SUPABASE_URL_INVALID/);
assert.throws(()=>validatePublicConfig('https://example.invalid','sb_publishable_12345678901234567890'),/SUPABASE_URL_INVALID/);
assert.throws(()=>validatePublicConfig('https://example.supabase.co','sb_secret_12345678901234567890'),/SUPABASE_SECRET_KEY_FORBIDDEN_IN_BROWSER/);
assert.throws(()=>validatePublicConfig('https://example.supabase.co','service_role_12345678901234567890'),/SUPABASE_SECRET_KEY_FORBIDDEN_IN_BROWSER/);
const serviceRolePayload=Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url');
const anonPayload=Buffer.from(JSON.stringify({role:'anon'})).toString('base64url');
assert.throws(()=>validatePublicConfig('https://example.supabase.co',`eyJhbGciOiJub25lIn0.${serviceRolePayload}.signature`),/SUPABASE_SECRET_KEY_FORBIDDEN_IN_BROWSER/);
assert.doesNotThrow(()=>validatePublicConfig('https://example.supabase.co',`eyJhbGciOiJub25lIn0.${anonPayload}.signature`));

const originalFetch=globalThis.fetch;
let capturedRequest;
globalThis.fetch=async(url,options)=>{
  capturedRequest={url,options};
  return{ok:true,status:200,json:async()=>({ok:true})};
};
try{
  const client=createSupabaseBrowserClient({
    url:'https://example.supabase.co',
    publishableKey:'sb_publishable_12345678901234567890',
    getAccessToken:()=> 'test-access-token'
  });
  assert.deepEqual(await client.request('/rest/v1/operations',{
    cache:'force-cache',credentials:'include'
  }),{ok:true});
  assert.equal(capturedRequest.options.cache,'no-store','authenticated API responses must not enter the browser HTTP cache');
  assert.equal(capturedRequest.options.credentials,'omit','Supabase requests must not attach ambient browser cookies');
  assert.equal(capturedRequest.options.headers.Authorization,'Bearer test-access-token');
  assert.equal(capturedRequest.options.headers.apikey,'sb_publishable_12345678901234567890');
}finally{
  globalThis.fetch=originalFetch;
}

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
