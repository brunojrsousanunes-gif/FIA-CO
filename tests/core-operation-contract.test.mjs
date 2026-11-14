import assert from 'node:assert/strict';
import {
  createOperation,
  moveOperation,
  setOperationCondition,
  canRequestRelease,
  requestRelease,
  disputeOperation,
  snapshotOperation
} from '../core/operations/operation-engine.mjs';

let seq = 0;
const idFactory = prefix => `${prefix}_TEST_${++seq}`;
const clock = () => '2026-08-21T00:00:00.000Z';
const deps = { idFactory, clock };

const op = createOperation({
  amount: 100,
  currency: 'EUR',
  buyer: 'buyer-1',
  seller: 'seller-1',
  actor: 'buyer-1'
}, deps);

assert.equal(op.state, 'DRAFT');
assert.equal(op.version, 1);
assert.equal(op.evidence.length, 1);
assert.equal(op.evidence[0].type, 'OPERATION_CREATED');

moveOperation(op, 'AWAITING_ACCEPTANCE', 'buyer-1', {}, deps);
moveOperation(op, 'CONDITIONED', 'seller-1', {}, deps);
moveOperation(op, 'IN_PROGRESS', 'system', {}, deps);
setOperationCondition(op, 'sellerAccepted', true, 'seller-1', deps);
setOperationCondition(op, 'courierVerified', true, 'courier', deps);
setOperationCondition(op, 'delivered', true, 'courier', deps);
moveOperation(op, 'DELIVERED', 'courier', {}, deps);
setOperationCondition(op, 'buyerAccepted', true, 'buyer-1', deps);
moveOperation(op, 'ACCEPTED', 'buyer-1', {}, deps);

assert.equal(canRequestRelease(op), true);
requestRelease(op, 'system', deps);
assert.equal(op.state, 'RELEASE_REQUESTED');
assert.equal(op.releaseRequested, true);
assert.equal(op.evidence.at(-1).meta.instruction, 'PSP_ONLY');

moveOperation(op, 'CLOSED', 'system', {}, deps);
assert.equal(op.state, 'CLOSED');
assert.throws(() => moveOperation(op, 'DISPUTED', 'buyer-1', {}, deps), /TERMINAL_OPERATION/);

const disputed = createOperation({ amount: 50 }, deps);
moveOperation(disputed, 'AWAITING_ACCEPTANCE', 'buyer', {}, deps);
moveOperation(disputed, 'CONDITIONED', 'seller', {}, deps);
disputeOperation(disputed, 'buyer', '<script>reason</script>', deps);
assert.equal(disputed.state, 'DISPUTED');
assert.equal(disputed.conditions.noOpenDispute, false);
assert.equal(disputed.evidence.at(-1).meta.reason.includes('<'), false);

const copy = snapshotOperation(disputed);
copy.state = 'MUTATED';
assert.equal(disputed.state, 'DISPUTED');

assert.throws(() => createOperation({ amount: 0 }, deps), /INVALID_AMOUNT/);
assert.throws(() => moveOperation(createOperation({ amount: 10 }, deps), 'CLOSED', 'system', {}, deps), /INVALID_TRANSITION/);
assert.throws(() => setOperationCondition(createOperation({ amount: 10 }, deps), 'unknown', true, 'system', deps), /UNKNOWN_CONDITION/);

const invalidDispute = createOperation({ amount: 20 }, deps);
const beforeInvalidDispute = JSON.stringify(invalidDispute);
assert.throws(() => disputeOperation(invalidDispute, 'buyer', 'not yet disputable', deps), /INVALID_TRANSITION/);
assert.equal(JSON.stringify(invalidDispute), beforeInvalidDispute,
  'a rejected dispute must not mutate the operation');

const strictCondition = createOperation({ amount: 30 }, deps);
const beforeInvalidCondition = JSON.stringify(strictCondition);
assert.throws(() => setOperationCondition(strictCondition, 'delivered', 'false', 'courier', deps), /INVALID_CONDITION_VALUE/);
assert.equal(JSON.stringify(strictCondition), beforeInvalidCondition,
  'non-boolean condition input must not mutate the operation');

const nestedMeta = { details: { note: 'original' }, tags: ['safe'] };
const evidenceOperation = createOperation({ amount: 40 }, deps);
moveOperation(evidenceOperation, 'AWAITING_ACCEPTANCE', 'buyer', nestedMeta, deps);
nestedMeta.details.note = 'tampered';
nestedMeta.tags.push('tampered');
assert.equal(evidenceOperation.evidence.at(-1).meta.details.note, 'original');
assert.deepEqual(evidenceOperation.evidence.at(-1).meta.tags, ['safe']);

const terminalCondition = createOperation({ amount: 50 }, deps);
moveOperation(terminalCondition, 'AWAITING_ACCEPTANCE', 'buyer', {}, deps);
moveOperation(terminalCondition, 'CONDITIONED', 'seller', {}, deps);
moveOperation(terminalCondition, 'IN_PROGRESS', 'courier', {}, deps);
moveOperation(terminalCondition, 'DELIVERED', 'courier', {}, deps);
moveOperation(terminalCondition, 'ACCEPTED', 'buyer', {}, deps);
moveOperation(terminalCondition, 'READY_FOR_RELEASE', 'system', {}, deps);
moveOperation(terminalCondition, 'RELEASE_REQUESTED', 'system', {}, deps);
moveOperation(terminalCondition, 'CLOSED', 'system', {}, deps);
const beforeTerminalCondition = JSON.stringify(terminalCondition);
assert.throws(() => setOperationCondition(terminalCondition, 'buyerAccepted', false, 'buyer', deps), /TERMINAL_OPERATION/);
assert.equal(JSON.stringify(terminalCondition), beforeTerminalCondition);


console.log('Core operation contract OK');
