import crypto from 'node:crypto';

export const RECOVERY_STATES = Object.freeze({
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  WAITING: 'WAITING',
  RESPONSE_RECEIVED: 'RESPONSE_RECEIVED',
  HUMAN_REVIEW: 'HUMAN_REVIEW',
  WON: 'WON',
  LOST: 'LOST',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED'
});

export const RESPONSE_CLASSES = Object.freeze({
  INTERESTED: 'INTERESTED',
  QUESTION: 'QUESTION',
  DECLINED: 'DECLINED',
  UNKNOWN: 'UNKNOWN'
});

export const ACTION_CLASSES = Object.freeze({
  AUTO_SAFE: 'AUTO_SAFE',
  AUTO_WITH_POLICY: 'AUTO_WITH_POLICY',
  HUMAN_APPROVAL: 'HUMAN_APPROVAL',
  PROHIBITED: 'PROHIBITED'
});

const terminal = new Set(['WON', 'LOST', 'EXPIRED', 'CANCELLED']);

const transitions = Object.freeze({
  DRAFT: Object.freeze(['ACTIVE', 'CANCELLED']),
  ACTIVE: Object.freeze(['WAITING', 'CANCELLED']),
  WAITING: Object.freeze(['WAITING', 'RESPONSE_RECEIVED', 'EXPIRED', 'CANCELLED']),
  RESPONSE_RECEIVED: Object.freeze(['HUMAN_REVIEW', 'CANCELLED']),
  HUMAN_REVIEW: Object.freeze(['WAITING', 'WON', 'LOST', 'CANCELLED']),
  WON: Object.freeze([]),
  LOST: Object.freeze([]),
  EXPIRED: Object.freeze([]),
  CANCELLED: Object.freeze([])
});

function cleanText(value, max = 160) {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .slice(0, max);
}

function defaultIdFactory(prefix = 'rec') {
  return `${prefix}_${crypto.randomUUID()}`;
}

function defaultClock() {
  return new Date().toISOString();
}

function dependencies(options = {}) {
  return {
    idFactory: options.idFactory || defaultIdFactory,
    clock: options.clock || defaultClock
  };
}

function makeEvidence(type, actor, meta, deps) {
  return Object.freeze({
    id: deps.idFactory('rev'),
    type: cleanText(type, 60),
    actor: cleanText(actor || 'system', 80),
    at: deps.clock(),
    meta: Object.freeze({ ...meta })
  });
}

function ensureOpen(recovery) {
  if (!recovery || typeof recovery !== 'object') throw new Error('INVALID_RECOVERY');
  if (terminal.has(recovery.state)) throw new Error('TERMINAL_RECOVERY');
}

function move(recovery, nextState, actor, meta, deps) {
  if (!transitions[recovery.state]?.includes(nextState)) throw new Error('INVALID_TRANSITION');
  recovery.state = nextState;
  recovery.version += 1;
  recovery.evidence.push(makeEvidence(`STATE_${nextState}`, actor, meta, deps));
  return recovery;
}

export function createRecoveryCase(input = {}, options = {}) {
  const deps = dependencies(options);
  const kind = cleanText(input.kind || 'QUOTE', 32).toUpperCase();
  const amount = input.amount == null ? null : Number(input.amount);
  if (amount != null && (!Number.isFinite(amount) || amount < 0)) throw new Error('INVALID_AMOUNT');

  const maxAttempts = Number(input.maxAttempts ?? 3);
  if (!Number.isInteger(maxAttempts) || maxAttempts < 0 || maxAttempts > 20) {
    throw new Error('INVALID_MAX_ATTEMPTS');
  }

  const caseId = deps.idFactory('rec');
  return {
    id: caseId,
    organizationId: cleanText(input.organizationId || '', 80) || null,
    sourceId: cleanText(input.sourceId || '', 120) || null,
    kind,
    subject: cleanText(input.subject || '', 140),
    amount: amount == null ? null : Math.round(amount * 100) / 100,
    currency: cleanText(input.currency || 'EUR', 6),
    state: 'DRAFT',
    attempts: 0,
    maxAttempts,
    nextActionAt: null,
    expiresAt: cleanText(input.expiresAt || '', 40) || null,
    lastResponseClass: null,
    outcome: null,
    outcomeValue: null,
    version: 1,
    evidence: [makeEvidence('RECOVERY_CREATED', input.actor || 'system', { kind }, deps)]
  };
}

export function activateRecovery(recovery, actor = 'system', options = {}) {
  ensureOpen(recovery);
  const deps = dependencies(options);
  move(recovery, 'ACTIVE', actor, {}, deps);
  return move(recovery, 'WAITING', actor, {}, deps);
}

export function scheduleFollowUp(recovery, at, actor = 'system', options = {}) {
  ensureOpen(recovery);
  if (!['WAITING', 'HUMAN_REVIEW'].includes(recovery.state)) throw new Error('SCHEDULE_NOT_ALLOWED');
  const when = cleanText(at, 40);
  if (!when || Number.isNaN(Date.parse(when))) throw new Error('INVALID_SCHEDULE');
  const deps = dependencies(options);
  recovery.nextActionAt = new Date(when).toISOString();
  recovery.version += 1;
  recovery.evidence.push(makeEvidence('FOLLOW_UP_SCHEDULED', actor, {
    at: recovery.nextActionAt,
    actionClass: ACTION_CLASSES.AUTO_SAFE
  }, deps));
  return recovery;
}

