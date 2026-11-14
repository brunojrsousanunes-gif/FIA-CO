begin;

-- Only FIA&CO's trusted verification process (service_role) can attest that
-- an account is the company's head or an appointed zone manager.
create table private.organization_l3_authority_verifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  authority_type text not null check (authority_type in ('company_head','zone_manager')),
  verification_status text not null default 'pending'
    check (verification_status in ('pending','verified','suspended','revoked')),
  evidence_ref text not null check (char_length(btrim(evidence_ref)) between 3 and 240),
  verified_by uuid references auth.users(id) on delete restrict,
  verified_at timestamptz,
  valid_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (verification_status = 'verified' and verified_by is not null
      and verified_at is not null and valid_until is not null and valid_until > verified_at)
    or verification_status <> 'verified'
  )
);
create index organization_l3_authority_lookup_idx
  on private.organization_l3_authority_verifications
  (organization_id,user_id,verification_status,valid_until);

-- Append-only authorization history. The newest event determines whether the
-- organization currently has consented to L3. A revoke immediately closes it.
create table private.organization_l3_authorization_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  actor_id uuid not null references auth.users(id) on delete restrict,
  authority_verification_id uuid not null
    references private.organization_l3_authority_verifications(id) on delete restrict,
  authority_type text not null check (authority_type in ('company_head','zone_manager')),
  action text not null check (action in ('authorized','revoked')),
  request_key uuid not null unique,
  created_at timestamptz not null default clock_timestamp(),
  valid_until timestamptz,
  check (
    (action = 'authorized' and valid_until is not null and valid_until > created_at)
    or (action = 'revoked' and valid_until is null)
  )
);
create index organization_l3_authorization_latest_idx
  on private.organization_l3_authorization_events
  (organization_id,created_at desc,id desc);

alter table private.organization_l3_authority_verifications enable row level security;
alter table private.organization_l3_authorization_events enable row level security;
revoke all on private.organization_l3_authority_verifications from public, anon, authenticated;
revoke all on private.organization_l3_authorization_events from public, anon, authenticated;
do $service_role_grants$
begin
  -- Supabase provides service_role; plain PostgreSQL CI intentionally does not.
  if exists (select 1 from pg_roles where rolname='service_role') then
    grant usage on schema private to service_role;
    grant select,insert,update,delete on private.organization_l3_authority_verifications to service_role;
    grant select on private.organization_l3_authorization_events to service_role;
  end if;
end
$service_role_grants$;

create or replace function private.organization_has_l3_authorization(target_organization uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1
    from private.organization_l3_authorization_events latest
    where latest.organization_id = target_organization
      and latest.action = 'authorized'
      and latest.valid_until > statement_timestamp()
      and not exists (
        select 1
        from private.organization_l3_authorization_events newer
        where newer.organization_id = latest.organization_id
          and (newer.created_at,newer.id) > (latest.created_at,latest.id)
      )
  );
$$;
revoke all on function private.organization_has_l3_authorization(uuid) from public,anon,authenticated;

-- Keep the existing control checks intact and add the company-authority
-- consent as an additional mandatory condition for L3 and L4.
alter function private.organization_has_trust_level(uuid,text)
  rename to organization_has_trust_level_without_l3_authorization;

create or replace function private.organization_has_trust_level(
  target_organization uuid,
  required_level text
) returns boolean
language sql stable security definer
set search_path = ''
as $$
  select private.organization_has_trust_level_without_l3_authorization(
    target_organization,required_level
  )
  and case
    when required_level in ('L3_SHARED','L4_ADVANCED')
      then private.organization_has_l3_authorization(target_organization)
    else true
  end;
$$;
revoke all on function private.organization_has_trust_level(uuid,text) from public,anon,authenticated;

-- A public RPC is necessary for the signed-in head/zone manager to consent.
-- It never accepts a caller id: the actor always comes from auth.uid().
create or replace function public.authorize_organization_l3(
  target_organization uuid,
  request_key uuid,
  authorization_valid_until timestamptz default null
) returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  authority private.organization_l3_authority_verifications;
  org_status text;
  expiry timestamptz := coalesce(authorization_valid_until, statement_timestamp() + interval '90 days');
  event_id uuid;
