import crypto from 'node:crypto';

export const OPERATION_STATES = Object.freeze({
  DRAFT: 'DRAFT',
  AWAITING_ACCEPTANCE: 'AWAITING_ACCEPTANCE',
  CONDITIONED: 'CONDITIONED',
  IN_PROGRESS: 'IN_PROGRESS',
  DELIVERED: 'DELIVERED',
  ACCEPTED: 'ACCEPTED',
  READY_FOR_RELEASE: 'READY_FOR_RELEASE',
  RELEASE_REQUESTED: 'RELEASE_REQUESTED',
  DISPUTED: 'DISPUTED',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED'
});

export const transitions = Object.freeze({
  DRAFT: Object.freeze(['AWAITING_ACCEPTANCE', 'CANCELLED']),
  AWAITING_ACCEPTANCE: Object.freeze(['CONDITIONED', 'CANCELLED']),
  CONDITIONED: Object.freeze(['IN_PROGRESS', 'DISPUTED', 'CANCELLED']),
  IN_PROGRESS: Object.freeze(['DELIVERED', 'DISPUTED']),
  DELIVERED: Object.freeze(['ACCEPTED', 'DISPUTED']),
  ACCEPTED: Object.freeze(['READY_FOR_RELEASE', 'DISPUTED']),
  READY_FOR_RELEASE: Object.freeze(['RELEASE_REQUESTED', 'DISPUTED']),
  RELEASE_REQUESTED: Object.freeze(['CLOSED', 'DISPUTED']),
  DISPUTED: Object.freeze(['IN_PROGRESS', 'CANCELLED']),
  CLOSED: Object.freeze([]),
  CANCELLED: Object.freeze([])
});

const terminal = new Set(['CLOSED', 'CANCELLED']);

function cleanText(value, max = 120) {
  return String(value ?? '').replace(/[<>]/g, '').trim().slice(0, max);
}

function defaultIdFactory(prefix = 'op') {
  return `${prefix}_${crypto.randomUUID()}`;
}

function defaultClock() {
  return new Date().toISOString();
}

function makeEvidence(type, actor, meta, deps) {
  return Object.freeze({
    id: deps.idFactory('ev'),
    type: cleanText(type, 50),
    actor: cleanText(actor, 80),
    at: deps.clock(),
    meta: Object.freeze({ ...meta })
  });
}

function dependencies(options = {}) {
  return {
    idFactory: options.idFactory || defaultIdFactory,
    clock: options.clock || defaultClock
  };
}

export function createOperation(input = {}, options = {}) {
  const deps = dependencies(options);
  const amount = Number(input.amount || 0);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('INVALID_AMOUNT');

  return {
    id: deps.idFactory('op'),
    kind: cleanText(input.kind || 'generic', 40),
    amount: Math.round(amount * 100) / 100,
    currency: cleanText(input.currency || 'EUR', 6),
    buyer: cleanText(input.buyer || 'buyer', 80),
    seller: cleanText(input.seller || 'seller', 80),
    state: 'DRAFT',
    conditions: {
      sellerAccepted: false,
      courierVerified: false,
      delivered: false,
      buyerAccepted: false,
      noOpenDispute: true
    },
    evidence: [makeEvidence('OPERATION_CREATED', input.actor || 'system', {}, deps)],
    version: 1,
    releaseRequested: false
  };
}

export function isTransitionAllowed(operation, nextState) {
  return (transitions[operation.state] || []).includes(nextState);
}

export function moveOperation(operation, nextState, actor, meta = {}, options = {}) {
  if (terminal.has(operation.state)) throw new Error('TERMINAL_OPERATION');
  if (!isTransitionAllowed(operation, nextState)) throw new Error('INVALID_TRANSITION');
  const deps = dependencies(options);
  operation.state = nextState;
  operation.version += 1;
  operation.evidence.push(makeEvidence(`STATE_${nextState}`, actor, meta, deps));
  return operation;
}

export function setOperationCondition(operation, name, value, actor, options = {}) {
  if (!(name in operation.conditions)) throw new Error('UNKNOWN_CONDITION');
  const deps = dependencies(options);
  operation.conditions[name] = Boolean(value);
  operation.version += 1;
  operation.evidence.push(makeEvidence(`CONDITION_${name.toUpperCase()}`, actor, { value: Boolean(value) }, deps));
  return operation;
}

export function canRequestRelease(operation) {
  const c = operation.conditions;
  return operation.state === 'ACCEPTED'
    && c.sellerAccepted
    && c.courierVerified
    && c.delivered
    && c.buyerAccepted
    && c.noOpenDispute
    && !operation.releaseRequested;
}

export function requestRelease(operation, actor = 'system', options = {}) {
  if (!canRequestRelease(operation)) throw new Error('RELEASE_NOT_ALLOWED');
  moveOperation(operation, 'READY_FOR_RELEASE', actor, {}, options);
  operation.releaseRequested = true;
  moveOperation(operation, 'RELEASE_REQUESTED', actor, { instruction: 'PSP_ONLY' }, options);
  return operation;
}

export function disputeOperation(operation, actor, reason = '', options = {}) {
  if (terminal.has(operation.state)) throw new Error('TERMINAL_OPERATION');
  operation.conditions.noOpenDispute = false;
  return moveOperation(operation, 'DISPUTED', actor, { reason: cleanText(reason, 160) }, options);
}

export function snapshotOperation(operation) {
  return JSON.parse(JSON.stringify(operation));
}