export function recordContactAttempt(recovery, input = {}, options = {}) {
  ensureOpen(recovery);
  if (recovery.state !== 'WAITING') throw new Error('CONTACT_NOT_ALLOWED');
  if (recovery.attempts >= recovery.maxAttempts) throw new Error('MAX_ATTEMPTS_REACHED');
  if (input.approved !== true) throw new Error('CONTACT_REQUIRES_APPROVAL');

  const deps = dependencies(options);
  recovery.attempts += 1;
  recovery.nextActionAt = null;
  recovery.version += 1;
  recovery.evidence.push(makeEvidence('CONTACT_ATTEMPT_RECORDED', input.actor || 'human', {
    channel: cleanText(input.channel || 'unknown', 30),
    templateId: cleanText(input.templateId || '', 80) || null,
    attempt: recovery.attempts,
    actionClass: ACTION_CLASSES.AUTO_WITH_POLICY,
    approvalRef: cleanText(input.approvalRef || '', 120) || null
  }, deps));
  return recovery;
}

export function recordResponse(recovery, input = {}, options = {}) {
  ensureOpen(recovery);
  if (recovery.state !== 'WAITING') throw new Error('RESPONSE_NOT_ALLOWED');
  const responseClass = cleanText(input.responseClass || 'UNKNOWN', 32).toUpperCase();
  if (!Object.values(RESPONSE_CLASSES).includes(responseClass)) throw new Error('INVALID_RESPONSE_CLASS');

  const confidence = input.confidence == null ? null : Number(input.confidence);
  if (confidence != null && (!Number.isFinite(confidence) || confidence < 0 || confidence > 1)) {
    throw new Error('INVALID_CONFIDENCE');
  }

  const deps = dependencies(options);
  recovery.lastResponseClass = responseClass;
  recovery.nextActionAt = null;
  recovery.version += 1;
  recovery.evidence.push(makeEvidence('RESPONSE_RECORDED', input.actor || 'system', {
    responseClass,
    confidence,
    classifier: cleanText(input.classifier || 'unknown', 80),
    actionClass: ACTION_CLASSES.AUTO_SAFE
  }, deps));
  move(recovery, 'RESPONSE_RECEIVED', input.actor || 'system', { responseClass }, deps);
  return move(recovery, 'HUMAN_REVIEW', input.actor || 'system', {
    reason: 'RESPONSE_REQUIRES_HUMAN_DECISION',
    actionClass: ACTION_CLASSES.HUMAN_APPROVAL
  }, deps);
}

export function returnToWaiting(recovery, input = {}, options = {}) {
  ensureOpen(recovery);
  if (recovery.state !== 'HUMAN_REVIEW') throw new Error('RETURN_NOT_ALLOWED');
  if (input.approvedByHuman !== true) throw new Error('HUMAN_APPROVAL_REQUIRED');
  const deps = dependencies(options);
  return move(recovery, 'WAITING', input.actor || 'human', {
    reason: cleanText(input.reason || 'continue_follow_up', 120)
  }, deps);
}

export function resolveRecovery(recovery, input = {}, options = {}) {
  ensureOpen(recovery);
  if (recovery.state !== 'HUMAN_REVIEW') throw new Error('RESOLUTION_NOT_ALLOWED');
  if (input.approvedByHuman !== true) throw new Error('HUMAN_APPROVAL_REQUIRED');

  const outcome = cleanText(input.outcome || '', 16).toUpperCase();
  if (!['WON', 'LOST'].includes(outcome)) throw new Error('INVALID_OUTCOME');

  const outcomeValue = input.outcomeValue == null ? null : Number(input.outcomeValue);
  if (outcomeValue != null && (!Number.isFinite(outcomeValue) || outcomeValue < 0)) {
    throw new Error('INVALID_OUTCOME_VALUE');
  }

  const deps = dependencies(options);
  recovery.outcome = outcome;
  recovery.outcomeValue = outcomeValue == null ? null : Math.round(outcomeValue * 100) / 100;
  return move(recovery, outcome, input.actor || 'human', {
    outcomeValue: recovery.outcomeValue,
    attribution: cleanText(input.attribution || 'ASSISTED', 20).toUpperCase(),
    actionClass: ACTION_CLASSES.HUMAN_APPROVAL
  }, deps);
}

export function expireRecovery(recovery, now, actor = 'system', options = {}) {
  ensureOpen(recovery);
  if (recovery.state !== 'WAITING') throw new Error('EXPIRY_NOT_ALLOWED');
  if (!recovery.expiresAt) throw new Error('NO_EXPIRY_SET');
  const current = Date.parse(now || dependencies(options).clock());
  const expiry = Date.parse(recovery.expiresAt);
  if (Number.isNaN(current) || Number.isNaN(expiry)) throw new Error('INVALID_EXPIRY');
  if (current < expiry) throw new Error('NOT_EXPIRED');
  const deps = dependencies(options);
  return move(recovery, 'EXPIRED', actor, { actionClass: ACTION_CLASSES.AUTO_WITH_POLICY }, deps);
}

export function cancelRecovery(recovery, actor = 'human', reason = '', options = {}) {
  ensureOpen(recovery);
  const deps = dependencies(options);
  return move(recovery, 'CANCELLED', actor, { reason: cleanText(reason, 160) }, deps);
}

export function snapshotRecovery(recovery) {
  return JSON.parse(JSON.stringify(recovery));
}
