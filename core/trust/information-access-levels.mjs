export const INFORMATION_LEVELS = Object.freeze({
  L0_DEMO: Object.freeze({ informationLevel: 'I0_PUBLIC', allowedDataClasses: Object.freeze(['PUBLIC']), allowedSources: Object.freeze(['PUBLIC_WEB_OR_CATALOG', 'SYNTHETIC']) }),
  L1_ISOLATED: Object.freeze({ informationLevel: 'I1_ISOLATED_BUSINESS', allowedDataClasses: Object.freeze(['PUBLIC', 'INTERNAL', 'COMMERCIAL_CONFIDENTIAL']), allowedSources: Object.freeze(['PUBLIC_WEB_OR_CATALOG', 'AUTHORIZED_ISOLATED_ORG_DATA']) }),
  L2_VERIFIED: Object.freeze({ informationLevel: 'I2_CONNECTED_INTERNAL', allowedDataClasses: Object.freeze(['PUBLIC', 'INTERNAL', 'COMMERCIAL_CONFIDENTIAL']), allowedSources: Object.freeze(['PUBLIC_WEB_OR_CATALOG', 'AUTHORIZED_ISOLATED_ORG_DATA', 'APPROVED_INTERNAL_INTEGRATION']) }),
  L3_SHARED: Object.freeze({ informationLevel: 'I3_SHARED_BUSINESS', allowedDataClasses: Object.freeze(['PUBLIC', 'INTERNAL', 'COMMERCIAL_CONFIDENTIAL']), allowedSources: Object.freeze(['PUBLIC_WEB_OR_CATALOG', 'AUTHORIZED_ISOLATED_ORG_DATA', 'APPROVED_INTERNAL_INTEGRATION', 'EXPLICIT_CROSS_ORG_GRANT']) }),
  L4_ADVANCED: Object.freeze({ informationLevel: 'I4_REVIEWED_PERSONAL', allowedDataClasses: Object.freeze(['PUBLIC', 'INTERNAL', 'COMMERCIAL_CONFIDENTIAL', 'PERSONAL']), allowedSources: Object.freeze(['PUBLIC_WEB_OR_CATALOG', 'AUTHORIZED_ISOLATED_ORG_DATA', 'APPROVED_INTERNAL_INTEGRATION', 'EXPLICIT_CROSS_ORG_GRANT', 'REVIEWED_PERSONAL_DATA_WORKFLOW']) })
});

const NEVER_ALLOWED = new Set(['CRITICAL', 'CREDENTIALS', 'SECRETS', 'PAYMENT_CREDENTIALS']);

export function getInformationAccessProfile(securityLevel = 'L0_DEMO') {
  const profile = INFORMATION_LEVELS[securityLevel];
  if (!profile) throw new Error('UNKNOWN_SECURITY_LEVEL_FOR_INFORMATION_SCOPE');
  return Object.freeze({
    securityLevel,
    informationLevel: profile.informationLevel,
    allowedDataClasses: profile.allowedDataClasses,
    allowedSources: profile.allowedSources,
    permanentExcludedDataClasses: Object.freeze([...NEVER_ALLOWED])
  });
}

export function canUseInformationAtSecurityLevel({ securityLevel = 'L0_DEMO', dataClass, sourceType, personalWorkflowReviewed = false } = {}) {
  const profile = getInformationAccessProfile(securityLevel);
  const dc = String(dataClass || '').toUpperCase();
  const source = String(sourceType || '').toUpperCase();
  if (NEVER_ALLOWED.has(dc)) return Object.freeze({ allowed: false, reason: 'PERMANENTLY_EXCLUDED_DATA_CLASS', profile });
  if (!profile.allowedDataClasses.includes(dc)) return Object.freeze({ allowed: false, reason: 'DATA_CLASS_ABOVE_INFORMATION_LEVEL', profile });
  if (source && !profile.allowedSources.includes(source)) return Object.freeze({ allowed: false, reason: 'SOURCE_NOT_ALLOWED_AT_INFORMATION_LEVEL', profile });
  if (dc === 'PERSONAL' && securityLevel === 'L4_ADVANCED' && personalWorkflowReviewed !== true) {
    return Object.freeze({ allowed: false, reason: 'PERSONAL_WORKFLOW_REVIEW_REQUIRED', profile });
  }
  return Object.freeze({ allowed: true, reason: 'ALLOWED_BY_INFORMATION_SCOPE', profile });
}
