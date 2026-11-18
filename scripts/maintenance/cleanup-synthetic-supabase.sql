-- ONE-OFF MAINTENANCE SCRIPT. Explicitly authorized synthetic-data removal; transactionally guarded.
-- Scope is pinned to the six inspected synthetic organizations and three synthetic operations.
-- Keeps every auth.users row. Writes a durable system-attributed cleanup record.
-- Execute as a controlled database administrator, in one transaction.

BEGIN;

CREATE TABLE IF NOT EXISTS private.synthetic_cleanup_runs (
  run_id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  actor_type text NOT NULL CHECK (actor_type = 'system'),
  actor_label text NOT NULL,
  actor_user_id uuid NULL,
  reason text NOT NULL,
  organization_ids uuid[] NOT NULL,
  operation_ids uuid[] NOT NULL,
  deleted_counts jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL CHECK (status IN ('completed'))
);

REVOKE ALL ON private.synthetic_cleanup_runs FROM PUBLIC;
REVOKE ALL ON private.synthetic_cleanup_runs FROM anon;
REVOKE ALL ON private.synthetic_cleanup_runs FROM authenticated;
REVOKE ALL ON private.synthetic_cleanup_runs FROM service_role;

DO $cleanup$
DECLARE
  v_org_ids uuid[] := ARRAY[
    '1f01dd2f-b1b9-45c7-b477-70273ef6cc1a'::uuid, -- Agrícola Moreno
    '0f42d46a-ec0b-48bf-add9-5ea49f64dba6'::uuid, -- Fran
    'f8821aa2-6c24-49a2-a899-fcd18738665e'::uuid, -- GSM
    '66faa8c0-1a85-494e-9d40-038d184fbea8'::uuid, -- Infa
    '795e4666-7ee0-4674-87ff-82ce758a4090'::uuid, -- Nariño
    'c2dc9ffe-64aa-436c-af55-def5c497a2ab'::uuid  -- Recalvo
  ];
  v_op_ids uuid[] := ARRAY[
    '44683c5c-4453-4762-8fb3-d97960573744'::uuid, -- synthetic tractor parent
    'c2f404e6-b37c-43f7-a76a-8147f3fd44d8'::uuid, -- synthetic part child
    '15fa9b78-b3d0-4c50-ade6-9a45730ca582'::uuid  -- synthetic part child
  ];
  v_auth_ids uuid[];
  v_auth_count bigint;
  v_run_id uuid := gen_random_uuid();
  v_counts jsonb;
  v_deleted bigint;
