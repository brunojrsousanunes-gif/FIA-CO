begin;

create index if not exists organization_verifications_verified_by_idx
  on public.organization_verifications (verified_by) where verified_by is not null;
create index if not exists organization_provider_qualifications_verified_by_idx
  on public.organization_provider_qualifications (verified_by) where verified_by is not null;

drop policy if exists notifications_recipient_mark_read on public.operation_notifications;
create policy notifications_recipient_mark_read
  on public.operation_notifications for update to authenticated
  using (
    recipient_organization_id is not null
    and (select private.can_access_operation(operation_id))
    and (select private.is_org_member(recipient_organization_id))
  )
  with check (
    recipient_organization_id is not null
    and read_at is not null
    and (select private.can_access_operation(operation_id))
    and (select private.is_org_member(recipient_organization_id))
  );

grant update (read_at) on public.operation_notifications to authenticated;

create or replace function public.mark_operation_notification_read(target_notification bigint)
returns public.operation_notifications language plpgsql security invoker
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
