\set ON_ERROR_STOP on
-- Seed seller, buyer and carrier organizations plus their authenticated members
-- after applying the complete repository migration chain.
insert into auth.users(id) values
 ('10000000-0000-0000-0000-000000000001'),
 ('10000000-0000-0000-0000-000000000002'),
 ('10000000-0000-0000-0000-000000000003'),
 ('10000000-0000-0000-0000-000000000004');

insert into public.organizations(id,name,status) values
 ('20000000-0000-0000-0000-000000000001','Empresa Uno','active'),
 ('20000000-0000-0000-0000-000000000002','Empresa Dos','active'),
 ('20000000-0000-0000-0000-000000000003','Empresa Transportista','active');

insert into public.organization_members(organization_id,user_id,member_role,status) values
 ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','ceo','active'),
 ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','manager','active'),
 ('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003','manager','active');

insert into public.operations(id,reference,title,status,created_by,owner_organization_id) values
 ('30000000-0000-0000-0000-000000000001','FIA-INV-0001','Operación inventario','accepted','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001');

insert into public.operation_participants(operation_id,organization_id,participant_role,status,invited_by,accepted_by,accepted_at)
values
 ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','seller','accepted',
  '10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',now()),
 ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','buyer','accepted',
  '10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002',now()),
 ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003','carrier','invited',
  '10000000-0000-0000-0000-000000000001',null,null);

-- An invited carrier cannot submit an offer until the invitation is accepted.
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';
set role authenticated;
do $logistics_quote_invited_carrier_guard$
begin
  begin
    insert into public.logistics_quotes
      (id,operation_id,provider_organization_id,label,amount_cents,currency,eta_days,status,created_by)
    values
      ('41000000-0000-0000-0000-000000000099','30000000-0000-0000-0000-000000000001',
       '20000000-0000-0000-0000-000000000003','Oferta antes de aceptar',10000,'EUR',2,'offered',
       '10000000-0000-0000-0000-000000000003');
    raise exception 'INVITED_CARRIER_SUBMITTED_LOGISTICS_QUOTE';
  exception when insufficient_privilege then
    null;
  end;
end
$logistics_quote_invited_carrier_guard$;
reset role;
update public.operation_participants
set status='accepted',accepted_by='10000000-0000-0000-0000-000000000003',accepted_at=now()
where operation_id='30000000-0000-0000-0000-000000000001'
  and organization_id='20000000-0000-0000-0000-000000000003'
  and participant_role='carrier';

set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';
set role authenticated;

-- Logistics quote selection is serialized and idempotent. The same key may
-- replay only the same quote; reusing it for another quote must fail.
insert into public.logistics_quotes
 (id,operation_id,provider_organization_id,label,amount_cents,currency,eta_days,status,created_by)
values
 ('41000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000003','Oferta uno',12000,'EUR',3,'offered',
  '10000000-0000-0000-0000-000000000003'),
 ('41000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000003','Oferta dos',15000,'EUR',2,'offered',
  '10000000-0000-0000-0000-000000000003'),
 ('41000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000003','Oferta tres',17000,'EUR',4,'offered',
  '10000000-0000-0000-0000-000000000003'),
 ('41000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000003','Oferta cuatro',19000,'EUR',5,'offered',
  '10000000-0000-0000-0000-000000000003');

do $logistics_quote_insert_guard$
begin
  begin
    insert into public.logistics_quotes
      (id,operation_id,provider_organization_id,label,amount_cents,currency,eta_days,status,created_by)
    values
      ('41000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000001',
       '20000000-0000-0000-0000-000000000003','Oferta no autorizada',18000,'EUR',1,'selected',
       '10000000-0000-0000-0000-000000000003');
    raise exception 'LOGISTICS_QUOTE_DIRECT_SELECTED_INSERT_WAS_ALLOWED';
  exception when insufficient_privilege then
    null;
  end;
end
$logistics_quote_insert_guard$;

do $logistics_quote_carrier_identity_guard$
begin
  begin
    insert into public.logistics_quotes
      (id,operation_id,provider_organization_id,label,amount_cents,currency,status,created_by)
    values ('41000000-0000-0000-0000-000000000008','30000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000001','Proveedor no transportista',10000,'EUR','offered',
      '10000000-0000-0000-0000-000000000003');
    raise exception 'CARRIER_SUBMITTED_QUOTE_FOR_WRONG_ORGANIZATION';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.logistics_quotes
      (id,operation_id,provider_organization_id,label,amount_cents,currency,status,created_by)
    values ('41000000-0000-0000-0000-000000000009','30000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000003','Identidad de creador falsificada',10000,'EUR','offered',
      '10000000-0000-0000-0000-000000000001');
    raise exception 'CARRIER_FORGED_LOGISTICS_QUOTE_CREATOR';
  exception when insufficient_privilege then null;
  end;
