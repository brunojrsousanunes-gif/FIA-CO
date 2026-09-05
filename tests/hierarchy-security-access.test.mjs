import assert from 'node:assert/strict';
import {
  HIERARCHY_SECURITY_CEILING,
  USER_CAPABILITIES,
  evaluateHierarchySecurity,
  assertHierarchyCapability,
  buildNeedToKnowManifest
} from '../core/identity/hierarchy-security-access.mjs';

function ctx(role){return {actorId:`actor-${role.toLowerCase()}`,organizationId:'org-1',role};}
function trust(level){return {level};}

assert.equal(HIERARCHY_SECURITY_CEILING.OWNER,'L4_ADVANCED');
assert.equal(HIERARCHY_SECURITY_CEILING.ADMIN,'L3_SHARED');
assert.equal(HIERARCHY_SECURITY_CEILING.OPERATOR,'L2_VERIFIED');
assert.equal(HIERARCHY_SECURITY_CEILING.VIEWER,'L1_ISOLATED');

const ownerAtL2=evaluateHierarchySecurity({context:ctx('OWNER'),organizationTrustProfile:trust('L2_VERIFIED')});
assert.equal(ownerAtL2.effectiveSecurityLevel,'L2_VERIFIED');
assert.equal(ownerAtL2.hierarchyNeverElevatesOrganizationSecurity,true);
assert.equal(ownerAtL2.capabilities.includes(USER_CAPABILITIES.CROSS_ORG_COORDINATION),false);

const operatorAtL4=evaluateHierarchySecurity({context:ctx('OPERATOR'),organizationTrustProfile:trust('L4_ADVANCED')});
assert.equal(operatorAtL4.effectiveSecurityLevel,'L2_VERIFIED');
assert.equal(operatorAtL4.capabilities.includes(USER_CAPABILITIES.MANAGE_OPERATIONS),true);
assert.equal(operatorAtL4.capabilities.includes(USER_CAPABILITIES.CROSS_ORG_COORDINATION),false);
assert.equal(operatorAtL4.capabilities.includes(USER_CAPABILITIES.APPROVE_HIGH_RISK_ACTION),false);

const adminAtL4=evaluateHierarchySecurity({context:ctx('ADMIN'),organizationTrustProfile:trust('L4_ADVANCED')});
assert.equal(adminAtL4.effectiveSecurityLevel,'L3_SHARED');
assert.equal(adminAtL4.capabilities.includes(USER_CAPABILITIES.CROSS_ORG_COORDINATION),true);
assert.equal(adminAtL4.capabilities.includes(USER_CAPABILITIES.MANAGE_TEAM),false);

const viewerAtL4=evaluateHierarchySecurity({context:ctx('VIEWER'),organizationTrustProfile:trust('L4_ADVANCED')});
assert.equal(viewerAtL4.effectiveSecurityLevel,'L1_ISOLATED');
assert.equal(viewerAtL4.capabilities.includes(USER_CAPABILITIES.VIEW_OPERATIONS),true);
assert.equal(viewerAtL4.capabilities.includes(USER_CAPABILITIES.MANAGE_OPERATIONS),false);

assert.throws(
  ()=>assertHierarchyCapability({context:ctx('VIEWER'),organizationTrustProfile:trust('L4_ADVANCED')},USER_CAPABILITIES.MANAGE_OPERATIONS),
  /HIERARCHY_CAPABILITY_DENIED/
);

const manifest=buildNeedToKnowManifest({context:ctx('OPERATOR'),organizationTrustProfile:trust('L4_ADVANCED')});
assert.deepEqual(manifest.visibleAreas,['HOME','OPPORTUNITIES','OPERATIONS','DOCUMENTS','SECURITY','PURCHASES']);
assert.equal(manifest.generatedServerSideRequiredForProduction,true);
assert.equal(manifest.hiddenClientControlsAreNotAuthorization,true);

console.log('hierarchy-security-access.test.mjs passed');
