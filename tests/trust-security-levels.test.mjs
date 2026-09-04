import assert from 'node:assert/strict';
import {
  TRUST_SECURITY_LEVELS,
  TRUST_CAPABILITIES,
  evaluateTrustSecurityLevel,
  hasTrustCapability,
  assertTrustCapability,
  getTrustLevelDefinition
} from '../core/trust/trust-security-levels.mjs';

const l0 = evaluateTrustSecurityLevel({});
assert.equal(l0.level, TRUST_SECURITY_LEVELS.L0_DEMO);
assert.equal(hasTrustCapability(l0, TRUST_CAPABILITIES.SYNTHETIC_DEMO), true);
assert.equal(hasTrustCapability(l0, TRUST_CAPABILITIES.REAL_DATA_ISOLATED), false);

const l1 = evaluateTrustSecurityLevel({
  organizationIdentified: true,
  termsAccepted: true,
  tenantBoundaryReady: true,
  auditReady: true,
  incidentContactDefined: true
});
assert.equal(l1.level, TRUST_SECURITY_LEVELS.L1_ISOLATED);
assert.equal(hasTrustCapability(l1, TRUST_CAPABILITIES.REAL_DATA_ISOLATED), true);
assert.equal(hasTrustCapability(l1, TRUST_CAPABILITIES.CROSS_ORG_SHARE), false);

const l2 = evaluateTrustSecurityLevel({
  ...l1.checks,
  identityVerified: true,
  strongAuthenticationReady: true,
  secretsManaged: true,
  dataMinimizationReady: true,
  retentionPolicyReady: true,
  securityTestsPassed: true
});
assert.equal(l2.level, TRUST_SECURITY_LEVELS.L2_VERIFIED);
assert.equal(hasTrustCapability(l2, TRUST_CAPABILITIES.APPROVED_OAUTH_INTEGRATION), true);
assert.equal(hasTrustCapability(l2, TRUST_CAPABILITIES.CROSS_ORG_SHARE), false);

const l3 = evaluateTrustSecurityLevel({
  ...l2.checks,
  dataPermitsReady: true,
  grantExpiryReady: true,
  grantRevocationReady: true,
  partnerIdentityVerified: true,
  purposeLimitationReady: true,
  crossOrgIsolationTestsPassed: true
});
assert.equal(l3.level, TRUST_SECURITY_LEVELS.L3_SHARED);
assert.equal(hasTrustCapability(l3, TRUST_CAPABILITIES.CROSS_ORG_SHARE), true);
assert.equal(hasTrustCapability(l3, TRUST_CAPABILITIES.PERSONAL_DATA_WORKFLOW), false);

const l4 = evaluateTrustSecurityLevel({
  ...l3.checks,
  legalRoleValidated: true,
  processorTermsReady: true,
  subprocessorsDocumented: true,
  personalDataWorkflowReviewed: true,
  enhancedSecurityReviewPassed: true,
  regulatedProviderGateReady: true
});
assert.equal(l4.level, TRUST_SECURITY_LEVELS.L4_ADVANCED);
assert.equal(hasTrustCapability(l4, TRUST_CAPABILITIES.PERSONAL_DATA_WORKFLOW), true);
assert.equal(hasTrustCapability(l4, TRUST_CAPABILITIES.REGULATED_PROVIDER_METADATA), true);
assert.equal(assertTrustCapability(l4, TRUST_CAPABILITIES.CROSS_ORG_SHARE), true);
assert.throws(() => assertTrustCapability(l2, TRUST_CAPABILITIES.CROSS_ORG_SHARE), /TRUST_CAPABILITY_REQUIRED:CROSS_ORG_SHARE/);

const definition = getTrustLevelDefinition(TRUST_SECURITY_LEVELS.L3_SHARED);
assert.ok(definition.requirements.includes('crossOrgIsolationTestsPassed'));
assert.ok(definition.capabilities.includes(TRUST_CAPABILITIES.CROSS_ORG_SHARE));

console.log('FIA Trust security levels contract OK');