end
$logistics_quote_carrier_identity_guard$;

reset role;
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set role authenticated;
do $logistics_quote_seller_guard$
begin
  begin
    insert into public.logistics_quotes
      (id,operation_id,provider_organization_id,label,amount_cents,currency,status,created_by)
    values ('41000000-0000-0000-0000-000000000006','30000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000003','Oferta suplantada por vendedor',10000,'EUR','offered',
      '10000000-0000-0000-0000-000000000001');
    raise exception 'SELLER_SUBMITTED_CARRIER_LOGISTICS_QUOTE';
  exception when insufficient_privilege then null;
  end;
end
$logistics_quote_seller_guard$;
reset role;
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set role authenticated;
do $logistics_quote_buyer_guard$
begin
  begin
    insert into public.logistics_quotes
      (id,operation_id,provider_organization_id,label,amount_cents,currency,status,created_by)
    values ('41000000-0000-0000-0000-000000000007','30000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000003','Oferta suplantada por comprador',10000,'EUR','offered',
      '10000000-0000-0000-0000-000000000002');
    raise exception 'BUYER_SUBMITTED_CARRIER_LOGISTICS_QUOTE';
  exception when insufficient_privilege then null;
  end;
end
$logistics_quote_buyer_guard$;
reset role;
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
do $logistics_quote_policy_contract$
declare
  fn_config text;
begin
  if not has_function_privilege('authenticated','private.can_submit_logistics_quote(uuid,uuid)','EXECUTE')
     or has_function_privilege('anon','private.can_submit_logistics_quote(uuid,uuid)','EXECUTE') then
    raise exception 'CARRIER_QUOTE_AUTHORIZATION_HELPER_GRANTS_INCORRECT';
  end if;
  if not has_table_privilege('authenticated','public.logistics_quotes','INSERT') then
    raise exception 'CARRIER_QUOTE_INSERT_TABLE_GRANT_MISSING';
  end if;
  if exists (select 1 from pg_policies
             where schemaname='public' and tablename='logistics_quotes'
               and policyname='logistics_quotes_creator_insert')
     or not exists (select 1 from pg_policies
                    where schemaname='public' and tablename='logistics_quotes'
                      and policyname='logistics_quotes_carrier_submit'
                      and cmd='INSERT') then
    raise exception 'LOGISTICS_QUOTE_CARRIER_POLICY_NOT_INSTALLED';
  end if;
  select array_to_string(proconfig,',') into fn_config
  from pg_proc where oid='private.can_submit_logistics_quote(uuid,uuid)'::regprocedure;
  if fn_config not like '%search_path=""%' then
    raise exception 'CARRIER_QUOTE_AUTHORIZATION_SEARCH_PATH_NOT_EMPTY';
  end if;
end
$logistics_quote_policy_contract$;

reset role;
update public.logistics_quotes set status='rejected'
where id='41000000-0000-0000-0000-000000000003';
set role authenticated;
do $logistics_quote_status_guard$
begin
  begin
    perform public.select_logistics_quote(
      '41000000-0000-0000-0000-000000000003',
      '51000000-0000-0000-0000-000000000003');
    raise exception 'LOGISTICS_QUOTE_REJECTED_STATE_WAS_SELECTABLE';
  exception when invalid_parameter_value then
    if sqlerrm <> 'QUOTE_NOT_SELECTABLE' then raise; end if;
  end;
end
$logistics_quote_status_guard$;

select public.select_logistics_quote(
 '41000000-0000-0000-0000-000000000001',
 '51000000-0000-0000-0000-000000000001');
select public.select_logistics_quote(
 '41000000-0000-0000-0000-000000000002',
 '51000000-0000-0000-0000-000000000002');
select public.select_logistics_quote(
 '41000000-0000-0000-0000-000000000002',
 '51000000-0000-0000-0000-000000000002');

