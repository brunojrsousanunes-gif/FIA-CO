-- Serialize logistics quote selection per operation and bind retries to the
-- original actor, operation and quote. This migration is additive and is
-- applied only through the repository migration chain.
begin;

create or replace function private.append_operation_audit(
  target_operation uuid,
  target_event text,
  target_actor uuid,
  target_data jsonb default '{}'::jsonb,
  target_request uuid default gen_random_uuid()
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  previous text;
  happened_at timestamptz := clock_timestamp();
  calculated text;
begin
  perform 1
  from public.operations
  where id = target_operation
  for update;
  if not found then
    raise exception 'OPERATION_NOT_FOUND' using errcode = 'P0002';
  end if;

  select event_hash into previous
  from public.operation_audit_events
  where operation_id = target_operation
  order by id desc
  limit 1;

  calculated := encode(
    extensions.digest(
      concat_ws(
        '|',
        target_operation::text,
        target_event,
        target_actor::text,
        happened_at::text,
        target_request::text,
        coalesce(previous, ''),
        target_data::text
      ),
      'sha256'
    ),
    'hex'
  );

  insert into public.operation_audit_events
    (operation_id,event_type,actor_id,event_data,previous_hash,event_hash,created_at,request_id)
  values
    (target_operation,target_event,target_actor,target_data,previous,calculated,happened_at,target_request)
  on conflict (operation_id,request_id) do nothing;
end;
$function$;

create or replace function public.select_logistics_quote(
  target_quote uuid,
  request_key uuid
)
returns public.logistics_quotes
language plpgsql
security definer
set search_path = ''
as $function$
declare
  caller uuid := auth.uid();
  target_operation uuid;
  locked_operation uuid;
  chosen public.logistics_quotes;
  prior_event public.operation_audit_events;
begin
  if caller is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if request_key is null then
    raise exception 'REQUEST_KEY_REQUIRED' using errcode = '22023';
  end if;
  if target_quote is null then
    raise exception 'QUOTE_REQUIRED' using errcode = '22023';
  end if;

  -- Resolve the parent, then always acquire the operation lock before any
  -- quote lock. Concurrent selections for one operation are serialized.
  select q.operation_id into target_operation
  from public.logistics_quotes q
  where q.id = target_quote;
  if not found then
    raise exception 'QUOTE_NOT_FOUND' using errcode = 'P0002';
  end if;

  -- Reject callers without management rights before taking the operation lock.
  -- Recheck below after locking to account for permission changes.
  if not private.can_manage_operation(target_operation) then
    raise exception 'OPERATION_NOT_MANAGEABLE' using errcode = '42501';
  end if;

  select o.id into locked_operation
  from public.operations o
  where o.id = target_operation
  for update;
  if not found then
    raise exception 'OPERATION_NOT_FOUND' using errcode = 'P0002';
  end if;

  if not private.can_manage_operation(target_operation) then
    raise exception 'OPERATION_NOT_MANAGEABLE' using errcode = '42501';
  end if;

  -- The operation lock also serializes lookups for this operation. A reused
  -- key is accepted only as an exact retry of the same actor and quote.
  select e.* into prior_event
  from public.operation_audit_events e
  where e.operation_id = target_operation
    and e.request_id = request_key;

  if found then
    if prior_event.event_type <> 'logistics.quote.selected'
       or prior_event.actor_id is distinct from caller
       or prior_event.event_data->>'quote_id' is distinct from target_quote::text then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode = '22023';
    end if;

    select q.* into chosen
    from public.logistics_quotes q
    where q.id = target_quote
      and q.operation_id = target_operation;
    if not found then
      raise exception 'QUOTE_NOT_FOUND' using errcode = 'P0002';
    end if;
    return chosen;
  end if;

  select q.* into chosen
  from public.logistics_quotes q
  where q.id = target_quote
    and q.operation_id = target_operation
  for update;
  if not found then
    raise exception 'QUOTE_NOT_FOUND' using errcode = 'P0002';
  end if;
  if chosen.status <> 'offered' then
    raise exception 'QUOTE_NOT_SELECTABLE' using errcode = '22023';
  end if;

  update public.logistics_quotes
  set status = 'offered', updated_at = now()
  where operation_id = target_operation
    and status = 'selected'
    and id <> target_quote;

  update public.logistics_quotes
  set status = 'selected', updated_at = now()
  where id = target_quote
    and operation_id = target_operation
  returning * into chosen;

  perform private.append_operation_audit(
    target_operation,
    'logistics.quote.selected',
    caller,
    jsonb_build_object('quote_id', target_quote),
    request_key
  );

  return chosen;
end;
$function$;

-- Quotes may be inserted directly only as offers. Selection is a state
-- transition and must pass through the audited, idempotent RPC below.
drop policy if exists logistics_quotes_creator_insert on public.logistics_quotes;
create policy logistics_quotes_creator_insert
on public.logistics_quotes
for insert
to authenticated
with check (
  (select private.can_manage_operation(logistics_quotes.operation_id))
  and created_by = (select auth.uid())
  and status = 'offered'
);

revoke all on function public.select_logistics_quote(uuid, uuid) from public, anon;
grant execute on function public.select_logistics_quote(uuid, uuid) to authenticated;

-- The browser workflow only selects an existing quote. Keep the existing
-- RLS-protected DELETE path, but do not allow clients to rewrite quote
-- ownership, provider, price, currency, ETA or creator directly.
revoke update on public.logistics_quotes from public, anon, authenticated;

commit;
