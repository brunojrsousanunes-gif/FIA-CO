import assert from 'node:assert/strict';
import { evaluateHumanPresence } from '../core/trust/human-presence-check.mjs';

const pending = evaluateHumanPresence({ sessionDurationMs: 300, honeypotEmpty: true });
assert.equal(pending.verdict, 'PENDING');
assert.equal(pending.identityVerified, false);
assert.equal(pending.trustLevelElevated, false);
assert.equal(pending.productionSecurityBoundary, false);

const likely = evaluateHumanPresence({
  sessionDurationMs: 2500,
  mascotInteraction: true,
  pointerOrTouch: true,
  keyboardOrForm: true,
  visibleAndFocused: true,
  honeypotEmpty: true
});
assert.equal(likely.verdict, 'HUMAN_LIKELY');
assert.ok(likely.score >= 70);
assert.equal(likely.identityVerified, false);

const bot = evaluateHumanPresence({
  sessionDurationMs: 4000,
  mascotInteraction: true,
  pointerOrTouch: true,
  honeypotEmpty: false
});
assert.equal(bot.verdict, 'AUTOMATION_SUSPECTED');
assert.equal(bot.score, 0);

const burst = evaluateHumanPresence({
  sessionDurationMs: 4000,
  mascotInteraction: true,
  pointerOrTouch: true,
  suspiciousBurst: true
});
assert.equal(burst.verdict, 'AUTOMATION_SUSPECTED');

console.log('human-presence-check.test.mjs passed');
