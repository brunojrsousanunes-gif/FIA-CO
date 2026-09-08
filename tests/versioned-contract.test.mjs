import assert from 'node:assert/strict';
import { createContractAcceptance, assertContractAmendment } from '../core/contracts/versioned-contract.mjs';

const base = {
  contractId:'c-1', contractVersion:'1', templateId:'sale-b2c-v1', termsHash:'sha256:a',
  parties:{seller:{id:'s',type:'BUSINESS',traderVerified:true},buyer:{id:'b',type:'CONSUMER'}},
  terms:{subject:'item',price:'10.00',currency:'EUR',performance:'delivery',cancellation:'14 days'},
  acceptances:[
    {partyId:'s',acceptedAt:'2026-09-01T10:00:00Z',termsHash:'sha256:a'},
    {partyId:'b',acceptedAt:'2026-09-01T10:01:00Z',termsHash:'sha256:a'}
  ],
  consumerDisclosuresAccepted:true, explicitPaymentObligationAccepted:true,
  durableCopyReference:'private://contracts/c-1-v1'
};
const contract=createContractAcceptance(base);
assert.equal(contract.relation,'B2C');
assert.equal(contract.legallyValidated,false);
assert.equal(assertContractAmendment(contract,{contractId:'c-1',contractVersion:'2',termsHash:'sha256:b'}),true);
assert.throws(()=>createContractAcceptance({...base,explicitPaymentObligationAccepted:false}),/EXPLICIT_PAYMENT/);
assert.throws(()=>assertContractAmendment(contract,{contractId:'c-1',contractVersion:'1',termsHash:'sha256:b'}),/NEW_CONTRACT_VERSION/);
console.log('versioned-contract: ok');
