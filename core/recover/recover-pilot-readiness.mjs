const PROOF_LEVELS = new Set(['GATED_IDENTIFIED', 'GATED_ANONYMIZED']);

function bool(value) {
  return value === true;
}

function finite(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function evaluateRecoverPilotReadiness(input = {}, policy = {}) {
  const candidateScore = Math.max(0, Math.floor(finite(input.candidateScore)));
  const projectedMonthlyRevenue = Math.max(0, finite(input.projectedMonthlyRevenue));
  const projectedTechnologyCost = Math.max(0, finite(input.projectedTechnologyCost));
  const projectedTotalVariableCost = Math.max(0, finite(input.projectedTotalVariableCost));

  const techRatio = projectedMonthlyRevenue > 0 ? projectedTechnologyCost / projectedMonthlyRevenue : Infinity;
  const variableRatio = projectedMonthlyRevenue > 0 ? projectedTotalVariableCost / projectedMonthlyRevenue : Infinity;
  const techLimit = finite(policy.economics?.targetTechnologyVariableCostRatioMax, 0.15);
  const variableLimit = finite(policy.economics?.targetTotalVariableCostRatioMax, 0.35);

  const checks = Object.freeze({
    candidateScoreReady: candidateScore >= 14,
    baselineReady: bool(input.baselineReady),
    measurableOutcomeReady: bool(input.measurableOutcomeReady),
    pilotTermsAccepted: bool(input.pilotTermsAccepted),
    organizationAuthorized: bool(input.organizationAuthorized),
    dataUseReviewed: bool(input.dataUseReviewed),
    dataMinimizationReady: bool(input.dataMinimizationReady),
    approvedTemplatesReady: bool(input.approvedTemplatesReady),
    allowedHoursReady: bool(input.allowedHoursReady),
    humanApprovalOwnerReady: bool(input.humanApprovalOwnerReady),
    killSwitchReady: bool(input.killSwitchReady),
    auditLoggingReady: bool(input.auditLoggingReady),
    shadowModeFirst: bool(input.shadowModeFirst),
    technologyEconomicsReady: techRatio <= techLimit,
    totalEconomicsReady: variableRatio <= variableLimit
  });

  const blocking = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
  const eligiblePilot = blocking.length === 0;

  const proofVisibility = String(input.proofVisibility || 'PRIVATE').trim().toUpperCase();
  const proofReuseAuthorized = bool(input.proofReuseAuthorized) && PROOF_LEVELS.has(proofVisibility);
  const commerciallyUsefulCandidate = eligiblePilot && proofReuseAuthorized && bool(input.customerWillReviewResults);

  return Object.freeze({
    status: commerciallyUsefulCandidate
      ? 'READY_FOUNDING_DEMONSTRATOR'
      : eligiblePilot
        ? 'READY_CONTROLLED_PILOT'
        : 'NOT_READY',
    eligiblePilot,
    eligibleFoundingDemonstrator: commerciallyUsefulCandidate,
    candidateScore,
    checks,
    blocking,
    economics: Object.freeze({
      projectedMonthlyRevenue,
      projectedTechnologyCost,
      projectedTotalVariableCost,
      technologyCostRatio: Number.isFinite(techRatio) ? Math.round(techRatio * 10000) / 10000 : null,
      totalVariableCostRatio: Number.isFinite(variableRatio) ? Math.round(variableRatio * 10000) / 10000 : null,
      technologyCostRatioLimit: techLimit,
      totalVariableCostRatioLimit: variableLimit
    }),
    proof: Object.freeze({
      visibility: proofVisibility,
      reuseAuthorized: proofReuseAuthorized,
      customerWillReviewResults: bool(input.customerWillReviewResults)
    }),
    externalActionsMustRemainDisabledForShadow: true,
    realDataRequiresSeparateProductionControls: true
  });
}
