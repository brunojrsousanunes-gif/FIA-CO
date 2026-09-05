import {
  USER_CAPABILITIES,
  assertHierarchyCapability,
  evaluateHierarchySecurity
} from '../identity/hierarchy-security-access.mjs';

export function createHierarchyScopedOperationService(scopedService, organizationTrustProfile = {}) {
  if (!scopedService || !scopedService.context) throw new Error('SCOPED_SERVICE_REQUIRED');

  const input = Object.freeze({
    context: scopedService.context,
    organizationTrustProfile
  });

  function guard(capability) {
    return assertHierarchyCapability(input, capability);
  }

  return Object.freeze({
    context: scopedService.context,
    accessDecision: evaluateHierarchySecurity(input),

    getById(id) {
      guard(USER_CAPABILITIES.VIEW_OPERATIONS);
      return scopedService.getById(id);
    },

    list(filters = {}) {
      guard(USER_CAPABILITIES.VIEW_OPERATIONS);
      return scopedService.list(filters);
    },

    create(payload = {}) {
      guard(USER_CAPABILITIES.MANAGE_OPERATIONS);
      return scopedService.create(payload);
    },

    move(id, nextState, meta = {}) {
      guard(USER_CAPABILITIES.MANAGE_OPERATIONS);
      return scopedService.move(id, nextState, meta);
    },

    setCondition(id, name, value) {
      guard(USER_CAPABILITIES.MANAGE_OPERATIONS);
      return scopedService.setCondition(id, name, value);
    },

    dispute(id, reason = '') {
      guard(USER_CAPABILITIES.MANAGE_OPERATIONS);
      return scopedService.dispute(id, reason);
    },

    requestRelease(id) {
      guard(USER_CAPABILITIES.APPROVE_HIGH_RISK_ACTION);
      return scopedService.requestRelease(id);
    },

    hierarchySecurityEnforced: true,
    productionAuthorization: false
  });
}
