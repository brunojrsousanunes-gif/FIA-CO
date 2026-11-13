\set ON_ERROR_STOP on
-- Seed two real organizations and one accepted operation participant after
-- applying the complete repository migration chain.
insert into auth.users(id) values
 ('10000000-0000-0000-0000-000000000001'),
 ('10000000-0000-0000-0000-000000000002');

insert into public.organizations(id,name,status) values
 ('20000000-0000-0000-0000-000000000001','Empresa Uno','active'),
 ('20000000-0000-0000-0000-000000000002','Empresa Dos','active');

insert into public.organization_members(organization_id,user_id,member_role,status) values
 ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','manager','active'),
 ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','manager','active');

insert into public.operations(id,reference,title,status,created_by) values
 ('30000000-0000-0000-0000-000000000001','FIA-INV-0001','Operación inventario','accepted','10000000-0000-0000-0000-000000000001');

insert into public.operation_participants(operation_id,organization_id,participant_role,status,invited_by,accepted_by,accepted_at)
values ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','seller','accepted',
 '10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',now());

set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set role authenticated;
insert into public.inventory_items(id,organization_id,sku,description,created_by)
values ('40000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','SKU-1','Material de prueba','10000000-0000-0000-0000-000000000001');
insert into public.inventory_items(id,organization_id,sku,description,created_by)
values ('40000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','SKU-2','Segundo material','10000000-0000-0000-0000-000000000001');

select public.record_inventory_movement(
 '40000000-0000-0000-0000-000000000001','in',10,'Entrada inicial',
 '50000000-0000-0000-0000-000000000001',null);
select public.reserve_inventory_item(
 '40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',4,
 '50000000-0000-0000-0000-000000000002');

-- Same request key and same payload must return the original row without duplicating it.
select public.record_inventory_movement(
 '40000000-0000-0000-0000-000000000001','in',10,'Entrada inicial',
 '50000000-0000-0000-0000-000000000001',null);
do $$
begin
 if (select count(*) from public.inventory_movements where request_key='50000000-0000-0000-0000-000000000001') <> 1 then
   raise exception 'IDEMPOTENT_RETRY_DUPLICATED_MOVEMENT';
 end if;
 begin
  perform public.reserve_inventory_item(
   '40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',7,
   '50000000-0000-0000-0000-000000000003');
  raise exception 'OVER_RESERVATION_WAS_ALLOWED';
 exception when check_violation then
  if sqlerrm <> 'INSUFFICIENT_AVAILABLE_STOCK' then raise; end if;
 end;
 begin
  perform public.record_inventory_movement(
   '40000000-0000-0000-0000-000000000001','out',7,'Salida excesiva',
   '50000000-0000-0000-0000-000000000004',null);
  raise exception 'OVER_WITHDRAWAL_WAS_ALLOWED';
 exception when check_violation then
  if sqlerrm <> 'INSUFFICIENT_AVAILABLE_STOCK' then raise; end if;
 end;
end $$;

do $$
begin
 if (select count(*) from public.inventory_items) <> 2 then
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
 if (select count(*) from public.inventory_reservations) <> 0 then
   raise exception 'CROSS_ORG_RESERVATION_LEAK';
 end if;
end $$;
reset role;

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
 begin
  perform public.record_inventory_movement(
   '40000000-0000-0000-0000-000000000002','in',10,'Entrada inicial',
   '50000000-0000-0000-0000-000000000001',null);
  raise exception 'CROSS_ITEM_IDEMPOTENCY_CHECK_FAILED';
 exception when sqlstate '22023' then
  if sqlerrm <> 'IDEMPOTENCY_KEY_REUSED' then raise; end if;
 end;
end $$;
reset role;
select 'FULL MIGRATION CHAIN + INVENTORY POSTGRESQL TESTS: PASS' as result;


-- Incident resolution guard: authorized resolver may resolve once, but cannot
-- rewrite the incident's identity/scope or reopen it afterwards.
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set role authenticated;
insert into public.operation_incidents
 (id,operation_id,incident_type,description,status,blocks_progress,opened_by)
values
 ('60000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  'delivery_delay','Incidencia de prueba','open',true,
  '10000000-0000-0000-0000-000000000001');

update public.operation_incidents
set status='resolved',
    resolved_by='10000000-0000-0000-0000-000000000001',
    resolved_at=now(),
    resolution_note='Resuelta en prueba'
where id='60000000-0000-0000-0000-000000000001';

do $$
begin
  begin
    update public.operation_incidents
    set description='Texto manipulado'
    where id='60000000-0000-0000-0000-000000000001';
    raise exception 'RESOLVED_INCIDENT_WAS_MUTABLE';
  exception when insufficient_privilege then
    if sqlerrm <> 'INCIDENT_IDENTITY_IMMUTABLE' then raise; end if;
  end;
  begin
    update public.operation_incidents
    set status='open'
    where id='60000000-0000-0000-0000-000000000001';
    raise exception 'RESOLVED_INCIDENT_WAS_REOPENED';
  exception when insufficient_privilege then
    if sqlerrm <> 'INCIDENT_TRANSITION_NOT_ALLOWED' then raise; end if;
  end;
  if (select count(*) from public.operation_incidents
      where id='60000000-0000-0000-0000-000000000001'
        and status='resolved'
        and description='Incidencia de prueba') <> 1 then
    raise exception 'INCIDENT_RESOLUTION_STATE_INVALID';
  end if;
end $$;
reset role;
select 'FULL MIGRATION CHAIN + INVENTORY + INCIDENT GUARD TESTS: PASS' as result;
