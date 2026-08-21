export const PREPROD_CHECKS = Object.freeze([
  'coreOperationContract',
  'repositoryContract',
  'organizationIsolation',
  'auditIntegrity',
  'recoveryProcedureDefined',
  'recoveryRoundTripVerified',
  'observabilitySafe',
  'productionExecutionDisabled'
]);

export function evaluatePreproductionGate(input = {}) {
  const checks = Object.fromEntries(PREPROD_CHECKS.map(name => [name, input[name] === true]));
  const missing = PREPROD_CHECKS.filter(name => !checks[name]);
  const technicalReady = missing.length === 0;

  return Object.freeze({
    status: technicalReady ? 'PREPROD_TECHNICAL_READY' : 'PREPROD_BLOCKED',
    technicalReady,
    missing: Object.freeze([...missing]),
    checks: Object.freeze(checks),
    productionExecutionEnabled: false,
    realFundsEnabled: false,
    realPiiEnabled: false,
    externalProviderActivationAllowed: false,
    explicitFounderAuthorizationRequiredForExternalActivation: true,
    noAutomaticProductionPromotion: true
  });
}
