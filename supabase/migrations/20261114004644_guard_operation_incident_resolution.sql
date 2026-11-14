begin;

-- Prevent incident resolution from rewriting the incident's identity, origin,
-- ownership, scope, or blocking behavior. Only a one-way open -> resolved
-- transition is accepted, and the resolver must be the authenticated caller.
create or replace function private.guard_operation_incident_update()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if new.id is distinct from old.id
     or new.operation_id is distinct from old.operation_id
     or new.incident_type is distinct from old.incident_type
     or new.description is distinct from old.description
     or new.blocks_progress is distinct from old.blocks_progress
     or new.opened_by is distinct from old.opened_by
     or new.created_at is distinct from old.created_at then
    raise exception 'INCIDENT_IDENTITY_IMMUTABLE' using errcode = '42501';
  end if;

  if old.status <> 'open' or new.status <> 'resolved' then
    raise exception 'INCIDENT_TRANSITION_NOT_ALLOWED' using errcode = '42501';
  end if;

  if caller is null or new.resolved_by is distinct from caller then
    raise exception 'INCIDENT_RESOLVER_MUST_BE_CALLER' using errcode = '42501';
  end if;

  if new.resolution_note is null
     or char_length(trim(new.resolution_note)) < 3 then
    raise exception 'INCIDENT_RESOLUTION_DETAILS_REQUIRED' using errcode = '22023';
  end if;

  -- The database, not the client, records the authoritative resolution time.
  new.resolved_at := statement_timestamp();

  return new;
end;
$$;

drop trigger if exists guard_operation_incident_update
  on public.operation_incidents;

create trigger guard_operation_incident_update
before update on public.operation_incidents
for each row execute function private.guard_operation_incident_update();

revoke all on function private.guard_operation_incident_update() from public, anon, authenticated;

commit;
