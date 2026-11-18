-- Keep the default L3 authorization within the verified authority window.
-- Reusing the same request key returns the original event without extending
-- its expiry; an explicitly changed expiry remains an idempotency conflict.
create or replace function public.authorize_organization_l3(
  target_organization uuid,
  request_key uuid,
  authorization_valid_until timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  caller uuid := (select auth.uid());
  authority private.organization_l3_authority_verifications;
  org_status text;
  expiry timestamptz;
  existing_event private.organization_l3_authorization_events;
begin
  if caller is null then
    raise exception 'AUTH_REQUIRED' using errcode='42501';
  end if;
  if target_organization is null or request_key is null then
    raise exception 'ORGANIZATION_AND_REQUEST_KEY_REQUIRED' using errcode='22023';
  end if;

  -- Reject non-members before taking the organization row lock.
  if not exists (
    select 1 from public.organization_members om
    where om.organization_id=target_organization
      and om.user_id=caller and om.status='active'
  ) then
    raise exception 'ACTIVE_ORGANIZATION_MEMBERSHIP_REQUIRED' using errcode='42501';
  end if;

  select o.status into org_status
  from public.organizations o
  where o.id=target_organization
  for update;
  if not found or org_status <> 'active' then
    raise exception 'ORGANIZATION_NOT_ACTIVE' using errcode='42501';
  end if;

  -- Recheck after locking to close the authorization-change window.
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

  -- Resolve an existing request before calculating a fresh default expiry.
  -- Otherwise each retry would produce a later 90-day timestamp and appear
  -- to be a different request.
  select e.* into existing_event
  from private.organization_l3_authorization_events e
  where e.request_key=$2;

  if found then
    if existing_event.organization_id is distinct from target_organization
       or existing_event.actor_id is distinct from caller
       or existing_event.authority_verification_id is distinct from authority.id
       or existing_event.authority_type is distinct from authority.authority_type
       or existing_event.action <> 'authorized'
       or (
         authorization_valid_until is not null
         and existing_event.valid_until is distinct from authorization_valid_until
       )
       or existing_event.valid_until > authority.valid_until then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode='22023';
    end if;
    return existing_event.id;
  end if;

  expiry := coalesce(
    authorization_valid_until,
    least(statement_timestamp() + interval '90 days', authority.valid_until)
  );

  if expiry <= statement_timestamp()
     or expiry > statement_timestamp() + interval '365 days' then
    raise exception 'INVALID_AUTHORIZATION_EXPIRY' using errcode='22023';
  end if;
  if expiry > authority.valid_until then
    raise exception 'AUTHORIZATION_EXCEEDS_AUTHORITY_VERIFICATION' using errcode='22023';
  end if;

  insert into private.organization_l3_authorization_events
    (organization_id,actor_id,authority_verification_id,authority_type,action,request_key,valid_until)
  values
    (target_organization,caller,authority.id,authority.authority_type,'authorized',request_key,expiry)
  on conflict on constraint organization_l3_authorization_events_request_key_key do nothing;

  select e.* into existing_event
  from private.organization_l3_authorization_events e
  where e.request_key=$2;

  if not found
     or existing_event.organization_id is distinct from target_organization
     or existing_event.actor_id is distinct from caller
     or existing_event.authority_verification_id is distinct from authority.id
     or existing_event.authority_type is distinct from authority.authority_type
     or existing_event.action <> 'authorized'
     or existing_event.valid_until is distinct from expiry then
    raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode='22023';
  end if;

  return existing_event.id;
end;
$function$;
