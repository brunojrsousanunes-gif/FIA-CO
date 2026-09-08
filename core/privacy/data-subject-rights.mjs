const RIGHTS = new Set(['ACCESS','RECTIFICATION','ERASURE','RESTRICTION','PORTABILITY','OBJECTION']);
const STATUSES = new Set(['RECEIVED','IDENTITY_PENDING','IN_REVIEW','FULFILLED','DENIED','EXTENDED']);

function required(value, code) {
  const result = String(value || '').trim();
  if (!result) throw new Error(code);
  return result;
}
function iso(value, code) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error(code);
  return date.toISOString();
}

export function createRightsRequest(input = {}) {
  const right = String(input.right || '').toUpperCase();
  if (!RIGHTS.has(right)) throw new Error('INVALID_DATA_SUBJECT_RIGHT');
  if (input.identityVerificationMethod === 'BIOMETRIC') throw new Error('BIOMETRIC_VERIFICATION_FORBIDDEN');
  return Object.freeze({
    schemaVersion: 'data-subject-rights.v1',
    requestId: required(input.requestId, 'MISSING_REQUEST_ID'),
    subjectReference: required(input.subjectReference, 'MISSING_SUBJECT_REFERENCE'),
    right,
    receivedAt: iso(input.receivedAt, 'INVALID_RECEIVED_AT'),
    deadlineAt: iso(input.deadlineAt, 'INVALID_DEADLINE_AT'),
    identityVerificationReference: input.identityVerificationReference ? String(input.identityVerificationReference) : null,
    identityVerificationMethod: input.identityVerificationMethod || 'NON_BIOMETRIC',
    status: input.identityVerificationReference ? 'RECEIVED' : 'IDENTITY_PENDING',
    automatedDeletionExecuted: false
  });
}

export function decideRightsRequest(request, input = {}) {
  const status = String(input.status || '').toUpperCase();
  if (!STATUSES.has(status) || status === 'RECEIVED' || status === 'IDENTITY_PENDING') throw new Error('INVALID_RIGHTS_DECISION');
  if ((status === 'DENIED' || status === 'EXTENDED') && !String(input.reason || '').trim()) {
    throw new Error('REASON_REQUIRED');
  }
  if (request.right === 'ERASURE' && (input.legalHold === true || input.retentionObligation === true) && status === 'FULFILLED') {
    throw new Error('ERASURE_BLOCKED_BY_LEGAL_BASIS');
  }
  return Object.freeze({
    ...request,
    status,
    decidedAt: iso(input.decidedAt, 'INVALID_DECIDED_AT'),
    reason: input.reason ? String(input.reason).trim() : null,
    legalHold: input.legalHold === true,
    retentionObligation: input.retentionObligation === true,
    humanReviewerReference: required(input.humanReviewerReference, 'HUMAN_REVIEWER_REQUIRED')
  });
}
