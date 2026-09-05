import assert from 'node:assert/strict';
import { issuePreprodSession, verifyPreprodSession } from '../core/identity/preprod-session-token.mjs';

const secret = '0123456789abcdef0123456789abcdef';
const token = issuePreprodSession({
  actorId: 'actor-demo',
  organizationId: 'org-demo',
  role: 'OWNER'
}, { secret, now: '2026-09-05T01:00:00Z', ttlSeconds: 600 });

const verified = verifyPreprodSession(token, { secret, now: '2026-09-05T01:05:00Z' });
assert.equal(verified.actorId, 'actor-demo');
assert.equal(verified.organizationId, 'org-demo');
assert.equal(verified.role, 'OWNER');
assert.equal(verified.preproductionOnly, true);
assert.equal(verified.productionIdentityVerified, false);

const parts = token.split('.');
const tampered = `${parts[0]}.${parts[1]}x.${parts[2]}`;
assert.throws(() => verifyPreprodSession(tampered, { secret, now: '2026-09-05T01:05:00Z' }), /INVALID_PREPROD_SESSION_SIGNATURE/);
assert.throws(() => verifyPreprodSession(token, { secret, now: '2026-09-05T02:00:00Z' }), /PREPROD_SESSION_EXPIRED/);
assert.throws(() => issuePreprodSession({ actorId: 'a', organizationId: 'o', role: 'OWNER' }, { secret: 'short' }), /SECRET_TOO_SHORT/);

console.log('FIA signed preproduction session contract OK');
