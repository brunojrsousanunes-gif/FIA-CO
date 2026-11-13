begin;

-- FIA&CO company inventory MVP. Balances are derived from immutable movements.
create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  sku text not null check (char_length(trim(sku)) between 1 and 80),
  description text not null check (char_length(trim(description)) between 2 and 240),
  unit text not null default 'ud' check (char_length(trim(unit)) between 1 and 16),
  active boolean not null default true,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, sku),
  unique (id, organization_id)
);
create index inventory_items_org_active_idx on public.inventory_items (organization_id, active, sku);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.inventory_items(id) on delete restrict,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  movement_type text not null check (movement_type in ('in','out','adjustment')),
  quantity numeric(14,3) not null check (quantity > 0),
  note text not null check (char_length(trim(note)) between 3 and 500),
  operation_id uuid references public.operations(id) on delete restrict,
  created_by uuid not null references auth.users(id) on delete restrict,
  request_key uuid not null,
  created_at timestamptz not null default now(),
  unique (organization_id, request_key),
  foreign key (item_id, organization_id) references public.inventory_items(id, organization_id)
);
create index inventory_movements_item_time_idx on public.inventory_movements (item_id, created_at desc);
create index inventory_movements_org_time_idx on public.inventory_movements (organization_id, created_at desc);

create table public.inventory_reservations (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.inventory_items(id) on delete restrict,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  operation_id uuid not null references public.operations(id) on delete restrict,
  quantity numeric(14,3) not null check (quantity > 0),
  status text not null default 'reserved' check (status in ('reserved','released','fulfilled')),
  created_by uuid not null references auth.users(id) on delete restrict,
  request_key uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, request_key),
  foreign key (item_id, organization_id) references public.inventory_items(id, organization_id)
);
create index inventory_reservations_item_status_idx on public.inventory_reservations (item_id, status);
create index inventory_reservations_operation_idx on public.inventory_reservations (operation_id, status);

create or replace function private.is_inventory_manager(target_org uuid)
returns boolean language sql stable security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.organization_members om
    where om.organization_id = target_org
      and om.user_id = (select auth.uid())
      and om.status = 'active'
      and om.member_role in ('manager','admin')
  );
$$;
revoke all on function private.is_inventory_manager(uuid) from public, anon;
grant execute on function private.is_inventory_manager(uuid) to authenticated;

alter table public.inventory_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.inventory_reservations enable row level security;

revoke all on public.inventory_items, public.inventory_movements, public.inventory_reservations from anon, authenticated;
grant select, insert, update on public.inventory_items to authenticated;
grant select on public.inventory_movements, public.inventory_reservations to authenticated;

create policy inventory_items_member_read on public.inventory_items
  for select to authenticated using ((select private.is_org_member(organization_id)));
create policy inventory_items_manager_insert on public.inventory_items
  for insert to authenticated with check (
    created_by = (select auth.uid()) and (select private.is_inventory_manager(organization_id))
  );
create or replace function private.prevent_inventory_item_owner_change()
returns trigger language plpgsql security invoker
set search_path = '' as $$
begin
  if new.organization_id <> old.organization_id or new.created_by <> old.created_by then
    raise exception 'INVENTORY_ITEM_OWNER_IMMUTABLE' using errcode='42501';
  end if;
  return new;
end;
$$;
revoke all on function private.prevent_inventory_item_owner_change() from public, anon, authenticated;
create trigger inventory_items_owner_immutable
before update on public.inventory_items
for each row execute function private.prevent_inventory_item_owner_change();

create policy inventory_items_manager_update on public.inventory_items
  for update to authenticated
  using ((select private.is_inventory_manager(organization_id)))
  with check ((select private.is_inventory_manager(organization_id)));

create policy inventory_movements_member_read on public.inventory_movements
  for select to authenticated using ((select private.is_org_member(organization_id)));
create policy inventory_reservations_member_read on public.inventory_reservations
  for select to authenticated using ((select private.is_org_member(organization_id)));

create or replace function public.record_inventory_movement(
  target_item uuid, movement text, amount numeric, explanation text,
  p_request_key uuid, linked_operation uuid default null
) returns public.inventory_movements
language plpgsql security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  item_row public.inventory_items;
  on_hand numeric(14,3);
  reserved numeric(14,3);
  result_row public.inventory_movements;
begin
  if caller is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  if movement not in ('in','out','adjustment') or amount <= 0 or amount <> round(amount,3)
     or explanation is null or char_length(trim(explanation)) not between 3 and 500
     or p_request_key is null then
    raise exception 'INVALID_MOVEMENT' using errcode='22023';
  end if;
  select * into item_row from public.inventory_items where id=target_item for update;
  if not found then raise exception 'ITEM_NOT_FOUND' using errcode='P0002'; end if;
  if not private.is_inventory_manager(item_row.organization_id) then
    raise exception 'INVENTORY_FORBIDDEN' using errcode='42501';
  end if;
  if linked_operation is not null and (
    not private.can_access_operation(linked_operation) or not exists (
      select 1 from public.operation_participants op
      where op.operation_id=linked_operation
        and op.organization_id=item_row.organization_id and op.status='accepted'
    )
  ) then
    raise exception 'OPERATION_ORGANIZATION_MISMATCH' using errcode='42501';
  end if;
  select * into result_row from public.inventory_movements
    where organization_id=item_row.organization_id and request_key=p_request_key;
  if found then
    if result_row.item_id <> target_item or result_row.movement_type <> movement
      or result_row.quantity <> amount or result_row.note <> trim(explanation)
      or result_row.operation_id is distinct from linked_operation
      or result_row.created_by <> caller then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode='22023';
    end if;
    return result_row;
  end if;
  select coalesce(sum(case when movement_type='out' then -quantity else quantity end),0)
    into on_hand from public.inventory_movements where item_id=target_item;
  select coalesce(sum(quantity),0) into reserved from public.inventory_reservations
    where item_id=target_item and status='reserved';
  if movement='out' and amount > on_hand-reserved then
    raise exception 'INSUFFICIENT_AVAILABLE_STOCK' using errcode='23514';
  end if;
  if movement='adjustment' and amount < 0 then
    raise exception 'INVALID_ADJUSTMENT' using errcode='22023';
  end if;
  insert into public.inventory_movements(item_id,organization_id,movement_type,quantity,note,operation_id,created_by,request_key)
  values(target_item,item_row.organization_id,movement,amount,trim(explanation),linked_operation,caller,p_request_key)
  returning * into result_row;
  return result_row;
