\set ON_ERROR_STOP on

-- Isolated CI fixture: seller-owned operation, one direct cost and one
-- logistics quote. The trigger must keep both financial projections in sync.
do $financial_recalculation_trigger_contract$
begin
  if not exists (
    select 1 from pg_trigger
    where tgrelid='public.operation_cost_items'::regclass
      and tgname='operation_cost_items_recalculate'
      and tgfoid='private.after_financial_change()'::regprocedure
      and not tgisinternal
  ) then
    raise exception 'OPERATION_COST_RECALCULATION_TRIGGER_MISSING';
  end if;
  if not exists (
    select 1 from pg_trigger
    where tgrelid='public.logistics_quotes'::regclass
      and tgname='logistics_quotes_recalculate'
      and tgfoid='private.after_financial_change()'::regprocedure
      and not tgisinternal
  ) then
    raise exception 'LOGISTICS_QUOTE_RECALCULATION_TRIGGER_MISSING';
  end if;
end
$financial_recalculation_trigger_contract$;

set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';

insert into public.operations
  (id,reference,title,status,amount_cents,created_by,owner_organization_id,margin_floor_cents)
values
  ('80000000-0000-0000-0000-000000000001',
   'FIA-FIN-CI-0001','Control financiero CI','accepted',100000,
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001',20000);

insert into public.operation_cost_items
  (id,operation_id,category,label,amount_cents,currency,created_by,organization_id)
values
  ('81000000-0000-0000-0000-000000000001',
   '80000000-0000-0000-0000-000000000001',
   'service','Coste directo de prueba',30000,'EUR',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001');

do $cost_only_margin$
begin
  if not exists (
    select 1 from public.operation_financials
    where operation_id='80000000-0000-0000-0000-000000000001'
      and organization_id='20000000-0000-0000-0000-000000000001'
      and amount_cents=100000 and total_cost_cents=30000
      and calculated_margin_cents=70000 and margin_status='ok'
  ) then raise exception 'DIRECT_COST_DID_NOT_RECALCULATE_MARGIN'; end if;
end
$cost_only_margin$;

insert into public.logistics_quotes
  (id,operation_id,provider_organization_id,label,amount_cents,currency,eta_days,status,created_by)
values
  ('82000000-0000-0000-0000-000000000001',
   '80000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000005',
   'Transporte de prueba',20000,'EUR',2,'offered',
   '10000000-0000-0000-0000-000000000003');

update public.logistics_quotes
set status='selected'
where id='82000000-0000-0000-0000-000000000001';

do $selected_quote_margin$
begin
  if not exists (
    select 1 from public.operation_financials
    where operation_id='80000000-0000-0000-0000-000000000001'
      and organization_id='20000000-0000-0000-0000-000000000001'
      and total_cost_cents=50000 and calculated_margin_cents=50000
      and margin_status='ok'
  ) then raise exception 'SELECTED_LOGISTICS_QUOTE_NOT_INCLUDED_IN_MARGIN'; end if;
end
$selected_quote_margin$;

-- Crossing the protected floor must block an active operation and preserve
-- the prior state so that it can be restored when the cost is corrected.
update public.logistics_quotes
set amount_cents=60000
where id='82000000-0000-0000-0000-000000000001';

do $margin_floor_block$
begin
  if not exists (
    select 1 from public.operation_financials
    where operation_id='80000000-0000-0000-0000-000000000001'
      and total_cost_cents=90000 and calculated_margin_cents=10000
      and margin_status='blocked'
  ) then raise exception 'MARGIN_FLOOR_BREACH_NOT_RECORDED'; end if;
  if not exists (
    select 1 from public.operations
    where id='80000000-0000-0000-0000-000000000001'
      and status='blocked' and status_before_block='accepted'
  ) then raise exception 'MARGIN_FLOOR_BREACH_DID_NOT_BLOCK_OPERATION'; end if;
end
$margin_floor_block$;

update public.logistics_quotes
set amount_cents=20000
where id='82000000-0000-0000-0000-000000000001';

do $margin_floor_recovery$
begin
  if not exists (
    select 1 from public.operation_financials
    where operation_id='80000000-0000-0000-0000-000000000001'
      and total_cost_cents=50000 and calculated_margin_cents=50000
      and margin_status='ok'
  ) then raise exception 'CORRECTED_MARGIN_NOT_RECALCULATED'; end if;
  if not exists (
    select 1 from public.operations
    where id='80000000-0000-0000-0000-000000000001'
      and status='accepted' and status_before_block is null
  ) then raise exception 'OPERATION_STATE_NOT_RESTORED_AFTER_MARGIN_RECOVERY'; end if;
end
$margin_floor_recovery$;

delete from public.operation_cost_items
where id='81000000-0000-0000-0000-000000000001';

do $financial_delete_recalculation$
begin
  if not exists (
    select 1 from public.operation_financials
    where operation_id='80000000-0000-0000-0000-000000000001'
      and total_cost_cents=20000 and calculated_margin_cents=80000
      and margin_status='ok'
  ) then raise exception 'DELETED_COST_NOT_REMOVED_FROM_MARGIN'; end if;
  if (select count(*) from public.operation_audit_events
      where operation_id='80000000-0000-0000-0000-000000000001'
        and event_type='finance.recalculated') <> 6 then
    raise exception 'FINANCIAL_RECALCULATION_AUDIT_EVENT_COUNT_INCORRECT';
  end if;
end
$financial_delete_recalculation$;

select 'FINANCIAL TRIGGERS + COSTS + MARGIN FLOOR + RECOVERY + AUDIT: PASS' as result;
