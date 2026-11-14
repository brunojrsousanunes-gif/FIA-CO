begin;

-- All objects referenced by these SECURITY DEFINER helpers are schema-qualified.
-- An empty search_path prevents object shadowing by writable schemas.
alter function private.is_org_finance_manager(uuid) set search_path = '';
alter function private.enforce_cost_item_company() set search_path = '';
alter function private.recalculate_operation_margin(uuid) set search_path = '';

-- The timeline view exposes only sanitized audit columns and must still obey
-- the caller's underlying operation_audit_events RLS policy.
alter view public.operation_audit_timeline set (security_invoker = true);

commit;
