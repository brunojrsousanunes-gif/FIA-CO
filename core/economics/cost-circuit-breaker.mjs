function finiteNonNegative(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function evaluateCostCircuitBreaker(usage = {}, policy = {}) {
  const dailyCost = finiteNonNegative(usage.dailyCost);
  const monthlyCost = finiteNonNegative(usage.monthlyCost);
  const monthlyRevenue = finiteNonNegative(usage.monthlyRevenue);
  const maxDailyCost = finiteNonNegative(policy.maxDailyCost || 10);
  const maxMonthlyCost = finiteNonNegative(policy.maxMonthlyCost || 100);
  const maxVariableCostShare = Number.isFinite(Number(policy.maxVariableCostShare))
    ? Math.max(0, Number(policy.maxVariableCostShare))
    : 0.35;
  const warningShare = Number.isFinite(Number(policy.warningVariableCostShare))
    ? Math.max(0, Number(policy.warningVariableCostShare))
    : 0.25;

  const share = monthlyRevenue > 0 ? monthlyCost / monthlyRevenue : null;
  const blockers = [];
  const warnings = [];

  if (dailyCost > maxDailyCost) blockers.push('DAILY_COST_LIMIT_EXCEEDED');
  if (monthlyCost > maxMonthlyCost) blockers.push('MONTHLY_COST_LIMIT_EXCEEDED');
  if (share !== null && share > maxVariableCostShare) blockers.push('VARIABLE_COST_SHARE_EXCEEDED');
  if (share !== null && share > warningShare && share <= maxVariableCostShare) warnings.push('VARIABLE_COST_SHARE_WARNING');
  if (monthlyRevenue === 0 && monthlyCost > 0) warnings.push('COST_WITHOUT_REVENUE');

  return Object.freeze({
    schemaVersion: 'cost-circuit-breaker.v1',
    decision: blockers.length ? 'BLOCK' : (warnings.length ? 'WARN' : 'ALLOW'),
    blockers: Object.freeze(blockers),
    warnings: Object.freeze(warnings),
    observed: Object.freeze({ dailyCost, monthlyCost, monthlyRevenue, variableCostShare: share }),
    limits: Object.freeze({ maxDailyCost, maxMonthlyCost, maxVariableCostShare, warningVariableCostShare: warningShare }),
    externalSpendActivation: false,
    rule: 'Este gate evalúa límites; no compra servicios ni cambia presupuestos externos.'
  });
}
