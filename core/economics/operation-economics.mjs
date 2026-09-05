export const ECONOMIC_EVENT_TYPES = Object.freeze({
  REVENUE: 'REVENUE',
  IMPLEMENTATION_REVENUE: 'IMPLEMENTATION_REVENUE',
  AI_COST: 'AI_COST',
  INFRA_COST: 'INFRA_COST',
  PROVIDER_COST: 'PROVIDER_COST',
  OTHER_VARIABLE_COST: 'OTHER_VARIABLE_COST',
  HUMAN_MINUTES: 'HUMAN_MINUTES'
});

function finiteNonNegative(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function round2(value) {
  return Math.round((finiteNonNegative(value) + Number.EPSILON) * 100) / 100;
}

export function summarizeOperationEconomics(events = [], options = {}) {
  if (!Array.isArray(events)) throw new Error('INVALID_ECONOMIC_EVENTS');
  const humanHourlyCost = finiteNonNegative(options.humanHourlyCost);
  const totals = {
    revenue: 0,
    implementationRevenue: 0,
    aiCost: 0,
    infraCost: 0,
    providerCost: 0,
    otherVariableCost: 0,
    humanMinutes: 0
  };

  for (const event of events) {
    if (!event || typeof event !== 'object') continue;
    const type = String(event.type || '').trim().toUpperCase();
    const amount = finiteNonNegative(event.amount ?? event.value);
    switch (type) {
      case ECONOMIC_EVENT_TYPES.REVENUE: totals.revenue += amount; break;
      case ECONOMIC_EVENT_TYPES.IMPLEMENTATION_REVENUE: totals.implementationRevenue += amount; break;
      case ECONOMIC_EVENT_TYPES.AI_COST: totals.aiCost += amount; break;
      case ECONOMIC_EVENT_TYPES.INFRA_COST: totals.infraCost += amount; break;
      case ECONOMIC_EVENT_TYPES.PROVIDER_COST: totals.providerCost += amount; break;
      case ECONOMIC_EVENT_TYPES.OTHER_VARIABLE_COST: totals.otherVariableCost += amount; break;
      case ECONOMIC_EVENT_TYPES.HUMAN_MINUTES: totals.humanMinutes += amount; break;
      default: throw new Error(`UNKNOWN_ECONOMIC_EVENT:${type || 'EMPTY'}`);
    }
  }

  const humanCost = (totals.humanMinutes / 60) * humanHourlyCost;
  const technologyCost = totals.aiCost + totals.infraCost + totals.providerCost + totals.otherVariableCost;
  const totalVariableCost = technologyCost + humanCost;
  const contribution = totals.revenue - totalVariableCost;
  const totalCollectedRevenue = totals.revenue + totals.implementationRevenue;

  return Object.freeze({
    schemaVersion: 'operation-economics.v1',
    revenue: round2(totals.revenue),
    implementationRevenue: round2(totals.implementationRevenue),
    totalCollectedRevenue: round2(totalCollectedRevenue),
    aiCost: round2(totals.aiCost),
    infraCost: round2(totals.infraCost),
    providerCost: round2(totals.providerCost),
    otherVariableCost: round2(totals.otherVariableCost),
    technologyCost: round2(technologyCost),
    humanMinutes: round2(totals.humanMinutes),
    humanCost: round2(humanCost),
    totalVariableCost: round2(totalVariableCost),
    contribution: Math.round((contribution + Number.EPSILON) * 100) / 100,
    contributionMargin: totals.revenue > 0 ? Math.round(((contribution / totals.revenue) + Number.EPSILON) * 10000) / 10000 : null,
    mrrPerHumanHour: totals.humanMinutes > 0 ? round2(totals.revenue / (totals.humanMinutes / 60)) : null,
    variableCostShareOfRevenue: totals.revenue > 0 ? Math.round(((totalVariableCost / totals.revenue) + Number.EPSILON) * 10000) / 10000 : null,
    evidenceOnly: true,
    note: 'Instrumentación económica; no estima ingresos ni costes ausentes.'
  });
}
