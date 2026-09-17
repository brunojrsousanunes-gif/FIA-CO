# FIA&CO operating rules

## Current product frame

FIA&CO is intended to coordinate and evidence transactions among three separated business roles:

- seller;
- buyer;
- carrier or logistics provider.

The private Operations Centre should enforce role separation, state transitions, confirmations, evidence metadata, and an append-only audit trail. Public marketing pages and private operational interfaces are separate surfaces.

Treat the GitHub repository `brunojrsousanunes-gif/FIA-CO` as the versioned code source. Confirm the active branch, deployment target, and current checks before changing or describing behavior.

## Security and data rules

- Use synthetic organizations, users, operations, documents, amounts, and identifiers for demonstrations.
- Store only the minimum data needed for a test. Do not copy credentials into source files, issues, pull requests, chat, or screenshots.
- Public frontend code may contain only deliberately public client configuration. Administrative or service-role secrets must remain server-side.
- Require row-level authorization for exposed multi-tenant database tables. Test both permitted access and denied cross-organization access.
- Keep sessions short-lived and avoid persistent browser storage for sensitive operational state.
- Keep audit events append-only and server-generated for security-relevant transitions.
- Treat payment, identity verification, biometrics, escrow, custody, and regulated financial claims as unavailable until implemented through qualified providers and legally reviewed.

## Change workflow

1. Inspect current repository and deployed state; preserve unrelated user changes.
2. Define the affected environment and reversible scope.
3. Work on a focused branch when the change is material.
4. Add or update tests for permissions, state transitions, errors, and mobile behavior.
5. Run relevant automated checks and inspect deployment/build output.
6. Do not merge to the production branch or change production data without current explicit authorization.
7. Record what changed, what was verified, and what remains simulated.

## Three-role pilot

Use three distinct test identities even if one person operates two of them. A useful pilot covers:

- successful sign-in for each identity;
- correct organization and role visibility;
- one synthetic operation moving through permitted states;
- denial of unauthorized reads and transitions;
- separate confirmations by the required roles;
- error, retry, conflict, and recovery behavior;
- audit events and timestamps;
- sign-out and session cleanup;
- usability on separate mobile devices or isolated browser sessions.

Do not call a test with friends "commercial traction." Describe it as technical and usability validation. Commercial traction requires external business interest, pilots, repeated use, or revenue.

## Evidence hierarchy

Prefer, in order:

1. current production behavior and database state;
2. passing automated tests and deployment logs;
3. current repository code and reviewed pull requests;
4. signed or attributable business evidence;
5. documented plans and assumptions.

If sources conflict, surface the conflict rather than selecting the more favorable claim.
