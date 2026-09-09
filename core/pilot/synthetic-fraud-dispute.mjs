const RULES=Object.freeze({
  FALSE_DELIVERY_CLAIM:{severity:'HIGH',decision:'OPEN_DISPUTE',evidence:['DELIVERY_REFERENCE','CARRIER_EVENT_CHAIN']},
  BUYER_DENIES_VERIFIED_DELIVERY:{severity:'HIGH',decision:'REQUEST_MORE_EVIDENCE',evidence:['DELIVERY_REFERENCE','BUYER_STATEMENT','CARRIER_STATEMENT']},
  CONTRADICTORY_EVIDENCE:{severity:'HIGH',decision:'HUMAN_REVIEW_REQUIRED',evidence:['ALL_CONFLICTING_VERSIONS','EVIDENCE_INTEGRITY_RESULTS']},
  DAMAGED_OR_INCOMPLETE_ITEM:{severity:'MEDIUM',decision:'OPEN_DISPUTE',evidence:['DISPATCH_CONDITION','RECEIPT_CONDITION','ITEM_SCOPE']},
  CANCELLATION_AFTER_DISPATCH:{severity:'MEDIUM',decision:'HUMAN_REVIEW_REQUIRED',evidence:['ACCEPTED_TERMS_VERSION','DISPATCH_TIMESTAMP','CANCELLATION_TIMESTAMP']},
  DUPLICATE_REFUND_REQUEST:{severity:'HIGH',decision:'BLOCK_OPERATION',evidence:['REFUND_IDEMPOTENCY_KEY','PRIOR_REQUEST_STATUS']},
  TERMS_CHANGED_AFTER_ACCEPTANCE:{severity:'CRITICAL',decision:'BLOCK_OPERATION',evidence:['ACCEPTED_TERMS_HASH','CURRENT_TERMS_HASH','ACCEPTANCE_TIMESTAMPS']},
  COLLUSION_SIGNAL:{severity:'HIGH',decision:'HUMAN_REVIEW_REQUIRED',evidence:['MINIMIZED_RISK_SIGNALS','RELATED_OPERATION_REFERENCES']},
  IDENTITY_IMPERSONATION:{severity:'CRITICAL',decision:'BLOCK_OPERATION',evidence:['NON_BIOMETRIC_VERIFICATION_RESULT','SESSION_AUDIT_REFERENCE']},
  PRESSURE_TO_RELEASE_DURING_DISPUTE:{severity:'CRITICAL',decision:'BLOCK_OPERATION',evidence:['DISPUTE_STATUS','RELEASE_ATTEMPT_AUDIT']},
  LATE_CLAIM:{severity:'MEDIUM',decision:'HUMAN_REVIEW_REQUIRED',evidence:['CLAIM_TIMESTAMP','APPLICABLE_TERMS_VERSION']},
  UNRESPONSIVE_PARTY:{severity:'MEDIUM',decision:'HUMAN_REVIEW_REQUIRED',evidence:['CONTACT_ATTEMPT_REFERENCES','RESPONSE_DEADLINE']}
});
const ALLOWED=new Set(['CONTINUE','REQUEST_MORE_EVIDENCE','BLOCK_OPERATION','OPEN_DISPUTE','HUMAN_REVIEW_REQUIRED','SIMULATED_PSP_INSTRUCTION']);

export function evaluateSyntheticFraudDispute(input={}){
  if(input.synthetic!==true) throw new Error('SYNTHETIC_FRAUD_CASE_ONLY');
  const type=String(input.type||'').toUpperCase();
  const rule=RULES[type];
  if(!rule) throw new Error('UNKNOWN_FRAUD_DISPUTE_CASE');
  if(!ALLOWED.has(rule.decision)) throw new Error('UNSAFE_DECISION');
  return Object.freeze({
    schemaVersion:'synthetic-fraud-dispute.v1',
    caseId:String(input.id||type),
    type,
    severity:rule.severity,
    decision:rule.decision,
    evidenceRequired:Object.freeze([...rule.evidence]),
    operationFrozen:['BLOCK_OPERATION','OPEN_DISPUTE','HUMAN_REVIEW_REQUIRED'].includes(rule.decision),
    humanReviewRequired:['OPEN_DISPUTE','HUMAN_REVIEW_REQUIRED'].includes(rule.decision),
    automaticWinnerSelected:false,
    legalConclusionProduced:false,
    financialInstructionCreated:false,
    realIdentityChecked:false,
    syntheticOnly:true,
    externalActionsExecuted:false,
    productionStateChanged:false
  });
}

export function summarizeSyntheticFraudDisputes(results=[]){
  const byDecision={};const bySeverity={};
  for(const item of results){
    byDecision[item.decision]=(byDecision[item.decision]||0)+1;
    bySeverity[item.severity]=(bySeverity[item.severity]||0)+1;
  }
  const unsafe=results.filter(item=>item.automaticWinnerSelected||item.legalConclusionProduced||item.financialInstructionCreated||item.externalActionsExecuted);
  return Object.freeze({
    schemaVersion:'synthetic-fraud-dispute-summary.v1',
    total:results.length,
    byDecision:Object.freeze(byDecision),
    bySeverity:Object.freeze(bySeverity),
    frozenOperations:results.filter(item=>item.operationFrozen).length,
    humanReviews:results.filter(item=>item.humanReviewRequired).length,
    unsafeOutcomes:unsafe.length,
    decision:unsafe.length?'BLOCK':'PASS_SYNTHETIC_DISPUTES',
    productionReady:false
  });
}
