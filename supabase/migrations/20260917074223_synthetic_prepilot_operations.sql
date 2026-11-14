begin;

alter table public.organizations
  add column if not exists is_synthetic boolean not null default false,
  add column if not exists demo_code text;

create unique index if not exists organizations_demo_code_unique
  on public.organizations (demo_code) where demo_code is not null;

alter table public.operations
  add column if not exists is_synthetic boolean not null default false,
  add column if not exists operation_type text not null default 'standard'
    check (operation_type in ('standard','machinery_purchase','goods_delivery','repair_part_delivery')),
  add column if not exists parent_operation_id uuid references public.operations(id) on delete restrict,
  add column if not exists item_description text,
  add column if not exists origin_label text,
  add column if not exists destination_label text,
  add column if not exists margin_floor_cents bigint not null default 0 check (margin_floor_cents >= 0),
  add column if not exists calculated_margin_cents bigint,
  add column if not exists margin_status text not null default 'pending'
    check (margin_status in ('pending','ok','blocked')),
  add column if not exists status_before_block text;

create index if not exists operations_parent_operation_idx
  on public.operations (parent_operation_id, created_at desc) where parent_operation_id is not null;

alter table public.operation_participants
  add column if not exists responsibility text not null default 'Responsabilidad pendiente de asignación'
    check (char_length(responsibility) between 3 and 500);

