import assert from 'node:assert/strict';
import {
  ACTION_CLASSES,
  createRecoveryCase,
  activateRecovery,
  scheduleFollowUp,
  recordContactAttempt,
  recordResponse,
  returnToWaiting,
  resolveRecovery,
  expireRecovery,
  cancelRecovery,
  snapshotRecovery
} from '../core/recover/recover-engine.mjs';

let seq = 0;
const idFactory = prefix => `${prefix}_TEST_${++seq}`;
const clock = () => '2026-09-04T06:00:00.000Z';
const deps = { idFactory, clock };

const rec = createRecoveryCase({
  organizationId: 'org-demo',
  sourceId: 'quote-1',
  kind: 'QUOTE',
  subject: '<b>Presupuesto tractor</b>',
  amount: 10000,
  maxAttempts: 3,
  expiresAt: '2026-09-30T00:00:00.000Z',
  actor: 'founder'
}, deps);

assert.equal(rec.state, 'DRAFT');
assert.equal(rec.subject.includes('<'), false);
assert.equal(rec.evidence[0].type, 'RECOVERY_CREATED');

activateRecovery(rec, 'founder', deps);
assert.equal(rec.state, 'WAITING');

scheduleFollowUp(rec, '2026-09-05T09:00:00.000Z', 'system', deps);
assert.equal(rec.nextActionAt, '2026-09-05T09:00:00.000Z');
assert.equal(rec.evidence.at(-1).meta.actionClass, ACTION_CLASSES.AUTO_SAFE);
assert.throws(() => scheduleFollowUp(rec, '2026-09-03T09:00:00.000Z', 'system', deps), /SCHEDULE_IN_PAST/);

assert.throws(() => recordContactAttempt(rec, {
  actor: 'system',
  channel: 'email',
  approved: false
}, deps), /CONTACT_REQUIRES_APPROVAL/);

recordContactAttempt(rec, {
  actor: 'founder',
  channel: 'email',
  templateId: 'quote-followup-v1',
  approvalRef: 'policy-v1',
  approved: true
}, deps);
assert.equal(rec.attempts, 1);

recordResponse(rec, {
  actor: 'ai-classifier',
  responseClass: 'INTERESTED',
  confidence: 0.93,
  classifier: 'recover-classifier-v1'
}, deps);
assert.equal(rec.state, 'HUMAN_REVIEW');
assert.equal(rec.lastResponseClass, 'INTERESTED');
assert.throws(() => resolveRecovery(rec, {
  actor: 'ai-classifier',
  approvedByHuman: false,
  outcome: 'WON'
}, deps), /HUMAN_APPROVAL_REQUIRED/);
assert.throws(() => resolveRecovery(rec, {
  actor: 'founder',
  approvedByHuman: true,
  outcome: 'WON',
  attribution: 'MADE_UP'
}, deps), /INVALID_ATTRIBUTION/);

resolveRecovery(rec, {
  actor: 'founder',
  approvedByHuman: true,
  outcome: 'WON',
  outcomeValue: 10000,
  attribution: 'ASSISTED'
}, deps);
assert.equal(rec.state, 'WON');
assert.equal(rec.outcomeValue, 10000);
assert.equal(rec.evidence.at(-1).meta.attribution, 'ASSISTED');
assert.throws(() => cancelRecovery(rec, 'system', 'late', deps), /TERMINAL_RECOVERY/);

const continuing = createRecoveryCase({ amount: 500, maxAttempts: 2 }, deps);
activateRecovery(continuing, 'human', deps);
recordResponse(continuing, {
  responseClass: 'QUESTION',
  confidence: 0.7,
  actor: 'ai'
}, deps);
returnToWaiting(continuing, {
  actor: 'human',
  approvedByHuman: true,
  reason: 'answer_then_continue'
}, deps);
assert.equal(continuing.state, 'WAITING');

const expiring = createRecoveryCase({
  maxAttempts: 1,
  expiresAt: '2026-09-05T00:00:00.000Z'
}, deps);
activateRecovery(expiring, 'system', deps);
assert.throws(() => expireRecovery(expiring, '2026-09-04T00:00:00.000Z', 'system', deps), /NOT_EXPIRED/);
expireRecovery(expiring, '2026-09-06T00:00:00.000Z', 'system', deps);
assert.equal(expiring.state, 'EXPIRED');

const cancelled = createRecoveryCase({}, deps);
cancelRecovery(cancelled, 'human', '<script>stop</script>', deps);
assert.equal(cancelled.state, 'CANCELLED');
assert.equal(cancelled.evidence.at(-1).meta.reason.includes('<'), false);

const copy = snapshotRecovery(continuing);
copy.state = 'MUTATED';
assert.equal(continuing.state, 'WAITING');

assert.throws(() => createRecoveryCase({ amount: -1 }, deps), /INVALID_AMOUNT/);
assert.throws(() => createRecoveryCase({ maxAttempts: 21 }, deps), /INVALID_MAX_ATTEMPTS/);
assert.throws(() => createRecoveryCase({ expiresAt: 'not-a-date' }, deps), /INVALID_EXPIRY/);
assert.throws(() => scheduleFollowUp(continuing, 'not-a-date', 'system', deps), /INVALID_SCHEDULE/);

console.log('FIA Recover engine contract OK');
