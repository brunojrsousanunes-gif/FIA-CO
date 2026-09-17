# Code security review

Use this procedure for source code, configuration, infrastructure, dependencies, CI/CD, and deployment changes.

## Baseline

Use the current released OWASP Top 10 as an awareness baseline, currently OWASP Top 10 2025. Do not limit the review to the list when FIA&CO business logic, tenant separation, authorization, transaction integrity, or privacy create additional risk.

Review at minimum:

- broken access control and cross-company or cross-user data access;
- security misconfiguration, unsafe defaults, CORS, CSP, headers, debug output, and public storage;
- software supply-chain failures, unpinned actions or dependencies, install scripts, and integrity gaps;
- cryptographic failures and sensitive data in transit, storage, logs, analytics, or browser state;
- injection, including SQL, NoSQL, shell, template, prompt, and header injection;
- insecure design and missing abuse-case controls;
- authentication failures, session handling, password reset, MFA, and account enumeration;
- software or data integrity failures, webhook verification, and unsafe deserialization;
- missing security logging, alerting, rate limits, and incident evidence;
- mishandling of exceptional conditions, fail-open behavior, partial transactions, and error leakage.

Also inspect XSS sinks such as `innerHTML`, `document.write`, unsafe template rendering, untrusted URLs, and dynamically constructed scripts. XSS may be represented within injection or other categories even when it is not a separate Top 10 heading.

## Procedure

1. Pin the review to a commit, branch, diff, or release candidate.
2. Identify entry points, trust boundaries, privileged operations, tenant identifiers, and regulated or personal data.
3. Trace authentication and authorization from the client through server-side enforcement and database policy.
4. Search for secrets and high-risk patterns, but confirm context manually to reduce false positives.
5. Inspect dependencies, lockfiles, CI workflows, deployment configuration, and externally loaded resources.
6. Review validation, encoding, parameterized queries, error handling, logs, rate limits, replay protection, and idempotency.
7. For Supabase, verify RLS is enabled where required and test policies for anonymous, authenticated, owner, company, and privileged roles. Never accept client-side checks as authorization.
8. For Cloudflare, verify build output contains an entry page, environment variables are scoped correctly, preview and production are separated, and tokens have the narrowest required permissions.
9. Run only understood, repository-native checks in an isolated non-production context. Record exact commands and results.
10. Report residual risk and the release gate result.

## Release blockers

Block production for exposed live credentials, authorization bypass, tenant isolation failure, injectable queries or commands, stored or reflected XSS with meaningful impact, unsigned or unverified privileged webhooks, known exploitable critical dependencies, or a build that depends on unreviewed executable downloads.

## Sources

- OWASP Top 10 project: https://owasp.org/projects/top-ten
- OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
