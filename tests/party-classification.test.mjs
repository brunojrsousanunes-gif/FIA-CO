import assert from 'node:assert/strict';
import {classifyTransactionParties} from '../core/legal/party-classification.mjs';

const p2p=classifyTransactionParties({seller:{id:'s1',type:'consumer'},buyer:{id:'b1',type:'consumer'}});
assert.equal(p2p.relation,'P2P');
assert.equal(p2p.consumerLawReviewRequired,false);

const b2c=classifyTransactionParties({seller:{id:'s2',type:'business',traderVerified:true},buyer:{id:'b2',type:'consumer'}});
assert.equal(b2c.relation,'B2C');
assert.equal(b2c.marketplaceTraderDisclosureRequired,true);
assert.equal(b2c.contractTemplateKey,'SALE_B2C');

assert.throws(()=>classifyTransactionParties({seller:{id:'s3',type:'business'},buyer:{id:'b3',type:'consumer'}}),/TRADER_VERIFICATION_REQUIRED/);
assert.throws(()=>classifyTransactionParties({seller:{id:'s4',type:'business',traderVerified:true,actsForOrganization:true},buyer:{id:'b4',type:'consumer'}}),/REPRESENTATIVE_AUTHORIZATION_REQUIRED/);
console.log('Party classification passed');
