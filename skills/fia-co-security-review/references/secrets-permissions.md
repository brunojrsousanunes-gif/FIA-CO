# Secrets and permissions review

Apply least privilege to people, agents, CI jobs, service accounts, tokens, database roles, and integrations.

## Inventory

For each identity or credential record:

- owner and intended workload;
- environment: local, preview, test, or production;
- resources and data it can access;
- allowed actions and whether write or administration is truly required;
- expiry, rotation, revocation, and audit owner;
- storage location and injection path, never the secret value itself.

## Secret detection

Inspect tracked files, `.env` examples, client bundles, configuration, CI definitions, deployment settings, documentation, logs, fixtures, screenshots, generated artifacts, and relevant Git history. Distinguish public identifiers from secrets, but never assume that a variable is safe merely because it has a public-looking name.

If a real secret is exposed:

1. Do not reproduce it in chat, issues, logs, or reports.
2. Treat removal from the latest commit as insufficient.
3. Recommend immediate revocation or rotation, then replacement through an approved secret store.
4. Check logs, artifacts, forks, deployment history, and downstream systems for exposure.
5. Record the incident and verification without retaining the credential.

## Least-privilege checks

- Separate development, preview, and production credentials.
- Prefer short-lived, workload-specific tokens with explicit resource scopes.
- Ensure frontend code never receives server-only secrets.
- Keep Supabase service-role credentials server-side; verify RLS and avoid using privileged keys to bypass missing policies.
- Limit Cloudflare tokens to the required account, zone or project and exact actions.
- Limit GitHub tokens and Actions permissions; default workflows to read-only and elevate only the job that requires it.
- Restrict database roles by schema, table, operation, tenant, and environment. Avoid shared administrator credentials.
- Remove unused integrations and permissions. Ensure every credential has a tested revocation path.

## Permission matrix

Report permissions as a table with identity, environment, resource, current access, required access, gap, and remediation. Mark unknown ownership, indefinite lifetime, wildcard resources, broad administration, or absent audit logs as unresolved or blocking according to impact.

## Source

- OWASP Secrets Management Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