begin
  if caller is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  if target_organization is null or request_key is null then
    raise exception 'ORGANIZATION_AND_REQUEST_KEY_REQUIRED' using errcode='22023';
  end if;
  if expiry <= statement_timestamp()
     or expiry > statement_timestamp() + interval '365 days' then
    raise exception 'INVALID_AUTHORIZATION_EXPIRY' using errcode='22023';
  end if;

  select o.status into org_status
  from public.organizations o
  where o.id=target_organization
  for update;
  if not found or org_status <> 'active' then
    raise exception 'ORGANIZATION_NOT_ACTIVE' using errcode='42501';
  end if;

  if not exists (
    select 1 from public.organization_members om
    where om.organization_id=target_organization
      and om.user_id=caller and om.status='active'
  ) then
    raise exception 'ACTIVE_ORGANIZATION_MEMBERSHIP_REQUIRED' using errcode='42501';
  end if;

  select v.* into authority
  from private.organization_l3_authority_verifications v
  where v.organization_id=target_organization and v.user_id=caller
    and v.verification_status='verified'
    and v.verified_at <= statement_timestamp()
    and v.valid_until > statement_timestamp()
  order by v.verified_at desc,v.id desc
  limit 1;
  if not found then
    raise exception 'L3_AUTHORITY_NOT_VERIFIED' using errcode='42501';
  end if;

  insert into private.organization_l3_authorization_events
    (organization_id,actor_id,authority_verification_id,authority_type,action,request_key,valid_until)
  values
    (target_organization,caller,authority.id,authority.authority_type,'authorized',request_key,expiry)
  on conflict (request_key) do nothing;

  select e.id into event_id
  from private.organization_l3_authorization_events e
  where e.request_key=request_key
    and e.organization_id=target_organization
    and e.actor_id=caller
    and e.authority_verification_id=authority.id
    and e.authority_type=authority.authority_type
    and e.action='authorized'
    and e.valid_until=expiry;
  if event_id is null then
    raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode='22023';
  end if;
  return event_id;
end;
$$;
revoke all on function public.authorize_organization_l3(uuid,uuid,timestamptz) from public,anon;
grant execute on function public.authorize_organization_l3(uuid,uuid,timestamptz) to authenticated;

create or replace function public.revoke_organization_l3_authorization(
  target_organization uuid,
  request_key uuid
) returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  authority private.organization_l3_authority_verifications;
  event_id uuid;
  org_status text;
begin
  if caller is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  if target_organization is null or request_key is null then
    raise exception 'ORGANIZATION_AND_REQUEST_KEY_REQUIRED' using errcode='22023';
  end if;

  -- Serialize authorize/revoke operations on the same organization.
  select o.status into org_status
  from public.organizations o
  where o.id=target_organization
  for update;
  if not found or org_status <> 'active' then
    raise exception 'ORGANIZATION_NOT_ACTIVE' using errcode='42501';
  end if;

  if not exists (
    select 1 from public.organization_members om
    where om.organization_id=target_organization
      and om.user_id=caller and om.status='active'
  ) then
    raise exception 'ACTIVE_ORGANIZATION_MEMBERSHIP_REQUIRED' using errcode='42501';
  end if;

  select v.* into authority
  from private.organization_l3_authority_verifications v
  where v.organization_id=target_organization and v.user_id=caller
    and v.verification_status='verified'
    and v.verified_at <= statement_timestamp()
    and v.valid_until > statement_timestamp()
  order by v.verified_at desc,v.id desc
  limit 1;
  if not found then
    raise exception 'L3_AUTHORITY_NOT_VERIFIED' using errcode='42501';
  end if;

  insert into private.organization_l3_authorization_events
    (organization_id,actor_id,authority_verification_id,authority_type,action,request_key,valid_until)
  values
    (target_organization,caller,authority.id,authority.authority_type,'revoked',request_key,null)
  on conflict (request_key) do nothing;

  select e.id into event_id
  from private.organization_l3_authorization_events e
  where e.request_key=request_key
    and e.organization_id=target_organization
    and e.actor_id=caller
    and e.action='revoked';
  if event_id is null then
    raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode='22023';
  end if;
  return event_id;
end;
$$;
revoke all on function public.revoke_organization_l3_authorization(uuid,uuid) from public,anon;
grant execute on function public.revoke_organization_l3_authorization(uuid,uuid) to authenticated;

commit;
