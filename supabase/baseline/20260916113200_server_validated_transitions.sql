begin;

alter table public.operation_audit_events
  add column request_id uuid not null default gen_random_uuid();
alter table public.operation_audit_events
  add constraint operation_audit_events_request_unique unique (operation_id, request_id);

create or replace function public.accept_operation_invitation(
  target_operation uuid,
  target_role text,
  request_key uuid
) returns public.operation_participants
language plpgsql security definer
set search_path = pg_catalog, public, private, extensions
as $$
declare
  caller uuid := (select auth.uid());
  participant public.operation_participants;
  previous text;
  happened_at timestamptz := clock_timestamp();
  calculated text;
begin
  if caller is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  if target_role not in ('seller','buyer','carrier') then raise exception 'INVALID_ROLE' using errcode = '22023'; end if;
  select op.* into participant
  from public.operation_participants op
  join public.organization_members om on om.organization_id = op.organization_id
  where op.operation_id = target_operation and op.participant_role = target_role
    and om.user_id = caller and om.status = 'active'
  for update of op;
  if not found then raise exception 'INVITATION_NOT_ACCESSIBLE' using errcode = '42501'; end if;
  if participant.status = 'accepted' then return participant; end if;
  if participant.status <> 'invited' then raise exception 'INVITATION_NOT_PENDING' using errcode = '22023'; end if;
  update public.operation_participants set status='accepted', accepted_at=happened_at
  where id=participant.id returning * into participant;
  select event_hash into previous from public.operation_audit_events
  where operation_id=target_operation order by id desc limit 1;
  calculated := encode(extensions.digest(concat_ws('|',target_operation::text,'participant.accepted',
    target_role,caller::text,happened_at::text,request_key::text,coalesce(previous,'')),'sha256'),'hex');
  insert into public.operation_audit_events
    (operation_id,event_type,actor_id,event_data,previous_hash,event_hash,created_at,request_id)
  values (target_operation,'participant.accepted',caller,jsonb_build_object('role',target_role),
    previous,calculated,happened_at,request_key)
  on conflict (operation_id,request_id) do nothing;
  return participant;
end;
$$;

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
    allowed := private.has_operation_role(target_operation,'buyer');
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

revoke all on function public.accept_operation_invitation(uuid,text,uuid) from public, anon;
revoke all on function public.transition_operation(uuid,text,integer,uuid) from public, anon;
grant execute on function public.accept_operation_invitation(uuid,text,uuid) to authenticated;
grant execute on function public.transition_operation(uuid,text,integer,uuid) to authenticated;

commit;
