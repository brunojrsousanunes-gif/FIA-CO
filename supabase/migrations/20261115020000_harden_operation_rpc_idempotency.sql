begin;

-- Lock the operation and participant before accepting an invitation. A request
-- key may only replay the same role acceptance by the same authenticated user.
create or replace function public.accept_operation_invitation(
  target_operation uuid,
  target_role text,
  request_key uuid
)
returns public.operation_participants
language plpgsql
security definer
set search_path to ''
as $function$
declare
  caller uuid := (select auth.uid());
  participant public.operation_participants;
  existing_event public.operation_audit_events;
begin
  if caller is null then
    raise exception 'AUTH_REQUIRED' using errcode='42501';
  end if;
  if target_operation is null or request_key is null then
    raise exception 'OPERATION_AND_REQUEST_KEY_REQUIRED' using errcode='22023';
  end if;
  if target_role is null or target_role not in ('seller','buyer','carrier') then
    raise exception 'INVALID_ROLE' using errcode='22023';
  end if;

  perform 1 from public.operations o
  where o.id=target_operation
  for update;
  if not found then
    raise exception 'OPERATION_NOT_FOUND' using errcode='P0002';
  end if;

  select op.* into participant
  from public.operation_participants op
  join public.organization_members om on om.organization_id=op.organization_id
  where op.operation_id=target_operation
    and op.participant_role=target_role
    and om.user_id=caller and om.status='active'
  for update of op;

  if not found then
    raise exception 'INVITATION_NOT_ACCESSIBLE' using errcode='42501';
  end if;

  select e.* into existing_event
  from public.operation_audit_events e
  where e.operation_id=target_operation and e.request_id=request_key;

  if found and (
    existing_event.event_type <> 'participant.accepted'
    or existing_event.actor_id is distinct from caller
    or existing_event.event_data->>'role' is distinct from target_role
  ) then
    raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode='22023';
  end if;

  if participant.status='accepted' then
    if participant.accepted_by is null then
      raise exception 'LEGACY_ACCEPTANCE_REQUIRES_REVALIDATION' using errcode='42501';
    elsif participant.accepted_by is distinct from caller then
      raise exception 'ROLE_ALREADY_BOUND' using errcode='42501';
    end if;
    return participant;
  end if;

  if participant.status <> 'invited' then
    raise exception 'INVITATION_NOT_PENDING' using errcode='22023';
  end if;
  if existing_event.id is not null then
    raise exception 'INVITATION_AUDIT_STATE_MISMATCH' using errcode='23514';
  end if;

  update public.operation_participants
  set status='accepted',accepted_at=clock_timestamp(),accepted_by=caller
  where id=participant.id
  returning * into participant;

  perform private.append_operation_audit(
    target_operation,'participant.accepted',caller,
    jsonb_build_object('role',target_role),request_key
  );

  select e.* into existing_event
  from public.operation_audit_events e
  where e.operation_id=target_operation and e.request_id=request_key;

  if not found
     or existing_event.event_type <> 'participant.accepted'
     or existing_event.actor_id is distinct from caller
     or existing_event.event_data->>'role' is distinct from target_role then
    raise exception 'INVITATION_AUDIT_WRITE_FAILED' using errcode='23514';
  end if;

  return participant;
end;
$function$;

-- Creation is idempotent only when the complete business payload matches.
-- The previous audit record already stores the three organizations and type;
-- title and owner are checked against the immutable operation row.
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
set search_path to ''
as $function$
declare
  caller uuid := (select auth.uid());
  new_operation_id uuid;
  existing_operation_id uuid;
  generated_reference text;
  existing_event public.operation_audit_events;
  existing_operation public.operations;
  active_org_count integer;
  existing_event_count integer;
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
  if target_operation_type is null
     or target_operation_type not in ('standard','machinery_purchase','goods_delivery','repair_part_delivery') then
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

  select count(*) into existing_event_count
  from public.operation_audit_events e
  where e.actor_id=caller and e.request_id=request_key;
  if existing_event_count > 1 then
    raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode='22023';
  end if;

  select e.* into existing_event
  from public.operation_audit_events e
  where e.actor_id=caller and e.request_id=request_key
    and e.event_type='operation.created'
  order by e.id desc
  limit 1;

  if found then
    select o.* into existing_operation
    from public.operations o
    where o.id=existing_event.operation_id;
    if not found then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode='22023';
    end if;
    if existing_event.event_data->>'owner_organization_id' is distinct from target_owner_organization::text
       or existing_event.event_data->>'seller_organization_id' is distinct from target_seller_organization::text
       or existing_event.event_data->>'carrier_organization_id' is distinct from target_carrier_organization::text
       or existing_event.event_data->>'buyer_organization_id' is distinct from target_buyer_organization::text
       or existing_event.event_data->>'operation_type' is distinct from target_operation_type
       or existing_operation.title is distinct from btrim(target_title)
       or existing_operation.owner_organization_id is distinct from target_owner_organization
       or existing_operation.operation_type is distinct from target_operation_type then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode='22023';
    end if;
    return existing_event.operation_id;
  end if;

  if exists (
    select 1 from public.operation_audit_events e
    where e.actor_id=caller and e.request_id=request_key
  ) then
    raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode='22023';
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

