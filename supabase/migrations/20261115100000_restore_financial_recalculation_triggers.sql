begin;

-- The hosted database already has these recalculation triggers, but the
-- repository migration chain did not install them on a fresh database.
-- Create only missing triggers: never drop or duplicate an existing one.
do $ensure_financial_recalculation_triggers$
begin
  if to_regclass('public.operation_cost_items') is null
     or to_regclass('public.logistics_quotes') is null
     or to_regprocedure('private.after_financial_change()') is null then
    raise exception 'FINANCIAL_RECALCULATION_DEPENDENCY_MISSING';
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgrelid='public.operation_cost_items'::regclass
      and tgname='operation_cost_items_recalculate'
      and not tgisinternal
  ) then
    execute 'create trigger operation_cost_items_recalculate
      after insert or update or delete on public.operation_cost_items
      for each row execute function private.after_financial_change()';
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgrelid='public.logistics_quotes'::regclass
      and tgname='logistics_quotes_recalculate'
      and not tgisinternal
  ) then
    execute 'create trigger logistics_quotes_recalculate
      after insert or update or delete on public.logistics_quotes
      for each row execute function private.after_financial_change()';
  end if;
end;
$ensure_financial_recalculation_triggers$;

commit;
