import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql=fs.readFileSync('supabase/migrations/20260917150000_architecture_boundaries.sql','utf8');
const demo=fs.readFileSync('frontend/beta-mobile.html','utf8');
assert.match(sql,/validate_evidence_role/);
assert.match(sql,/EVIDENCE_ROLE_NOT_ALLOWED/);
assert.match(sql,/for update/);
assert.match(sql,/organization_verifications/);
assert.match(sql,/organization_provider_qualifications/);
assert.match(sql,/verification_status='pending'/);
assert.match(sql,/qualification_status='pending'/);
assert.match(sql,/mark_operation_notification_read/);
assert.match(sql,/AUTH_REQUIRED/);
assert.doesNotMatch(sql,/service_role|sb_secret_/);
assert.match(demo,/data-mode="demo"/);
assert.match(demo,/data-data-boundary="local-only"/);
console.log('architecture boundaries contract: ok');
