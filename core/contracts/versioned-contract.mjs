import { classifyTransactionParties } from '../legal/party-classification.mjs';

const REQUIRED_TERMS = ['subject', 'price', 'currency', 'performance', 'cancellation'];

function text(value, code) {
  const normalized = String(value || '').trim();
  if (!normalized) throw new Error(code);
  return normalized;
}

export function createContractAcceptance(input = {}) {
  const parties = classifyTransactionParties(input.parties);
  const terms = input.terms || {};
  for (const field of REQUIRED_TERMS) text(terms[field], `MISSING_TERM_${field.toUpperCase()}`);
  const accepted = Array.isArray(input.acceptances) ? input.acceptances : [];
  const requiredIds = [parties.seller.id, parties.buyer.id];
  for (const partyId of requiredIds) {
    const record = accepted.find(item => item?.partyId === partyId);
    if (!record?.acceptedAt || record?.termsHash !== input.termsHash) {
      throw new Error('MATCHING_PARTY_ACCEPTANCE_REQUIRED');
    }
  }
  if (parties.consumerLawReviewRequired && input.consumerDisclosuresAccepted !== true) {
    throw new Error('CONSUMER_DISCLOSURES_REQUIRED');
  }
  if (parties.relation === 'B2C' && input.explicitPaymentObligationAccepted !== true) {
    throw new Error('EXPLICIT_PAYMENT_OBLIGATION_REQUIRED');
  }
  return Object.freeze({
    schemaVersion: 'contract-acceptance.v1',
    contractId: text(input.contractId, 'MISSING_CONTRACT_ID'),
    contractVersion: text(input.contractVersion, 'MISSING_CONTRACT_VERSION'),
    templateId: text(input.templateId, 'MISSING_TEMPLATE_ID'),
    relation: parties.relation,
    parties,
    terms: Object.freeze({...terms}),
    termsHash: text(input.termsHash, 'MISSING_TERMS_HASH'),
    acceptances: Object.freeze(accepted.map(item => Object.freeze({...item}))),
    durableCopyReference: text(input.durableCopyReference, 'DURABLE_COPY_REQUIRED'),
    amendmentRule: 'NEW_VERSION_AND_NEW_ACCEPTANCE_REQUIRED',
    legallyValidated: false
  });
}

export function assertContractAmendment(previous, next = {}) {
  if (previous.contractId !== next.contractId) throw new Error('CONTRACT_ID_MISMATCH');
  if (previous.contractVersion === next.contractVersion) throw new Error('NEW_CONTRACT_VERSION_REQUIRED');
  if (previous.termsHash === next.termsHash) throw new Error('NEW_TERMS_HASH_REQUIRED');
  return true;
}
