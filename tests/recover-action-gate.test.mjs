import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  FOLLOW_UP_DECISIONS,
  evaluateExternalFollowUp,
  assertExternalFollowUpAllowed
} from '../core/recover/recover-action-gate.mjs';

const policy = JSON.parse(fs.readFileSync(new URL('../config/recover-policy.v1.json', import.meta.url), 'utf8'));
const safeContext = {
  killSwitch: false,
  organizationAuthorized: true,
  dataUseAuthorized: true,
  contactAllowed: true,
  withinAllowedHours: true,
  attemptNumber: 1,
  templateApproved: true,
  humanApproved: true,
  preapprovedSequence: false,
  sensitiveMessage: false
};

const disabled = evaluateExternalFollowUp(policy, safeContext);
assert.equal(disabled.decision, FOLLOW_UP_DECISIONS.DENY);
assert.equal(disabled.reason, 'EXTERNAL_ACTIONS_DISABLED');
assert.throws(() => assertExternalFollowUpAllowed(policy, safeContext), /DENY_EXTERNAL_ACTION/);

const enabledPolicy = structuredClone(policy);
enabledPolicy.externalActionsEnabled = true;

const firstWithoutHuman = evaluateExternalFollowUp(enabledPolicy, {
  ...safeContext,
  humanApproved: false
});
assert.equal(firstWithoutHuman.decision, FOLLOW_UP_DECISIONS.REQUIRE_HUMAN);
assert.equal(firstWithoutHuman.reason, 'FIRST_SEND_REQUIRES_HUMAN');

const firstWithHuman = evaluateExternalFollowUp(enabledPolicy, safeContext);
assert.equal(firstWithHuman.allowed, true);
assert.equal(firstWithHuman.reason, 'HUMAN_APPROVED');

const laterPreapproved = evaluateExternalFollowUp(enabledPolicy, {
  ...safeContext,
  attemptNumber: 2,
  humanApproved: false,
  preapprovedSequence: true
});
assert.equal(laterPreapproved.allowed, true);
assert.equal(laterPreapproved.reason, 'PREAPPROVED_SEQUENCE');

const killed = evaluateExternalFollowUp(enabledPolicy, {
  ...safeContext,
  killSwitch: true
});
assert.equal(killed.allowed, false);
assert.equal(killed.reason, 'KILL_SWITCH_ACTIVE');

const unauthorizedData = evaluateExternalFollowUp(enabledPolicy, {
  ...safeContext,
  dataUseAuthorized: false
});
assert.equal(unauthorizedData.reason, 'DATA_USE_NOT_AUTHORIZED');

const sensitive = evaluateExternalFollowUp(enabledPolicy, {
  ...safeContext,
  sensitiveMessage: true
});
assert.equal(sensitive.decision, FOLLOW_UP_DECISIONS.REQUIRE_HUMAN);

console.log('FIA Recover action gate contract OK');
