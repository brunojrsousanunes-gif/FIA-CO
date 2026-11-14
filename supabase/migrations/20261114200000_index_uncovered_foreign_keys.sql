begin;

-- Add the seven indexes identified by Supabase's unindexed-foreign-key
-- advisor. These are additive and do not alter row visibility or data.
-- Composite indexes follow the FK column order exactly.

create index if not exists organization_security_profiles_verified_by_idx
  on private.organization_security_profiles (verified_by);

create index if not exists inventory_items_created_by_idx
  on public.inventory_items (created_by);

create index if not exists inventory_movements_created_by_idx
  on public.inventory_movements (created_by);

create index if not exists inventory_movements_item_organization_idx
  on public.inventory_movements (item_id, organization_id);

create index if not exists inventory_movements_operation_id_idx
  on public.inventory_movements (operation_id);

create index if not exists inventory_reservations_created_by_idx
  on public.inventory_reservations (created_by);

create index if not exists inventory_reservations_item_organization_idx
  on public.inventory_reservations (item_id, organization_id);

commit;
