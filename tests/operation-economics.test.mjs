import assert from 'node:assert/strict';
import { summarizeOperationEconomics } from '../core/economics/operation-economics.mjs';

const summary = summarizeOperationEconomics([
  { type: 'REVENUE', amount: 129 },
  { type: 'IMPLEMENTATION_REVENUE', amount: 49 },
  { type: 'AI_COST', amount: 2.5 },
  { type: 'INFRA_COST', amount: 3 },
  { type: 'PROVIDER_COST', amount: 4.5 },
  { type: 'HUMAN_MINUTES', amount: 60 }
], { humanHourlyCost: 20 });

assert.equal(summary.revenue, 129);
assert.equal(summary.implementationRevenue, 49);
assert.equal(summary.totalCollectedRevenue, 178);
assert.equal(summary.technologyCost, 10);
assert.equal(summary.humanCost, 20);
assert.equal(summary.totalVariableCost, 30);
assert.equal(summary.contribution, 99);
assert.equal(summary.mrrPerHumanHour, 129);
assert.equal(summary.evidenceOnly, true);
assert.throws(() => summarizeOperationEconomics([{ type: 'UNKNOWN', amount: 1 }]), /UNKNOWN_ECONOMIC_EVENT/);

console.log('FIA generic operation economics contract OK');
