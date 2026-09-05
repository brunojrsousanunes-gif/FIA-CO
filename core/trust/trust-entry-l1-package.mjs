import { FIA_ENTRY_SCENARIOS } from '../discovery/entry-scenario-selector.mjs';

const ALLOWED_CLASSIFICATIONS = new Set(['PUBLIC', 'INTERNAL', 'COMMERCIAL_CONFIDENTIAL', 'PERSONAL']);

function clean(value, max = 160) {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .slice(0, max);
}

function normalizeField(field = {}) {
  if ('value' in field || 'sample' in field || 'example' in field) throw new Error('L1_PACKAGE_MUST_NOT_CONTAIN_REAL_VALUES');
  const key = clean(field.key, 80);
  const purpose = clean(field.purpose, 180);
  const classification = clean(field.classification || 'INTERNAL', 40).toUpperCase();
  if (!key || !purpose) throw new Error('FIELD_KEY_AND_PURPOSE_REQUIRED');
  if (!ALLOWED_CLASSIFICATIONS.has(classification)) throw new Error('INVALID_OR_CRITICAL_FIELD_CLASSIFICATION');
  return Object.freeze({ key, purpose, classification, required: field.required === true });
}

export function createL1PreparationPackage(input = {}, options = {}) {
  const scenario = clean(input.scenario, 60).toUpperCase();
  if (!Object.values(FIA_ENTRY_SCENARIOS).includes(scenario)) throw new Error('INVALID_ENTRY_SCENARIO');
  if (scenario === FIA_ENTRY_SCENARIOS.PARTNER_COORDINATION) throw new Error('PARTNER_COORDINATION_REQUIRES_L3_NOT_L1');

  const fields = (Array.isArray(input.requestedFields) ? input.requestedFields : []).map(normalizeField);
  if (!fields.length) throw new Error('AT_LEAST_ONE_FIELD_DESCRIPTOR_REQUIRED');
  const metricKeys = [...new Set((Array.isArray(input.metricKeys) ? input.metricKeys : [])
    .map(value => clean(value, 80))
    .filter(Boolean))];
  if (!metricKeys.length) throw new Error('MEASUREMENT_PLAN_REQUIRED');

  const retentionDays = Math.max(1, Math.min(90, Math.floor(Number(input.retentionDays) || 30)));
  const generatedAt = new Date(options.now || new Date().toISOString()).toISOString();

  return Object.freeze({
    schemaVersion: 'trust-entry-l1-package.v1',
    generatedAt,
    activationStatus: 'PREPARATION_ONLY',
    productionActivation: false,
    realDataIncluded: false,
    organizationAlias: clean(input.organizationAlias || 'prospect', 80),
    operationAlias: clean(input.operationAlias || 'operation-01', 80),
    scenario,
    operationKind: clean(input.operationKind || 'generic', 80),
    dataPermitDraft: Object.freeze({
      fields: Object.freeze(fields),
      defaultDecision: 'DENY_UNLISTED',
      crossOrganizationSharing: false,
      criticalDataAllowed: false,
      externalActionsAllowed: false,
      paymentExecutionAllowed: false
    }),
    measurementPlan: Object.freeze({ metricKeys: Object.freeze(metricKeys), baselineRequired: true }),
    retentionPlan: Object.freeze({ retentionDays, deletionAtCloseRequired: true, extensionRequiresNewDecision: true }),
    securityRestrictions: Object.freeze({
      oneOrganizationOnly: true,
      oneOperationOnly: true,
      noCredentialsInPackage: true,
      noRawDocumentsInPackage: true,
      noBankingDataInPackage: true,
      nonCustodial: true
    }),
    unresolvedActivationRequirements: Object.freeze([
      'managerSponsorConfirmed',
      'organizationIdentified',
      'termsAccepted',
      'incidentContactDefined',
      'productionAuthenticationReady',
      'productionPersistenceReady',
      'applicableLegalPrivacyReview'
    ]),
    nextAction: 'REVIEW_PACKAGE_BEFORE_ANY_REAL_DATA'
  });
}