-- Audit rows are intentionally not directly readable by authenticated. Inspect the
-- internal event count as the database owner while checking explicit grants below.
reset role;
do $logistics_quote_selection_idempotency$
begin
 if (select count(*) from public.operation_audit_events
     where operation_id='30000000-0000-0000-0000-000000000001'
       and request_id='51000000-0000-0000-0000-000000000002') <> 1 then
   raise exception 'LOGISTICS_QUOTE_RETRY_DUPLICATED_AUDIT_EVENT';
 end if;
 if (select status from public.logistics_quotes
     where id='41000000-0000-0000-0000-000000000002') <> 'selected'
    or (select status from public.logistics_quotes
     where id='41000000-0000-0000-0000-000000000001') <> 'offered' then
   raise exception 'LOGISTICS_QUOTE_SELECTION_STATE_INCORRECT';
 end if;

 begin
  perform public.select_logistics_quote(
   '41000000-0000-0000-0000-000000000001',
   '51000000-0000-0000-0000-000000000002');
  raise exception 'LOGISTICS_QUOTE_IDEMPOTENCY_KEY_REUSED_FOR_OTHER_QUOTE';
 exception when invalid_parameter_value then
  if sqlerrm <> 'IDEMPOTENCY_KEY_REUSED' then raise; end if;
 end;

 begin
  perform public.select_logistics_quote(
   '41000000-0000-0000-0000-000000000001',null);
  raise exception 'LOGISTICS_QUOTE_ACCEPTED_NULL_REQUEST_KEY';
 exception when sqlstate '22023' then
  if sqlerrm <> 'REQUEST_KEY_REQUIRED' then raise; end if;
 end;

 if has_column_privilege('authenticated','public.logistics_quotes','amount_cents','UPDATE')
    or has_column_privilege('authenticated','public.logistics_quotes','provider_organization_id','UPDATE')
    or has_column_privilege('authenticated','public.logistics_quotes','operation_id','UPDATE') then
   raise exception 'LOGISTICS_QUOTE_SENSITIVE_COLUMNS_DIRECTLY_UPDATABLE';
 end if;
 if has_any_column_privilege('authenticated','public.logistics_quotes','UPDATE') then
   raise exception 'LOGISTICS_QUOTE_DIRECT_UPDATE_PRIVILEGE_REMAINS';
 end if;
end
$logistics_quote_selection_idempotency$;
reset role;

-- Deletion is serialized before the quote row, audited and idempotent.
set role authenticated;
select public.delete_logistics_quote(
 '41000000-0000-0000-0000-000000000001',
 '52000000-0000-0000-0000-000000000001');
select public.delete_logistics_quote(
 '41000000-0000-0000-0000-000000000001',
 '52000000-0000-0000-0000-000000000001');

do $logistics_quote_delete_guards$
begin
  begin
    perform public.delete_logistics_quote(
      '41000000-0000-0000-0000-000000000004',
      '52000000-0000-0000-0000-000000000001');
    raise exception 'LOGISTICS_QUOTE_DELETE_KEY_REUSE_WAS_ALLOWED';
  exception when invalid_parameter_value then
    if sqlerrm <> 'IDEMPOTENCY_KEY_REUSED' then raise; end if;
  end;

  begin
    perform public.delete_logistics_quote(
      '41000000-0000-0000-0000-000000000002',
      '52000000-0000-0000-0000-000000000002');
    raise exception 'LOGISTICS_QUOTE_SELECTED_DELETE_WAS_ALLOWED';
  exception when invalid_parameter_value then
    if sqlerrm <> 'QUOTE_SELECTED_CANNOT_DELETE' then raise; end if;
  end;

  begin
    delete from public.logistics_quotes
    where id='41000000-0000-0000-0000-000000000004';
    raise exception 'LOGISTICS_QUOTE_DIRECT_DELETE_WAS_ALLOWED';
  exception when insufficient_privilege then
    null;
  end;
end
$logistics_quote_delete_guards$;

reset role;
do $logistics_quote_delete_audit$
begin
  if exists (select 1 from public.logistics_quotes
             where id='41000000-0000-0000-0000-000000000001') then
    raise exception 'LOGISTICS_QUOTE_DELETE_DID_NOT_REMOVE_TARGET';
  end if;
  if (select count(*) from public.operation_audit_events
      where operation_id='30000000-0000-0000-0000-000000000001'
        and request_id='52000000-0000-0000-0000-000000000001'
        and event_type='logistics.quote.deleted') <> 1 then
    raise exception 'LOGISTICS_QUOTE_DELETE_AUDIT_NOT_IDEMPOTENT';
  end if;
  if not exists (select 1 from public.logistics_quotes
                 where id='41000000-0000-0000-0000-000000000004') then
    raise exception 'LOGISTICS_QUOTE_REUSED_KEY_DELETED_OTHER_QUOTE';
  end if;
  if has_table_privilege('authenticated','public.logistics_quotes','DELETE') then
    raise exception 'LOGISTICS_QUOTE_DIRECT_DELETE_PRIVILEGE_REMAINS';
  end if;
  if not has_table_privilege('authenticated','public.operation_cost_items','DELETE') then
    raise exception 'OPERATION_COST_ITEM_DELETE_PERMISSION_REMOVED';
  end if;
  if not has_function_privilege('authenticated','public.delete_logistics_quote(uuid,uuid)','EXECUTE')
     or has_function_privilege('anon','public.delete_logistics_quote(uuid,uuid)','EXECUTE') then
    raise exception 'LOGISTICS_QUOTE_DELETE_RPC_GRANTS_INCORRECT';
  end if;
  if not exists (select 1 from pg_policies
                 where schemaname='public' and tablename='logistics_quotes'
                   and cmd='DELETE' and policyname='logistics_quotes_creator_delete') then
    raise exception 'LOGISTICS_QUOTE_DELETE_RLS_POLICY_REMOVED';
  end if;
