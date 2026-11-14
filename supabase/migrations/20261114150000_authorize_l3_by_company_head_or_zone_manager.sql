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
  -- Supabase provides service_role; the isolated plain-PostgreSQL CI harness
  -- does not. In CI the migration owner remains the only trusted verifier.
  if exists (select 1 from pg_roles where rolname='service_role') then
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

-- Preserve the existing function identity so any database dependencies
-- continue to resolve to this updated implementation. L3/L4 additionally
-- require the latest unexpired company authorization event.
create or replace function private.organization_has_trust_level(
  target_organization uuid,
  required_level text
) returns boolean
language sql stable security definer
set search_path = ''
as $$
 select exists (
  select 1 from private.organization_security_profiles p
  where p.organization_id=target_organization and p.verification_status='verified'
   and p.verified_at<=statement_timestamp() and p.valid_until>statement_timestamp()
   and case required_level
    when 'L1_ISOLATED' then p.trust_level in ('L1_ISOLATED','L2_VERIFIED','L3_SHARED','L4_ADVANCED')
     and coalesce((p.verified_controls->>'organizationIdentified')::boolean,false)
     and coalesce((p.verified_controls->>'termsAccepted')::boolean,false)
     and coalesce((p.verified_controls->>'tenantBoundaryReady')::boolean,false)
     and coalesce((p.verified_controls->>'auditReady')::boolean,false)
     and coalesce((p.verified_controls->>'incidentContactDefined')::boolean,false)
    when 'L2_VERIFIED' then p.trust_level in ('L2_VERIFIED','L3_SHARED','L4_ADVANCED')
     and coalesce((p.verified_controls->>'organizationIdentified')::boolean,false)
     and coalesce((p.verified_controls->>'termsAccepted')::boolean,false)
     and coalesce((p.verified_controls->>'tenantBoundaryReady')::boolean,false)
     and coalesce((p.verified_controls->>'auditReady')::boolean,false)
     and coalesce((p.verified_controls->>'incidentContactDefined')::boolean,false)
     and coalesce((p.verified_controls->>'identityVerified')::boolean,false)
     and coalesce((p.verified_controls->>'strongAuthenticationReady')::boolean,false)
     and coalesce((p.verified_controls->>'secretsManaged')::boolean,false)
     and coalesce((p.verified_controls->>'dataMinimizationReady')::boolean,false)
     and coalesce((p.verified_controls->>'retentionPolicyReady')::boolean,false)
     and coalesce((p.verified_controls->>'securityTestsPassed')::boolean,false)
    when 'L3_SHARED' then p.trust_level in ('L3_SHARED','L4_ADVANCED')
     and coalesce((p.verified_controls->>'organizationIdentified')::boolean,false)
     and coalesce((p.verified_controls->>'termsAccepted')::boolean,false)
     and coalesce((p.verified_controls->>'tenantBoundaryReady')::boolean,false)
     and coalesce((p.verified_controls->>'auditReady')::boolean,false)
     and coalesce((p.verified_controls->>'incidentContactDefined')::boolean,false)
     and coalesce((p.verified_controls->>'identityVerified')::boolean,false)
     and coalesce((p.verified_controls->>'strongAuthenticationReady')::boolean,false)
     and coalesce((p.verified_controls->>'secretsManaged')::boolean,false)
     and coalesce((p.verified_controls->>'dataMinimizationReady')::boolean,false)
     and coalesce((p.verified_controls->>'retentionPolicyReady')::boolean,false)
     and coalesce((p.verified_controls->>'securityTestsPassed')::boolean,false)
     and coalesce((p.verified_controls->>'dataPermitsReady')::boolean,false)
     and coalesce((p.verified_controls->>'grantExpiryReady')::boolean,false)
     and coalesce((p.verified_controls->>'grantRevocationReady')::boolean,false)
     and coalesce((p.verified_controls->>'partnerIdentityVerified')::boolean,false)
     and coalesce((p.verified_controls->>'purposeLimitationReady')::boolean,false)
     and coalesce((p.verified_controls->>'crossOrgIsolationTestsPassed')::boolean,false)
    when 'L4_ADVANCED' then p.trust_level='L4_ADVANCED'
     and coalesce((p.verified_controls->>'legalRoleValidated')::boolean,false)
     and coalesce((p.verified_controls->>'processorTermsReady')::boolean,false)
     and coalesce((p.verified_controls->>'subprocessorsDocumented')::boolean,false)
     and coalesce((p.verified_controls->>'personalDataWorkflowReviewed')::boolean,false)
     and coalesce((p.verified_controls->>'enhancedSecurityReviewPassed')::boolean,false)
     and coalesce((p.verified_controls->>'regulatedProviderGateReady')::boolean,false)
    else false end
   and (
     required_level not in ('L3_SHARED','L4_ADVANCED')
     or exists (
       select 1 from private.organization_l3_authorization_events latest
       where latest.organization_id=target_organization
         and latest.action='authorized'
         and latest.valid_until>statement_timestamp()
         and exists (
           select 1 from private.organization_l3_authority_verifications authority
           where authority.id=latest.authority_verification_id
             and authority.verification_status='verified'
             and authority.verified_at<=statement_timestamp()
             and authority.valid_until>statement_timestamp()
         )
         and not exists (
           select 1 from private.organization_l3_authorization_events newer
           where newer.organization_id=latest.organization_id
             and (newer.created_at,newer.id)>(latest.created_at,latest.id)
         )
     )
   )
 );
$$;
revoke all on function private.organization_has_trust_level(uuid,text) from public,anon,authenticated;

-- A public RPC is necessary for the signed-in head/zone manager to consent.
-- It never accepts a caller id: the actor always comes from auth.uid().
create or replace function public.authorize_organization_l3(
  target_organization uuid,
  target_request_key uuid,
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
  if target_organization is null or target_request_key is null then
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
  order by v.created_at desc,v.id desc
  limit 1;
  if not found or authority.verification_status <> 'verified'
     or authority.verified_at > statement_timestamp()
     or authority.valid_until <= statement_timestamp() then
    raise exception 'L3_AUTHORITY_NOT_VERIFIED' using errcode='42501';
  end if;
  if expiry > authority.valid_until then
    raise exception 'AUTHORIZATION_EXCEEDS_AUTHORITY_VERIFICATION' using errcode='22023';
  end if;

  insert into private.organization_l3_authorization_events
    (organization_id,actor_id,authority_verification_id,authority_type,action,request_key,valid_until)
  values
    (target_organization,caller,authority.id,authority.authority_type,'authorized',target_request_key,expiry)
  on conflict on constraint organization_l3_authorization_events_request_key_key do nothing;

  select e.id into event_id
  from private.organization_l3_authorization_events e
  where e.request_key=target_request_key
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
  target_request_key uuid
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
  if target_organization is null or target_request_key is null then
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
  order by v.created_at desc,v.id desc
  limit 1;
  if not found or authority.verification_status <> 'verified'
     or authority.verified_at > statement_timestamp()
     or authority.valid_until <= statement_timestamp() then
    raise exception 'L3_AUTHORITY_NOT_VERIFIED' using errcode='42501';
  end if;

  insert into private.organization_l3_authorization_events
    (organization_id,actor_id,authority_verification_id,authority_type,action,request_key,valid_until)
  values
    (target_organization,caller,authority.id,authority.authority_type,'revoked',target_request_key,null)
  on conflict on constraint organization_l3_authorization_events_request_key_key do nothing;

  select e.id into event_id
  from private.organization_l3_authorization_events e
  where e.request_key=target_request_key
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
