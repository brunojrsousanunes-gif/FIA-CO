import assert from 'node:assert/strict';
import {
  createPilotBaseline,
  summarizeRecoveryCases,
  compareBaselineToPilot
} from '../core/recover/recover-outcomes.mjs';

const baseline = createPilotBaseline({
  periodDays: 30,
  quotesSent: 40,
  quotesFollowedUp: 12,
  totalQuoteValue: 80000,
  followUpHours: 10,
  averageFirstFollowUpHours: 72,
  confirmedWinsAfterFollowUp: 2,
  currency: 'EUR'
});

assert.equal(baseline.followUpRate, 0.3);
assert.throws(() => createPilotBaseline({ quotesSent: 2, quotesFollowedUp: 3 }), /FOLLOWED_EXCEEDS_QUOTES/);

const cases = [
  {
    state: 'WON',
    attempts: 2,
    lastResponseClass: 'INTERESTED',
    outcomeValue: 3500,
    evidence: [
      { type: 'STATE_HUMAN_REVIEW' },
      { type: 'STATE_WON', meta: { attribution: 'CONFIRMED' } }
    ]
  },
  {
    state: 'WON',
    attempts: 1,
    lastResponseClass: 'QUESTION',
    outcomeValue: 1200,
    evidence: [
      { type: 'STATE_HUMAN_REVIEW' },
      { type: 'STATE_WON', meta: { attribution: 'ASSISTED' } }
    ]
  },
  {
    state: 'WAITING',
    attempts: 1,
    lastResponseClass: null,
    evidence: []
  }
];

const summary = summarizeRecoveryCases(cases, {
  technologyCost: 8,
  humanMinutes: 60,
  humanHourlyCost: 20,
  monthlyRevenue: 129,
  implementationRevenue: 199
});

assert.equal(summary.casesTracked, 3);
assert.equal(summary.confirmedValue, 3500);
assert.equal(summary.assistedValue, 1200);
assert.equal(summary.totalVariableCost, 28);
assert.equal(summary.contributionMargin, 0.78);
assert.equal(summary.valueToFiaCostRatio, 167.86);
assert.equal(summary.mrrPerHumanHour, 129);

const comparison = compareBaselineToPilot(baseline, {
  quotesTracked: 40,
  quotesFollowedUp: 36,
  hoursSaved: 7
}, { hourlyValue: 18 });

assert.equal(comparison.pilotFollowUpRate, 0.9);
assert.equal(comparison.followUpRateDelta, 0.6);
assert.equal(comparison.estimatedTimeValue, 126);

console.log('FIA Recover outcomes contract OK');
