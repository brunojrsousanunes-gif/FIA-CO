import { TRUST_SECURITY_LEVELS } from '../trust/trust-security-levels.mjs';

export const FIA_ENTRY_SCENARIOS = Object.freeze({
  TRUST_TRANSACTION: 'TRUST_TRANSACTION',
  QUOTE_RECOVERY: 'QUOTE_RECOVERY',
  DOCUMENT_FLOW: 'DOCUMENT_FLOW',
  PARTNER_COORDINATION: 'PARTNER_COORDINATION'
});

const ORDER = Object.freeze([
  FIA_ENTRY_SCENARIOS.TRUST_TRANSACTION,
  FIA_ENTRY_SCENARIOS.QUOTE_RECOVERY,
  FIA_ENTRY_SCENARIOS.DOCUMENT_FLOW,
  FIA_ENTRY_SCENARIOS.PARTNER_COORDINATION
]);

const MIN_LEVEL = Object.freeze({
  TRUST_TRANSACTION: TRUST_SECURITY_LEVELS.L1_ISOLATED,
  QUOTE_RECOVERY: TRUST_SECURITY_LEVELS.L1_ISOLATED,
  DOCUMENT_FLOW: TRUST_SECURITY_LEVELS.L1_ISOLATED,
  PARTNER_COORDINATION: TRUST_SECURITY_LEVELS.L3_SHARED
});

function signal(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(3, Math.round(n)));
}

function scoreSignals(input = {}) {
  return Object.freeze({
    [FIA_ENTRY_SCENARIOS.TRUST_TRANSACTION]:
      signal(input.traceabilityPain) * 3 +
      signal(input.operationComplexity) * 2 +
      signal(input.highTicketRisk) * 2 +
      signal(input.needForAuditability) * 2,
    [FIA_ENTRY_SCENARIOS.QUOTE_RECOVERY]:
      signal(input.quoteVolume) * 2 +
      signal(input.followUpPain) * 3 +
      signal(input.lostOpportunityRisk) * 3 +
      signal(input.manualCommercialWork) * 2,
    [FIA_ENTRY_SCENARIOS.DOCUMENT_FLOW]:
      signal(input.documentVolume) * 2 +
      signal(input.missingDocumentPain) * 3 +
      signal(input.reworkPain) * 2 +
      signal(input.documentWaitingTime) * 3,
    [FIA_ENTRY_SCENARIOS.PARTNER_COORDINATION]:
      signal(input.partnerFrequency) * 2 +
      signal(input.handoffFriction) * 3 +
      signal(input.callsAndEmailsPain) * 2 +
      signal(input.crossCompanyWaitingTime) * 3
  });
}

function levelIndex(level) {
  const order = [
    TRUST_SECURITY_LEVELS.L0_DEMO,
    TRUST_SECURITY_LEVELS.L1_ISOLATED,
    TRUST_SECURITY_LEVELS.L2_VERIFIED,
    TRUST_SECURITY_LEVELS.L3_SHARED,
    TRUST_SECURITY_LEVELS.L4_ADVANCED
  ];
  return Math.max(0, order.indexOf(level));
}

function reasonCodes(scenario, input = {}) {
  const pairs = {
    TRUST_TRANSACTION: [
      ['TRACEABILITY_PAIN', input.traceabilityPain],
      ['OPERATION_COMPLEXITY', input.operationComplexity],
      ['HIGH_TICKET_RISK', input.highTicketRisk],
      ['AUDITABILITY_NEEDED', input.needForAuditability]
    ],
    QUOTE_RECOVERY: [
      ['FOLLOW_UP_PAIN', input.followUpPain],
      ['LOST_OPPORTUNITY_RISK', input.lostOpportunityRisk],
      ['QUOTE_VOLUME', input.quoteVolume],
      ['MANUAL_COMMERCIAL_WORK', input.manualCommercialWork]
    ],
    DOCUMENT_FLOW: [
      ['MISSING_DOCUMENT_PAIN', input.missingDocumentPain],
      ['DOCUMENT_WAITING_TIME', input.documentWaitingTime],
      ['DOCUMENT_VOLUME', input.documentVolume],
      ['REWORK_PAIN', input.reworkPain]
    ],
    PARTNER_COORDINATION: [
      ['HANDOFF_FRICTION', input.handoffFriction],
      ['CROSS_COMPANY_WAITING', input.crossCompanyWaitingTime],
      ['PARTNER_FREQUENCY', input.partnerFrequency],
      ['CALLS_EMAILS_PAIN', input.callsAndEmailsPain]
    ]
  };
  return Object.freeze((pairs[scenario] || [])
    .filter(([, value]) => signal(value) >= 2)
    .sort((a, b) => signal(b[1]) - signal(a[1]))
    .map(([code]) => code));
}

export function selectEntryScenario(input = {}, options = {}) {
  const scores = scoreSignals(input);
  const currentLevel = Object.values(TRUST_SECURITY_LEVELS).includes(options.currentLevel)
    ? options.currentLevel
    : TRUST_SECURITY_LEVELS.L0_DEMO;

  const ranking = ORDER.map((scenario, stableIndex) => ({
    scenario,
    score: scores[scenario],
    stableIndex,
    minimumTrustLevel: MIN_LEVEL[scenario],
    reasons: reasonCodes(scenario, input)
  })).sort((a, b) => b.score - a.score || a.stableIndex - b.stableIndex)
    .map(item => Object.freeze({
      scenario: item.scenario,
      score: item.score,
      minimumTrustLevel: item.minimumTrustLevel,
      reasons: item.reasons,
      currentlyExecutable: levelIndex(currentLevel) >= levelIndex(item.minimumTrustLevel)
    }));

  const top = ranking[0];
  const hasMeaningfulSignal = top.score >= 6;
  return Object.freeze({
    schemaVersion: 'entry-scenario-selector.v1',
    currentLevel,
    hasMeaningfulSignal,
    recommendation: hasMeaningfulSignal ? top.scenario : null,
    recommendationMode: hasMeaningfulSignal
      ? (top.currentlyExecutable ? 'CURRENT_LEVEL_COMPATIBLE' : 'DEMO_NOW_UNLOCK_LATER')
      : 'MORE_DISCOVERY_REQUIRED',
    ranking: Object.freeze(ranking),
    rule: 'Seleccionar el problema dominante; no enseñar cuatro productos a la vez.'
  });
}

export function getEntryDiscoveryQuestions() {
  return Object.freeze([
    '¿Dónde se os quedan más operaciones o presupuestos esperando a que alguien actúe?',
    '¿Qué parte genera más llamadas, correos o seguimientos manuales?',
    '¿Dónde aparecen más documentos pendientes o reenvíos?',
    '¿Qué ocurre cuando interviene otra empresa, taller, transporte, proveedor o renting?',
    '¿Qué operación os preocupa más perder de vista o no poder reconstruir después?'
  ]);
}
