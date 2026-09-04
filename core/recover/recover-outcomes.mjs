export const ATTRIBUTION_LEVELS = Object.freeze({
  CONFIRMED: 'CONFIRMED',
  ASSISTED: 'ASSISTED',
  ESTIMATED: 'ESTIMATED'
});

function finiteNonNegative(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function round2(value) {
  return Math.round((finiteNonNegative(value) + Number.EPSILON) * 100) / 100;
}

function normalizeAttribution(value) {
  const normalized = String(value || 'ASSISTED').trim().toUpperCase();
  if (!Object.values(ATTRIBUTION_LEVELS).includes(normalized)) throw new Error('INVALID_ATTRIBUTION');
  return normalized;
}

export function createPilotBaseline(input = {}) {
  const quotes = Math.floor(finiteNonNegative(input.quotesSent));
  const followed = Math.floor(finiteNonNegative(input.quotesFollowedUp));
  const hours = finiteNonNegative(input.followUpHours);
  const quoteValue = finiteNonNegative(input.totalQuoteValue);

  if (followed > quotes) throw new Error('FOLLOWED_EXCEEDS_QUOTES');

  return Object.freeze({
    periodDays: Math.max(1, Math.floor(finiteNonNegative(input.periodDays, 30))),
    quotesSent: quotes,
    quotesFollowedUp: followed,
    followUpRate: quotes > 0 ? round2(followed / quotes) : 0,
    totalQuoteValue: round2(quoteValue),
    followUpHours: round2(hours),
    averageFirstFollowUpHours: round2(input.averageFirstFollowUpHours),
    confirmedWinsAfterFollowUp: Math.floor(finiteNonNegative(input.confirmedWinsAfterFollowUp)),
    currency: String(input.currency || 'EUR').trim().toUpperCase().slice(0, 6)
  });
}

export function summarizeRecoveryCases(cases = [], economics = {}) {
  if (!Array.isArray(cases)) throw new Error('INVALID_CASES');

  const summary = {
    casesTracked: 0,
    attempts: 0,
    responses: 0,
    interestedResponses: 0,
    humanReviews: 0,
    wonCases: 0,
    lostCases: 0,
    confirmedValue: 0,
    assistedValue: 0,
    estimatedValue: 0
  };

  for (const recovery of cases) {
    if (!recovery || typeof recovery !== 'object') continue;
    summary.casesTracked += 1;
    summary.attempts += Math.floor(finiteNonNegative(recovery.attempts));
    if (recovery.lastResponseClass) summary.responses += 1;
    if (recovery.lastResponseClass === 'INTERESTED') summary.interestedResponses += 1;
    if (recovery.state === 'HUMAN_REVIEW' || recovery.evidence?.some(e => e?.type === 'STATE_HUMAN_REVIEW')) {
      summary.humanReviews += 1;
    }
    if (recovery.state === 'WON') summary.wonCases += 1;
    if (recovery.state === 'LOST') summary.lostCases += 1;

    if (recovery.state === 'WON' && recovery.outcomeValue != null) {
      const resolution = [...(recovery.evidence || [])].reverse().find(e => e?.type === 'STATE_WON');
      const attribution = normalizeAttribution(resolution?.meta?.attribution || 'ASSISTED');
      const value = finiteNonNegative(recovery.outcomeValue);
      if (attribution === 'CONFIRMED') summary.confirmedValue += value;
      if (attribution === 'ASSISTED') summary.assistedValue += value;
      if (attribution === 'ESTIMATED') summary.estimatedValue += value;
    }
  }

  const techCost = finiteNonNegative(economics.technologyCost);
  const humanMinutes = finiteNonNegative(economics.humanMinutes);
  const humanHourlyCost = finiteNonNegative(economics.humanHourlyCost);
  const humanCost = (humanMinutes / 60) * humanHourlyCost;
  const totalVariableCost = techCost + humanCost;
  const monthlyRevenue = finiteNonNegative(economics.monthlyRevenue);
  const implementationRevenue = finiteNonNegative(economics.implementationRevenue);
  const attributableValue = summary.confirmedValue + summary.assistedValue;
  const contribution = monthlyRevenue - totalVariableCost;

  return Object.freeze({
    ...summary,
    confirmedValue: round2(summary.confirmedValue),
    assistedValue: round2(summary.assistedValue),
    estimatedValue: round2(summary.estimatedValue),
    technologyCost: round2(techCost),
    humanMinutes: round2(humanMinutes),
    humanCost: round2(humanCost),
    totalVariableCost: round2(totalVariableCost),
    monthlyRevenue: round2(monthlyRevenue),
    implementationRevenue: round2(implementationRevenue),
    contributionMargin: monthlyRevenue > 0 ? round2(contribution / monthlyRevenue) : 0,
    valueToFiaCostRatio: totalVariableCost > 0 ? round2(attributableValue / totalVariableCost) : null,
    mrrPerHumanHour: humanMinutes > 0 ? round2(monthlyRevenue / (humanMinutes / 60)) : null
  });
}

export function compareBaselineToPilot(baseline, pilot = {}, assumptions = {}) {
  if (!baseline || typeof baseline !== 'object') throw new Error('INVALID_BASELINE');
  const pilotQuotes = Math.floor(finiteNonNegative(pilot.quotesTracked));
  const pilotFollowed = Math.floor(finiteNonNegative(pilot.quotesFollowedUp));
  if (pilotFollowed > pilotQuotes) throw new Error('FOLLOWED_EXCEEDS_QUOTES');

  const pilotRate = pilotQuotes > 0 ? pilotFollowed / pilotQuotes : 0;
  const baselineRate = finiteNonNegative(baseline.followUpRate);
  const hoursSaved = finiteNonNegative(pilot.hoursSaved);
  const hourlyValue = finiteNonNegative(assumptions.hourlyValue);

  return Object.freeze({
    baselineFollowUpRate: round2(baselineRate),
    pilotFollowUpRate: round2(pilotRate),
    followUpRateDelta: round2(pilotRate - baselineRate),
    hoursSaved: round2(hoursSaved),
    estimatedTimeValue: round2(hoursSaved * hourlyValue),
    estimationMethod: hourlyValue > 0 ? 'hoursSaved * agreedHourlyValue' : null
  });
}
