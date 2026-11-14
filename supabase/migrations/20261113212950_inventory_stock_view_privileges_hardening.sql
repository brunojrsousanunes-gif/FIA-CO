begin;

-- Keep the stock view under the caller's RLS context and make its API access explicit.
alter view public.inventory_stock set (security_invoker = true);
revoke all on public.inventory_stock from public, anon;
grant select on public.inventory_stock to authenticated;

commit;
