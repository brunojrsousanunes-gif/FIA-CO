const PARTY_TYPES = new Set(['CONSUMER', 'SOLE_TRADER', 'BUSINESS']);
const RELATIONS = Object.freeze({
  'CONSUMER:CONSUMER': 'P2P',
  'CONSUMER:SOLE_TRADER': 'C2B',
  'CONSUMER:BUSINESS': 'C2B',
  'SOLE_TRADER:CONSUMER': 'B2C',
  'BUSINESS:CONSUMER': 'B2C',
  'SOLE_TRADER:SOLE_TRADER': 'B2B',
  'SOLE_TRADER:BUSINESS': 'B2B',
  'BUSINESS:SOLE_TRADER': 'B2B',
  'BUSINESS:BUSINESS': 'B2B'
});

function normalizeParty(party = {}, label) {
  const type = String(party.type || '').trim().toUpperCase();
  if (!PARTY_TYPES.has(type)) throw new Error(`INVALID_${label}_PARTY_TYPE`);
  if (!String(party.id || '').trim()) throw new Error(`MISSING_${label}_PARTY_ID`);
  if (type !== 'CONSUMER' && party.traderVerified !== true) {
    throw new Error(`${label}_TRADER_VERIFICATION_REQUIRED`);
  }
  if (party.actsForOrganization === true && !String(party.authorizationReference || '').trim()) {
    throw new Error(`${label}_REPRESENTATIVE_AUTHORIZATION_REQUIRED`);
  }
  return Object.freeze({
    id: String(party.id).trim(),
    type,
    traderVerified: type === 'CONSUMER' ? false : true,
    actsForOrganization: party.actsForOrganization === true,
    authorizationReference: party.authorizationReference ? String(party.authorizationReference).trim() : null
  });
}

export function classifyTransactionParties(input = {}) {
  const seller = normalizeParty(input.seller, 'SELLER');
  const buyer = normalizeParty(input.buyer, 'BUYER');
  const relation = RELATIONS[`${seller.type}:${buyer.type}`];
  if (!relation) throw new Error('UNSUPPORTED_PARTY_RELATION');
  return Object.freeze({
    schemaVersion: 'party-classification.v1',
    seller,
    buyer,
    relation,
    consumerLawReviewRequired: relation === 'B2C' || relation === 'C2B',
    marketplaceTraderDisclosureRequired: seller.type !== 'CONSUMER',
    contractTemplateKey: `SALE_${relation}`,
    readyForContract: true
  });
}
