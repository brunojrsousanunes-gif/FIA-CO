begin;

-- A creator must remain an active member of the owning organization.
-- Being the historical creator alone must not bypass company revocation.
create or replace function private.can_access_operation(target_operation uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select (select auth.uid()) is not null
     and (
       exists (
         select 1
         from public.operations o
         join public.organization_members om
           on om.organization_id = o.owner_organization_id
          and om.user_id = (select auth.uid())
          and om.status = 'active'
         where o.id = target_operation
           and o.created_by = (select auth.uid())
       )
       or exists (
         select 1
         from public.operation_participants op
         join public.organization_members om
           on om.organization_id = op.organization_id
          and om.user_id = (select auth.uid())
          and om.status = 'active'
         where op.operation_id = target_operation
           and op.status in ('invited','accepted')
       )
     );
$function$;

create or replace function private.can_manage_operation(target_operation uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.operations o
    join public.organization_members om
      on om.organization_id = o.owner_organization_id
     and om.user_id = (select auth.uid())
     and om.status = 'active'
    where o.id = target_operation
      and o.created_by = (select auth.uid())
      and o.status in ('draft','invited','accepted','blocked')
  );
$function$;

-- All objects referenced by these SECURITY DEFINER functions are schema-qualified.
-- Empty search_path prevents object-shadowing through future schema changes.
alter function private.after_confirmation_insert() set search_path = '';
alter function private.after_incident_change() set search_path = '';
alter function private.after_participant_acceptance() set search_path = '';
alter function private.append_operation_audit(uuid,text,uuid,jsonb,uuid) set search_path = '';
alter function private.enqueue_operation_notice(uuid,text,text) set search_path = '';
alter function private.is_org_member(uuid) set search_path = '';
alter function private.validate_evidence_role() set search_path = '';
alter function private.is_org_finance_manager(uuid) set search_path = '';
alter function private.enforce_cost_item_company() set search_path = '';
alter function private.recalculate_operation_margin(uuid) set search_path = '';


-- The draft UPDATE policy must enforce the same active-owner boundary in
-- both USING and WITH CHECK; otherwise a revoked creator remains a candidate
-- row for direct updates even though the check rejects the final row.
drop policy if exists operations_creator_draft_update on public.operations;
create policy operations_creator_draft_update
on public.operations
for update
to authenticated
using (
  created_by = (select auth.uid())
  and status = 'draft'
  and owner_organization_id is not null
  and exists (
    select 1
    from public.organization_members om
    where om.organization_id = operations.owner_organization_id
      and om.user_id = (select auth.uid())
      and om.status = 'active'
  )
)
with check (
  created_by = (select auth.uid())
  and status = 'draft'
  and owner_organization_id is not null
  and exists (
    select 1
    from public.organization_members om
    where om.organization_id = operations.owner_organization_id
      and om.user_id = (select auth.uid())
      and om.status = 'active'
  )
);

-- Transaction amounts are exposed only through the owner-scoped finance table.
-- The legacy operations amount fields must not bypass that boundary.
revoke select (amount_cents, currency) on public.operations from anon, authenticated;

-- A participant may identify the other organizations in an operation they can access.
-- Only the organization row is exposed; private finance data remains separately scoped.
drop policy if exists organizations_visible_select on public.organizations;
create policy organizations_visible_select
on public.organizations
for select
to authenticated
using (
  is_synthetic = true
  or (select private.is_org_member(organizations.id))
  or exists (
    select 1
    from public.operation_participants op
    where op.organization_id = organizations.id
      and op.status in ('invited','accepted')
      and private.can_access_operation(op.operation_id)
  )
);

revoke all on function private.can_access_operation(uuid) from public, anon;
revoke all on function private.can_manage_operation(uuid) from public, anon;
grant execute on function private.can_access_operation(uuid) to authenticated;
grant execute on function private.can_manage_operation(uuid) to authenticated;


-- Least-privilege cleanup: authenticated users only receive writes that have
-- an explicit RLS policy and an application path.
revoke insert, update on public.organization_members from authenticated;
revoke insert, update on public.organizations from authenticated;
revoke update on public.pilot_access_requests from authenticated;
revoke update on public.operation_confirmations from authenticated;
revoke update on public.operation_evidence from authenticated;
revoke insert, update on public.operation_notifications from authenticated;
grant update (read_at) on public.operation_notifications to authenticated;
revoke insert, update on public.operation_audit_timeline from authenticated;
revoke update on public.operation_incidents from authenticated;
grant update (status,resolved_by,resolved_at,resolution_note) on public.operation_incidents to authenticated;
revoke all on function private.recalculate_operation_margin(uuid) from public, anon, authenticated;

commit;
