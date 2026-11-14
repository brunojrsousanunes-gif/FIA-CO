# FIA&CO — Historical database baseline

The two SQL files in this directory are the original bootstrap schema and transition functions:

1. `20260916112600_initial_multi_tenant_operations.sql`
2. `20260916113200_server_validated_transitions.sql`

They are intentionally kept **outside** `supabase/migrations/`.

## Why

The connected Supabase project contains the core tables created by this baseline, but its migration history does not contain versions `20260916112600` or `20260916113200`. Leaving these non-idempotent `CREATE TABLE` scripts in the executable migration directory would make a future `supabase db push` treat them as pending and could make it fail against an existing database.

## Safe use

- Existing Supabase project: **do not reapply these baseline scripts**.
- New, empty test database: apply these two files once, in timestamp order, then apply the tracked files in `supabase/migrations/`.
- GitHub Actions follows that clean-database sequence so the complete schema and tracked migration chain remain testable.

The live project was checked read-only for the presence of the core tables. This is not a full schema equivalence proof between the historical SQL and every current production object. Before using this baseline to provision a new production environment, compare the resulting schema and policies with the current source of truth.
