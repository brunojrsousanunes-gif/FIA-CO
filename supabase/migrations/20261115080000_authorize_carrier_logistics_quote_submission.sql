-- Only the authenticated user who accepted the carrier invitation may
-- submit logistics offers for that carrier organization.
-- The operation owner, seller, buyer and unrelated organization members
-- cannot impersonate the carrier.

begin;

create or replace function private.can_submit_logistics_quote(
  target_operation uuid,
  target_provider_organization uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select (select auth.uid()) is not null
     and target_operation is not null
     and target_provider_organization is not null
     and exists (
       select 1
       from public.operations o
       join public.operation_participants op
         on op.operation_id = o.id
        and op.organization_id = target_provider_organization
        and op.participant_role = 'carrier'
        and op.status = 'accepted'
        and op.accepted_by = (select auth.uid())
       join public.organization_members om
         on om.organization_id = op.organization_id
        and om.user_id = (select auth.uid())
        and om.status = 'active'
       join public.organizations org
         on org.id = op.organization_id
        and org.status = 'active'
       where o.id = target_operation
         and o.status in ('invited','accepted')
     );
$function$;

revoke all on function private.can_submit_logistics_quote(uuid, uuid)
  from public, anon, authenticated;
grant execute on function private.can_submit_logistics_quote(uuid, uuid)
  to authenticated;

drop policy if exists logistics_quotes_creator_insert
  on public.logistics_quotes;

create policy logistics_quotes_carrier_submit
on public.logistics_quotes
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and status = 'offered'
  and (select private.can_submit_logistics_quote(
    logistics_quotes.operation_id,
    logistics_quotes.provider_organization_id
  ))
);

commit;
