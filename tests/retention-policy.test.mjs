import assert from 'node:assert/strict';
import { evaluateRetention } from '../core/security/retention-policy.mjs';

const keep = evaluateRetention({ createdAt: '2026-09-01T00:00:00Z', retentionDays: 30 }, { now: '2026-09-10T00:00:00Z' });
assert.equal(keep.decision, 'KEEP');
assert.equal(keep.automaticDeletionExecuted, false);

const due = evaluateRetention({ closedAt: '2026-08-01T00:00:00Z', retentionDays: 30 }, { now: '2026-09-05T00:00:00Z' });
assert.equal(due.decision, 'DELETE_DUE');
assert.equal(due.deletionDue, true);

const hold = evaluateRetention({ closedAt: '2026-08-01T00:00:00Z', retentionDays: 30, legalHold: true }, { now: '2026-09-05T00:00:00Z' });
assert.equal(hold.decision, 'HOLD');
assert.equal(hold.deletionDue, false);

console.log('FIA retention policy evaluator contract OK');
