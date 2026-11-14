begin;

drop policy if exists cost_items_creator_write on public.operation_cost_items;
create policy cost_items_creator_insert on public.operation_cost_items for insert to authenticated
  with check ((select private.can_manage_operation(operation_id)) and created_by=(select auth.uid()));
create policy cost_items_creator_update on public.operation_cost_items for update to authenticated
  using ((select private.can_manage_operation(operation_id)))
  with check ((select private.can_manage_operation(operation_id)));
create policy cost_items_creator_delete on public.operation_cost_items for delete to authenticated
  using ((select private.can_manage_operation(operation_id)));

drop policy if exists logistics_quotes_creator_write on public.logistics_quotes;
create policy logistics_quotes_creator_insert on public.logistics_quotes for insert to authenticated
  with check ((select private.can_manage_operation(operation_id)) and created_by=(select auth.uid()));
create policy logistics_quotes_creator_update on public.logistics_quotes for update to authenticated
  using ((select private.can_manage_operation(operation_id)))
  with check ((select private.can_manage_operation(operation_id)));
create policy logistics_quotes_creator_delete on public.logistics_quotes for delete to authenticated
  using ((select private.can_manage_operation(operation_id)));

drop policy if exists organizations_member_select on public.organizations;
drop policy if exists organizations_synthetic_catalog_select on public.organizations;
create policy organizations_visible_select on public.organizations for select to authenticated
  using (is_synthetic=true or (select private.is_org_member(id)));

create or replace function public.select_logistics_quote(target_quote uuid,request_key uuid)
returns public.logistics_quotes language plpgsql security invoker
set search_path = pg_catalog, public as $$
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
  return chosen;
end;
$$;

commit;
