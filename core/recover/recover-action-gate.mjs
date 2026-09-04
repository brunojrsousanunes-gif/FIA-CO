export const FOLLOW_UP_DECISIONS = Object.freeze({
  DENY: 'DENY_EXTERNAL_ACTION',
  REQUIRE_HUMAN: 'REQUIRE_HUMAN_APPROVAL',
  ALLOW: 'ALLOW_EXTERNAL_ACTION'
});

function deny(reason) {
  return Object.freeze({
    decision: FOLLOW_UP_DECISIONS.DENY,
    allowed: false,
    reason
  });
}

function requireHuman(reason) {
  return Object.freeze({
    decision: FOLLOW_UP_DECISIONS.REQUIRE_HUMAN,
    allowed: false,
    reason
  });
}

export function evaluateExternalFollowUp(policy, context = {}) {
  if (!policy || typeof policy !== 'object') return deny('MISSING_POLICY');
  if (policy.externalActionsEnabled !== true) return deny('EXTERNAL_ACTIONS_DISABLED');
  if (context.killSwitch === true) return deny('KILL_SWITCH_ACTIVE');
  if (context.organizationAuthorized !== true) return deny('ORGANIZATION_NOT_AUTHORIZED');
  if (context.dataUseAuthorized !== true) return deny('DATA_USE_NOT_AUTHORIZED');
  if (context.contactAllowed !== true) return deny('CONTACT_NOT_ALLOWED');
  if (context.withinAllowedHours !== true) return deny('OUTSIDE_ALLOWED_HOURS');

  const attemptNumber = Number(context.attemptNumber);
  if (!Number.isInteger(attemptNumber) || attemptNumber < 1) return deny('INVALID_ATTEMPT_NUMBER');

  if (context.sensitiveMessage === true) return requireHuman('SENSITIVE_MESSAGE');
  if (context.templateApproved !== true) return requireHuman('TEMPLATE_NOT_APPROVED');

  const firstSendNeedsApproval = policy.quoteRecovery?.humanApprovalRequiredForFirstExternalSend !== false;
  if (attemptNumber === 1 && firstSendNeedsApproval && context.humanApproved !== true) {
    return requireHuman('FIRST_SEND_REQUIRES_HUMAN');
  }

  if (context.humanApproved !== true && context.preapprovedSequence !== true) {
    return requireHuman('NO_PREAPPROVAL');
  }

  return Object.freeze({
    decision: FOLLOW_UP_DECISIONS.ALLOW,
    allowed: true,
    reason: context.humanApproved === true ? 'HUMAN_APPROVED' : 'PREAPPROVED_SEQUENCE'
  });
}

export function assertExternalFollowUpAllowed(policy, context = {}) {
  const decision = evaluateExternalFollowUp(policy, context);
  if (!decision.allowed) {
    const error = new Error(decision.decision);
    error.reason = decision.reason;
    throw error;
  }
  return decision;
}
