\set ON_ERROR_STOP on
create role anon nologin;
create role authenticated nologin;
create schema auth;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$
 select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
create schema private;
grant usage on schema public, auth, private to authenticated;
create table public.organizations(id uuid primary key);
create table public.organization_members(
 organization_id uuid not null references public.organizations(id),
 user_id uuid not null references auth.users(id),
 member_role text not null,
 status text not null,
 primary key(organization_id,user_id)
);
create table public.operations(id uuid primary key, created_by uuid not null references auth.users(id));
create table public.operation_participants(
 operation_id uuid not null references public.operations(id),
 organization_id uuid not null references public.organizations(id),
 status text not null
);
create function private.is_org_member(target_org uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.organization_members m
 where m.organization_id=target_org and m.user_id=(select auth.uid()) and m.status='active')
$$;
create function private.can_access_operation(target_operation uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.operations o where o.id=target_operation and o.created_by=(select auth.uid()))
 or exists(select 1 from public.operation_participants p join public.organization_members m
 on m.organization_id=p.organization_id where p.operation_id=target_operation
 and p.status in ('invited','accepted') and m.user_id=(select auth.uid()) and m.status='active')
$$;
grant execute on function private.is_org_member(uuid), private.can_access_operation(uuid) to authenticated;
insert into auth.users values
 ('10000000-0000-0000-0000-000000000001'),
 ('10000000-0000-0000-0000-000000000002');
insert into public.organizations values
 ('20000000-0000-0000-0000-000000000001'),
 ('20000000-0000-0000-0000-000000000002');
insert into public.organization_members values
 ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','manager','active'),
 ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','manager','active');
insert into public.operations values
 ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001');
insert into public.operation_participants values
 ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','accepted');
