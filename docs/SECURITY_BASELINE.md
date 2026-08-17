# FIA-CO — Cybersecurity baseline (initial / zero-cash stage)

## Security objective
Build the validation-stage product so that adding AI automation does not grant autonomous financial authority or expose secrets/customer data.

## Non-negotiable controls
- Least privilege for humans, workflows and agents.
- No credentials, API keys, payment data or secrets in source, prompts, browser storage or logs.
- AI agents cannot move funds, approve/refund payments, change identity, export sensitive data or delete records.
- High-impact actions require deterministic authorization plus explicit human approval.
- External/user content is untrusted and must be validated before agent use.
- Agent memory is disabled in the zero-cash demo; future memory must be isolated per tenant/user, minimized and expired.
- Structured audit events must record action type/result without storing unnecessary sensitive content.
- Rate/cost/retry/tool-chain limits are mandatory before connecting paid AI APIs.
- Production payment execution remains disabled until legal/PSP/security gates are complete.

## Repository / CI baseline
- GitHub Actions permissions must be explicit and minimal.
- Build jobs should be read-only; deployment write/OIDC permissions belong only to the deploy job.
- Third-party/GitHub Actions should be pinned to immutable full commit SHAs before production financial integrations.
- Prefer OIDC short-lived credentials over long-lived cloud secrets.
- Keep build and deploy separated so deployment retries do not recreate artifacts.
- Add dependency/security scanning before introducing a backend or package-heavy agent runtime.

## Agent trust model
1. Intake: sanitize/limit input and flag prompt injection/sensitive data.
2. Planner: may only propose allowlisted low-risk actions.
3. Policy gate: deterministic code authorizes/denies; model output never grants permission.
4. Human gate: required for incidents and any financial/identity/high-impact operation.
5. Executor: absent in demo. Future executors receive narrowly scoped credentials/tools.
6. Audit: record metadata, denial/escalation reason and version; redact sensitive content.

## Current demo allowlist
CLASSIFY, PREPARE_CHECKLIST, DRAFT_REPLY, FOLLOW_UP, ESCALATE.

## Current hard deny list
MOVE_FUNDS, APPROVE_PAYMENT, REFUND, CHANGE_IDENTITY, EXPORT_SENSITIVE_DATA, DELETE_RECORDS.

## Release gate for first connected AI agent
Before an external model/API or tool is connected: threat-model prompt injection and data exfiltration; add adversarial tests; define per-tool scopes; enforce rate/cost limits; document data retention/provider terms; require human approval for high-impact actions; verify logs redact secrets/PII.
