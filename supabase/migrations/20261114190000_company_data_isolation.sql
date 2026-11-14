begin;
create or replace function private.is_org_finance_manager(target_org uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,public as $$
select (select auth.uid()) is not null and exists(select 1 from public.organization_members om
where om.organization_id=target_org and om.user_id=(select auth.uid()) and om.status='active'
and om.member_role in ('manager','admin','ceo')); $$;
revoke all on function private.is_org_finance_manager(uuid) from public,anon;
grant execute on function private.is_org_finance_manager(uuid) to authenticated;

create or replace function private.operation_owner_organization(target_operation uuid)
returns uuid language sql stable security definer set search_path=pg_catalog,public as $$
select case when count(distinct op.organization_id)=1 then min(op.organization_id::text)::uuid else null end
from public.operations o join public.operation_participants op on op.operation_id=o.id
join public.organization_members om on om.organization_id=op.organization_id and om.user_id=o.created_by
where o.id=target_operation
  and ((select auth.uid()) is null or private.can_access_operation(o.id)); $$;
revoke all on function private.operation_owner_organization(uuid) from public,anon;
grant execute on function private.operation_owner_organization(uuid) to authenticated;

alter table public.operation_cost_items add column if not exists organization_id uuid references public.organizations(id) on delete restrict;
update public.operation_cost_items ci set organization_id=private.operation_owner_organization(ci.operation_id) where ci.organization_id is null;
do $check_cost_item_ownership$ begin
if exists(select 1 from public.operation_cost_items where organization_id is null) then
raise exception 'COST_ITEM_OWNER_AMBIGUOUS: assign each existing cost item to its verified company before retrying'; end if;
end $check_cost_item_ownership$;
alter table public.operation_cost_items alter column organization_id set not null;

create or replace function private.enforce_cost_item_company()
returns trigger language plpgsql security definer
set search_path=pg_catalog,public,private as $$
declare expected_org uuid;
begin
  expected_org:=private.operation_owner_organization(new.operation_id);
  if expected_org is null then
    raise exception 'OPERATION_OWNER_ORGANIZATION_AMBIGUOUS' using errcode='23514';
  end if;
  if new.organization_id is not null and new.organization_id is distinct from expected_org then
    raise exception 'COST_ITEM_COMPANY_MISMATCH' using errcode='42501';
  end if;
  new.organization_id:=expected_org;
  return new;
end;
$$;
revoke all on function private.enforce_cost_item_company() from public,anon,authenticated;
create trigger operation_cost_items_company_guard
before insert or update of operation_id,organization_id on public.operation_cost_items
for each row execute function private.enforce_cost_item_company();

create index if not exists operation_cost_items_org_operation_idx on public.operation_cost_items(organization_id,operation_id,created_at desc);

drop policy if exists cost_items_operation_select on public.operation_cost_items;
drop policy if exists cost_items_creator_write on public.operation_cost_items;
drop policy if exists cost_items_creator_insert on public.operation_cost_items;
drop policy if exists cost_items_creator_update on public.operation_cost_items;
drop policy if exists cost_items_creator_delete on public.operation_cost_items;
create policy cost_items_company_finance_select on public.operation_cost_items for select to authenticated
using((select private.can_access_operation(operation_id)) and (select private.is_org_finance_manager(organization_id))
and organization_id=(select private.operation_owner_organization(operation_id)));
create policy cost_items_company_finance_insert on public.operation_cost_items for insert to authenticated
with check(created_by=(select auth.uid()) and organization_id=(select private.operation_owner_organization(operation_id))
and (select private.is_org_finance_manager(organization_id)) and (select private.can_manage_operation(operation_id)));
create policy cost_items_company_finance_update on public.operation_cost_items for update to authenticated
using(created_by=(select auth.uid()) and organization_id=(select private.operation_owner_organization(operation_id))
and (select private.is_org_finance_manager(organization_id)) and (select private.can_manage_operation(operation_id)))
with check(created_by=(select auth.uid()) and organization_id=(select private.operation_owner_organization(operation_id))
and (select private.is_org_finance_manager(organization_id)) and (select private.can_manage_operation(operation_id)));
create policy cost_items_company_finance_delete on public.operation_cost_items for delete to authenticated
using(created_by=(select auth.uid()) and organization_id=(select private.operation_owner_organization(operation_id))
and (select private.is_org_finance_manager(organization_id)) and (select private.can_manage_operation(operation_id)));

create table if not exists public.operation_financials(
operation_id uuid not null references public.operations(id) on delete cascade,
organization_id uuid not null references public.organizations(id) on delete restrict,
amount_cents bigint check(amount_cents is null or amount_cents>=0),
total_cost_cents bigint not null default 0 check(total_cost_cents>=0),
margin_floor_cents bigint not null default 0 check(margin_floor_cents>=0),
calculated_margin_cents bigint,
margin_status text not null default 'pending' check(margin_status in ('pending','ok','blocked')),
updated_at timestamptz not null default now(),
primary key(operation_id,organization_id));
create index if not exists operation_financials_org_operation_idx on public.operation_financials(organization_id,operation_id);
alter table public.operation_financials enable row level security;
revoke all on public.operation_financials from public,anon,authenticated;
grant select on public.operation_financials to authenticated;
create policy operation_financials_company_select on public.operation_financials for select to authenticated
using(organization_id=(select private.operation_owner_organization(operation_id))
and (select private.is_org_finance_manager(organization_id)) and (select private.can_access_operation(operation_id)));

create or replace function private.recalculate_operation_margin(target_operation uuid)
returns void language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare current_row public.operations; owner_org uuid; costs bigint; logistics bigint; total_cost bigint;
calculated bigint; open_blockers integer;
begin
select * into current_row from public.operations where id=target_operation for update;
if not found then return; end if;
owner_org:=private.operation_owner_organization(target_operation);
if owner_org is null then raise exception 'OPERATION_OWNER_ORGANIZATION_AMBIGUOUS' using errcode='23514'; end if;
select coalesce(sum(amount_cents),0) into costs from public.operation_cost_items
where operation_id=target_operation and organization_id=owner_org;
select coalesce(sum(amount_cents),0) into logistics from public.logistics_quotes
where operation_id=target_operation and status='selected';
total_cost:=costs+logistics;
if current_row.amount_cents is null then
insert into public.operation_financials(operation_id,organization_id,amount_cents,total_cost_cents,margin_floor_cents,calculated_margin_cents,margin_status,updated_at)
values(target_operation,owner_org,null,total_cost,current_row.margin_floor_cents,null,'pending',now())
on conflict(operation_id,organization_id) do update set amount_cents=excluded.amount_cents,total_cost_cents=excluded.total_cost_cents,
margin_floor_cents=excluded.margin_floor_cents,calculated_margin_cents=null,margin_status='pending',updated_at=now();
update public.operations set calculated_margin_cents=null,margin_status='pending',updated_at=now() where id=target_operation;
return; end if;
calculated:=current_row.amount_cents-total_cost;
insert into public.operation_financials(operation_id,organization_id,amount_cents,total_cost_cents,margin_floor_cents,calculated_margin_cents,margin_status,updated_at)
values(target_operation,owner_org,current_row.amount_cents,total_cost,current_row.margin_floor_cents,calculated,
case when calculated<current_row.margin_floor_cents then 'blocked' else 'ok' end,now())
on conflict(operation_id,organization_id) do update set amount_cents=excluded.amount_cents,total_cost_cents=excluded.total_cost_cents,
margin_floor_cents=excluded.margin_floor_cents,calculated_margin_cents=excluded.calculated_margin_cents,
margin_status=excluded.margin_status,updated_at=now();
if calculated<current_row.margin_floor_cents then
update public.operations set status_before_block=case when status<>'blocked' then status else status_before_block end,
status=case when status in ('completed','cancelled','disputed') then status else 'blocked' end,updated_at=now()
where id=target_operation;
else
select count(*) into open_blockers from public.operation_incidents where operation_id=target_operation and status='open' and blocks_progress;
update public.operations set status=case when status='blocked' and open_blockers=0 then coalesce(status_before_block,'draft') else status end,
status_before_block=case when status='blocked' and open_blockers=0 then null else status_before_block end,updated_at=now()
where id=target_operation;
end if;
end; $$;
revoke all on function private.recalculate_operation_margin(uuid) from public,anon,authenticated;

revoke select on public.operations from authenticated;
grant select(id,reference,title,status,amount_cents,currency,created_by,version,created_at,updated_at,
is_synthetic,operation_type,parent_operation_id,item_description,origin_label,destination_label)
on public.operations to authenticated;
revoke select on public.operation_audit_events from authenticated;
grant select(id,operation_id,event_type,actor_id,created_at) on public.operation_audit_events to authenticated;
create or replace view public.operation_audit_timeline
with (security_barrier=true)
as
select id,operation_id,event_type,created_at
from public.operation_audit_events
where private.can_access_operation(operation_id);
revoke all on public.operation_audit_timeline from public,anon;
grant select on public.operation_audit_timeline to authenticated;
revoke select on public.operation_confirmations from authenticated;
grant select(id,operation_id,participant_role,confirmation_type,confirmed_by,idempotency_key,confirmed_at)
on public.operation_confirmations to authenticated;
revoke select on public.operation_evidence from authenticated;
grant select(id,operation_id,evidence_type,sha256_hex,uploaded_by,created_at) on public.operation_evidence to authenticated;
revoke select on public.operation_incidents from authenticated;
grant select(id,operation_id,incident_type,description,status,blocks_progress,opened_by,resolved_by,created_at,resolved_at)
on public.operation_incidents to authenticated;

do $rebuild_financial_summaries$ declare op record; begin
for op in select id from public.operations where private.operation_owner_organization(id) is not null
loop perform private.recalculate_operation_margin(op.id); end loop;
end $rebuild_financial_summaries$;
commit;