end
$logistics_quote_delete_audit$;

-- A different organization member cannot delete a quote from this operation.
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set role authenticated;
do $logistics_quote_delete_authorization$
begin
  begin
    perform public.delete_logistics_quote(
      '41000000-0000-0000-0000-000000000004',
      '52000000-0000-0000-0000-000000000003');
    raise exception 'LOGISTICS_QUOTE_CROSS_ORGANIZATION_DELETE_WAS_ALLOWED';
  exception when insufficient_privilege then
    null;
  end;
end
$logistics_quote_delete_authorization$;
reset role;
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';

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
 begin
  insert into public.inventory_items(id,organization_id,sku,description,created_by)
  values ('40000000-0000-0000-0000-000000000099',
          '20000000-0000-0000-0000-000000000001',
          'SKU-CROSS-ORG-ATTACK','Intento de escritura entre empresas',
          '10000000-0000-0000-0000-000000000002');
  raise exception 'CROSS_ORG_ITEM_INSERT_WAS_ALLOWED';
 exception when insufficient_privilege then
  null;
 end;
end $$;
reset role;

set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set role authenticated;
select public.release_inventory_reservation(
 (select id from public.inventory_reservations where request_key='50000000-0000-0000-0000-000000000002'),
 'fulfilled');
-- Retrying the same terminal action is a no-op and must not create another stock movement.
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


-- Incident resolution guard: authorized resolver may resolve once, but cannot
-- rewrite the incident's identity/scope or reopen it afterwards.
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set role authenticated;
insert into public.operation_incidents
 (id,operation_id,incident_type,description,status,blocks_progress,opened_by)
values
 ('60000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  'logistics','Incidencia de prueba','open',true,
  '10000000-0000-0000-0000-000000000001');

do $incident_rejection$
begin
  begin
    update public.operation_incidents
    set status='resolved',
        resolved_by='10000000-0000-0000-0000-000000000002',
        resolved_at=now(),
        resolution_note='Resuelta por otro usuario'
    where id='60000000-0000-0000-0000-000000000001';
    raise exception 'INCIDENT_WRONG_RESOLVER_WAS_ACCEPTED';
  exception when insufficient_privilege then
    if sqlerrm <> 'INCIDENT_RESOLVER_MUST_BE_CALLER' then raise; end if;
  end;

  begin
    update public.operation_incidents
    set status='resolved',
        resolved_by='10000000-0000-0000-0000-000000000001',
        resolved_at=now(),
        resolution_note='  '
    where id='60000000-0000-0000-0000-000000000001';
    raise exception 'INCIDENT_EMPTY_RESOLUTION_NOTE_WAS_ACCEPTED';
  exception when invalid_parameter_value then
    if sqlerrm <> 'INCIDENT_RESOLUTION_DETAILS_REQUIRED' then raise; end if;
  end;
end $incident_rejection$;

do $incident_timestamp$
declare recorded_at timestamptz;
begin
  update public.operation_incidents
  set status='resolved',
      resolved_by='10000000-0000-0000-0000-000000000001',
      resolved_at='2099-01-01 00:00:00+00',
      resolution_note='Resuelta en prueba'
  where id='60000000-0000-0000-0000-000000000001';

  select resolved_at into recorded_at
  from public.operation_incidents
  where id='60000000-0000-0000-0000-000000000001';

  if recorded_at is distinct from statement_timestamp() then
    raise exception 'INCIDENT_RESOLUTION_TIMESTAMP_NOT_DATABASE_CONTROLLED';
  end if;
end $incident_timestamp$;

reset role;
-- Exercise the trigger itself as table owner while retaining auth.uid() for
-- the resolver identity. The authenticated role's RLS policy may hide resolved
-- rows from UPDATE, which would otherwise make a zero-row UPDATE look like a
-- trigger rejection.
do $incident_guard$
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

  begin
    update public.operation_incidents
    set resolved_by='10000000-0000-0000-0000-000000000002',
        resolved_at=now() + interval '1 day',
        resolution_note='Nota sustituida'
    where id='60000000-0000-0000-0000-000000000001';
    raise exception 'RESOLVED_INCIDENT_DETAILS_WERE_MUTABLE';
  exception when insufficient_privilege then
    if sqlerrm <> 'INCIDENT_TRANSITION_NOT_ALLOWED' then raise; end if;
  end;
  if (select count(id) from public.operation_incidents
      where id='60000000-0000-0000-0000-000000000001'
        and status='resolved'
        and description='Incidencia de prueba') <> 1 then
    raise exception 'INCIDENT_RESOLUTION_STATE_INVALID';
  end if;
