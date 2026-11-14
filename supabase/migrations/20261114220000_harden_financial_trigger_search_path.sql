begin;

-- The migration-safe trigger remains SECURITY DEFINER; remove its search path
-- so no writable schema can shadow objects during normal financial writes.
alter function private.after_financial_change() set search_path = '';

commit;
