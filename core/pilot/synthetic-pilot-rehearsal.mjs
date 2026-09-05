import crypto from 'node:crypto';
import { selectEntryScenario, FIA_ENTRY_SCENARIOS } from '../discovery/entry-scenario-selector.mjs';
import { createL1PreparationPackage } from '../trust/trust-entry-l1-package.mjs';
import { buildLocalShadowAggregate } from '../shadow/local-shadow.mjs';
import { summarizeOperationEconomics } from '../economics/operation-economics.mjs';
import { createOperation } from '../operations/operation-engine.mjs';
import { createTrustTransaction } from '../trust/trust-transaction.mjs';
import { buildTrustClientSnapshot } from '../trust/trust-client-snapshot.mjs';
import { createTrustEvidenceManifest, verifyTrustEvidenceManifest } from '../trust/trust-evidence-manifest.mjs';
import { TRUST_SECURITY_LEVELS } from '../trust/trust-security-levels.mjs';

export const SYNTHETIC_REHEARSAL_VERSION = 'synthetic-pilot-rehearsal.v1';

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  }
  return value;
}

function digest(value) {
  return crypto.createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
}

function clean(value, max = 120) {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .slice(0, max);
}

function deterministicDeps(seed = 'rehearsal') {
  let sequence = 0;
  const safeSeed = clean(seed, 40) || 'rehearsal';
  return {
    idFactory(prefix = 'id') {
      sequence += 1;
      return `${prefix}_${safeSeed}_${String(sequence).padStart(3, '0')}`;
    },
    clock: () => '2026-09-05T00:00:00.000Z'
  };
}

function assertSyntheticCase(input = {}) {
  if (!input || typeof input !== 'object') throw new Error('SYNTHETIC_REHEARSAL_CASE_REQUIRED');
  if (!input.id || !input.expectedEntry) throw new Error('SYNTHETIC_REHEARSAL_ID_AND_ENTRY_REQUIRED');
  if (!Object.values(FIA_ENTRY_SCENARIOS).includes(String(input.expectedEntry).toUpperCase())) {
    throw new Error('INVALID_SYNTHETIC_EXPECTED_ENTRY');
  }
  if (input.realData === true || input.production === true || input.externalActions === true || input.paymentExecution === true) {
    throw new Error('SYNTHETIC_REHEARSAL_CANNOT_ENABLE_REAL_EXECUTION');
  }
  return true;
}

function artifact(id, value) {
  return Object.freeze({ id, kind: value?.schemaVersion || id, digest: digest(value) });
}

function commonEnvelope(input, selection, shadow, economics) {
  return {
    schemaVersion: SYNTHETIC_REHEARSAL_VERSION,
    rehearsalId: clean(input.id, 100),
    syntheticOnly: true,
    realDataUsed: false,
    productionActivation: false,
    externalActionsExecuted: false,
    paymentExecution: false,
    nonCustodial: true,
    currentTrustLevel: TRUST_SECURITY_LEVELS.L0_DEMO,
    expectedEntry: String(input.expectedEntry).toUpperCase(),
    selectedEntry: selection.recommendation,
    selectorMode: selection.recommendationMode,
    localShadow: shadow,
    economics,
    evidencePolicy: Object.freeze({
      realOutcomeClaimsAllowed: false,
      customerProofPackAllowed: false,
      marketValidationClaimAllowed: false,
      syntheticResultsMustRemainLabeled: true
    })
  };
}

