begin;

-- Bind each company role to the exact account that accepted it. This keeps a
-- second member of the same company from confirming another person's action.
alter table public.operation_participants
  add column if not exists accepted_by uuid references auth.users(id) on delete restrict;
create index if not exists operation_participants_accepted_by_idx
  on public.operation_participants (accepted_by) where accepted_by is not null;

create or replace function private.has_operation_role(target_operation uuid, target_role text)
returns boolean language sql stable security definer
set search_path = pg_catalog, public as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.operation_participants op
    join public.organization_members om on om.organization_id = op.organization_id
      and om.user_id = (select auth.uid()) and om.status = 'active'
    where op.operation_id = target_operation
      and op.participant_role = target_role
      and op.status = 'accepted'
      and op.accepted_by = (select auth.uid())
  );
$$;
revoke all on function private.has_operation_role(uuid,text) from public,anon;
grant execute on function private.has_operation_role(uuid,text) to authenticated;

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
  if participant.status = 'accepted' then
    if participant.accepted_by is null then
      update public.operation_participants set accepted_by=caller
        where id=participant.id and accepted_by is null returning * into participant;
    elsif participant.accepted_by is distinct from caller then
      raise exception 'ROLE_ALREADY_BOUND' using errcode='42501';
    end if;
    return participant;
  end if;
  if participant.status <> 'invited' then raise exception 'INVITATION_NOT_PENDING' using errcode = '22023'; end if;
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
revoke all on function public.accept_operation_invitation(uuid,text,uuid) from public,anon;
grant execute on function public.accept_operation_invitation(uuid,text,uuid) to authenticated;

-- Operation and participant creation is an administrative/server workflow.
-- Authenticated browser accounts only receive the narrowly scoped RPCs below.
revoke insert,update,delete on public.operations from authenticated;
revoke insert,update,delete on public.operation_participants from authenticated;
drop policy if exists operations_creator_insert on public.operations;
drop policy if exists operations_creator_draft_update on public.operations;
drop policy if exists participants_creator_insert on public.operation_participants;
drop policy if exists participants_creator_update on public.operation_participants;

drop policy if exists confirmations_role_insert on public.operation_confirmations;
create policy confirmations_bound_account_insert
  on public.operation_confirmations for insert to authenticated
  with check (
    confirmed_by = (select auth.uid())
    and exists (
      select 1
      from public.operation_participants op
      join public.organization_members om on om.organization_id=op.organization_id
      where op.operation_id=operation_confirmations.operation_id
        and op.participant_role=operation_confirmations.participant_role
        and op.status='accepted'
        and op.accepted_by=(select auth.uid())
        and om.user_id=(select auth.uid())
        and om.status='active'
    )
  );

commit;
