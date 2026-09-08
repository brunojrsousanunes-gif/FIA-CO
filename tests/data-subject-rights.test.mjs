import assert from 'node:assert/strict';
import { createRightsRequest, decideRightsRequest } from '../core/privacy/data-subject-rights.mjs';

const request=createRightsRequest({
  requestId:'r-1',subjectReference:'user-7',right:'erasure',
  receivedAt:'2026-09-01T00:00:00Z',deadlineAt:'2026-10-01T00:00:00Z',
  identityVerificationReference:'nonbio:challenge-1',identityVerificationMethod:'NON_BIOMETRIC'
});
assert.equal(request.status,'RECEIVED');
assert.throws(()=>createRightsRequest({...request,identityVerificationMethod:'BIOMETRIC'}),/BIOMETRIC/);
assert.throws(()=>decideRightsRequest(request,{status:'FULFILLED',decidedAt:'2026-09-02',legalHold:true,humanReviewerReference:'staff-1'}),/ERASURE_BLOCKED/);
const denied=decideRightsRequest(request,{status:'DENIED',reason:'legal retention',decidedAt:'2026-09-02',legalHold:true,humanReviewerReference:'staff-1'});
assert.equal(denied.status,'DENIED');
console.log('data-subject-rights: ok');