end $incident_guard$;
reset role;


-- Three-party confirmation gate: invited users cannot confirm; buyer closure
-- cannot bypass a persisted buyer receipt confirmation.
reset role;
insert into public.organizations(id,name,status)
values ('20000000-0000-0000-0000-000000000003','Empresa Transportista','active');
insert into private.organization_security_profiles
 (organization_id,trust_level,verification_status,verified_controls,verified_at,valid_until,verified_by)
select id,'L3_SHARED','verified',
 jsonb_build_object(
 'organizationIdentified',true,'termsAccepted',true,'tenantBoundaryReady',true,'auditReady',true,'incidentContactDefined',true,
 'identityVerified',true,'strongAuthenticationReady',true,'secretsManaged',true,'dataMinimizationReady',true,'retentionPolicyReady',true,'securityTestsPassed',true,
 'dataPermitsReady',true,'grantExpiryReady',true,'grantRevocationReady',true,'partnerIdentityVerified',true,'purposeLimitationReady',true,'crossOrgIsolationTestsPassed',true
 ),now(),now()+interval '30 days','10000000-0000-0000-0000-000000000001'
from public.organizations where id in ('20000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003');
insert into public.organization_members(organization_id,user_id,member_role,status) values
 ('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','manager','active'),
 ('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003','ceo','active');

-- CEO / zone-manager verification and explicit L3 consent for
-- every organization participating in the shared-operation invitation test.
insert into private.organization_l3_authority_verifications
 (organization_id,user_id,authority_type,verification_status,evidence_ref,verified_by,verified_at,valid_until)
values
 ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',
  'ceo','verified','ci://inventory/ceo-1','10000000-0000-0000-0000-000000000004',now(),now()+interval '90 days'),
 ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002',
  'zone_manager','verified','ci://inventory/zone-manager-2','10000000-0000-0000-0000-000000000004',now(),now()+interval '90 days'),
 ('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003',
  'ceo','verified','ci://inventory/ceo-3','10000000-0000-0000-0000-000000000004',now(),now()+interval '90 days');

set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set role authenticated;
select public.authorize_organization_l3(
 '20000000-0000-0000-0000-000000000001',
 '50000000-0000-0000-0000-000000000021',now()+interval '30 days');
reset role;

set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set role authenticated;
select public.authorize_organization_l3(
 '20000000-0000-0000-0000-000000000002',
 '50000000-0000-0000-0000-000000000022',now()+interval '30 days');
reset role;

set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';
set role authenticated;
select public.authorize_organization_l3(
 '20000000-0000-0000-0000-000000000003',
 '50000000-0000-0000-0000-000000000023',now()+interval '30 days');
reset role;

-- The creator can invite three L3 organizations before their users accept,
-- and can still cancel an invitation if a trust check later expires.
insert into public.operations(id,reference,title,status,created_by,owner_organization_id)
values ('30000000-0000-0000-0000-000000000002','FIA-INV-0002','Operación de invitación','draft',
        '10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001');
insert into public.operation_participants
 (operation_id,organization_id,participant_role,status,invited_by)
values
 ('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','seller','invited','10000000-0000-0000-0000-000000000001'),
 ('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','buyer','invited','10000000-0000-0000-0000-000000000001'),
 ('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003','carrier','invited','10000000-0000-0000-0000-000000000001');
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set role authenticated;
select public.transition_operation(
 '30000000-0000-0000-0000-000000000002','invited',1,
 '50000000-0000-0000-0000-000000000012');
do $invitation_transition$
begin
 if (select status from public.operations where id='30000000-0000-0000-0000-000000000002') <> 'invited' then
   raise exception 'L3_INVITATION_TRANSITION_FAILED';
 end if;
end $invitation_transition$;
reset role;

update private.organization_security_profiles set trust_level='L2_VERIFIED'
where organization_id='20000000-0000-0000-0000-000000000003';
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set role authenticated;
select public.transition_operation(
 '30000000-0000-0000-0000-000000000002','cancelled',2,
 '50000000-0000-0000-0000-000000000013');
do $invitation_cancellation$
begin
 if (select status from public.operations where id='30000000-0000-0000-0000-000000000002') <> 'cancelled' then
   raise exception 'INVITATION_CANCELLATION_BLOCKED_BY_TRUST_GATE';
 end if;
end $invitation_cancellation$;
reset role;
update private.organization_security_profiles set trust_level='L3_SHARED'
where organization_id='20000000-0000-0000-0000-000000000003';

