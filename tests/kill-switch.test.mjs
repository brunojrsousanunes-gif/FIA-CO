import assert from 'node:assert/strict';
import { createKillSwitchState, setKillSwitch, evaluateKillSwitch } from '../core/security/kill-switch.mjs';

const state = createKillSwitchState();
assert.equal(evaluateKillSwitch(state, { organizationId: 'org-a' }).decision, 'ALLOW');

setKillSwitch(state, { scope: 'ORGANIZATION', key: 'org-a', reason: 'synthetic drill', actorId: 'tester' }, { now: '2026-09-05T01:00:00Z' });
assert.equal(evaluateKillSwitch(state, { organizationId: 'org-a' }).decision, 'DENY');
assert.equal(evaluateKillSwitch(state, { organizationId: 'org-b' }).decision, 'ALLOW');

setKillSwitch(state, { scope: 'WORKFLOW', key: 'recover', reason: 'policy anomaly' }, { now: '2026-09-05T01:01:00Z' });
assert.equal(evaluateKillSwitch(state, { organizationId: 'org-b', workflowId: 'recover' }).blocked, true);

setKillSwitch(state, { scope: 'FIA', enabled: true, reason: 'global drill' }, { now: '2026-09-05T01:02:00Z' });
assert.equal(evaluateKillSwitch(state, { organizationId: 'any' }).decision, 'DENY');

setKillSwitch(state, { scope: 'FIA', enabled: false, reason: 'drill complete' }, { now: '2026-09-05T01:03:00Z' });
assert.equal(evaluateKillSwitch(state, { organizationId: 'org-b', workflowId: 'other' }).decision, 'ALLOW');
assert.equal(state.events.length, 4);

console.log('FIA multi-scope kill switch contract OK');