BEGIN
  -- Serialize cleanup against concurrent writes to all directly affected tables.
  LOCK TABLE public.organizations, public.operations, public.organization_members,
    public.pilot_access_requests, public.operation_audit_events,
    public.operation_cost_items, public.logistics_quotes,
    public.operation_participants, public.operation_financials,
    public.inventory_items, public.inventory_movements, public.inventory_reservations
    IN SHARE ROW EXCLUSIVE MODE;

  -- Exact-scope assertions: abort on any drift, extra or missing synthetic row.
  IF (SELECT count(*) FROM public.organizations WHERE id = ANY(v_org_ids) AND is_synthetic IS TRUE) <> 6
     OR (SELECT count(*) FROM public.organizations WHERE id = ANY(v_org_ids)) <> 6 THEN
    RAISE EXCEPTION 'CLEANUP_ABORT: organization scope changed';
  END IF;

  IF (SELECT count(*) FROM public.operations WHERE id = ANY(v_op_ids) AND is_synthetic IS TRUE) <> 3
     OR (SELECT count(*) FROM public.operations WHERE id = ANY(v_op_ids)) <> 3 THEN
    RAISE EXCEPTION 'CLEANUP_ABORT: operation scope changed';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.operations o
    WHERE (o.owner_organization_id = ANY(v_org_ids)
       OR EXISTS (SELECT 1 FROM public.operation_participants p
                  WHERE p.operation_id = o.id AND p.organization_id = ANY(v_org_ids)))
      AND NOT (o.id = ANY(v_op_ids))
  ) THEN
    RAISE EXCEPTION 'CLEANUP_ABORT: organization has an operation outside the approved synthetic set';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.operations
    WHERE id = ANY(v_op_ids)
      AND (owner_organization_id <> '795e4666-7ee0-4674-87ff-82ce758a4090'::uuid
           OR is_synthetic IS DISTINCT FROM TRUE)
  ) THEN
    RAISE EXCEPTION 'CLEANUP_ABORT: operation ownership/classification changed';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.operations
    WHERE id IN ('c2f404e6-b37c-43f7-a76a-8147f3fd44d8'::uuid,
                 '15fa9b78-b3d0-4c50-ade6-9a45730ca582'::uuid)
      AND parent_operation_id <> '44683c5c-4453-4762-8fb3-d97960573744'::uuid
  ) OR EXISTS (
    SELECT 1 FROM public.operations
    WHERE id = '44683c5c-4453-4762-8fb3-d97960573744'::uuid
      AND parent_operation_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'CLEANUP_ABORT: operation parent graph changed';
  END IF;

  -- Inventory and L3 records are not in the approved deletion scope.
  IF EXISTS (SELECT 1 FROM public.inventory_items WHERE organization_id = ANY(v_org_ids))
     OR EXISTS (SELECT 1 FROM public.inventory_movements
                WHERE organization_id = ANY(v_org_ids) OR operation_id = ANY(v_op_ids))
     OR EXISTS (SELECT 1 FROM public.inventory_reservations
                WHERE organization_id = ANY(v_org_ids) OR operation_id = ANY(v_op_ids))
     OR EXISTS (SELECT 1 FROM private.organization_l3_authority_verifications
                WHERE organization_id = ANY(v_org_ids))
     OR EXISTS (SELECT 1 FROM private.organization_l3_authorization_events
                WHERE organization_id = ANY(v_org_ids)) THEN
    RAISE EXCEPTION 'CLEANUP_ABORT: inventory or L3 records require separate review';
  END IF;

  -- Capture every Auth identity before cleanup. No Auth row is ever deleted.
  SELECT count(*), array_agg(id ORDER BY id) INTO v_auth_count, v_auth_ids
  FROM auth.users;

  -- Current inspected counts are pinned to avoid deleting an unexpected new dataset.
  IF (SELECT count(*) FROM public.organization_members WHERE organization_id = ANY(v_org_ids)) <> 1
     OR (SELECT count(*) FROM public.pilot_access_requests WHERE organization_id = ANY(v_org_ids)) <> 1
     OR (SELECT count(*) FROM public.operation_audit_events WHERE operation_id = ANY(v_op_ids)) <> 13
     OR (SELECT count(*) FROM public.operation_cost_items WHERE operation_id = ANY(v_op_ids)) <> 3
     OR (SELECT count(*) FROM public.logistics_quotes
         WHERE operation_id = ANY(v_op_ids) OR provider_organization_id = ANY(v_org_ids)) <> 2
     OR (SELECT count(*) FROM public.operation_participants WHERE operation_id = ANY(v_op_ids)) <> 9
     OR (SELECT count(*) FROM public.operation_financials WHERE operation_id = ANY(v_op_ids)) <> 3 THEN
    RAISE EXCEPTION 'CLEANUP_ABORT: dependent row counts changed since inspection';
  END IF;

  SELECT jsonb_build_object(
    'organization_members', (SELECT count(*) FROM public.organization_members WHERE organization_id = ANY(v_org_ids)),
    'pilot_access_requests', (SELECT count(*) FROM public.pilot_access_requests WHERE organization_id = ANY(v_org_ids)),
    'operation_audit_events', (SELECT count(*) FROM public.operation_audit_events WHERE operation_id = ANY(v_op_ids)),
    'operation_cost_items', (SELECT count(*) FROM public.operation_cost_items WHERE operation_id = ANY(v_op_ids)),
    'logistics_quotes', (SELECT count(*) FROM public.logistics_quotes WHERE operation_id = ANY(v_op_ids) OR provider_organization_id = ANY(v_org_ids)),
    'operation_participants', (SELECT count(*) FROM public.operation_participants WHERE operation_id = ANY(v_op_ids)),
    'operation_financials', (SELECT count(*) FROM public.operation_financials WHERE operation_id = ANY(v_op_ids))
  ) INTO v_counts;

  INSERT INTO private.synthetic_cleanup_runs
    (run_id, actor_type, actor_label, actor_user_id, reason,
     organization_ids, operation_ids, deleted_counts, status)
  VALUES
    (v_run_id, 'system', 'FIA&CO authorized maintenance', NULL,
     'Retirada controlada de empresas y operaciones sintéticas heredadas; cuentas Auth preservadas.',
     v_org_ids, v_op_ids, v_counts, 'completed');

  -- Suppress only the financial recalculation trigger side-effect for rows being removed.
  -- The independent private cleanup record above remains durable in this same transaction.
  PERFORM set_config('fia_co.migration_mode', 'company_data_isolation', true);

  DELETE FROM public.operation_audit_events WHERE operation_id = ANY(v_op_ids);
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  IF v_deleted <> 13 THEN RAISE EXCEPTION 'CLEANUP_ABORT: unexpected audit delete count'; END IF;

  DELETE FROM public.operation_cost_items WHERE operation_id = ANY(v_op_ids);
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  IF v_deleted <> 3 THEN RAISE EXCEPTION 'CLEANUP_ABORT: unexpected cost delete count'; END IF;

  DELETE FROM public.logistics_quotes
   WHERE operation_id = ANY(v_op_ids) OR provider_organization_id = ANY(v_org_ids);
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  IF v_deleted <> 2 THEN RAISE EXCEPTION 'CLEANUP_ABORT: unexpected quote delete count'; END IF;

  DELETE FROM public.operation_participants WHERE operation_id = ANY(v_op_ids);
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  IF v_deleted <> 9 THEN RAISE EXCEPTION 'CLEANUP_ABORT: unexpected participant delete count'; END IF;

  DELETE FROM public.operation_financials WHERE operation_id = ANY(v_op_ids);
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  IF v_deleted <> 3 THEN RAISE EXCEPTION 'CLEANUP_ABORT: unexpected financial delete count'; END IF;

  DELETE FROM public.pilot_access_requests WHERE organization_id = ANY(v_org_ids);
  DELETE FROM public.organization_members WHERE organization_id = ANY(v_org_ids);

  -- Child operations first because parent_operation_id is ON DELETE RESTRICT.
  DELETE FROM public.operations
   WHERE id IN ('c2f404e6-b37c-43f7-a76a-8147f3fd44d8'::uuid,
                '15fa9b78-b3d0-4c50-ade6-9a45730ca582'::uuid);
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  IF v_deleted <> 2 THEN RAISE EXCEPTION 'CLEANUP_ABORT: unexpected child operation delete count'; END IF;

  DELETE FROM public.operations
   WHERE id = '44683c5c-4453-4762-8fb3-d97960573744'::uuid;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  IF v_deleted <> 1 THEN RAISE EXCEPTION 'CLEANUP_ABORT: unexpected parent operation delete count'; END IF;

  DELETE FROM public.organizations WHERE id = ANY(v_org_ids);
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  IF v_deleted <> 6 THEN RAISE EXCEPTION 'CLEANUP_ABORT: unexpected organization delete count'; END IF;

  -- Postconditions: no target rows remain and Auth identities are byte-for-byte the same IDs/count.
  IF EXISTS (SELECT 1 FROM public.organizations WHERE id = ANY(v_org_ids))
     OR EXISTS (SELECT 1 FROM public.operations WHERE id = ANY(v_op_ids))
     OR EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = ANY(v_org_ids))
     OR EXISTS (SELECT 1 FROM public.pilot_access_requests WHERE organization_id = ANY(v_org_ids))
     OR EXISTS (SELECT 1 FROM public.operation_audit_events WHERE operation_id = ANY(v_op_ids))
     OR EXISTS (SELECT 1 FROM public.operation_cost_items WHERE operation_id = ANY(v_op_ids))
     OR EXISTS (SELECT 1 FROM public.logistics_quotes
                WHERE operation_id = ANY(v_op_ids) OR provider_organization_id = ANY(v_org_ids))
     OR EXISTS (SELECT 1 FROM public.operation_participants WHERE operation_id = ANY(v_op_ids))
     OR EXISTS (SELECT 1 FROM public.operation_financials WHERE operation_id = ANY(v_op_ids)) THEN
    RAISE EXCEPTION 'CLEANUP_ABORT: postcondition failed; transaction must roll back';
  END IF;

  IF (SELECT count(*) FROM auth.users) <> v_auth_count
     OR (SELECT array_agg(id ORDER BY id) FROM auth.users) IS DISTINCT FROM v_auth_ids THEN
    RAISE EXCEPTION 'CLEANUP_ABORT: Auth identities changed unexpectedly';
  END IF;
END;
$cleanup$;

COMMIT;
