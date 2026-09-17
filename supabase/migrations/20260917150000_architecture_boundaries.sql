begin;

-- La base de datos es la autoridad para la correspondencia entre rol y acción.
create or replace function private.validate_evidence_role()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public as $$
declare allowed boolean;
begin
  if new.evidence_type='document' then return new; end if;
  select exists (
    select 1 from public.operation_participants p
    join public.organization_members om on om.organization_id=p.organization_id
    where p.operation_id=new.operation_id and om.user_id=new.uploaded_by and om.status='active'
      and p.status in ('invited','accepted')
      and ((new.evidence_type='pre_dispatch_photo' and p.participant_role='seller')
        or (new.evidence_type in ('pickup_photo','delivery_photo') and p.participant_role='carrier')
        or (new.evidence_type='receipt_photo' and p.participant_role='buyer'))
  ) into allowed;
  if not allowed then raise exception 'EVIDENCE_ROLE_NOT_ALLOWED' using errcode='42501'; end if;
  return new;
end;
$$;
drop trigger if exists operation_evidence_role_guard on public.operation_evidence;
create trigger operation_evidence_role_guard before insert or update of evidence_type,uploaded_by,operation_id
  on public.operation_evidence for each row execute function private.validate_evidence_role();
revoke all on function private.validate_evidence_role() from public, anon, authenticated;

-- Serializa la cadena de auditoría por operación. Las funciones que escriben
-- eventos pueden ejecutarse en paralelo, pero nunca calculan el mismo anterior.
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
  perform 1 from public.operations where id=target_operation for update;
  if not found then raise exception 'OPERATION_NOT_FOUND' using errcode='P0002'; end if;
  select event_hash into previous
    from public.operation_audit_events
    where operation_id=target_operation order by id desc limit 1;
  calculated := encode(extensions.digest(concat_ws('|', target_operation::text, target_event,
    target_actor::text, happened_at::text, target_request::text, coalesce(previous,''), target_data::text),
    'sha256'), 'hex');
  insert into public.operation_audit_events
    (operation_id,event_type,actor_id,event_data,previous_hash,event_hash,created_at,request_id)
  values (target_operation,target_event,target_actor,target_data,previous,calculated,happened_at,target_request)
  on conflict (operation_id,request_id) do nothing;
end;
$$;

-- Identidad y habilitación se separan de la entidad empresarial. Los usuarios
-- solo pueden solicitar una verificación pendiente; la validación efectiva
-- queda reservada al proceso administrativo/servidor.
create table if not exists public.organization_verifications (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  verification_status text not null default 'pending'
    check (verification_status in ('pending','verified','suspended','rejected')),
  verification_method text check (verification_method is null or char_length(verification_method) between 2 and 80),
  legal_name text check (legal_name is null or char_length(legal_name) between 2 and 200),
  tax_id_last4 text check (tax_id_last4 is null or tax_id_last4 ~ '^[A-Z0-9]{4}$'),
  evidence_ref text check (evidence_ref is null or evidence_ref !~ '(^|/)\.\.(/|$)'),
  verified_at timestamptz,
  verified_by uuid references auth.users(id) on delete restrict,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_provider_qualifications (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  capability text not null check (capability in ('logistics','machinery','payment')),
  qualification_status text not null default 'pending'
    check (qualification_status in ('pending','verified','suspended','rejected')),
  evidence_ref text check (evidence_ref is null or evidence_ref !~ '(^|/)\.\.(/|$)'),
  verified_at timestamptz,
  verified_by uuid references auth.users(id) on delete restrict,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, capability)
);

alter table public.organization_verifications enable row level security;
alter table public.organization_provider_qualifications enable row level security;

create policy organization_verification_member_select
  on public.organization_verifications for select to authenticated
  using ((select private.is_org_member(organization_id)));
create policy organization_verification_member_request
  on public.organization_verifications for insert to authenticated
  with check ((select private.is_org_member(organization_id)) and verification_status='pending');
create policy provider_qualification_member_select
  on public.organization_provider_qualifications for select to authenticated
  using ((select private.is_org_member(organization_id)));
create policy provider_qualification_member_request
  on public.organization_provider_qualifications for insert to authenticated
  with check ((select private.is_org_member(organization_id)) and qualification_status='pending');

grant select,insert on public.organization_verifications, public.organization_provider_qualifications to authenticated;
revoke update,delete on public.organization_verifications, public.organization_provider_qualifications from authenticated;

-- Las notificaciones se generan por funciones controladas; se añade una vía
-- explícita para marcar como leída sin conceder escritura general.
create or replace function public.mark_operation_notification_read(target_notification bigint)
returns public.operation_notifications language plpgsql security definer
set search_path = pg_catalog, public, private as $$
declare result public.operation_notifications;
begin
  if (select auth.uid()) is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  update public.operation_notifications n
    set read_at=coalesce(read_at,now())
    where n.id=target_notification
      and private.can_access_operation(n.operation_id)
      and n.recipient_organization_id is not null
      and private.is_org_member(n.recipient_organization_id)
    returning n.* into result;
  if not found then raise exception 'NOTIFICATION_NOT_ACCESSIBLE' using errcode='42501'; end if;
  return result;
end;
$$;
revoke all on function public.mark_operation_notification_read(bigint) from public, anon;
grant execute on function public.mark_operation_notification_read(bigint) to authenticated;

commit;
