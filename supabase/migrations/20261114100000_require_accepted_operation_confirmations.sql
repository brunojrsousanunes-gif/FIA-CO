begin;

-- A pending invitation is not an accepted operational role.
create or replace function private.has_operation_role(target_operation uuid, target_role text) returns boolean language sql stable security definer
set search_path = pg_catalog, public as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.operation_participants op
    join public.organization_members om on om.organization_id = op.organization_id
      and om.user_id = (select auth.uid()) and om.status = 'active'
    where op.operation_id = target_operation and op.participant_role = target_role and op.status = 'accepted'
  );
$$;

-- Closing requires an explicit receipt/completion confirmation from the buyer.
create or replace function public.transition_operation(
  target_operation uuid,
  target_status text,
  expected_version integer,
  request_key uuid
) returns public.operations
language plpgsql security definer
set search_path = pg_catalog, public, private, extensions
as $$
declare
  caller uuid := (select auth.uid());
  current_row public.operations;
  previous text;
  happened_at timestamptz := clock_timestamp();
  calculated text;
  accepted_count integer;
  allowed boolean := false;
begin
  if caller is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  if target_status not in ('invited','accepted','in_transit','delivered','completed','disputed','cancelled')
    then raise exception 'INVALID_TARGET_STATUS' using errcode='22023'; end if;
  select * into current_row from public.operations where id=target_operation for update;
  if not found then raise exception 'OPERATION_NOT_FOUND' using errcode='P0002'; end if;
  if current_row.version<>expected_version then raise exception 'VERSION_CONFLICT' using errcode='40001'; end if;
  if not private.can_access_operation(target_operation) then raise exception 'OPERATION_NOT_ACCESSIBLE' using errcode='42501'; end if;

  if current_row.status='draft' and target_status='invited' and current_row.created_by=caller then
    select count(*) into accepted_count from public.operation_participants where operation_id=target_operation;
    allowed := accepted_count=3
      and exists(select 1 from public.operation_participants where operation_id=target_operation and participant_role='seller')
      and exists(select 1 from public.operation_participants where operation_id=target_operation and participant_role='buyer')
      and exists(select 1 from public.operation_participants where operation_id=target_operation and participant_role='carrier');
  elsif current_row.status='invited' and target_status='accepted' then
    select count(*) into accepted_count from public.operation_participants where operation_id=target_operation and status='accepted';
    allowed := accepted_count=3;
  elsif current_row.status='accepted' and target_status='in_transit' then
    allowed := private.has_operation_role(target_operation,'carrier');
  elsif current_row.status='in_transit' and target_status='delivered' then
    allowed := private.has_operation_role(target_operation,'carrier');
  elsif current_row.status='delivered' and target_status='completed' then
    allowed := private.has_operation_role(target_operation,'buyer')
      and exists (
        select 1 from public.operation_confirmations c
        where c.operation_id=target_operation
          and c.participant_role='buyer'
          and c.confirmation_type in ('receipt','completion')
          and c.confirmed_by=caller
      );
  elsif target_status='disputed' and current_row.status in ('invited','accepted','in_transit','delivered') then
    allowed := private.can_access_operation(target_operation);
  elsif target_status='cancelled' and current_row.status in ('draft','invited') then
    allowed := current_row.created_by=caller;
  end if;
  if not allowed then raise exception 'TRANSITION_NOT_ALLOWED' using errcode='42501'; end if;

  update public.operations set status=target_status,version=version+1,updated_at=happened_at
  where id=target_operation returning * into current_row;
  select event_hash into previous from public.operation_audit_events
  where operation_id=target_operation order by id desc limit 1;
  calculated := encode(extensions.digest(concat_ws('|',target_operation::text,'operation.transition',
    target_status,current_row.version::text,caller::text,happened_at::text,request_key::text,coalesce(previous,'')),'sha256'),'hex');
  insert into public.operation_audit_events
    (operation_id,event_type,actor_id,event_data,previous_hash,event_hash,created_at,request_id)
  values (target_operation,'operation.transition',caller,
    jsonb_build_object('to',target_status,'version',current_row.version),
    previous,calculated,happened_at,request_key)
  on conflict (operation_id,request_id) do nothing;
  return current_row;
end;
$$;

commit;
