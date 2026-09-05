export const INTERACTION_RISK_SEVERITY = Object.freeze({
  INFO: 'INFO',
  WARNING: 'WARNING',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
});

export const INTERACTION_RISK_CATEGORIES = Object.freeze({
  SENSITIVE_DATA: 'SENSITIVE_DATA',
  CREDENTIALS: 'CREDENTIALS',
  FINANCIAL_BOUNDARY: 'FINANCIAL_BOUNDARY',
  CROSS_ORG_ACCESS: 'CROSS_ORG_ACCESS',
  EXTERNAL_ACTION: 'EXTERNAL_ACTION',
  UNSUPPORTED_CLAIM: 'UNSUPPORTED_CLAIM',
  OPERATIONAL_INTEGRITY: 'OPERATIONAL_INTEGRITY'
});

const SEVERITY_SCORE = Object.freeze({ INFO: 0, WARNING: 1, HIGH: 2, CRITICAL: 3 });
const LOW_TRUST_LEVELS = new Set(['L0_DEMO', 'L1_ISOLATED', 'L2_VERIFIED']);

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2000);
}

function signal(code, category, severity, message, action) {
  return Object.freeze({ code, category, severity, message, action });
}

function hasActualSensitiveValue(raw) {
  const text = String(raw ?? '');
  return /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text)
    || /\bES\d{22}\b/i.test(text.replace(/\s+/g, ''))
    || /\b(?:\d{8}[A-Z]|[XYZ]\d{7}[A-Z])\b/i.test(text)
    || /\b(?:api[_ -]?key|token|secret|password|contrasena)\s*[:=]\s*\S{6,}/i.test(text);
}

export function evaluateInteractionRisk(input = {}, context = {}) {
  const raw = String(input.text ?? '');
  const text = normalize(raw);
  const currentLevel = String(context.currentTrustLevel || 'L0_DEMO').toUpperCase();
  const signals = [];

  if (hasActualSensitiveValue(raw)) {
    signals.push(signal(
      'REAL_SENSITIVE_VALUE_DETECTED',
      INTERACTION_RISK_CATEGORIES.SENSITIVE_DATA,
      INTERACTION_RISK_SEVERITY.CRITICAL,
      'Parece que se ha introducido un dato real o secreto. No debe continuar dentro de una superficie demo.',
      'REMOVE_VALUE_AND_USE_SYNTHETIC_DATA'
    ));
  }

  if (/\b(contrasena|password|credencial|api key|token|secreto|secret)\b/.test(text)) {
    signals.push(signal(
      'CREDENTIAL_TOPIC_DETECTED',
      INTERACTION_RISK_CATEGORIES.CREDENTIALS,
      INTERACTION_RISK_SEVERITY.HIGH,
      'Las credenciales y secretos no deben introducirse en el asistente ni enviarse al contexto de IA.',
      'KEEP_SECRET_OUTSIDE_ASSISTANT_CONTEXT'
    ));
  }

  if (/(mueve|mover|mueva|muevas|movimiento de|custodia|custodiar|custodie|custodiar|custodi[eoa]|transfiere|transferir|transfiera|transfieran|retira|retirar|retire|paga desde fia|pague desde fia|cobrar desde fia|cobra desde fia|cobre desde fia).*(fondos|dinero|cuenta|pago)?/.test(text)) {
    signals.push(signal(
      'FINANCIAL_EXECUTION_REQUEST',
      INTERACTION_RISK_CATEGORIES.FINANCIAL_BOUNDARY,
      INTERACTION_RISK_SEVERITY.CRITICAL,
      'FIA no recibe, custodia ni mueve fondos. La ejecución real corresponde a un proveedor legalmente habilitado.',
      'KEEP_NON_CUSTODIAL_BOUNDARY'
    ));
  }

  if (LOW_TRUST_LEVELS.has(currentLevel)
      && /(comparte|compartir|envia|enviar|dar acceso|acceso a).*(proveedor|taller|partner|otra empresa|tercero)/.test(text)) {
    signals.push(signal(
      'CROSS_ORG_BEFORE_L3',
      INTERACTION_RISK_CATEGORIES.CROSS_ORG_ACCESS,
      INTERACTION_RISK_SEVERITY.HIGH,
      'El intercambio entre organizaciones no debe habilitarse antes de L3_SHARED.',
      'KEEP_CROSS_ORG_DENY_BY_DEFAULT'
    ));
  }

  if (/(envia un correo real|mandar correo real|llama al cliente|hacer llamada real|publica|ejecuta automaticamente|ejecutar automaticamente)/.test(text)
      && ['L0_DEMO', 'L1_ISOLATED'].includes(currentLevel)) {
    signals.push(signal(
      'EXTERNAL_ACTION_TOO_EARLY',
      INTERACTION_RISK_CATEGORIES.EXTERNAL_ACTION,
      INTERACTION_RISK_SEVERITY.HIGH,
      'Las acciones externas reales permanecen bloqueadas en L0/L1.',
      'KEEP_EXTERNAL_ACTION_DISABLED'
    ));
  }

  if (/(garantiza ventas|roi garantizado|100% seguro|cumple todo|cumplimiento garantizado|certificado por fia|sin ningun riesgo)/.test(text)) {
    signals.push(signal(
      'UNSUPPORTED_ASSURANCE_CLAIM',
      INTERACTION_RISK_CATEGORIES.UNSUPPORTED_CLAIM,
      INTERACTION_RISK_SEVERITY.WARNING,
      'La afirmación parece absoluta o no respaldada. FIA debe mostrar evidencia y límites, no garantías inventadas.',
      'REFRAME_AS_EVIDENCE_BASED_CLAIM'
    ));
  }

  const ordered = signals.sort((a, b) => SEVERITY_SCORE[b.severity] - SEVERITY_SCORE[a.severity]);
  const highestSeverity = ordered[0]?.severity || INTERACTION_RISK_SEVERITY.INFO;
  return Object.freeze({
    schemaVersion: 'interaction-risk-engine.v1',
    inputStored: false,
    currentTrustLevel: currentLevel,
    riskDetected: ordered.length > 0,
    highestSeverity,
    requiresImmediateAttention: SEVERITY_SCORE[highestSeverity] >= SEVERITY_SCORE.HIGH,
    safeToContinueWithoutReview: ordered.length === 0,
    signals: Object.freeze(ordered)
  });
}

