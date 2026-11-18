begin;

-- Creates a draft with exactly one seller, one carrier and one buyer.
-- The caller must be an active member of the declared owner organization.
-- Invited organizations receive access only through existing participant RLS;
-- moving the operation beyond draft still requires the existing L3 trust gates.
create or replace function public.create_operation_draft(
  target_title text,
  target_operation_type text,
  target_owner_organization uuid,
  target_seller_organization uuid,
  target_carrier_organization uuid,
  target_buyer_organization uuid,
  request_key uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  caller uuid := (select auth.uid());
  new_operation_id uuid;
  existing_operation_id uuid;
  generated_reference text;
  active_org_count integer;
begin
  if caller is null then
    raise exception 'AUTH_REQUIRED' using errcode='42501';
  end if;
  if request_key is null or target_owner_organization is null
     or target_seller_organization is null or target_carrier_organization is null
     or target_buyer_organization is null then
    raise exception 'ALL_PARTIES_AND_REQUEST_KEY_REQUIRED' using errcode='22023';
  end if;
  if target_title is null or char_length(btrim(target_title)) not between 3 and 180 then
    raise exception 'INVALID_OPERATION_TITLE' using errcode='22023';
  end if;
  if target_operation_type not in ('standard','machinery_purchase','goods_delivery','repair_part_delivery') then
    raise exception 'INVALID_OPERATION_TYPE' using errcode='22023';
  end if;
  if target_seller_organization=target_carrier_organization
     or target_seller_organization=target_buyer_organization
     or target_carrier_organization=target_buyer_organization then
    raise exception 'THREE_DISTINCT_ORGANIZATIONS_REQUIRED' using errcode='22023';
  end if;
  if target_owner_organization not in (target_seller_organization,target_carrier_organization,target_buyer_organization) then
    raise exception 'OWNER_MUST_BE_A_PARTICIPANT' using errcode='22023';
  end if;
  if not exists (
    select 1 from public.organization_members om
    where om.organization_id=target_owner_organization
      and om.user_id=caller and om.status='active'
  ) then
    raise exception 'ACTIVE_OWNER_ORGANIZATION_MEMBERSHIP_REQUIRED' using errcode='42501';
  end if;

  select count(*) into active_org_count
  from public.organizations o
  where o.id in (target_seller_organization,target_carrier_organization,target_buyer_organization)
    and o.status='active' and not o.is_synthetic;
  if active_org_count<>3 then
    raise exception 'ALL_THREE_REAL_ORGANIZATIONS_MUST_BE_ACTIVE' using errcode='42501';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(caller::text || ':' || request_key::text,0));
  select e.operation_id into existing_operation_id
  from public.operation_audit_events e
  where e.actor_id=caller and e.request_id=request_key and e.event_type='operation.created'
  limit 1;
  if existing_operation_id is not null then
    return existing_operation_id;
  end if;

  generated_reference := 'FIA-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,16));
  insert into public.operations(reference,title,status,operation_type,created_by,owner_organization_id)
  values(generated_reference,btrim(target_title),'draft',target_operation_type,caller,target_owner_organization)
  returning id into new_operation_id;

  insert into public.operation_participants(operation_id,organization_id,participant_role,status,invited_by,responsibility)
  values
    (new_operation_id,target_seller_organization,'seller','invited',caller,'Preparar la oferta y confirmar la expedición'),
    (new_operation_id,target_carrier_organization,'carrier','invited',caller,'Aceptar la logística y confirmar recogida y entrega'),
    (new_operation_id,target_buyer_organization,'buyer','invited',caller,'Revisar la oferta y confirmar la recepción');

  perform private.append_operation_audit(
    new_operation_id,'operation.created',caller,
    jsonb_build_object(
      'owner_organization_id',target_owner_organization,
      'seller_organization_id',target_seller_organization,
      'carrier_organization_id',target_carrier_organization,
      'buyer_organization_id',target_buyer_organization,
      'operation_type',target_operation_type
    ),
    request_key
  );
  return new_operation_id;
end;
$function$;

revoke all on function public.create_operation_draft(text,text,uuid,uuid,uuid,uuid,uuid) from public, anon;
grant execute on function public.create_operation_draft(text,text,uuid,uuid,uuid,uuid,uuid) to authenticated;

commit;