export function runSyntheticPilotRehearsal(input = {}, options = {}) {
  assertSyntheticCase(input);
  const expectedEntry = String(input.expectedEntry).toUpperCase();
  const selection = selectEntryScenario(input.discoverySignals || {}, {
    currentLevel: TRUST_SECURITY_LEVELS.L0_DEMO
  });
  const shadow = buildLocalShadowAggregate(input.shadowRecords || [], {
    kind: input.operationKind || expectedEntry
  });
  const economics = summarizeOperationEconomics(input.economicEvents || [], {
    humanHourlyCost: Number(options.humanHourlyCost) || 0
  });
  const base = commonEnvelope(input, selection, shadow, economics);

  const selectionMatches = selection.hasMeaningfulSignal && selection.recommendation === expectedEntry;
  if (!selectionMatches) {
    return Object.freeze({
      ...base,
      status: 'REHEARSAL_FAIL',
      failureReason: selection.hasMeaningfulSignal ? 'ENTRY_SELECTOR_MISMATCH' : 'INSUFFICIENT_DISCOVERY_SIGNAL',
      l1Preparation: null,
      operation: null,
      clientSnapshot: null,
      evidenceManifest: null,
      unresolvedActivationRequirements: Object.freeze([])
    });
  }

  if (expectedEntry === FIA_ENTRY_SCENARIOS.PARTNER_COORDINATION) {
    return Object.freeze({
      ...base,
      status: 'REHEARSAL_BLOCKED_EXPECTED',
      failureReason: null,
      blockedBy: 'TRUST_LEVEL_L3_REQUIRED',
      minimumTrustLevel: TRUST_SECURITY_LEVELS.L3_SHARED,
      l1Preparation: null,
      operation: null,
      clientSnapshot: null,
      evidenceManifest: null,
      unresolvedActivationRequirements: Object.freeze([
        'dataPermitsReady',
        'grantExpiryReady',
        'grantRevocationReady',
        'partnerIdentityVerified',
        'purposeLimitationReady',
        'crossOrgIsolationTestsPassed'
      ])
    });
  }

  const l1Preparation = createL1PreparationPackage({
    scenario: expectedEntry,
    organizationAlias: `synthetic-${clean(input.id, 50).toLowerCase()}`,
    operationAlias: `${clean(input.id, 50).toLowerCase()}-operation`,
    operationKind: input.operationKind || 'synthetic-operation',
    requestedFields: input.requestedFields || [],
    metricKeys: input.metricKeys || [],
    retentionDays: 30
  }, { now: '2026-09-05T00:00:00.000Z' });

  const deps = deterministicDeps(clean(input.id, 30));
  const organizationId = `org-synthetic-${clean(input.id, 40).toLowerCase()}`;
  const operation = createOperation({
    ...(input.syntheticOperation || {}),
    organizationId,
    kind: input.operationKind || 'synthetic-operation',
    actor: 'synthetic-rehearsal'
  }, deps);

  const transaction = createTrustTransaction({
    ownerOrganizationId: organizationId,
    operationId: operation.id,
    title: `Ensayo ${clean(input.id, 80)}`,
    state: operation.state,
    fields: input.syntheticFields || [],
    actor: 'synthetic-rehearsal'
  }, deps);

  const clientSnapshot = buildTrustClientSnapshot({
    operation,
    transaction,
    context: { actorId: 'synthetic-owner', organizationId, role: 'OWNER' },
    auditEvents: [],
    auditIntegrityVerified: true
  }, { now: '2026-09-05T00:00:00.000Z' });

  const manifest = createTrustEvidenceManifest({
    operationId: operation.id,
    organizationId,
    artifacts: [
      artifact('entry-selection', selection),
      artifact('l1-preparation', l1Preparation),
      artifact('local-shadow', shadow),
      artifact('economics', economics),
      artifact('client-snapshot', clientSnapshot)
    ]
  }, { now: '2026-09-05T00:00:00.000Z' });

  if (!verifyTrustEvidenceManifest(manifest)) throw new Error('SYNTHETIC_MANIFEST_INTEGRITY_FAILED');
  if (l1Preparation.productionActivation !== false || l1Preparation.realDataIncluded !== false) {
    throw new Error('SYNTHETIC_L1_BOUNDARY_BROKEN');
  }
  if (clientSnapshot.security.sourceDataFilteredBeforeClient !== true) {
    throw new Error('SYNTHETIC_CLIENT_BOUNDARY_BROKEN');
  }

  return Object.freeze({
    ...base,
    status: 'REHEARSAL_PASS',
    failureReason: null,
    blockedBy: null,
    minimumTrustLevel: TRUST_SECURITY_LEVELS.L1_ISOLATED,
    l1Preparation,
    operation: Object.freeze({
      id: operation.id,
      state: operation.state,
      kind: operation.kind,
      syntheticAmount: operation.amount,
      currency: operation.currency
    }),
    clientSnapshot,
    evidenceManifest: manifest,
    unresolvedActivationRequirements: l1Preparation.unresolvedActivationRequirements,
    nextAction: 'USE_REHEARSAL_TO_PREPARE_MANAGER_DEMO_NOT_PRODUCTION'
  });
}

export function summarizeSyntheticRehearsalSet(results = []) {
  if (!Array.isArray(results)) throw new Error('INVALID_REHEARSAL_RESULTS');
  const summary = {
    total: results.length,
    passed: 0,
    expectedSecurityBlocks: 0,
    failed: 0,
    entriesCovered: new Set(),
    marketValidated: false,
    productionReady: false
  };
  for (const result of results) {
    if (!result || typeof result !== 'object') continue;
    if (result.selectedEntry) summary.entriesCovered.add(result.selectedEntry);
    if (result.status === 'REHEARSAL_PASS') summary.passed += 1;
    else if (result.status === 'REHEARSAL_BLOCKED_EXPECTED') summary.expectedSecurityBlocks += 1;
    else summary.failed += 1;
  }
  return Object.freeze({
    schemaVersion: 'synthetic-pilot-rehearsal-summary.v1',
    total: summary.total,
    passed: summary.passed,
    expectedSecurityBlocks: summary.expectedSecurityBlocks,
    failed: summary.failed,
    entriesCovered: Object.freeze([...summary.entriesCovered]),
    marketValidated: false,
    productionReady: false,
    safeToUseForInternalRehearsal: summary.failed === 0,
    note: 'Ensayo técnico/comercial sintético. No demuestra demanda, ROI, cumplimiento jurídico ni readiness productivo.'
  });
}
