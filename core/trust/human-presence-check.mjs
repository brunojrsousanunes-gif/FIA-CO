export const HUMAN_PRESENCE_VERDICTS = Object.freeze({
  PENDING: 'PENDING',
  HUMAN_LIKELY: 'HUMAN_LIKELY',
  INCONCLUSIVE: 'INCONCLUSIVE',
  AUTOMATION_SUSPECTED: 'AUTOMATION_SUSPECTED'
});

function boundaries() {
  return Object.freeze({
    identityVerified: false,
    trustLevelElevated: false,
    productionSecurityBoundary: false,
    ddosMitigation: false,
    intendedUse: 'BOT_AND_FIRST_CONTACT_ABUSE_SIGNAL'
  });
}

export function evaluateHumanPresence(input = {}) {
  const sessionDurationMs = Number(input.sessionDurationMs || 0);
  const mascotInteraction = input.mascotInteraction === true;
  const pointerOrTouch = input.pointerOrTouch === true;
  const keyboardOrForm = input.keyboardOrForm === true;
  const visibleAndFocused = input.visibleAndFocused === true;
  const honeypotEmpty = input.honeypotEmpty !== false;
  const suspiciousBurst = input.suspiciousBurst === true;

  if (!honeypotEmpty || suspiciousBurst) {
    return Object.freeze({
      schemaVersion: 'human-presence-check.v1',
      verdict: HUMAN_PRESENCE_VERDICTS.AUTOMATION_SUSPECTED,
      score: 0,
      reasons: Object.freeze(!honeypotEmpty ? ['HONEYPOT_TRIGGERED'] : ['SUSPICIOUS_BURST']),
      ...boundaries()
    });
  }

  let score = 0;
  const reasons = [];
  if (mascotInteraction) { score += 35; reasons.push('MASCOT_INTERACTION'); }
  if (pointerOrTouch) { score += 20; reasons.push('POINTER_OR_TOUCH_PRESENT'); }
  if (keyboardOrForm) { score += 15; reasons.push('KEYBOARD_OR_FORM_INTERACTION'); }
  if (visibleAndFocused) { score += 10; reasons.push('PAGE_VISIBLE_AND_FOCUSED'); }
  if (sessionDurationMs >= 1200) { score += 20; reasons.push('MINIMUM_SESSION_DURATION'); }

  const verdict = score >= 70
    ? HUMAN_PRESENCE_VERDICTS.HUMAN_LIKELY
    : score >= 35
      ? HUMAN_PRESENCE_VERDICTS.INCONCLUSIVE
      : HUMAN_PRESENCE_VERDICTS.PENDING;

  return Object.freeze({
    schemaVersion: 'human-presence-check.v1',
    verdict,
    score,
    reasons: Object.freeze(reasons),
    ...boundaries()
  });
}
