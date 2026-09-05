import assert from 'node:assert/strict';
import { getInformationAccessProfile, canUseInformationAtSecurityLevel } from '../core/trust/information-access-levels.mjs';

assert.equal(getInformationAccessProfile('L0_DEMO').informationLevel, 'I0_PUBLIC');
assert.deepEqual(getInformationAccessProfile('L0_DEMO').allowedDataClasses, ['PUBLIC']);
assert.ok(getInformationAccessProfile('L1_ISOLATED').allowedDataClasses.includes('COMMERCIAL_CONFIDENTIAL'));
assert.ok(getInformationAccessProfile('L2_VERIFIED').allowedSources.includes('APPROVED_INTERNAL_INTEGRATION'));
assert.ok(getInformationAccessProfile('L3_SHARED').allowedSources.includes('EXPLICIT_CROSS_ORG_GRANT'));
assert.ok(getInformationAccessProfile('L4_ADVANCED').allowedDataClasses.includes('PERSONAL'));

assert.equal(canUseInformationAtSecurityLevel({ securityLevel: 'L0_DEMO', dataClass: 'INTERNAL', sourceType: 'AUTHORIZED_ISOLATED_ORG_DATA' }).allowed, false);
assert.equal(canUseInformationAtSecurityLevel({ securityLevel: 'L1_ISOLATED', dataClass: 'COMMERCIAL_CONFIDENTIAL', sourceType: 'AUTHORIZED_ISOLATED_ORG_DATA' }).allowed, true);
assert.equal(canUseInformationAtSecurityLevel({ securityLevel: 'L2_VERIFIED', dataClass: 'COMMERCIAL_CONFIDENTIAL', sourceType: 'EXPLICIT_CROSS_ORG_GRANT' }).allowed, false);
assert.equal(canUseInformationAtSecurityLevel({ securityLevel: 'L3_SHARED', dataClass: 'COMMERCIAL_CONFIDENTIAL', sourceType: 'EXPLICIT_CROSS_ORG_GRANT' }).allowed, true);
assert.equal(canUseInformationAtSecurityLevel({ securityLevel: 'L3_SHARED', dataClass: 'PERSONAL', sourceType: 'EXPLICIT_CROSS_ORG_GRANT' }).allowed, false);
assert.equal(canUseInformationAtSecurityLevel({ securityLevel: 'L4_ADVANCED', dataClass: 'PERSONAL', sourceType: 'REVIEWED_PERSONAL_DATA_WORKFLOW' }).allowed, false);
assert.equal(canUseInformationAtSecurityLevel({ securityLevel: 'L4_ADVANCED', dataClass: 'PERSONAL', sourceType: 'REVIEWED_PERSONAL_DATA_WORKFLOW', personalWorkflowReviewed: true }).allowed, true);
assert.equal(canUseInformationAtSecurityLevel({ securityLevel: 'L4_ADVANCED', dataClass: 'CRITICAL', sourceType: 'REVIEWED_PERSONAL_DATA_WORKFLOW', personalWorkflowReviewed: true }).allowed, false);

console.log('information-access-levels.test.mjs passed');
