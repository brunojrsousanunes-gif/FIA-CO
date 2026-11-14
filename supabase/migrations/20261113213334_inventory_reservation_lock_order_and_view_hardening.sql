begin;

-- Lock order for all inventory write paths: item first, reservation second.
-- This matches reserve_inventory_item() and record_inventory_movement().
create or replace function public.release_inventory_reservation(
  target_reservation uuid, final_status text
) returns public.inventory_reservations
language plpgsql security definer
set search_path = ''
as $$
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
  if final_status is null or final_status not in ('released','fulfilled') then
    raise exception 'INVALID_RESERVATION_STATUS' using errcode='22023';
  end if;

  -- Read identifiers without locking the reservation. Every writer locks item
  -- before reservation, avoiding the previous reservation->item inversion.
  select r.item_id, r.organization_id
    into expected_item_id, expected_org_id
  from public.inventory_reservations r
  where r.id = target_reservation;

  if not found then
    raise exception 'RESERVATION_NOT_FOUND' using errcode='P0002';
  end if;

  if not private.is_inventory_manager(expected_org_id) then
    raise exception 'INVENTORY_FORBIDDEN' using errcode='42501';
  end if;

  select * into item_row
  from public.inventory_items i
  where i.id = expected_item_id
    and i.organization_id = expected_org_id
  for update;

  if not found then
    raise exception 'INVENTORY_ITEM_NOT_FOUND' using errcode='P0002';
  end if;

  select * into reservation_row
  from public.inventory_reservations r
  where r.id = target_reservation
  for update;

  if not found
     or reservation_row.item_id <> expected_item_id
     or reservation_row.organization_id <> expected_org_id then
    raise exception 'RESERVATION_CHANGED_RETRY' using errcode='40001';
  end if;

  if reservation_row.status <> 'reserved' then
    raise exception 'RESERVATION_ALREADY_CLOSED' using errcode='23514';
  end if;

  if final_status = 'fulfilled' then
    insert into public.inventory_movements (
      item_id, organization_id, movement_type, quantity, note,
      operation_id, created_by, request_key
    ) values (
      reservation_row.item_id, reservation_row.organization_id, 'out',
      reservation_row.quantity,
      'Salida por cumplimiento de reserva ' || reservation_row.id::text,
      reservation_row.operation_id, caller, gen_random_uuid()
    );
  end if;

  update public.inventory_reservations
  set status = final_status, updated_at = now()
  where id = target_reservation
  returning * into reservation_row;

  return reservation_row;
end;
$$;

revoke all on function public.release_inventory_reservation(uuid,text) from public, anon;
grant execute on function public.release_inventory_reservation(uuid,text) to authenticated;

-- Keep the stock view private to signed-in sessions; RLS remains enforced
-- through security_invoker=true on the view.
revoke all on table public.inventory_stock from public, anon, authenticated;
grant select on table public.inventory_stock to authenticated;

commit;