export function evaluateDemoOperationRisk(operation = {}, evidence = []) {
  const relatedEvidence = (Array.isArray(evidence) ? evidence : []).filter(item => item?.operationId === operation?.id);
  const hasIncident = relatedEvidence.some(item => String(item?.type || '').toLowerCase() === 'incidencia');
  const requiresLogistics = ['sale_transport', 'transport', 'special', 'animal'].includes(operation?.type);
  const signals = [];

  if (!operation?.id) return Object.freeze({ riskDetected: false, highestSeverity: 'INFO', signals: Object.freeze([]) });
  if (hasIncident) {
    signals.push(signal('OPERATION_INCIDENT_OPEN', INTERACTION_RISK_CATEGORIES.OPERATIONAL_INTEGRITY, 'HIGH', 'Existe una incidencia registrada y requiere revisión humana.', 'OPEN_HUMAN_REVIEW'));
  }
  if (!relatedEvidence.length) {
    signals.push(signal('OPERATION_WITHOUT_EVIDENCE', INTERACTION_RISK_CATEGORIES.OPERATIONAL_INTEGRITY, 'WARNING', 'La operación todavía no tiene evidencia vinculada.', 'ADD_EVIDENCE'));
  }
  if (requiresLogistics && !operation.logistics) {
    signals.push(signal('LOGISTICS_PLAN_MISSING', INTERACTION_RISK_CATEGORIES.OPERATIONAL_INTEGRITY, 'WARNING', 'La operación requiere logística y todavía no tiene plan.', 'ADD_LOGISTICS_PLAN'));
  }
  if (operation.completed && hasIncident) {
    signals.push(signal('COMPLETED_WITH_OPEN_INCIDENT', INTERACTION_RISK_CATEGORIES.OPERATIONAL_INTEGRITY, 'CRITICAL', 'La operación figura cerrada mientras existe una incidencia.', 'REOPEN_FOR_HUMAN_REVIEW'));
  } else if (operation.completed && !relatedEvidence.length) {
    signals.push(signal('COMPLETED_WITHOUT_EVIDENCE', INTERACTION_RISK_CATEGORIES.OPERATIONAL_INTEGRITY, 'HIGH', 'La operación figura cerrada sin evidencia vinculada.', 'REVIEW_CLOSURE'));
  }

  const ordered = signals.sort((a, b) => SEVERITY_SCORE[b.severity] - SEVERITY_SCORE[a.severity]);
  return Object.freeze({
    riskDetected: ordered.length > 0,
    highestSeverity: ordered[0]?.severity || 'INFO',
    signals: Object.freeze(ordered)
  });
}
