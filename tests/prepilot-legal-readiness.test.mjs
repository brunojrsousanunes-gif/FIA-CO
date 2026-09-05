import assert from 'node:assert/strict';
import fs from 'node:fs';

const readiness = JSON.parse(fs.readFileSync('config/prepilot-legal-readiness.v1.json', 'utf8'));
assert.equal(readiness.status, 'REVIEW_REQUIRED');
assert.equal(readiness.autoApprovalAllowed, false);
assert.ok(readiness.items.length >= 8);
assert.equal(readiness.items.some(item => item.status === 'APPROVED'), false);
assert.match(readiness.rule, /no.*aprobación jurídica|Ningún estado.*aprobación jurídica/i);
assert.ok(readiness.items.some(item => item.id === 'financial_boundary' && /NON_CUSTODIAL/.test(item.description)));

console.log('FIA prepilot legal readiness remains review-gated OK');
