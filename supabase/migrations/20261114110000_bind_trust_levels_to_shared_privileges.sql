begin;

-- Trust levels are server-verified facts, never user-editable profile fields.
create table public.organization_security_profiles (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  trust_level text not null default 'L0_DEMO'
    check (trust_level in ('L0_DEMO','L1_ISOLATED','L2_VERIFIED','L3_SHARED','L4_ADVANCED')),
  verification_status text not null default 'pending'
    check (verification_status in ('pending','verified','suspended')),
  verified_controls jsonb not null default '{}'::jsonb
    check (jsonb_typeof(verified_controls) = 'object'),
  verified_at timestamptz,
  valid_until timestamptz,
  verified_by uuid references auth.users(id) on delete restrict,
  updated_at timestamptz not null default now(),
  check ((verification_status = 'verified' and verified_at is not null
    and valid_until is not null and verified_by is not null) or verification_status <> 'verified'),
  check (valid_until is null or verified_at is null or valid_until > verified_at)
);
alter table public.organization_security_profiles enable row level security;
revoke all on public.organization_security_profiles from public, anon, authenticated;
grant select on public.organization_security_profiles to authenticated;
grant select, insert, update on public.organization_security_profiles to service_role;
create policy organization_security_profile_member_read
 on public.organization_security_profiles for select to authenticated
 using (exists (select 1 from public.organization_members om
  where om.organization_id=organization_security_profiles.organization_id
   and om.user_id=(select auth.uid()) and om.status='active'));

create or replace function private.organization_has_trust_level(target_organization uuid, required_level text)
returns boolean language sql stable security definer
set search_path = pg_catalog, public as $
 select exists (
  select 1 from public.organization_security_profiles p
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
 );
$;

create or replace function private.operation_has_shared_trust(target_operation uuid)
returns boolean language sql stable security definer
set search_path = pg_catalog, public, private as $
 select count(*)=3
  and count(*) filter (where private.organization_has_trust_level(op.organization_id,'L3_SHARED'))=3
 from public.operation_participants op
 where op.operation_id=target_operation and op.status='accepted'
  and op.participant_role in ('seller','buyer','carrier');
$;
revoke all on function private.organization_has_trust_level(uuid,text) from public,anon,authenticated;
revoke all on function private.operation_has_shared_trust(uuid) from public,anon,authenticated;

-- A pending invitation is not an accepted operational role.
create or replace function private.has_operation_role(target_operation uuid, target_role text) returns boolean language sql stable security definer
set search_path = pg_catalog, public as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.operation_participants op
    join public.organization_members om on om.organization_id = op.organization_id
      and om.user_id = (select auth.uid()) and om.status = 'active'
    where op.operation_id = target_operation and op.participant_role = target_role and op.status = 'accepted'
      and private.organization_has_trust_level(op.organization_id,'L3_SHARED')
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
  if not private.operation_has_shared_trust(target_operation) then
    raise exception 'TRUST_LEVEL_REQUIRED:L3_SHARED' using errcode='42501';
  end if;

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
