\set ON_ERROR_STOP on
-- User 1 creates an item, receives stock and reserves part of it.
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set role authenticated;
insert into public.inventory_items(id,organization_id,sku,description,created_by)
values ('40000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','SKU-1','Material de prueba','10000000-0000-0000-0000-000000000001');
select public.record_inventory_movement(
 '40000000-0000-0000-0000-000000000001','in',10,'Entrada inicial',
 '50000000-0000-0000-0000-000000000001',null);
select public.reserve_inventory_item(
 '40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',4,
 '50000000-0000-0000-0000-000000000002');
-- Another organization must not see this company's item.
do $$
begin
 if (select count(*) from public.inventory_items) <> 1 then
   raise exception 'OWNER_CANNOT_READ_OWN_ITEM';
 end if;
end $$;
reset role;
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set role authenticated;
do $$
begin
 if (select count(*) from public.inventory_items) <> 0 then
   raise exception 'CROSS_ORG_ITEM_LEAK';
 end if;
 if (select count(*) from public.inventory_movements) <> 0 then
   raise exception 'CROSS_ORG_MOVEMENT_LEAK';
 end if;
end $$;
reset role;
-- Owner fulfills reservation: this must create an outgoing movement atomically.
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set role authenticated;
select public.release_inventory_reservation(
 (select id from public.inventory_reservations where request_key='50000000-0000-0000-0000-000000000002'),
 'fulfilled');
do $$
declare s record;
begin
 select * into s from public.inventory_stock where item_id='40000000-0000-0000-0000-000000000001';
 if s.on_hand <> 6 or s.reserved <> 0 or s.available <> 6 then
   raise exception 'FULFILLMENT_BALANCE_WRONG: %, %, %',s.on_hand,s.reserved,s.available;
 end if;
 if (select count(*) from public.inventory_movements where movement_type='out') <> 1 then
   raise exception 'FULFILLMENT_MOVEMENT_MISSING';
 end if;
end $$;
-- Reusing an idempotency key with a different payload must fail.
do $$
begin
 begin
  perform public.record_inventory_movement(
   '40000000-0000-0000-0000-000000000001','in',9,'payload distinto',
   '50000000-0000-0000-0000-000000000001',null);
  raise exception 'IDEMPOTENCY_CHECK_FAILED';
 exception when sqlstate '22023' then
  if sqlerrm <> 'IDEMPOTENCY_KEY_REUSED' then raise; end if;
 end;
end $$;
reset role;
select 'PostgreSQL inventory integration tests: PASS' as result;