create table if not exists public.operation_cost_items (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid not null references public.operations(id) on delete cascade,
  category text not null check (category in ('machinery','tax','service','other')),
  label text not null check (char_length(label) between 2 and 160),
  amount_cents bigint not null check (amount_cents >= 0),
  currency char(3) not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists operation_cost_items_operation_idx
  on public.operation_cost_items (operation_id, created_at);
create index if not exists operation_cost_items_created_by_idx
  on public.operation_cost_items (created_by);

create table if not exists public.logistics_quotes (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid not null references public.operations(id) on delete cascade,
  provider_organization_id uuid not null references public.organizations(id) on delete restrict,
  label text not null check (char_length(label) between 2 and 160),
  amount_cents bigint not null check (amount_cents >= 0),
  currency char(3) not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  eta_days integer check (eta_days is null or eta_days between 0 and 365),
  status text not null default 'offered' check (status in ('offered','selected','rejected','expired')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists logistics_quotes_operation_idx
  on public.logistics_quotes (operation_id, status, amount_cents);
create index if not exists logistics_quotes_provider_idx
  on public.logistics_quotes (provider_organization_id, operation_id);
create index if not exists logistics_quotes_created_by_idx
  on public.logistics_quotes (created_by);
create unique index if not exists logistics_quotes_one_selected
  on public.logistics_quotes (operation_id) where status = 'selected';

create table if not exists public.operation_incidents (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid not null references public.operations(id) on delete cascade,
  incident_type text not null check (incident_type in ('data_error','logistics','documentation','security','other')),
  description text not null check (char_length(description) between 3 and 1000),
  status text not null default 'open' check (status in ('open','resolved')),
  blocks_progress boolean not null default true,
  opened_by uuid not null references auth.users(id) on delete restrict,
  resolved_by uuid references auth.users(id) on delete restrict,
  resolution_note text check (resolution_note is null or char_length(resolution_note) between 3 and 1000),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  check ((status = 'open' and resolved_by is null and resolved_at is null)
    or (status = 'resolved' and resolved_by is not null and resolved_at is not null and resolution_note is not null))
);
create index if not exists operation_incidents_operation_status_idx
  on public.operation_incidents (operation_id, status, created_at desc);
create index if not exists operation_incidents_opened_by_idx
  on public.operation_incidents (opened_by);
create index if not exists operation_incidents_resolved_by_idx
  on public.operation_incidents (resolved_by) where resolved_by is not null;

create table if not exists public.operation_notifications (
  id bigint generated always as identity primary key,
  operation_id uuid not null references public.operations(id) on delete cascade,
  recipient_organization_id uuid references public.organizations(id) on delete cascade,
  event_type text not null check (char_length(event_type) between 3 and 80),
  message text not null check (char_length(message) between 3 and 500),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists operation_notifications_recipient_idx
  on public.operation_notifications (recipient_organization_id, created_at desc);
create index if not exists operation_notifications_operation_idx
  on public.operation_notifications (operation_id, created_at desc);

create or replace function private.can_manage_operation(target_operation uuid)
returns boolean language sql stable security definer
set search_path = pg_catalog, public as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.operations o
    where o.id = target_operation
      and o.created_by = (select auth.uid())
      and o.status in ('draft','invited','accepted','blocked')
  );
$$;

create or replace function private.append_operation_audit(
  target_operation uuid,
  target_event text,
  target_actor uuid,
  target_data jsonb default '{}'::jsonb,
  target_request uuid default gen_random_uuid()
) returns void language plpgsql security definer
set search_path = pg_catalog, public, extensions as $$
declare
  previous text;
  happened_at timestamptz := clock_timestamp();
  calculated text;
begin
  select event_hash into previous
  from public.operation_audit_events
  where operation_id = target_operation order by id desc limit 1;
  calculated := encode(extensions.digest(concat_ws('|', target_operation::text, target_event,
    target_actor::text, happened_at::text, target_request::text, coalesce(previous,''), target_data::text),
    'sha256'), 'hex');
  insert into public.operation_audit_events
    (operation_id,event_type,actor_id,event_data,previous_hash,event_hash,created_at,request_id)
  values (target_operation,target_event,target_actor,target_data,previous,calculated,happened_at,target_request)
  on conflict (operation_id,request_id) do nothing;
end;
$$;

create or replace function private.enqueue_operation_notice(
  target_operation uuid,
  target_event text,
  target_message text
) returns void language sql security definer
set search_path = pg_catalog, public as $$
  insert into public.operation_notifications (operation_id,recipient_organization_id,event_type,message)
  select target_operation, op.organization_id, target_event, target_message
  from public.operation_participants op where op.operation_id = target_operation;
$$;

create or replace function private.recalculate_operation_margin(target_operation uuid)
returns void language plpgsql security definer
set search_path = pg_catalog, public as $$
declare
  current_row public.operations;
  costs bigint;
  logistics bigint;
  calculated bigint;
  open_blockers integer;
begin
  select * into current_row from public.operations where id = target_operation for update;
  if not found then return; end if;
  select coalesce(sum(amount_cents),0) into costs from public.operation_cost_items where operation_id = target_operation;
  select coalesce(sum(amount_cents),0) into logistics from public.logistics_quotes
    where operation_id = target_operation and status = 'selected';
  if current_row.amount_cents is null then
    update public.operations set calculated_margin_cents = null, margin_status = 'pending', updated_at = now()
      where id = target_operation;
    return;
  end if;
  calculated := current_row.amount_cents - costs - logistics;
  if calculated < current_row.margin_floor_cents then
    update public.operations set calculated_margin_cents = calculated, margin_status = 'blocked',
      status_before_block = case when status <> 'blocked' then status else status_before_block end,
      status = case when status in ('completed','cancelled','disputed') then status else 'blocked' end,
      updated_at = now() where id = target_operation;
  else
    select count(*) into open_blockers from public.operation_incidents
      where operation_id = target_operation and status = 'open' and blocks_progress;
    update public.operations set calculated_margin_cents = calculated, margin_status = 'ok',
      status = case when status = 'blocked' and open_blockers = 0 then coalesce(status_before_block,'draft') else status end,
      status_before_block = case when status = 'blocked' and open_blockers = 0 then null else status_before_block end,
      updated_at = now() where id = target_operation;
  end if;
end;
$$;

create or replace function private.after_financial_change()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public, private as $$
declare target uuid := coalesce(new.operation_id, old.operation_id);
begin
  perform private.recalculate_operation_margin(target);
  perform private.append_operation_audit(target, 'finance.recalculated', (select auth.uid()),
    jsonb_build_object('source', tg_table_name));
  return coalesce(new,old);
end;
$$;

create or replace function private.after_confirmation_insert()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public, private as $$
declare current_status text;
begin
  select status into current_status from public.operations where id = new.operation_id for update;
  if current_status = 'blocked' then raise exception 'OPERATION_BLOCKED' using errcode = '42501'; end if;
  if new.confirmation_type = 'pickup' and new.participant_role = 'carrier'
    and exists (select 1 from public.operation_confirmations where operation_id=new.operation_id and participant_role='seller' and confirmation_type='dispatch')
    and current_status = 'accepted' then
      update public.operations set status='in_transit',version=version+1,updated_at=now() where id=new.operation_id;
  elsif new.confirmation_type = 'dispatch' and new.participant_role = 'seller'
    and exists (select 1 from public.operation_confirmations where operation_id=new.operation_id and participant_role='carrier' and confirmation_type='pickup')
    and current_status = 'accepted' then
      update public.operations set status='in_transit',version=version+1,updated_at=now() where id=new.operation_id;
  elsif new.confirmation_type = 'delivery' and new.participant_role = 'carrier' and current_status = 'in_transit' then
      update public.operations set status='delivered',version=version+1,updated_at=now() where id=new.operation_id;
  elsif new.confirmation_type in ('receipt','completion') and new.participant_role = 'buyer' and current_status = 'delivered' then
      update public.operations set status='completed',version=version+1,updated_at=now() where id=new.operation_id;
  end if;
  perform private.append_operation_audit(new.operation_id, 'confirmation.' || new.confirmation_type,
    new.confirmed_by, jsonb_build_object('role',new.participant_role));
  perform private.enqueue_operation_notice(new.operation_id, 'confirmation.' || new.confirmation_type,
    'Se ha registrado una confirmación en el expediente.');
  return new;
end;
$$;

create or replace function private.after_participant_acceptance()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public, private as $$
declare accepted_participants integer;
begin
  if old.status<>'accepted' and new.status='accepted' then
    select count(*) into accepted_participants from public.operation_participants
      where operation_id=new.operation_id and status='accepted';
    if accepted_participants=3 then
      update public.operations set status='accepted',version=version+1,updated_at=now()
        where id=new.operation_id and status='invited';
      perform private.append_operation_audit(new.operation_id,'operation.accepted',coalesce((select auth.uid()),new.invited_by),
        jsonb_build_object('accepted_participants',accepted_participants));
      perform private.enqueue_operation_notice(new.operation_id,'operation.accepted','Los tres participantes han aceptado y la operación puede avanzar.');
    end if;
  end if;
  return new;
end;
$$;

create or replace function private.after_incident_change()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public, private as $$
declare open_blockers integer; incomplete_recoveries integer;
begin
  if tg_op = 'INSERT' then
    if new.blocks_progress then
      update public.operations set status_before_block=case when status<>'blocked' then status else status_before_block end,
        status=case when status in ('completed','cancelled') then status else 'blocked' end,
        version=version+1,updated_at=now() where id=new.operation_id;
    end if;
    perform private.append_operation_audit(new.operation_id,'incident.opened',new.opened_by,
      jsonb_build_object('incident_id',new.id,'type',new.incident_type,'blocks_progress',new.blocks_progress));
    perform private.enqueue_operation_notice(new.operation_id,'incident.opened','La operación contiene una incidencia y puede estar bloqueada.');
  elsif old.status='open' and new.status='resolved' then
    select count(*) into open_blockers from public.operation_incidents
      where operation_id=new.operation_id and status='open' and blocks_progress and id<>new.id;
    select count(*) into incomplete_recoveries from public.operations
      where parent_operation_id=new.operation_id and operation_type='repair_part_delivery' and status<>'completed';
    if incomplete_recoveries > 0 then
      raise exception 'RECOVERY_OPERATION_INCOMPLETE' using errcode='23514';
    end if;
    update public.operations set
      status=case when status='blocked' and open_blockers=0 and margin_status<>'blocked' then coalesce(status_before_block,'draft') else status end,
      status_before_block=case when status='blocked' and open_blockers=0 and margin_status<>'blocked' then null else status_before_block end,
      version=version+1,updated_at=now() where id=new.operation_id;
    perform private.append_operation_audit(new.operation_id,'incident.resolved',new.resolved_by,
      jsonb_build_object('incident_id',new.id));
    perform private.enqueue_operation_notice(new.operation_id,'incident.resolved','La incidencia ha sido revisada y resuelta.');
  end if;
  return new;
end;
$$;

create or replace function public.create_synthetic_part_recovery(
  target_parent uuid,
  sender_demo_code text,
  carrier_demo_code text,
  part_description text,
  request_key uuid
) returns public.operations
language plpgsql security definer
set search_path = pg_catalog, public, private as $$
declare
  caller uuid := (select auth.uid());
  sender_org uuid;
  carrier_org uuid;
  buyer_org uuid;
  sender_name text;
  carrier_name text;
  buyer_name text;
  recovery public.operations;
begin
  if caller is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  if not private.can_manage_operation(target_parent) then raise exception 'OPERATION_NOT_MANAGEABLE' using errcode='42501'; end if;
  if not exists (select 1 from public.operations where id=target_parent and is_synthetic and operation_type='machinery_purchase' and status='blocked') then
    raise exception 'PARENT_NOT_BLOCKED_SYNTHETIC_TRACTOR' using errcode='23514';
  end if;
  if not exists (select 1 from public.operation_incidents where operation_id=target_parent and status='open' and blocks_progress) then
    raise exception 'OPEN_INCIDENT_REQUIRED' using errcode='23514';
  end if;
  if sender_demo_code not in ('SYN-FRAN','SYN-INFA') then raise exception 'INVALID_SYNTHETIC_SENDER' using errcode='22023'; end if;
  if carrier_demo_code not in ('SYN-GSM','SYN-AGRICOLA-MORENO') then raise exception 'INVALID_SYNTHETIC_CARRIER' using errcode='22023'; end if;
  if char_length(trim(part_description)) not between 3 and 180 then raise exception 'INVALID_PART_DESCRIPTION' using errcode='22023'; end if;
  select id,name into sender_org,sender_name from public.organizations where demo_code=sender_demo_code and is_synthetic;
  select id,name into carrier_org,carrier_name from public.organizations where demo_code=carrier_demo_code and is_synthetic;
  select op.organization_id,o.name into buyer_org,buyer_name
    from public.operation_participants op join public.organizations o on o.id=op.organization_id
    where op.operation_id=target_parent and op.participant_role='buyer';
  if sender_org is null or carrier_org is null or buyer_org is null then raise exception 'SYNTHETIC_PARTIES_INCOMPLETE' using errcode='23514'; end if;
  insert into public.operations(reference,title,status,operation_type,parent_operation_id,is_synthetic,item_description,origin_label,destination_label,created_by)
  values ('FIA-REC-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),
    'Reposición de pieza · ' || trim(part_description),'invited','repair_part_delivery',target_parent,true,
    trim(part_description),sender_name,buyer_name,caller) returning * into recovery;
  insert into public.operation_participants(operation_id,organization_id,participant_role,status,invited_by,responsibility)
  values
    (recovery.id,sender_org,'seller','invited',caller,'Preparar y expedir la pieza de sustitución'),
    (recovery.id,carrier_org,'carrier','invited',caller,'Recoger, transportar y acreditar la entrega de la pieza'),
    (recovery.id,buyer_org,'buyer','invited',caller,'Recibir, revisar y confirmar la pieza antes de reanudar la finalización');
  perform private.append_operation_audit(recovery.id,'recovery.created',caller,
    jsonb_build_object('parent_operation_id',target_parent,'sender',sender_name,'carrier',carrier_name),request_key);
  perform private.append_operation_audit(target_parent,'recovery.linked',caller,
    jsonb_build_object('recovery_operation_id',recovery.id,'part',trim(part_description)),request_key);
  perform private.enqueue_operation_notice(target_parent,'recovery.linked','Se ha creado una suboperación para reponer la pieza y recuperar la entrega.');
  return recovery;
end;
$$;

create or replace function public.select_logistics_quote(
  target_quote uuid,
  request_key uuid
) returns public.logistics_quotes
language plpgsql security definer
set search_path = pg_catalog, public, private as $$
declare
  caller uuid := (select auth.uid());
  chosen public.logistics_quotes;
begin
  if caller is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  select * into chosen from public.logistics_quotes where id=target_quote for update;
  if not found then raise exception 'QUOTE_NOT_FOUND' using errcode='P0002'; end if;
  if not private.can_manage_operation(chosen.operation_id) then raise exception 'OPERATION_NOT_MANAGEABLE' using errcode='42501'; end if;
  update public.logistics_quotes set status='offered',updated_at=now()
    where operation_id=chosen.operation_id and status='selected' and id<>chosen.id;
  update public.logistics_quotes set status='selected',updated_at=now() where id=chosen.id returning * into chosen;
  perform private.append_operation_audit(chosen.operation_id,'logistics.selected',caller,
    jsonb_build_object('quote_id',chosen.id,'amount_cents',chosen.amount_cents),request_key);
  perform private.enqueue_operation_notice(chosen.operation_id,'logistics.selected','Se ha seleccionado un presupuesto logístico.');
  return chosen;
end;
$$;

drop trigger if exists operation_cost_items_recalculate on public.operation_cost_items;
create trigger operation_cost_items_recalculate after insert or update or delete on public.operation_cost_items
  for each row execute function private.after_financial_change();
drop trigger if exists logistics_quotes_recalculate on public.logistics_quotes;
create trigger logistics_quotes_recalculate after insert or update or delete on public.logistics_quotes
  for each row execute function private.after_financial_change();
drop trigger if exists operation_confirmation_advance on public.operation_confirmations;
create trigger operation_confirmation_advance after insert on public.operation_confirmations
  for each row execute function private.after_confirmation_insert();
drop trigger if exists operation_participant_auto_accept on public.operation_participants;
create trigger operation_participant_auto_accept after update of status on public.operation_participants
  for each row execute function private.after_participant_acceptance();
drop trigger if exists operation_incident_blocking on public.operation_incidents;
create trigger operation_incident_blocking after insert or update of status on public.operation_incidents
  for each row execute function private.after_incident_change();

alter table public.operation_cost_items enable row level security;
alter table public.logistics_quotes enable row level security;
alter table public.operation_incidents enable row level security;
alter table public.operation_notifications enable row level security;

create policy cost_items_operation_select on public.operation_cost_items for select to authenticated
  using ((select private.can_access_operation(operation_id)));
create policy cost_items_creator_write on public.operation_cost_items for all to authenticated
  using ((select private.can_manage_operation(operation_id)) and created_by=(select auth.uid()))
  with check ((select private.can_manage_operation(operation_id)) and created_by=(select auth.uid()));
create policy logistics_quotes_operation_select on public.logistics_quotes for select to authenticated
  using ((select private.can_access_operation(operation_id)));
create policy logistics_quotes_creator_write on public.logistics_quotes for all to authenticated
  using ((select private.can_manage_operation(operation_id)) and created_by=(select auth.uid()))
  with check ((select private.can_manage_operation(operation_id)) and created_by=(select auth.uid()));
create policy incidents_operation_select on public.operation_incidents for select to authenticated
  using ((select private.can_access_operation(operation_id)));
create policy incidents_participant_insert on public.operation_incidents for insert to authenticated
  with check (opened_by=(select auth.uid()) and (select private.can_access_operation(operation_id)));
create policy incidents_creator_resolve on public.operation_incidents for update to authenticated
  using ((select private.can_manage_operation(operation_id)) and status='open')
  with check (status='resolved' and resolved_by=(select auth.uid()) and resolved_at is not null and resolution_note is not null);
create policy notifications_recipient_select on public.operation_notifications for select to authenticated
  using ((select private.can_access_operation(operation_id)) and
    (recipient_organization_id is null or (select private.is_org_member(recipient_organization_id))));
create policy organizations_synthetic_catalog_select on public.organizations for select to authenticated
  using (is_synthetic=true);

grant select,insert,update,delete on public.operation_cost_items,public.logistics_quotes to authenticated;
grant select,insert,update on public.operation_incidents to authenticated;
grant select on public.operation_notifications to authenticated;
grant usage,select on sequence public.operation_notifications_id_seq to authenticated;
revoke insert,update,delete on public.operation_audit_events from authenticated;
drop policy if exists audit_participant_insert on public.operation_audit_events;

revoke all on function private.can_manage_operation(uuid) from public,anon;
revoke all on function private.append_operation_audit(uuid,text,uuid,jsonb,uuid) from public,anon,authenticated;
revoke all on function private.enqueue_operation_notice(uuid,text,text) from public,anon,authenticated;
revoke all on function private.recalculate_operation_margin(uuid) from public,anon,authenticated;
revoke all on function private.after_financial_change() from public,anon,authenticated;
revoke all on function private.after_confirmation_insert() from public,anon,authenticated;
revoke all on function private.after_participant_acceptance() from public,anon,authenticated;
revoke all on function private.after_incident_change() from public,anon,authenticated;
grant execute on function private.can_manage_operation(uuid) to authenticated;
revoke all on function public.create_synthetic_part_recovery(uuid,text,text,text,uuid) from public,anon;
grant execute on function public.create_synthetic_part_recovery(uuid,text,text,text,uuid) to authenticated;
revoke all on function public.select_logistics_quote(uuid,uuid) from public,anon;
grant execute on function public.select_logistics_quote(uuid,uuid) to authenticated;

alter table public.operation_confirmations drop constraint if exists operation_confirmations_role_action_check;
alter table public.operation_confirmations add constraint operation_confirmations_role_action_check check (
  confirmation_type='dispute'
  or (participant_role='seller' and confirmation_type in ('terms','dispatch'))
  or (participant_role='carrier' and confirmation_type in ('terms','pickup','delivery'))
  or (participant_role='buyer' and confirmation_type in ('terms','receipt','completion'))
);

insert into public.organizations (name,is_synthetic,demo_code)
select seed.name,true,seed.code from (values
  ('Fran','SYN-FRAN'),('GSM','SYN-GSM'),('Nariño','SYN-NARINO'),
  ('Recalvo','SYN-RECALVO'),('Infa','SYN-INFA'),('Agrícola Moreno','SYN-AGRICOLA-MORENO')
) as seed(name,code)
where not exists (select 1 from public.organizations o where o.demo_code=seed.code);

commit;