-- A transition retry is idempotent only for the same actor, target and expected version.
-- Legacy events derive the original expected version from their resulting version.
create or replace function public.transition_operation(
  target_operation uuid,
  target_status text,
  expected_version integer,
  request_key uuid
)
returns public.operations
language plpgsql
security definer
set search_path to ''
as $function$
declare
  caller uuid := (select auth.uid());
  current_row public.operations;
  previous text;
  happened_at timestamptz;
  calculated text;
  accepted_count integer;
  allowed boolean := false;
  existing_event record;
begin
  if caller is null then
    raise exception 'AUTH_REQUIRED' using errcode='42501';
  end if;
  if target_status is null
     or target_status not in ('invited','accepted','in_transit','delivered','completed','disputed','cancelled') then
    raise exception 'INVALID_TARGET_STATUS' using errcode='22023';
  end if;
  if target_operation is null then
    raise exception 'OPERATION_REQUIRED' using errcode='22023';
  end if;
  if expected_version is null then
    raise exception 'EXPECTED_VERSION_REQUIRED' using errcode='22023';
  end if;
  if request_key is null then
    raise exception 'IDEMPOTENCY_KEY_REQUIRED' using errcode='22023';
  end if;

  select * into current_row
  from public.operations
  where id=target_operation
  for update;
  if not found then
    raise exception 'OPERATION_NOT_FOUND' using errcode='P0002';
  end if;
  happened_at := clock_timestamp();
  if not private.can_access_operation(target_operation) then
    raise exception 'OPERATION_NOT_ACCESSIBLE' using errcode='42501';
  end if;

  select event_type,actor_id,event_data into existing_event
  from public.operation_audit_events
  where operation_id=target_operation and request_id=request_key;
  if found then
    if existing_event.event_type='operation.transition'
       and existing_event.actor_id=caller
       and existing_event.event_data->>'to'=target_status
       and coalesce(
         (existing_event.event_data->>'expected_version')::integer,
         (existing_event.event_data->>'version')::integer - 1
       ) is not distinct from expected_version then
      -- Return the exact row produced by the original request, even if the
      -- operation has advanced since then. Older events derive their version
      -- from the resulting version for backward compatibility.
      if existing_event.event_data ? 'result' then
        return jsonb_populate_record(
          null::public.operations,
          existing_event.event_data->'result'
        );
      end if;
      return current_row;
    end if;
    raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode='22023';
  end if;

  if current_row.version is distinct from expected_version then
    raise exception 'VERSION_CONFLICT' using errcode='40001';
  end if;
  if current_row.status='draft' and target_status='invited' then
    if not private.operation_participants_have_shared_trust(target_operation) then
      raise exception 'TRUST_LEVEL_REQUIRED:L3_SHARED' using errcode='42501';
    end if;
  elsif target_status <> 'cancelled' and not private.operation_has_shared_trust(target_operation) then
    raise exception 'TRUST_LEVEL_REQUIRED:L3_SHARED' using errcode='42501';
  end if;

  if current_row.status='draft' and target_status='invited' and current_row.created_by=caller then
    select count(*) into accepted_count
    from public.operation_participants
    where operation_id=target_operation;
    allowed := accepted_count=3
      and exists(select 1 from public.operation_participants where operation_id=target_operation and participant_role='seller')
      and exists(select 1 from public.operation_participants where operation_id=target_operation and participant_role='buyer')
      and exists(select 1 from public.operation_participants where operation_id=target_operation and participant_role='carrier');
  elsif current_row.status='invited' and target_status='accepted' then
    select count(*) into accepted_count
    from public.operation_participants
    where operation_id=target_operation and status='accepted';
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
  if not allowed then
    raise exception 'TRANSITION_NOT_ALLOWED' using errcode='42501';
  end if;

  update public.operations
  set status=target_status,version=version+1,updated_at=happened_at
  where id=target_operation
  returning * into current_row;

  select event_hash into previous
  from public.operation_audit_events
  where operation_id=target_operation
  order by id desc
  limit 1;

  calculated := encode(extensions.digest(concat_ws('|',target_operation::text,'operation.transition',
    target_status,current_row.version::text,caller::text,happened_at::text,request_key::text,coalesce(previous,'')),'sha256'),'hex');

  insert into public.operation_audit_events
    (operation_id,event_type,actor_id,event_data,previous_hash,event_hash,created_at,request_id)
  values (
    target_operation,'operation.transition',caller,
    jsonb_build_object(
      'to',target_status,
      'expected_version',expected_version,
      'version',current_row.version,
      'result',to_jsonb(current_row)
    ),
    previous,calculated,happened_at,request_key
  )
  on conflict (operation_id,request_id) do nothing;

  return current_row;