insert into public.operation_participants
 (operation_id,organization_id,participant_role,status,invited_by,accepted_by,accepted_at)
values
 ('30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002','buyer','invited',
  '10000000-0000-0000-0000-000000000001',null,null),
 ('30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000003','carrier','invited',
  '10000000-0000-0000-0000-000000000001',null,null);

set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set role authenticated;
do $confirmation_gate$
begin
  begin
    insert into public.operation_confirmations
      (operation_id,participant_role,confirmation_type,confirmed_by)
    values
      ('30000000-0000-0000-0000-000000000001','buyer','receipt',
       '10000000-0000-0000-0000-000000000002');
    raise exception 'INVITED_BUYER_CONFIRMATION_WAS_ACCEPTED';
  exception when insufficient_privilege then
    null;
  end;
end $confirmation_gate$;
reset role;

-- Each role is accepted by a different authenticated account.
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set role authenticated;
select public.accept_operation_invitation(
 '30000000-0000-0000-0000-000000000001','buyer',
 '50000000-0000-0000-0000-000000000009');
reset role;

set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';
set role authenticated;
select public.accept_operation_invitation(
 '30000000-0000-0000-0000-000000000001','carrier',
 '50000000-0000-0000-0000-000000000016');
reset role;

do $three_distinct_role_acceptors$
begin
  if (select count(distinct accepted_by)
      from public.operation_participants
      where operation_id='30000000-0000-0000-0000-000000000001'
        and status='accepted') <> 3 then
    raise exception 'THREE_DISTINCT_ROLE_ACCEPTORS_REQUIRED';
  end if;
end
$three_distinct_role_acceptors$;
-- L2 is insufficient for cross-company confirmations.
reset role;
update private.organization_security_profiles set trust_level='L2_VERIFIED'
where organization_id='20000000-0000-0000-0000-000000000002';
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set role authenticated;
do $trust_gate$
begin
 begin
  insert into public.operation_confirmations(operation_id,participant_role,confirmation_type,confirmed_by)
  values ('30000000-0000-0000-0000-000000000001','buyer','receipt','10000000-0000-0000-0000-000000000002');
  raise exception 'L2_COMPANY_CONFIRMED_SHARED_OPERATION';
 exception when insufficient_privilege then null;
 end;
end $trust_gate$;
reset role;
update private.organization_security_profiles set trust_level='L3_SHARED'
where organization_id='20000000-0000-0000-0000-000000000002';

-- A buyer with L3 cannot confirm when another participant company is only L2.
update private.organization_security_profiles set trust_level='L2_VERIFIED'
where organization_id='20000000-0000-0000-0000-000000000003';
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set role authenticated;
do $all_participant_trust_gate$
begin
  begin
    insert into public.operation_confirmations(operation_id,participant_role,confirmation_type,confirmed_by)
    values ('30000000-0000-0000-0000-000000000001','buyer','receipt','10000000-0000-0000-0000-000000000002');
    raise exception 'L2_PARTICIPANT_COMPANY_ALLOWED_SHARED_CONFIRMATION';
  exception when insufficient_privilege then null;
  end;
end $all_participant_trust_gate$;
reset role;
update private.organization_security_profiles set trust_level='L3_SHARED'
where organization_id='20000000-0000-0000-0000-000000000003';

-- The seller account is also an active member of the carrier company,
-- but it did not accept the carrier role and must not act as the carrier.
update public.operations set status='in_transit',version=version+1
where id='30000000-0000-0000-0000-000000000001';
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set role authenticated;
do $accepted_account_gate$
begin
  begin
    perform public.transition_operation(
      '30000000-0000-0000-0000-000000000001','delivered',
      (select version from public.operations where id='30000000-0000-0000-0000-000000000001'),
      '50000000-0000-0000-0000-000000000011');
    raise exception 'NON_ACCEPTING_CARRIER_MEMBER_TRANSITION_WAS_ACCEPTED';
  exception when insufficient_privilege then
    if sqlerrm <> 'TRANSITION_NOT_ALLOWED' then raise; end if;
  end;
end $accepted_account_gate$;
reset role;

-- The distinct carrier account that accepted the role remains authorized.
-- Retry with the ORIGINAL expected_version to simulate a lost response.
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';
set role authenticated;
do $transition_idempotency_replay$
declare
  v_operation_id constant uuid := '30000000-0000-0000-0000-000000000001';
  v_request_key constant uuid := '50000000-0000-0000-0000-000000000014';
  initial_version integer;
  first_result public.operations;
  replay_result public.operations;
  audit_count_before integer;
  audit_count_after integer;
