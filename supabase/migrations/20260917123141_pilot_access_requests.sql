begin;

create table public.pilot_access_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  requested_member_role text not null default 'member' check (requested_member_role='member'),
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  reviewed_by uuid references auth.users(id) on delete restrict,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (status='pending' and reviewed_by is null and reviewed_at is null)
    or (status in ('approved','rejected') and reviewed_by is not null and reviewed_at is not null)
    or (status='cancelled' and reviewed_at is not null)
  )
);
create unique index pilot_access_requests_one_pending_per_user on public.pilot_access_requests (user_id) where status='pending';
create index pilot_access_requests_org_status_idx on public.pilot_access_requests (organization_id,status,created_at);
create index pilot_access_requests_reviewed_by_idx on public.pilot_access_requests (reviewed_by) where reviewed_by is not null;

alter table public.pilot_access_requests enable row level security;
create policy pilot_access_requests_self_select on public.pilot_access_requests for select to authenticated
  using (user_id=(select auth.uid()));
create policy pilot_access_requests_self_insert on public.pilot_access_requests for insert to authenticated
  with check (
    user_id=(select auth.uid()) and requested_member_role='member' and status='pending'
    and exists (select 1 from public.organizations o where o.id=organization_id and o.is_synthetic=true and o.status='active')
  );
grant select,insert on public.pilot_access_requests to authenticated;
revoke all on public.pilot_access_requests from anon;

create or replace function public.request_pilot_access(target_demo_code text,target_display_name text)
returns public.pilot_access_requests language plpgsql security invoker
set search_path = pg_catalog, public as $$
declare
  caller uuid := (select auth.uid());
  target_org uuid;
  result public.pilot_access_requests;
begin
  if caller is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  if char_length(trim(target_display_name)) not between 2 and 120 then raise exception 'INVALID_DISPLAY_NAME' using errcode='22023'; end if;
  select o.id into target_org from public.organizations o
    where o.demo_code=target_demo_code and o.is_synthetic=true and o.status='active';
  if target_org is null then raise exception 'PILOT_ORGANIZATION_NOT_AVAILABLE' using errcode='22023'; end if;
  insert into public.profiles(user_id,display_name,platform_role) values(caller,trim(target_display_name),'member')
    on conflict(user_id) do update set display_name=excluded.display_name,updated_at=now();
  insert into public.pilot_access_requests(user_id,organization_id) values(caller,target_org)
    on conflict(user_id) where status='pending' do update set organization_id=excluded.organization_id,updated_at=now()
    returning * into result;
  return result;
end;
$$;
revoke all on function public.request_pilot_access(text,text) from public,anon;
grant execute on function public.request_pilot_access(text,text) to authenticated;

commit;
