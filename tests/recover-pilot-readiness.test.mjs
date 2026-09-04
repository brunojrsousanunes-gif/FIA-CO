import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluateRecoverPilotReadiness } from '../core/recover/recover-pilot-readiness.mjs';

const policy = JSON.parse(fs.readFileSync(new URL('../config/recover-policy.v1.json', import.meta.url), 'utf8'));

const ready = evaluateRecoverPilotReadiness({
  candidateScore: 17,
  baselineReady: true,
  measurableOutcomeReady: true,
  pilotTermsAccepted: true,
  organizationAuthorized: true,
  dataUseReviewed: true,
  dataMinimizationReady: true,
  approvedTemplatesReady: true,
  allowedHoursReady: true,
  humanApprovalOwnerReady: true,
  killSwitchReady: true,
  auditLoggingReady: true,
  shadowModeFirst: true,
  projectedMonthlyRevenue: 129,
  projectedTechnologyCost: 8,
  projectedTotalVariableCost: 28,
  proofVisibility: 'GATED_ANONYMIZED',
  proofReuseAuthorized: true,
  customerWillReviewResults: true
}, policy);

assert.equal(ready.status, 'READY_FOUNDING_DEMONSTRATOR');
assert.equal(ready.eligiblePilot, true);
assert.equal(ready.eligibleFoundingDemonstrator, true);
assert.equal(ready.economics.technologyCostRatio < 0.15, true);
assert.equal(ready.economics.totalVariableCostRatio < 0.35, true);

const privatePilot = evaluateRecoverPilotReadiness({
  candidateScore: 17,
  baselineReady: true,
  measurableOutcomeReady: true,
  pilotTermsAccepted: true,
  organizationAuthorized: true,
  dataUseReviewed: true,
  dataMinimizationReady: true,
  approvedTemplatesReady: true,
  allowedHoursReady: true,
  humanApprovalOwnerReady: true,
  killSwitchReady: true,
  auditLoggingReady: true,
  shadowModeFirst: true,
  projectedMonthlyRevenue: 129,
  projectedTechnologyCost: 8,
  projectedTotalVariableCost: 28,
  proofVisibility: 'PRIVATE',
  proofReuseAuthorized: false,
  customerWillReviewResults: true
}, policy);
assert.equal(privatePilot.status, 'READY_CONTROLLED_PILOT');
assert.equal(privatePilot.eligibleFoundingDemonstrator, false);

const tooExpensive = evaluateRecoverPilotReadiness({
  candidateScore: 18,
  baselineReady: true,
  measurableOutcomeReady: true,
  pilotTermsAccepted: true,
  organizationAuthorized: true,
  dataUseReviewed: true,
  dataMinimizationReady: true,
  approvedTemplatesReady: true,
  allowedHoursReady: true,
  humanApprovalOwnerReady: true,
  killSwitchReady: true,
  auditLoggingReady: true,
  shadowModeFirst: true,
  projectedMonthlyRevenue: 79,
  projectedTechnologyCost: 30,
  projectedTotalVariableCost: 65,
  proofVisibility: 'GATED_IDENTIFIED',
  proofReuseAuthorized: true,
  customerWillReviewResults: true
}, policy);
assert.equal(tooExpensive.status, 'NOT_READY');
assert.equal(tooExpensive.checks.technologyEconomicsReady, false);
assert.equal(tooExpensive.checks.totalEconomicsReady, false);

const weakCandidate = evaluateRecoverPilotReadiness({ candidateScore: 8 }, policy);
assert.equal(weakCandidate.status, 'NOT_READY');
assert.equal(weakCandidate.blocking.includes('candidateScoreReady'), true);
assert.equal(weakCandidate.externalActionsMustRemainDisabledForShadow, true);

console.log('FIA Recover pilot readiness contract OK');