end;
$function$;

-- Serialize audit timestamps with the per-operation hash-chain lock.
-- Assign created_at only after obtaining the operation row lock so concurrent
-- appenders cannot produce timestamps older than the event they follow.
create or replace function private.append_operation_audit(
  target_operation uuid,
  target_event text,
  target_actor uuid,
  target_data jsonb default '{}'::jsonb,
  target_request uuid default gen_random_uuid()
)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  previous text;
  happened_at timestamptz;
  calculated text;
begin
  perform 1
  from public.operations
  where id=target_operation
  for update;
  if not found then
    raise exception 'OPERATION_NOT_FOUND' using errcode='P0002';
  end if;

  happened_at := clock_timestamp();

  select event_hash into previous
  from public.operation_audit_events
  where operation_id=target_operation
  order by id desc
  limit 1;

  calculated := encode(extensions.digest(concat_ws('|',
    target_operation::text,
    target_event,
    target_actor::text,
    happened_at::text,
    target_request::text,
    coalesce(previous,''),
    target_data::text
  ),'sha256'),'hex');

  insert into public.operation_audit_events
    (operation_id,event_type,actor_id,event_data,previous_hash,event_hash,created_at,request_id)
  values
    (target_operation,target_event,target_actor,target_data,previous,calculated,happened_at,target_request)
  on conflict (operation_id,request_id) do nothing;
end;
$function$;

-- A repeated part-recovery request returns the same child operation only when
-- both audit-chain records match the original parent, parties and part.
create or replace function public.create_synthetic_part_recovery(
  target_parent uuid,
  sender_demo_code text,
  carrier_demo_code text,
  part_description text,
  request_key uuid
)
returns public.operations
language plpgsql
security definer
set search_path to ''
as $function$
declare
  caller uuid := (select auth.uid());
  parent public.operations;
  sender_org uuid;
  carrier_org uuid;
  buyer_org uuid;
  sender_name text;
  carrier_name text;
  buyer_name text;
  recovery public.operations;
  existing_recovery_event public.operation_audit_events;
  existing_parent_event public.operation_audit_events;
  request_event_count integer;
