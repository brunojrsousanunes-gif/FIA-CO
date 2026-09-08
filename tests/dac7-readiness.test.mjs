import assert from 'node:assert/strict';
import { evaluateDac7Readiness } from '../core/tax/dac7-readiness.mjs';

const unknown=evaluateDac7Readiness({seller:{}});
assert.equal(unknown.decision,'PROFESSIONAL_SCOPE_REVIEW_REQUIRED');
assert.equal(unknown.reportingAllowed,false);
const ready=evaluateDac7Readiness({operatorInScope:true,professionalValidationReference:'tax-counsel-1',seller:{sellerReference:'s',legalName:'Seller',primaryAddressCountry:'ES',taxResidenceCountry:'ES',taxIdentifierReference:'vault://tax/s'}});
assert.equal(ready.decision,'READY_FOR_CONTROLLED_REPORTING_PIPELINE');
assert.equal(Boolean(ready.reportingAllowed),true);
assert.equal(ready.taxDataStoredInPublicFrontend,false);
console.log('dac7-readiness: ok');
