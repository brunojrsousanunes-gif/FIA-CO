-- Add covering indexes for foreign keys identified by Supabase Performance Advisor.
-- These indexes do not change data, permissions, or application behavior.
-- Existing single-column indexes are retained; composite FK indexes are added explicitly.

create index if not exists organization_security_profiles_verified_by_idx
  on private.organization_security_profiles (verified_by)
  where verified_by is not null;

create index if not exists inventory_items_created_by_idx
  on public.inventory_items (created_by)
  where created_by is not null;

create index if not exists inventory_movements_created_by_idx
  on public.inventory_movements (created_by)
  where created_by is not null;

create index if not exists inventory_movements_item_org_fk_idx
  on public.inventory_movements (item_id, organization_id);

create index if not exists inventory_movements_operation_id_idx
  on public.inventory_movements (operation_id)
  where operation_id is not null;

create index if not exists inventory_reservations_created_by_idx
  on public.inventory_reservations (created_by)
  where created_by is not null;

create index if not exists inventory_reservations_item_org_fk_idx
  on public.inventory_reservations (item_id, organization_id);
