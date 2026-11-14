begin;

-- Bind each accepted operational role to the exact authenticated account
-- that accepted its invitation. The column is introduced by the preceding
-- acceptance-identity migration and is already part of the current schema.
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
  if caller is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if target_role not in ('seller','buyer','carrier') then
    raise exception 'INVALID_ROLE' using errcode = '22023';
  end if;
  if request_key is null then
    raise exception 'IDEMPOTENCY_KEY_REQUIRED' using errcode = '22023';
  end if;

  select op.* into participant
  from public.operation_participants op
  join public.organization_members om
    on om.organization_id = op.organization_id
  where op.operation_id = target_operation
    and op.participant_role = target_role
    and om.user_id = caller
    and om.status = 'active'
  for update of op;

  if not found then
    raise exception 'INVITATION_NOT_ACCESSIBLE' using errcode = '42501';
  end if;

  if participant.status = 'accepted' then
    if participant.accepted_by = caller then
      return participant;
    end if;
    raise exception 'INVITATION_ALREADY_ACCEPTED_BY_ANOTHER_ACCOUNT'
      using errcode = '42501';
  end if;

  if participant.status <> 'invited' then
    raise exception 'INVITATION_NOT_PENDING' using errcode = '22023';
  end if;

  update public.operation_participants
  set status = 'accepted',
      accepted_by = caller,
      accepted_at = happened_at
  where id = participant.id
  returning * into participant;

  select event_hash into previous
  from public.operation_audit_events
  where operation_id = target_operation
  order by id desc
  limit 1;

  calculated := encode(
    extensions.digest(
      concat_ws(
        '|',
        target_operation::text,
        'participant.accepted',
        target_role,
        caller::text,
        happened_at::text,
        request_key::text,
        coalesce(previous,'')
      ),
      'sha256'
    ),
    'hex'
  );

  insert into public.operation_audit_events
    (operation_id,event_type,actor_id,event_data,previous_hash,event_hash,created_at,request_id)
  values
    (target_operation,'participant.accepted',caller,
     jsonb_build_object('role',target_role),previous,calculated,happened_at,request_key)
  on conflict (operation_id,request_id) do nothing;

  return participant;
end;
$$;

alter function public.accept_operation_invitation(uuid,text,uuid) set search_path = '';

commit;
