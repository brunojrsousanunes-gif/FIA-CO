import assert from 'node:assert/strict';
import { evaluateCostCircuitBreaker } from '../core/economics/cost-circuit-breaker.mjs';

const allow = evaluateCostCircuitBreaker({ dailyCost: 1, monthlyCost: 10, monthlyRevenue: 129 }, {
  maxDailyCost: 5,
  maxMonthlyCost: 50,
  warningVariableCostShare: 0.2,
  maxVariableCostShare: 0.35
});
assert.equal(allow.decision, 'ALLOW');
assert.equal(allow.externalSpendActivation, false);

const warn = evaluateCostCircuitBreaker({ dailyCost: 1, monthlyCost: 30, monthlyRevenue: 129 }, {
  maxDailyCost: 5,
  maxMonthlyCost: 50,
  warningVariableCostShare: 0.2,
  maxVariableCostShare: 0.35
});
assert.equal(warn.decision, 'WARN');
assert.ok(warn.warnings.includes('VARIABLE_COST_SHARE_WARNING'));

const block = evaluateCostCircuitBreaker({ dailyCost: 8, monthlyCost: 60, monthlyRevenue: 129 }, {
  maxDailyCost: 5,
  maxMonthlyCost: 50,
  maxVariableCostShare: 0.35
});
assert.equal(block.decision, 'BLOCK');
assert.ok(block.blockers.includes('DAILY_COST_LIMIT_EXCEEDED'));
assert.ok(block.blockers.includes('MONTHLY_COST_LIMIT_EXCEEDED'));

const noRevenue = evaluateCostCircuitBreaker({ dailyCost: 1, monthlyCost: 2, monthlyRevenue: 0 }, { maxDailyCost: 5, maxMonthlyCost: 50 });
assert.equal(noRevenue.decision, 'WARN');
assert.ok(noRevenue.warnings.includes('COST_WITHOUT_REVENUE'));

console.log('FIA cost circuit breaker contract OK');
