begin;

-- An L3 revocation request key is bound to the exact authority verification
-- that was active when the revocation was requested.
create or replace function public.revoke_organization_l3_authorization(
  target_organization uuid,
  request_key uuid
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  caller uuid := (select auth.uid());
  authority private.organization_l3_authority_verifications;
  existing_event private.organization_l3_authorization_events;
  org_status text;
begin
  if caller is null then
    raise exception 'AUTH_REQUIRED' using errcode='42501';
  end if;
  if target_organization is null or request_key is null then
    raise exception 'ORGANIZATION_AND_REQUEST_KEY_REQUIRED' using errcode='22023';
  end if;

  -- Check membership before taking the organization lock to avoid lock
  -- contention from authenticated users who do not belong to this company.
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

  select e.* into existing_event
  from private.organization_l3_authorization_events e
  where e.request_key=$2;

  if found then
    if existing_event.organization_id is distinct from target_organization
       or existing_event.actor_id is distinct from caller
       or existing_event.authority_verification_id is distinct from authority.id
       or existing_event.authority_type is distinct from authority.authority_type
       or existing_event.action <> 'revoked'
       or existing_event.valid_until is not null then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode='22023';
    end if;
    return existing_event.id;
  end if;

  insert into private.organization_l3_authorization_events
    (organization_id,actor_id,authority_verification_id,authority_type,action,request_key,valid_until)
  values
    (target_organization,caller,authority.id,authority.authority_type,'revoked',request_key,null)
  on conflict on constraint organization_l3_authorization_events_request_key_key do nothing;

  select e.* into existing_event
  from private.organization_l3_authorization_events e
  where e.request_key=$2;

  if not found
     or existing_event.organization_id is distinct from target_organization
     or existing_event.actor_id is distinct from caller
     or existing_event.authority_verification_id is distinct from authority.id
     or existing_event.authority_type is distinct from authority.authority_type
     or existing_event.action <> 'revoked'
     or existing_event.valid_until is not null then
    raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode='22023';
  end if;

  return existing_event.id;
end;
$function$;

-- A repeated close request for the same terminal reservation state is a
-- successful no-op. A conflicting terminal state remains an error.
create or replace function public.release_inventory_reservation(
  target_reservation uuid,
  final_status text
)
returns public.inventory_reservations
language plpgsql
security definer
set search_path to ''
as $function$
declare
  caller uuid := (select auth.uid());
  reservation_row public.inventory_reservations;
  item_row public.inventory_items;
  expected_item_id uuid;
  expected_org_id uuid;
begin
  if caller is null then
    raise exception 'AUTH_REQUIRED' using errcode='42501';
  end if;
  if target_reservation is null
     or final_status is null
     or final_status not in ('released','fulfilled') then
    raise exception 'INVALID_RESERVATION_STATUS' using errcode='22023';
  end if;

  -- Read identifiers without locking the reservation. Every writer locks item
  -- before reservation, avoiding a reservation->item lock-order inversion.
  select r.item_id,r.organization_id
    into expected_item_id,expected_org_id
  from public.inventory_reservations r
  where r.id=target_reservation;

  if not found then
    raise exception 'RESERVATION_NOT_FOUND' using errcode='P0002';
  end if;

  if not private.is_inventory_manager(expected_org_id) then
    raise exception 'INVENTORY_FORBIDDEN' using errcode='42501';
  end if;

  select * into item_row
  from public.inventory_items i
  where i.id=expected_item_id and i.organization_id=expected_org_id
  for update;

  if not found then
    raise exception 'INVENTORY_ITEM_NOT_FOUND' using errcode='P0002';
  end if;

  -- Recheck membership after waiting for the item lock. A membership revoked
  -- while this request was blocked must not authorize reservation closure.
  if not private.is_inventory_manager(expected_org_id) then
    raise exception 'INVENTORY_FORBIDDEN' using errcode='42501';
  end if;

  select * into reservation_row
  from public.inventory_reservations r
  where r.id=target_reservation
  for update;

  if not found
     or reservation_row.item_id <> expected_item_id
     or reservation_row.organization_id <> expected_org_id then
    raise exception 'RESERVATION_CHANGED_RETRY' using errcode='40001';
  end if;

  if reservation_row.status <> 'reserved' then
    if reservation_row.status=final_status then
      return reservation_row;
    end if;
    raise exception 'RESERVATION_ALREADY_CLOSED' using errcode='23514';
  end if;

  if final_status = 'fulfilled' then
    insert into public.inventory_movements (
      item_id,organization_id,movement_type,quantity,note,
      operation_id,created_by,request_key
    ) values (
      reservation_row.item_id,reservation_row.organization_id,'out',
      reservation_row.quantity,
      'Salida por cumplimiento de reserva ' || reservation_row.id::text,
      reservation_row.operation_id,caller,gen_random_uuid()
    );
  end if;

  update public.inventory_reservations
  set status=final_status,updated_at=now()
  where id=target_reservation
  returning * into reservation_row;

  return reservation_row;
end;
$function$;

commit;