begin
  select count(*) into audit_count_before from public.operation_audit_timeline where operation_id=v_operation_id;
  select version into initial_version
  from public.operations where id=v_operation_id;

  first_result := public.transition_operation(
    v_operation_id,'delivered',initial_version,v_request_key);

  if first_result.status is distinct from 'delivered'
     or first_result.version <> initial_version + 1 then
    raise exception 'TRANSITION_FIRST_REQUEST_RESULT_INVALID';
  end if;

  -- Advance the operation after the first request. A replay of the original
  -- request must still return the original delivered/version snapshot.
  perform public.transition_operation(
    v_operation_id,'disputed',first_result.version,
    '50000000-0000-0000-0000-000000000015');

  replay_result := public.transition_operation(
    v_operation_id,'delivered',initial_version,v_request_key);

  if replay_result.status is distinct from first_result.status
     or replay_result.version <> first_result.version then
    raise exception 'TRANSITION_IDEMPOTENCY_REPLAY_CHANGED_ORIGINAL_RESULT';
  end if;

  if (select status from public.operations where id=v_operation_id) <> 'disputed' then
    raise exception 'TRANSITION_REPLAY_CHANGED_CURRENT_OPERATION_STATE';
  end if;

  select count(*) into audit_count_after from public.operation_audit_timeline
  where operation_id=v_operation_id;

  if audit_count_after <> audit_count_before + 2 then
    raise exception 'TRANSITION_IDEMPOTENCY_REPLAY_DUPLICATED_AUDIT_EVENT';
  end if;
end $transition_idempotency_replay$;

do $transition_idempotency_reuse$
begin
  begin
    perform public.transition_operation(
      '30000000-0000-0000-0000-000000000001','completed',
      (select version from public.operations where id='30000000-0000-0000-0000-000000000001'),
      '50000000-0000-0000-0000-000000000014');
    raise exception 'TRANSITION_IDEMPOTENCY_KEY_REUSE_ACCEPTED';
  exception when invalid_parameter_value then
    if sqlerrm <> 'IDEMPOTENCY_KEY_REUSED' then raise; end if;
  end;
end $transition_idempotency_reuse$;
reset role;

-- Put the operation at delivered for the closure-specific test.
update public.operations set status='delivered',version=version+1
where id='30000000-0000-0000-0000-000000000001';

set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set role authenticated;
do $completion_gate$
begin
  begin
    perform public.transition_operation(
      '30000000-0000-0000-0000-000000000001','completed',
      (select version from public.operations where id='30000000-0000-0000-0000-000000000001'),
      '50000000-0000-0000-0000-000000000010');
    raise exception 'BUYER_CLOSED_WITHOUT_RECEIPT_CONFIRMATION';
  exception when insufficient_privilege then
    if sqlerrm <> 'TRANSITION_NOT_ALLOWED' then raise; end if;
  end;
end $completion_gate$;

insert into public.operation_confirmations
 (operation_id,participant_role,confirmation_type,confirmed_by)
values
 ('30000000-0000-0000-0000-000000000001','buyer','receipt',
  '10000000-0000-0000-0000-000000000002');

do $completion_result$
begin
  if (select status from public.operations
      where id='30000000-0000-0000-0000-000000000001') <> 'completed' then
    raise exception 'BUYER_RECEIPT_DID_NOT_COMPLETE_OPERATION';
  end if;
end $completion_result$;
reset role;

-- Private role helper is an internal authorization primitive, not a client API.
do $private_role_helper_boundary$
begin
  if has_function_privilege('authenticated','private.has_operation_role(uuid,text)','EXECUTE')
     or has_function_privilege('anon','private.has_operation_role(uuid,text)','EXECUTE') then
    raise exception 'PRIVATE_ROLE_HELPER_EXECUTABLE_BY_CLIENT';
  end if;
end $private_role_helper_boundary$;

-- Trust profiles are internal security state, not part of the public API.
do $trust_profile_boundary$
begin
  if to_regclass('public.organization_security_profiles') is not null then
    raise exception 'TRUST_PROFILE_EXPOSED_IN_PUBLIC_SCHEMA';
  end if;
end $trust_profile_boundary$;

set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set role authenticated;
do $trust_profile_read$
begin
  begin
    perform count(*) from private.organization_security_profiles;
    raise exception 'AUTHENTICATED_USER_READ_PRIVATE_TRUST_PROFILE';
  exception when insufficient_privilege then
    null;
  end;
end $trust_profile_read$;
reset role;


-- Privileged RPCs that are intentionally callable by authenticated users
-- must resolve built-ins and application objects without writable search paths.
do $security_definer_search_path$
declare
  fn record;
