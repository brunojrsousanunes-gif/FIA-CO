function required(value, code) {
  const result = String(value || '').trim();
  if (!result) throw new Error(code);
  return result;
}

export function createIllegalContentNotice(input = {}) {
  if (input.goodFaithDeclaration !== true) throw new Error('GOOD_FAITH_DECLARATION_REQUIRED');
  return Object.freeze({
    schemaVersion: 'dsa-notice.v1',
    noticeId: required(input.noticeId, 'MISSING_NOTICE_ID'),
    listingReference: required(input.listingReference, 'MISSING_LISTING_REFERENCE'),
    explanation: required(input.explanation, 'MISSING_EXPLANATION'),
    exactLocation: required(input.exactLocation, 'MISSING_EXACT_LOCATION'),
    notifierContact: required(input.notifierContact, 'MISSING_NOTIFIER_CONTACT'),
    submittedAt: new Date(required(input.submittedAt, 'MISSING_SUBMITTED_AT')).toISOString(),
    goodFaithDeclaration: true,
    status: 'RECEIVED'
  });
}

export function decideNotice(notice, input = {}) {
  const action = String(input.action || '').toUpperCase();
  if (!['NO_ACTION','RESTRICT','REMOVE','SUSPEND'].includes(action)) throw new Error('INVALID_NOTICE_ACTION');
  return Object.freeze({
    ...notice,
    status: 'DECIDED',
    action,
    statementOfReasons: required(input.statementOfReasons, 'STATEMENT_OF_REASONS_REQUIRED'),
    legalOrTermsBasis: required(input.legalOrTermsBasis, 'LEGAL_OR_TERMS_BASIS_REQUIRED'),
    automatedMeansUsed: input.automatedMeansUsed === true,
    humanReviewerReference: required(input.humanReviewerReference, 'HUMAN_REVIEWER_REQUIRED'),
    appealPath: required(input.appealPath, 'APPEAL_PATH_REQUIRED'),
    decidedAt: new Date(required(input.decidedAt, 'MISSING_DECIDED_AT')).toISOString()
  });
}

export function validateTraderTraceability(input = {}) {
  const requiredFields = ['traderReference','name','address','email','verificationReference','selfCertificationAt'];
  for (const field of requiredFields) required(input[field], `MISSING_TRADER_${field.toUpperCase()}`);
  if (input.bankAccountOwnedByTrader !== true) throw new Error('TRADER_BANK_OWNERSHIP_NOT_VERIFIED');
  return Object.freeze({
    schemaVersion: 'trader-traceability.v1',
    traderReference: input.traderReference,
    verified: true,
    sourceDocumentStoredHere: false,
    productionActivationAllowed: false
  });
}
