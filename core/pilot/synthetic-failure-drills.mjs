const PROTOCOLS = Object.freeze({
  MISSING_OWNER_DOCUMENTATION: {
    severity:'LOW', decision:'CONTINUE_SYNTHETIC_WITH_PLACEHOLDER',
    prevent:['MAINTAIN_REQUIREMENT_REGISTER','USE_EXPLICIT_SYNTHETIC_PLACEHOLDERS'],
    contain:['KEEP_PRODUCTION_GATE_CLOSED'],
    recover:['CONSOLIDATE_OWNER_REQUEST_AT_ACTIVATION_GATE'],
    ownerActionRequiredNow:false, responsibleRole:'PROJECT_COORDINATOR'
  },
  DUPLICATE_EVENT: {
    severity:'MEDIUM', decision:'IGNORE_DUPLICATE',
    prevent:['IDEMPOTENCY_KEY_REQUIRED'], contain:['DO_NOT_APPLY_EVENT_TWICE'],
    recover:['VERIFY_CANONICAL_EVENT_STATE'], ownerActionRequiredNow:false, responsibleRole:'OPERATIONS'
  },
  STALE_VERSION: {
    severity:'MEDIUM', decision:'RELOAD_AND_REVIEW',
    prevent:['OPTIMISTIC_VERSION_CHECK'], contain:['REJECT_STALE_WRITE'],
    recover:['RELOAD_LATEST_VERSION','REAPPLY_WITH_HUMAN_REVIEW'], ownerActionRequiredNow:false, responsibleRole:'OPERATIONS'
  },
  INVALID_STATE_TRANSITION: {
    severity:'HIGH', decision:'BLOCK_TRANSITION',
    prevent:['SERVER_STATE_MACHINE'], contain:['PRESERVE_CURRENT_STATE','LOG_ATTEMPT'],
    recover:['REVIEW_ALLOWED_NEXT_ACTIONS'], ownerActionRequiredNow:false, responsibleRole:'OPERATIONS'
  },
  EVIDENCE_HASH_MISMATCH: {
    severity:'HIGH', decision:'QUARANTINE_EVIDENCE',
    prevent:['HASH_BEFORE_STORAGE'], contain:['DENY_EVIDENCE_USE','QUARANTINE_REFERENCE'],
    recover:['REQUEST_NEW_SYNTHETIC_COPY','VERIFY_NEW_HASH'], ownerActionRequiredNow:false, responsibleRole:'SECURITY'
  },
  UNAUTHORIZED_ACCESS: {
    severity:'CRITICAL', decision:'DENY_AND_ESCALATE',
    prevent:['DENY_BY_DEFAULT','SERVER_SCOPE_CHECK'], contain:['DENY_ACCESS','RECOMMEND_SESSION_REVOCATION'],
    recover:['HUMAN_SECURITY_REVIEW_REQUIRED'], ownerActionRequiredNow:false, responsibleRole:'SECURITY'
  },
  PSP_TIMEOUT: {
    severity:'HIGH', decision:'NO_RETRY_WITHOUT_STATUS_CHECK',
    prevent:['IDEMPOTENCY_KEY_REQUIRED','SIGNED_STATUS_QUERY'], contain:['DO_NOT_ASSUME_PAYMENT_RESULT','DO_NOT_RELEASE'],
    recover:['QUERY_PROVIDER_STATUS','HUMAN_RECONCILIATION_IF_UNCERTAIN'], ownerActionRequiredNow:false, responsibleRole:'FINANCE_OPERATIONS'
  },
  MALWARE_DETECTED: {
    severity:'CRITICAL', decision:'QUARANTINE_EVIDENCE',
    prevent:['MIME_ALLOWLIST','ANTIMALWARE_SCAN'], contain:['ISOLATE_FILE','DENY_DOWNLOAD'],
    recover:['DELETE_PER_POLICY_AFTER_REVIEW','REQUEST_SAFE_SYNTHETIC_REPLACEMENT'], ownerActionRequiredNow:false, responsibleRole:'SECURITY'
  },
  SENSITIVE_DATA_IN_PUBLIC_INPUT: {
    severity:'HIGH', decision:'REJECT_AND_PURGE',
    prevent:['CLIENT_WARNING','SERVER_CONTENT_CLASSIFICATION'], contain:['DO_NOT_STORE_RAW_VALUE','EXCLUDE_FROM_ANALYTICS_AND_AI'],
    recover:['RECORD_MINIMIZED_EVENT_ONLY'], ownerActionRequiredNow:false, responsibleRole:'PRIVACY'
  },
  AI_UNSUPPORTED_DECISION: {
    severity:'HIGH', decision:'HUMAN_REVIEW_REQUIRED',
    prevent:['AI_SHADOW_MODE','BINDING_EFFECTS_FORBIDDEN'], contain:['BLOCK_AUTOMATED_ACTION'],
    recover:['ASSIGN_HUMAN_REVIEWER'], ownerActionRequiredNow:false, responsibleRole:'COMPLIANCE'
  }
});

function clean(value,max=100){return String(value||'').replace(/[<>\r\n\t]/g,' ').trim().slice(0,max);}

export function runSyntheticFailureDrill(input = {}) {
  if (input.synthetic !== true) throw new Error('SYNTHETIC_DRILL_ONLY');
  const type=clean(input.type,60).toUpperCase();
  const protocol=PROTOCOLS[type];
  if (!protocol) throw new Error('UNKNOWN_SYNTHETIC_FAILURE');
  return Object.freeze({
    schemaVersion:'synthetic-failure-drill.v1',
    drillId:clean(input.id,80) || `DRILL-${type}`,
    type,
    syntheticOnly:true,
    realIncident:false,
    externalActionsExecuted:false,
    productionStateChanged:false,
    ...protocol,
    prevent:Object.freeze([...protocol.prevent]),
    contain:Object.freeze([...protocol.contain]),
    recover:Object.freeze([...protocol.recover]),
    closureEvidenceRequired:Object.freeze(['DETECTION_RECORDED','CONTAINMENT_VERIFIED','RECOVERY_TEST_PASSED']),
    status:'DRILL_COMPLETED'
  });
}

export function verifySyntheticDrillClosure(result = {}, evidence = []) {
  if (result.syntheticOnly !== true || result.status !== 'DRILL_COMPLETED') return false;
  const supplied=new Set(evidence);
  return result.closureEvidenceRequired.every(item=>supplied.has(item));
}
