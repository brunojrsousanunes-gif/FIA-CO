# FIA Human Presence Check v1

## Purpose

Reduce obvious automated first-contact traffic without turning a lightweight web interaction into an identity claim.

The mascot can collect a few coarse, ephemeral session signals and issue one of four verdicts:

- `PENDING`
- `HUMAN_LIKELY`
- `INCONCLUSIVE`
- `AUTOMATION_SUSPECTED`

## What it is not

`HUMAN_LIKELY` does **not** mean identity verified, company verified, authorized representative verified, or Trust Level elevated.

The check is not a production security boundary by itself.

## Signals

The current beta may consider only coarse signals:

- interaction with the FIA mascot when the short challenge becomes ready;
- presence of pointer/touch interaction;
- presence of keyboard/form interaction;
- visible/focused page;
- minimum session duration;
- empty honeypot;
- obvious event bursts.

It does not retain raw pointer coordinates, mouse trajectories, keystroke timing, behavioral biometrics, device fingerprints or the user's text for this purpose.

## Experience

When the FIA guide opens, a small status strip shows `Presencia: Pendiente`.

After a short randomized delay, the mascot visually indicates that it is ready and asks the user to touch it once. The result can become `Humano probable`, remain inconclusive, or trigger a review warning.

The interaction is intentionally lightweight and should not feel like a CAPTCHA questionnaire.

## Production requirements later

A real abuse-prevention gate for contact submission still requires server-side controls such as a server-issued nonce, rate limiting and replay protection. A privacy-reviewed third-party challenge may be added only if needed.

Current status: `CLIENT_HEURISTIC_IMPLEMENTED / IDENTITY_NOT_VERIFIED / SERVER_GATE_PENDING`.