begin
  if caller is null then
    raise exception 'AUTH_REQUIRED' using errcode='42501';
  end if;
  if target_parent is null or request_key is null then
    raise exception 'PARENT_AND_REQUEST_KEY_REQUIRED' using errcode='22023';
  end if;
  if sender_demo_code is null or sender_demo_code not in ('SYN-FRAN','SYN-INFA') then
    raise exception 'INVALID_SYNTHETIC_SENDER' using errcode='22023';
  end if;
  if carrier_demo_code is null or carrier_demo_code not in ('SYN-GSM','SYN-AGRICOLA-MORENO') then
    raise exception 'INVALID_SYNTHETIC_CARRIER' using errcode='22023';
  end if;
  if part_description is null or char_length(btrim(part_description)) not between 3 and 180 then
    raise exception 'INVALID_PART_DESCRIPTION' using errcode='22023';
  end if;

  select o.* into parent
  from public.operations o
  where o.id=target_parent
  for update;
  if not found then
    raise exception 'OPERATION_NOT_FOUND' using errcode='P0002';
  end if;
  if not private.can_manage_operation(target_parent) then
    raise exception 'OPERATION_NOT_MANAGEABLE' using errcode='42501';
  end if;
  if not parent.is_synthetic or parent.operation_type <> 'machinery_purchase' then
    raise exception 'PARENT_NOT_SYNTHETIC_TRACTOR' using errcode='23514';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(caller::text || ':' || request_key::text,0));

  select count(*) into request_event_count
  from public.operation_audit_events e
  where e.actor_id=caller and e.request_id=request_key;

  if request_event_count > 0 then
    select e.* into existing_recovery_event
    from public.operation_audit_events e
    where e.actor_id=caller and e.request_id=request_key
      and e.event_type='recovery.created'
    order by e.id desc limit 1;

    if not found or request_event_count <> 2 then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode='22023';
    end if;

    select e.* into existing_parent_event
    from public.operation_audit_events e
    where e.operation_id=target_parent and e.actor_id=caller
      and e.request_id=request_key and e.event_type='recovery.linked';

    select o.* into recovery
    from public.operations o
    where o.id=existing_recovery_event.operation_id;

    if not found
       or recovery.parent_operation_id is distinct from target_parent
       or existing_recovery_event.event_data->>'parent_operation_id' is distinct from target_parent::text
       or existing_recovery_event.event_data->>'sender' is distinct from sender_demo_code
       or existing_recovery_event.event_data->>'carrier' is distinct from carrier_demo_code
       or existing_recovery_event.event_data->>'part' is distinct from btrim(part_description)
       or existing_parent_event.id is null
       or existing_parent_event.event_data->>'recovery_operation_id' is distinct from recovery.id::text
       or existing_parent_event.event_data->>'part' is distinct from btrim(part_description) then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode='22023';
    end if;
    return recovery;
  end if;

  if parent.status <> 'blocked'
     or not exists (
       select 1 from public.operation_incidents i
       where i.operation_id=target_parent and i.status='open' and i.blocks_progress
     ) then
    raise exception 'OPEN_BLOCKING_INCIDENT_REQUIRED' using errcode='23514';
  end if;

  select o.id,o.name into sender_org,sender_name
  from public.organizations o
  where o.demo_code=sender_demo_code and o.is_synthetic;

  select o.id,o.name into carrier_org,carrier_name
  from public.organizations o
  where o.demo_code=carrier_demo_code and o.is_synthetic;

  select op.organization_id,o.name into buyer_org,buyer_name
  from public.operation_participants op
  join public.organizations o on o.id=op.organization_id
  where op.operation_id=target_parent and op.participant_role='buyer'
    and o.is_synthetic;

  if sender_org is null or carrier_org is null or buyer_org is null then
    raise exception 'SYNTHETIC_PARTIES_INCOMPLETE' using errcode='23514';
  end if;
  if sender_org=carrier_org or sender_org=buyer_org or carrier_org=buyer_org then
    raise exception 'THREE_DISTINCT_SYNTHETIC_ORGANIZATIONS_REQUIRED' using errcode='23514';
  end if;

  insert into public.operations(
    reference,title,status,operation_type,parent_operation_id,is_synthetic,
    item_description,origin_label,destination_label,created_by
  )
  values (
    'FIA-REC-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),
    'Reposición de pieza · ' || btrim(part_description),
    'invited','repair_part_delivery',target_parent,true,
    btrim(part_description),sender_name,buyer_name,caller
  )
  returning * into recovery;

  insert into public.operation_participants(
    operation_id,organization_id,participant_role,status,invited_by,responsibility
  )
  values
    (recovery.id,sender_org,'seller','invited',caller,'Preparar y expedir la pieza de sustitución'),
    (recovery.id,carrier_org,'carrier','invited',caller,'Recoger, transportar y acreditar la entrega de la pieza'),
    (recovery.id,buyer_org,'buyer','invited',caller,'Recibir, revisar y confirmar la pieza antes de reanudar la finalización');

  perform private.append_operation_audit(
    recovery.id,'recovery.created',caller,
    jsonb_build_object(
      'parent_operation_id',target_parent,
      'sender',sender_demo_code,
      'carrier',carrier_demo_code,
      'part',btrim(part_description)
    ),
    request_key
  );
  perform private.append_operation_audit(
    target_parent,'recovery.linked',caller,
    jsonb_build_object('recovery_operation_id',recovery.id,'part',btrim(part_description)),
    request_key
  );
  perform private.enqueue_operation_notice(
    target_parent,'recovery.linked',
    'Se ha creado una suboperación para reponer la pieza y recuperar la entrega.'
  );

  return recovery;
end;
$function$;

commit;