begin
  for fn in
    select p.oid,p.proname,coalesce(array_to_string(p.proconfig,','),'') config
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and p.proname in (
        'accept_operation_invitation',
        'create_synthetic_part_recovery',
        'record_inventory_movement',
        'release_inventory_reservation',
        'reserve_inventory_item',
        'transition_operation'
      )
  loop
    if fn.config not like '%search_path=""%' then
      raise exception 'SECURITY_DEFINER_SEARCH_PATH_NOT_EMPTY:%:%',fn.proname,fn.config;
    end if;
  end loop;
end
$security_definer_search_path$;

-- Public tables must not retain anonymous access or client privileges that
-- bypass RLS / are not part of the browser application contract.
do $least_privilege_table_grants$
declare
  table_row record;
begin
  for table_row in
    select c.oid, c.relname, c.relrowsecurity
    from pg_class c
    join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind in ('r','p')
  loop
    if not table_row.relrowsecurity then
      raise exception 'PUBLIC_TABLE_WITHOUT_RLS:%',table_row.relname;
    end if;

    if has_table_privilege('anon',table_row.oid,'SELECT')
       or has_table_privilege('anon',table_row.oid,'INSERT')
       or has_table_privilege('anon',table_row.oid,'UPDATE')
       or has_table_privilege('anon',table_row.oid,'DELETE')
       or has_table_privilege('anon',table_row.oid,'TRUNCATE')
       or has_table_privilege('anon',table_row.oid,'REFERENCES')
       or has_table_privilege('anon',table_row.oid,'TRIGGER') then
      raise exception 'ANON_TABLE_PRIVILEGE_REMAINS:%',table_row.relname;
    end if;

    if has_table_privilege('authenticated',table_row.oid,'TRUNCATE')
       or has_table_privilege('authenticated',table_row.oid,'REFERENCES')
       or has_table_privilege('authenticated',table_row.oid,'TRIGGER')
 then
      raise exception 'AUTHENTICATED_DANGEROUS_TABLE_PRIVILEGE_REMAINS:%',table_row.relname;
    end if;

    if has_table_privilege('authenticated',table_row.oid,'DELETE')
       and table_row.relname <> 'operation_cost_items' then
      raise exception 'AUTHENTICATED_DELETE_WITHOUT_DELETE_POLICY:%',table_row.relname;
    end if;
  end loop;

  if has_table_privilege('authenticated','public.logistics_quotes','DELETE')
     or not has_table_privilege('authenticated','public.operation_cost_items','DELETE') then
    raise exception 'LOGISTICS_QUOTE_OR_COST_DELETE_PRIVILEGES_INCORRECT';
  end if;
  if not exists (select 1 from pg_policies
                 where schemaname='public' and tablename='logistics_quotes'
                   and cmd='DELETE' and policyname='logistics_quotes_creator_delete') then
    raise exception 'LOGISTICS_QUOTE_DELETE_RLS_POLICY_MISSING';
  end if;

  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public'
      and c.relkind='v'
      and has_table_privilege('authenticated',c.oid,'SELECT')
      and not coalesce('security_invoker=true'=any(c.reloptions),false)
  ) then
    raise exception 'PUBLIC_API_VIEW_WITHOUT_SECURITY_INVOKER';
  end if;

  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and has_function_privilege('anon',p.oid,'EXECUTE')
  ) then
    raise exception 'PUBLIC_FUNCTION_EXECUTABLE_BY_ANON';
  end if;

  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind='S'
      and (
        has_sequence_privilege('anon',c.oid,'USAGE')
        or has_sequence_privilege('anon',c.oid,'SELECT')
        or has_sequence_privilege('anon',c.oid,'UPDATE')
      )
  ) then
    raise exception 'ANON_SEQUENCE_PRIVILEGE_REMAINS';
  end if;

  if exists (
    select 1
    from pg_default_acl d
    cross join lateral aclexplode(d.defaclacl) a
    where d.defaclobjtype='S'
      and d.defaclnamespace='public'::regnamespace
      and a.grantee='anon'::regrole
  ) then
    raise exception 'UNSAFE_PUBLIC_SEQUENCE_DEFAULT_PRIVILEGES_REMAIN';
  end if;

  if exists (
    select 1
    from pg_default_acl d
    cross join lateral aclexplode(d.defaclacl) a
    where d.defaclobjtype='r'
      and d.defaclnamespace='public'::regnamespace
      and (
        a.grantee='anon'::regrole
        or (
          a.grantee='authenticated'::regrole
          and a.privilege_type in ('DELETE','TRUNCATE','REFERENCES','TRIGGER')
        )
      )
  ) then
    raise exception 'UNSAFE_PUBLIC_TABLE_DEFAULT_PRIVILEGES_REMAIN';
  end if;
end
$least_privilege_table_grants$;

select 'FULL MIGRATION CHAIN + INCIDENT + TRUST + PRIVATE PROFILE TESTS: PASS' as result;
