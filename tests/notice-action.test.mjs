import assert from 'node:assert/strict';
import { createIllegalContentNotice, decideNotice, validateTraderTraceability } from '../core/marketplace/notice-action.mjs';

const notice=createIllegalContentNotice({noticeId:'n-1',listingReference:'l-1',explanation:'illegal item',exactLocation:'/listing/l-1',notifierContact:'n@example.test',submittedAt:'2026-09-01',goodFaithDeclaration:true});
const decision=decideNotice(notice,{action:'REMOVE',statementOfReasons:'prohibited listing',legalOrTermsBasis:'terms-4',automatedMeansUsed:true,humanReviewerReference:'moderator-1',appealPath:'/appeals/n-1',decidedAt:'2026-09-02'});
assert.equal(decision.action,'REMOVE');
assert.equal(decision.humanReviewerReference,'moderator-1');
assert.throws(()=>createIllegalContentNotice({...notice,goodFaithDeclaration:false}),/GOOD_FAITH/);
assert.equal(validateTraderTraceability({traderReference:'t-1',name:'Trader',address:'address-ref',email:'contact-ref',verificationReference:'kyb-ref',selfCertificationAt:'2026-09-01',bankAccountOwnedByTrader:true}).productionActivationAllowed,false);
console.log('notice-action: ok');
