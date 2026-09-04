export const TRUST_SECURITY_LEVELS = Object.freeze({
  L0_DEMO: 'L0_DEMO',
  L1_ISOLATED: 'L1_ISOLATED',
  L2_VERIFIED: 'L2_VERIFIED',
  L3_SHARED: 'L3_SHARED',
  L4_ADVANCED: 'L4_ADVANCED'
});

export const TRUST_CAPABILITIES = Object.freeze({
  SYNTHETIC_DEMO: 'SYNTHETIC_DEMO',
  REAL_DATA_ISOLATED: 'REAL_DATA_ISOLATED',
  INTERNAL_AUDIT: 'INTERNAL_AUDIT',
  APPROVED_OAUTH_INTEGRATION: 'APPROVED_OAUTH_INTEGRATION',
  INTERNAL_SAFE_AUTOMATION: 'INTERNAL_SAFE_AUTOMATION',
  EXTERNAL_ACTION_WITH_POLICY: 'EXTERNAL_ACTION_WITH_POLICY',
  CROSS_ORG_SHARE: 'CROSS_ORG_SHARE',
  PERSONAL_DATA_WORKFLOW: 'PERSONAL_DATA_WORKFLOW',
  REGULATED_PROVIDER_METADATA: 'REGULATED_PROVIDER_METADATA'
});

const LEVEL_ORDER = Object.freeze([
  TRUST_SECURITY_LEVELS.L0_DEMO,
  TRUST_SECURITY_LEVELS.L1_ISOLATED,
  TRUST_SECURITY_LEVELS.L2_VERIFIED,
  TRUST_SECURITY_LEVELS.L3_SHARED,
  TRUST_SECURITY_LEVELS.L4_ADVANCED
]);

const CAPABILITIES = Object.freeze({
  L0_DEMO: Object.freeze([
    TRUST_CAPABILITIES.SYNTHETIC_DEMO
  ]),
  L1_ISOLATED: Object.freeze([
    TRUST_CAPABILITIES.SYNTHETIC_DEMO,
    TRUST_CAPABILITIES.REAL_DATA_ISOLATED,
    TRUST_CAPABILITIES.INTERNAL_AUDIT
  ]),
  L2_VERIFIED: Object.freeze([
    TRUST_CAPABILITIES.SYNTHETIC_DEMO,
    TRUST_CAPABILITIES.REAL_DATA_ISOLATED,
    TRUST_CAPABILITIES.INTERNAL_AUDIT,
    TRUST_CAPABILITIES.APPROVED_OAUTH_INTEGRATION,
    TRUST_CAPABILITIES.INTERNAL_SAFE_AUTOMATION
  ]),
  L3_SHARED: Object.freeze([
    TRUST_CAPABILITIES.SYNTHETIC_DEMO,
    TRUST_CAPABILITIES.REAL_DATA_ISOLATED,
    TRUST_CAPABILITIES.INTERNAL_AUDIT,
    TRUST_CAPABILITIES.APPROVED_OAUTH_INTEGRATION,
    TRUST_CAPABILITIES.INTERNAL_SAFE_AUTOMATION,
    TRUST_CAPABILITIES.EXTERNAL_ACTION_WITH_POLICY,
    TRUST_CAPABILITIES.CROSS_ORG_SHARE
  ]),
  L4_ADVANCED: Object.freeze([
    TRUST_CAPABILITIES.SYNTHETIC_DEMO,
    TRUST_CAPABILITIES.REAL_DATA_ISOLATED,
    TRUST_CAPABILITIES.INTERNAL_AUDIT,
    TRUST_CAPABILITIES.APPROVED_OAUTH_INTEGRATION,
    TRUST_CAPABILITIES.INTERNAL_SAFE_AUTOMATION,
    TRUST_CAPABILITIES.EXTERNAL_ACTION_WITH_POLICY,
    TRUST_CAPABILITIES.CROSS_ORG_SHARE,
    TRUST_CAPABILITIES.PERSONAL_DATA_WORKFLOW,
    TRUST_CAPABILITIES.REGULATED_PROVIDER_METADATA
  ])
});

const REQUIREMENTS = Object.freeze({
  L1_ISOLATED: Object.freeze([
    'organizationIdentified',
    'termsAccepted',
    'tenantBoundaryReady',
    'auditReady',
    'incidentContactDefined'
  ]),
  L2_VERIFIED: Object.freeze([
    'identityVerified',
    'strongAuthenticationReady',
    'secretsManaged',
    'dataMinimizationReady',
    'retentionPolicyReady',
    'securityTestsPassed'
  ]),
  L3_SHARED: Object.freeze([
    'dataPermitsReady',
    'grantExpiryReady',
    'grantRevocationReady',
    'partnerIdentityVerified',
    'purposeLimitationReady',
    'crossOrgIsolationTestsPassed'
  ]),
  L4_ADVANCED: Object.freeze([
    'legalRoleValidated',
    'processorTermsReady',
    'subprocessorsDocumented',
    'personalDataWorkflowReviewed',
    'enhancedSecurityReviewPassed',
    'regulatedProviderGateReady'
  ])
});

function bool(value) {
  return value === true;
}

function satisfied(checks, requirementNames) {
  return requirementNames.every(name => bool(checks?.[name]));
}

export function evaluateTrustSecurityLevel(checks = {}) {
  let level = TRUST_SECURITY_LEVELS.L0_DEMO;
  const missingByLevel = {};

  for (const candidate of LEVEL_ORDER.slice(1)) {
    const requirements = REQUIREMENTS[candidate] || [];
    const missing = requirements.filter(name => !bool(checks[name]));
    missingByLevel[candidate] = missing;
    if (!missing.length) {
      const previousIndex = LEVEL_ORDER.indexOf(candidate) - 1;
      const previous = LEVEL_ORDER[previousIndex];
      if (previous === TRUST_SECURITY_LEVELS.L0_DEMO || satisfied(checks, REQUIREMENTS[previous] || [])) {
        level = candidate;
        continue;
      }
    }
    break;
  }

  return Object.freeze({
    policyVersion: 'trust-security-levels.v1',
    level,
    levelIndex: LEVEL_ORDER.indexOf(level),
    capabilities: Object.freeze([...(CAPABILITIES[level] || [])]),
    missingForNextLevel: Object.freeze([...(missingByLevel[LEVEL_ORDER[LEVEL_ORDER.indexOf(level) + 1]] || [])]),
    checks: Object.freeze({ ...checks })
  });
}

export function hasTrustCapability(profile, capability) {
  return Boolean(profile && Array.isArray(profile.capabilities) && profile.capabilities.includes(capability));
}

export function assertTrustCapability(profile, capability) {
  if (!hasTrustCapability(profile, capability)) {
    const error = new Error(`TRUST_CAPABILITY_REQUIRED:${capability}`);
    error.name = 'TrustCapabilityError';
    error.requiredCapability = capability;
    error.currentLevel = profile?.level || TRUST_SECURITY_LEVELS.L0_DEMO;
    throw error;
  }
  return true;
}

export function getTrustLevelDefinition(level) {
  if (!LEVEL_ORDER.includes(level)) throw new Error('UNKNOWN_TRUST_SECURITY_LEVEL');
  return Object.freeze({
    level,
    levelIndex: LEVEL_ORDER.indexOf(level),
    capabilities: Object.freeze([...(CAPABILITIES[level] || [])]),
    requirements: Object.freeze([...(REQUIREMENTS[level] || [])])
  });
}