end;
$$;

create or replace function public.reserve_inventory_item(
  target_item uuid, target_operation uuid, amount numeric,
  p_request_key uuid
) returns public.inventory_reservations
language plpgsql security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  item_row public.inventory_items;
  on_hand numeric(14,3);
  reserved numeric(14,3);
  result_row public.inventory_reservations;
begin
  if caller is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  if amount is null or amount <= 0 or amount <> round(amount,3) or request_key is null then
    raise exception 'INVALID_RESERVATION' using errcode='22023';
  end if;
  select * into item_row from public.inventory_items where id=target_item and active for update;
  if not found then raise exception 'ITEM_NOT_AVAILABLE' using errcode='P0002'; end if;
  if not private.is_inventory_manager(item_row.organization_id) then
    raise exception 'INVENTORY_FORBIDDEN' using errcode='42501';
  end if;
  if not private.can_access_operation(target_operation) or not exists (
    select 1 from public.operation_participants op
    where op.operation_id=target_operation
      and op.organization_id=item_row.organization_id and op.status='accepted'
  ) then
    raise exception 'OPERATION_ORGANIZATION_MISMATCH' using errcode='42501';
  end if;
  select * into result_row from public.inventory_reservations
    where organization_id=item_row.organization_id and request_key=request_key;
  if found then
    if result_row.item_id <> target_item or result_row.operation_id <> target_operation
      or result_row.quantity <> amount or result_row.created_by <> caller then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode='22023';
    end if;
    return result_row;
  end if;
  select coalesce(sum(case when movement_type='out' then -quantity else quantity end),0)
    into on_hand from public.inventory_movements where item_id=target_item;
  select coalesce(sum(quantity),0) into reserved from public.inventory_reservations
    where item_id=target_item and status='reserved';
  if amount > on_hand-reserved then
    raise exception 'INSUFFICIENT_AVAILABLE_STOCK' using errcode='23514';
  end if;
  insert into public.inventory_reservations(item_id,organization_id,operation_id,quantity,created_by,request_key)
  values(target_item,item_row.organization_id,target_operation,amount,caller,request_key)
  returning * into result_row;
  return result_row;
end;
$$;

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
begin
  if caller is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  if final_status not in ('released','fulfilled') then
    raise exception 'INVALID_RESERVATION_STATUS' using errcode='22023';
  end if;
  select * into reservation_row from public.inventory_reservations
    where id=target_reservation for update;
  if not found then raise exception 'RESERVATION_NOT_FOUND' using errcode='P0002'; end if;
  if not private.is_inventory_manager(reservation_row.organization_id) then
    raise exception 'INVENTORY_FORBIDDEN' using errcode='42501';
  end if;
  if reservation_row.status <> 'reserved' then
    raise exception 'RESERVATION_ALREADY_CLOSED' using errcode='23514';
  end if;
  select * into item_row from public.inventory_items where id=reservation_row.item_id for update;
  if not found then raise exception 'INVENTORY_ITEM_NOT_FOUND' using errcode='P0002'; end if;
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
  update public.inventory_reservations set status=final_status,updated_at=now()
    where id=target_reservation returning * into reservation_row;
  return reservation_row;
end;
$$;

revoke all on function public.record_inventory_movement(uuid,text,numeric,text,uuid,uuid) from public, anon;
revoke all on function public.reserve_inventory_item(uuid,uuid,numeric,uuid) from public, anon;
revoke all on function public.release_inventory_reservation(uuid,text) from public, anon;
grant execute on function public.record_inventory_movement(uuid,text,numeric,text,uuid,uuid) to authenticated;
grant execute on function public.reserve_inventory_item(uuid,uuid,numeric,uuid) to authenticated;
grant execute on function public.release_inventory_reservation(uuid,text) to authenticated;

create or replace view public.inventory_stock with (security_invoker = true) as
select i.id as item_id, i.organization_id, i.sku, i.description, i.unit, i.active,
  coalesce(sum(case when m.movement_type='out' then -m.quantity else m.quantity end),0)::numeric(14,3) as on_hand,
  coalesce((select sum(r.quantity) from public.inventory_reservations r
    where r.item_id=i.id and r.status='reserved'),0)::numeric(14,3) as reserved,
  (coalesce(sum(case when m.movement_type='out' then -m.quantity else m.quantity end),0)
    - coalesce((select sum(r.quantity) from public.inventory_reservations r
      where r.item_id=i.id and r.status='reserved'),0))::numeric(14,3) as available
from public.inventory_items i
left join public.inventory_movements m on m.item_id=i.id
group by i.id;
grant select on public.inventory_stock to authenticated;

commit;
