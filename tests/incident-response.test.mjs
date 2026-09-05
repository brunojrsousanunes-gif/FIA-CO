import assert from 'node:assert/strict';
import { classifyIncident, buildIncidentResponsePlan, createSyntheticIncidentDrill } from '../core/security/incident-response.mjs';

assert.equal(classifyIncident({ costSpike: true }), 'MEDIUM');
assert.equal(classifyIncident({ personalDataExposure: true }), 'HIGH');
assert.equal(classifyIncident({ crossTenantExposure: true }), 'CRITICAL');

const crossTenant = buildIncidentResponsePlan({ crossTenantExposure: true });
assert.equal(crossTenant.severity, 'CRITICAL');
assert.equal(crossTenant.executionMode, 'PLAN_ONLY');
assert.equal(crossTenant.automaticExternalCommunication, false);
assert.ok(crossTenant.recommendedActions.includes('RECOMMEND_ORGANIZATION_KILL_SWITCH'));
assert.ok(crossTenant.recommendedActions.includes('RECOMMEND_CROSS_ORG_FREEZE'));
assert.ok(crossTenant.reviewFlags.includes('PRIVACY_LEGAL_ASSESSMENT_REQUIRED'));

const cost = buildIncidentResponsePlan(createSyntheticIncidentDrill('COST_SPIKE'));
assert.ok(cost.recommendedActions.includes('RECOMMEND_COST_CIRCUIT_BREAKER'));

const finance = buildIncidentResponsePlan(createSyntheticIncidentDrill('FINANCIAL_BOUNDARY'));
assert.equal(finance.severity, 'CRITICAL');
assert.equal(finance.financialBoundary, 'NON_CUSTODIAL');
assert.ok(finance.reviewFlags.includes('FINANCIAL_PROVIDER_AND_LEGAL_ASSESSMENT_REQUIRED'));

console.log('FIA incident response planner contract OK');
