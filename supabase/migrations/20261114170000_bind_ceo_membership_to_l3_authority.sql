begin;

-- The CEO is an explicit organization role, not an alias for admin.
-- organization_members has no authenticated INSERT/UPDATE policy, so this
-- role can only be assigned by a trusted backend/administrative workflow.
alter table public.organization_members
  drop constraint organization_members_member_role_check;
alter table public.organization_members
  add constraint organization_members_member_role_check
  check (member_role in ('member','manager','admin','ceo'));

-- CEO receives inventory-management rights only inside their own organization.
create or replace function private.is_inventory_manager(target_org uuid)
returns boolean language sql stable security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.organization_members om
    where om.organization_id = target_org
      and om.user_id = (select auth.uid())
      and om.status = 'active'
      and om.member_role in ('manager','admin','ceo')
  );
$$;
revoke all on function private.is_inventory_manager(uuid) from public, anon;
grant execute on function private.is_inventory_manager(uuid) to authenticated;

-- A "CEO" verification is not enough on its own: the same user must still
-- hold the active CEO membership in the same organization at authorization
-- time. Zone-manager authority remains a separate verified route.
create or replace function private.enforce_l3_ceo_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.authority_type = 'ceo' and not exists (
    select 1
    from public.organization_members om
    where om.organization_id = new.organization_id
      and om.user_id = new.actor_id
      and om.member_role = 'ceo'
      and om.status = 'active'
  ) then
    raise exception 'CEO_ROLE_MEMBERSHIP_REQUIRED' using errcode = '42501';
  end if;
  return new;
end;
$$;
revoke all on function private.enforce_l3_ceo_membership() from public, anon, authenticated;

create trigger organization_l3_event_requires_current_ceo_role
before insert on private.organization_l3_authorization_events
for each row execute function private.enforce_l3_ceo_membership();

commit;
