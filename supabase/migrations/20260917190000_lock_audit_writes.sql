begin;

-- Audit events are generated only by SECURITY DEFINER RPCs that validate
-- authentication, membership, role, state transition and idempotency.
drop policy if exists audit_participant_insert
  on public.operation_audit_events;

revoke insert, update, delete
  on table public.operation_audit_events
  from authenticated;

-- Evidence and confirmations are append-only from the client perspective.
-- Existing INSERT policies still enforce user and operation access.
revoke update, delete
  on table public.operation_confirmations,
           public.operation_evidence
  from authenticated;

commit;
