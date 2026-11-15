begin;

-- Do not acquire an inventory-item row lock until the caller has been
-- authorized for the item's organization. Recheck after locking so a
-- permission change between the read and lock is not silently accepted.
create or replace function public.record_inventory_movement(
  target_item uuid, movement text, amount numeric, explanation text,
  p_request_key uuid, linked_operation uuid default null
) returns public.inventory_movements
language plpgsql security definer
set search_path = ''
as $function$
declare
  caller uuid := (select auth.uid());
  item_row public.inventory_items;
  on_hand numeric(14,3);
  reserved numeric(14,3);
  result_row public.inventory_movements;
begin
  if caller is null then
    raise exception 'AUTH_REQUIRED' using errcode='42501';
  end if;
  if target_item is null or movement is null
     or movement not in ('in','out','adjustment')
     or amount is null or amount <= 0 or amount <> round(amount,3)
     or explanation is null or char_length(trim(explanation)) not between 3 and 500
     or p_request_key is null then
    raise exception 'INVALID_MOVEMENT' using errcode='22023';
  end if;

  select * into item_row
  from public.inventory_items
  where id=target_item;
  if not found then
    raise exception 'ITEM_NOT_FOUND' using errcode='P0002';
  end if;
  if not private.is_inventory_manager(item_row.organization_id) then
    raise exception 'INVENTORY_FORBIDDEN' using errcode='42501';
  end if;

  select * into item_row
  from public.inventory_items
  where id=target_item
  for update;
  if not found then
    raise exception 'ITEM_NOT_FOUND' using errcode='P0002';
  end if;
  if not private.is_inventory_manager(item_row.organization_id) then
    raise exception 'INVENTORY_FORBIDDEN' using errcode='42501';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(item_row.organization_id::text || ':' || p_request_key::text, 0)
  );

  if linked_operation is not null and (
    not private.can_access_operation(linked_operation) or not exists (
      select 1 from public.operation_participants op
      where op.operation_id=linked_operation
        and op.organization_id=item_row.organization_id
        and op.status='accepted'
    )
  ) then
    raise exception 'OPERATION_ORGANIZATION_MISMATCH' using errcode='42501';
  end if;

  select * into result_row
  from public.inventory_movements
  where organization_id=item_row.organization_id and request_key=p_request_key;
  if found then
    if result_row.item_id <> target_item
       or result_row.movement_type <> movement
       or result_row.quantity <> amount
       or result_row.note <> trim(explanation)
       or result_row.operation_id is distinct from linked_operation
       or result_row.created_by <> caller then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode='22023';
    end if;
    return result_row;
  end if;

  select coalesce(sum(case when movement_type='out' then -quantity else quantity end),0)
    into on_hand
  from public.inventory_movements
  where item_id=target_item;

  select coalesce(sum(quantity),0)
    into reserved
  from public.inventory_reservations
  where item_id=target_item and status='reserved';

  if movement='out' and amount > on_hand-reserved then
    raise exception 'INSUFFICIENT_AVAILABLE_STOCK' using errcode='23514';
  end if;
  if movement='adjustment' and amount < 0 then
    raise exception 'INVALID_ADJUSTMENT' using errcode='22023';
  end if;

  insert into public.inventory_movements(
    item_id,organization_id,movement_type,quantity,note,
    operation_id,created_by,request_key
  )
  values(
    target_item,item_row.organization_id,movement,amount,trim(explanation),
    linked_operation,caller,p_request_key
  )
  returning * into result_row;

  return result_row;
end;
$function$;

create or replace function public.reserve_inventory_item(
  target_item uuid, target_operation uuid, amount numeric,
  p_request_key uuid
) returns public.inventory_reservations
language plpgsql security definer
set search_path = ''
as $function$
declare
  caller uuid := (select auth.uid());
  item_row public.inventory_items;
  on_hand numeric(14,3);
  reserved numeric(14,3);
  result_row public.inventory_reservations;
begin
  if caller is null then
    raise exception 'AUTH_REQUIRED' using errcode='42501';
  end if;
  if target_item is null or target_operation is null
     or amount is null or amount <= 0 or amount <> round(amount,3)
     or p_request_key is null then
    raise exception 'INVALID_RESERVATION' using errcode='22023';
  end if;

  select * into item_row
  from public.inventory_items
  where id=target_item and active;
  if not found then
    raise exception 'ITEM_NOT_AVAILABLE' using errcode='P0002';
  end if;
  if not private.is_inventory_manager(item_row.organization_id) then
    raise exception 'INVENTORY_FORBIDDEN' using errcode='42501';
  end if;

  select * into item_row
  from public.inventory_items
  where id=target_item and active
  for update;
  if not found then
    raise exception 'ITEM_NOT_AVAILABLE' using errcode='P0002';
  end if;
  if not private.is_inventory_manager(item_row.organization_id) then
    raise exception 'INVENTORY_FORBIDDEN' using errcode='42501';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(item_row.organization_id::text || ':' || p_request_key::text, 0)
  );

  if not private.can_access_operation(target_operation) or not exists (
    select 1 from public.operation_participants op
    where op.operation_id=target_operation
      and op.organization_id=item_row.organization_id
      and op.status='accepted'
  ) then
    raise exception 'OPERATION_ORGANIZATION_MISMATCH' using errcode='42501';
  end if;

  select * into result_row
  from public.inventory_reservations
  where organization_id=item_row.organization_id and request_key=p_request_key;
  if found then
    if result_row.item_id <> target_item
       or result_row.operation_id <> target_operation
       or result_row.quantity <> amount
       or result_row.created_by <> caller then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode='22023';
    end if;
    return result_row;
  end if;

  select coalesce(sum(case when movement_type='out' then -quantity else quantity end),0)
    into on_hand
  from public.inventory_movements
  where item_id=target_item;

  select coalesce(sum(quantity),0)
    into reserved
  from public.inventory_reservations
  where item_id=target_item and status='reserved';

  if amount > on_hand-reserved then
    raise exception 'INSUFFICIENT_AVAILABLE_STOCK' using errcode='23514';
  end if;

  insert into public.inventory_reservations(
    item_id,organization_id,operation_id,quantity,created_by,request_key
  )
  values(
    target_item,item_row.organization_id,target_operation,amount,caller,p_request_key
  )
  returning * into result_row;

  return result_row;
end;
$function$;

revoke all on function public.record_inventory_movement(uuid,text,numeric,text,uuid,uuid) from public, anon;
revoke all on function public.reserve_inventory_item(uuid,uuid,numeric,uuid) from public, anon;
grant execute on function public.record_inventory_movement(uuid,text,numeric,text,uuid,uuid) to authenticated;
grant execute on function public.reserve_inventory_item(uuid,uuid,numeric,uuid) to authenticated;

commit;
