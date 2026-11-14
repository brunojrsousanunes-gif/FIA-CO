begin;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  status text not null default 'active' check (status in ('active','suspended','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 120),
  platform_role text not null default 'member' check (platform_role in ('member','operator','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  member_role text not null default 'member' check (member_role in ('member','manager','admin')),
  status text not null default 'active' check (status in ('invited','active','suspended','revoked')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create index organization_members_user_active_idx on public.organization_members (user_id, organization_id) where status = 'active';

create table public.operations (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique check (reference ~ '^FIA-[A-Z0-9-]{4,40}$'),
  title text not null check (char_length(title) between 3 and 180),
  status text not null default 'draft' check (status in ('draft','invited','accepted','in_transit','delivered','completed','disputed','blocked','cancelled')),
  amount_cents bigint check (amount_cents is null or amount_cents >= 0),
  currency char(3) not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  created_by uuid not null references auth.users(id) on delete restrict,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index operations_created_by_idx on public.operations (created_by);
create index operations_status_created_idx on public.operations (status, created_at desc);

create table public.operation_participants (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid not null references public.operations(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  participant_role text not null check (participant_role in ('seller','buyer','carrier')),
  status text not null default 'invited' check (status in ('invited','accepted','rejected','revoked')),
  invited_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique (operation_id, participant_role),
  unique (operation_id, organization_id)
);
create index operation_participants_org_operation_idx on public.operation_participants (organization_id, operation_id);
create index operation_participants_invited_by_idx on public.operation_participants (invited_by);

create table public.operation_confirmations (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid not null references public.operations(id) on delete cascade,
  participant_role text not null check (participant_role in ('seller','buyer','carrier')),
  confirmation_type text not null check (confirmation_type in ('terms','dispatch','pickup','delivery','receipt','completion','dispute')),
  confirmed_by uuid not null references auth.users(id) on delete restrict,
  idempotency_key uuid not null default gen_random_uuid(),
  confirmed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  unique (operation_id, idempotency_key)
);
create index operation_confirmations_operation_time_idx on public.operation_confirmations (operation_id, confirmed_at desc);
create index operation_confirmations_confirmed_by_idx on public.operation_confirmations (confirmed_by);

create table public.operation_evidence (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid not null references public.operations(id) on delete cascade,
  evidence_type text not null check (evidence_type in ('pre_dispatch_photo','pickup_photo','delivery_photo','receipt_photo','document')),
  storage_path text not null check (storage_path !~ '(^|/)\.\.(/|$)'),
  sha256_hex text not null check (sha256_hex ~ '^[0-9a-f]{64}$'),
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (operation_id, sha256_hex)
);
create index operation_evidence_operation_time_idx on public.operation_evidence (operation_id, created_at desc);
create index operation_evidence_uploaded_by_idx on public.operation_evidence (uploaded_by);

create table public.operation_audit_events (
  id bigint generated always as identity primary key,
  operation_id uuid not null references public.operations(id) on delete restrict,
  event_type text not null check (char_length(event_type) between 3 and 80),
  actor_id uuid not null references auth.users(id) on delete restrict,
  event_data jsonb not null default '{}'::jsonb check (jsonb_typeof(event_data) = 'object'),
  previous_hash text check (previous_hash is null or previous_hash ~ '^[0-9a-f]{64}$'),
  event_hash text not null check (event_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  unique (operation_id, event_hash)
);
create index operation_audit_events_operation_id_idx on public.operation_audit_events (operation_id, id);
create index operation_audit_events_actor_idx on public.operation_audit_events (actor_id);

create or replace function private.is_org_member(target_org uuid) returns boolean language sql stable security definer
set search_path = pg_catalog, public as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.organization_members om
    where om.organization_id = target_org and om.user_id = (select auth.uid()) and om.status = 'active'
  );
$$;

create or replace function private.can_access_operation(target_operation uuid) returns boolean language sql stable security definer
set search_path = pg_catalog, public as $$
  select (select auth.uid()) is not null and (
    exists (select 1 from public.operations o where o.id = target_operation and o.created_by = (select auth.uid()))
    or exists (
      select 1 from public.operation_participants op
      join public.organization_members om on om.organization_id = op.organization_id
        and om.user_id = (select auth.uid()) and om.status = 'active'
      where op.operation_id = target_operation and op.status in ('invited','accepted')
    )
  );
$$;

create or replace function private.has_operation_role(target_operation uuid, target_role text) returns boolean language sql stable security definer
set search_path = pg_catalog, public as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.operation_participants op
    join public.organization_members om on om.organization_id = op.organization_id
      and om.user_id = (select auth.uid()) and om.status = 'active'
    where op.operation_id = target_operation and op.participant_role = target_role and op.status in ('invited','accepted')
  );
$$;

revoke all on function private.is_org_member(uuid) from public, anon;
revoke all on function private.can_access_operation(uuid) from public, anon;
revoke all on function private.has_operation_role(uuid,text) from public, anon;
grant execute on function private.is_org_member(uuid) to authenticated;
grant execute on function private.can_access_operation(uuid) to authenticated;
grant execute on function private.has_operation_role(uuid,text) to authenticated;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.operations enable row level security;
alter table public.operation_participants enable row level security;
alter table public.operation_confirmations enable row level security;
alter table public.operation_evidence enable row level security;
alter table public.operation_audit_events enable row level security;

revoke all on all tables in schema public from anon;
grant select on public.organizations, public.profiles, public.organization_members, public.operations, public.operation_participants, public.operation_confirmations, public.operation_evidence, public.operation_audit_events to authenticated;
grant insert, update on public.profiles, public.operations, public.operation_participants, public.operation_confirmations, public.operation_evidence, public.operation_audit_events to authenticated;
grant usage, select on sequence public.operation_audit_events_id_seq to authenticated;

create policy organizations_member_select on public.organizations for select to authenticated using ((select private.is_org_member(id)));
create policy profiles_self_select on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy profiles_self_insert on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id and platform_role = 'member');
create policy profiles_self_update on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id and platform_role = 'member');
create policy organization_members_self_select on public.organization_members for select to authenticated using (user_id = (select auth.uid()));
create policy operations_participant_select on public.operations for select to authenticated using ((select private.can_access_operation(id)));
create policy operations_creator_insert on public.operations for insert to authenticated with check (created_by = (select auth.uid()) and status = 'draft');
create policy operations_creator_draft_update on public.operations for update to authenticated using (created_by = (select auth.uid()) and status = 'draft') with check (created_by = (select auth.uid()) and status = 'draft');
create policy participants_operation_select on public.operation_participants for select to authenticated using ((select private.can_access_operation(operation_id)));
create policy participants_creator_insert on public.operation_participants for insert to authenticated with check (
  invited_by = (select auth.uid()) and exists (select 1 from public.operations o where o.id = operation_id and o.created_by = (select auth.uid()) and o.status = 'draft')
);
create policy participants_creator_update on public.operation_participants for update to authenticated
using (exists (select 1 from public.operations o where o.id = operation_id and o.created_by = (select auth.uid()) and o.status = 'draft'))
with check (exists (select 1 from public.operations o where o.id = operation_id and o.created_by = (select auth.uid()) and o.status = 'draft'));
create policy confirmations_operation_select on public.operation_confirmations for select to authenticated using ((select private.can_access_operation(operation_id)));
create policy confirmations_role_insert on public.operation_confirmations for insert to authenticated with check (confirmed_by = (select auth.uid()) and (select private.has_operation_role(operation_id, participant_role)));
create policy evidence_operation_select on public.operation_evidence for select to authenticated using ((select private.can_access_operation(operation_id)));
create policy evidence_participant_insert on public.operation_evidence for insert to authenticated with check (uploaded_by = (select auth.uid()) and (select private.can_access_operation(operation_id)));
create policy audit_operation_select on public.operation_audit_events for select to authenticated using ((select private.can_access_operation(operation_id)));
create policy audit_participant_insert on public.operation_audit_events for insert to authenticated with check (actor_id = (select auth.uid()) and (select private.can_access_operation(operation_id)));

commit;
