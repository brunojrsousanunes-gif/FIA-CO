begin;

-- Do not let an arbitrary active organization member claim an already
-- accepted legacy participant whose accepting account was never recorded.
-- Such rows require an explicit, trusted revalidation/backfill workflow.
create or replace function public.accept_operation_invitation(
  target_operation uuid,
  target_role text,
  request_key uuid
) returns public.operation_participants
language plpgsql security definer
set search_path = ''
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

  if participant.status = 'accepted' then
    if participant.accepted_by is null then
      raise exception 'LEGACY_ACCEPTANCE_REQUIRES_REVALIDATION' using errcode = '42501';
    elsif participant.accepted_by is distinct from caller then
      raise exception 'ROLE_ALREADY_BOUND' using errcode = '42501';
    end if;
    return participant;
  end if;

  if participant.status <> 'invited' then
    raise exception 'INVITATION_NOT_PENDING' using errcode = '22023';
  end if;

  update public.operation_participants
    set status='accepted', accepted_at=happened_at, accepted_by=caller
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

commit;
