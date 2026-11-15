-- Route logistics quote deletion through an audited RPC.
-- Lock order: request-key advisory lock -> parent operation -> quote row.
-- The financial trigger therefore reuses the already-held operation lock.

begin;

create or replace function public.delete_logistics_quote(
  target_quote uuid,
  request_key uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  caller uuid := (select auth.uid());
  target_operation uuid;
  prior_count bigint;
  prior_event public.operation_audit_events;
  chosen public.logistics_quotes;
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

  -- Fast path for an exact retry of a completed deletion. This path is
  -- read-only, so it remains safe even though the quote row no longer exists.
  select count(*) into prior_count
  from public.operation_audit_events
  where request_id = request_key;

  if prior_count > 0 then
    select e.* into prior_event
    from public.operation_audit_events e
    where e.request_id = request_key
    order by e.id desc
    limit 1;

    if prior_count <> 1
       or prior_event.event_type <> 'logistics.quote.deleted'
       or prior_event.actor_id is distinct from caller
       or prior_event.event_data->>'quote_id' is distinct from target_quote::text then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode = '22023';
    end if;
    return true;
  end if;

  -- Resolve the parent and reject unauthorized callers before taking the
  -- request-key advisory lock. Recheck authorization after the row lock below.
  select q.operation_id into target_operation
  from public.logistics_quotes q
  where q.id = target_quote;
  if not found then
    raise exception 'QUOTE_NOT_FOUND' using errcode = 'P0002';
  end if;

  if not private.can_manage_operation(target_operation) then
    raise exception 'OPERATION_NOT_MANAGEABLE' using errcode = '42501';
  end if;

  -- Serialize reuse of one key even if a caller mistakenly targets two
  -- different operations concurrently.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(request_key::text, 0)
  );

  -- A concurrent request may have completed while this call waited.
  select count(*) into prior_count
  from public.operation_audit_events
  where request_id = request_key;

  if prior_count > 0 then
    select e.* into prior_event
    from public.operation_audit_events e
    where e.request_id = request_key
    order by e.id desc
    limit 1;

    if prior_count <> 1
       or prior_event.event_type <> 'logistics.quote.deleted'
       or prior_event.actor_id is distinct from caller
       or prior_event.event_data->>'quote_id' is distinct from target_quote::text then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode = '22023';
    end if;
    return true;
  end if;

  -- Every mutating path takes the operation lock before the quote row to
  -- match the financial trigger.
  perform 1
  from public.operations o
  where o.id = target_operation
  for update;
  if not found then
    raise exception 'OPERATION_NOT_FOUND' using errcode = 'P0002';
  end if;

  if not private.can_manage_operation(target_operation) then
    raise exception 'OPERATION_NOT_MANAGEABLE' using errcode = '42501';
  end if;

  -- Recheck after acquiring the parent lock; this also protects retries
  -- racing with a first successful request.
  select count(*) into prior_count
  from public.operation_audit_events
  where request_id = request_key;

  if prior_count > 0 then
    select e.* into prior_event
    from public.operation_audit_events e
    where e.request_id = request_key
    order by e.id desc
    limit 1;

    if prior_count <> 1
       or prior_event.event_type <> 'logistics.quote.deleted'
       or prior_event.actor_id is distinct from caller
       or prior_event.event_data->>'quote_id' is distinct from target_quote::text then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode = '22023';
    end if;
    return true;
  end if;

  select q.* into chosen
  from public.logistics_quotes q
  where q.id = target_quote
    and q.operation_id = target_operation
  for update;
  if not found then
    raise exception 'QUOTE_NOT_FOUND' using errcode = 'P0002';
  end if;

  if chosen.status = 'selected' then
    raise exception 'QUOTE_SELECTED_CANNOT_DELETE' using errcode = '22023';
  end if;

  delete from public.logistics_quotes
  where id = target_quote
    and operation_id = target_operation;

  if not found then
    raise exception 'QUOTE_NOT_FOUND' using errcode = 'P0002';
  end if;

  perform private.append_operation_audit(
    target_operation,
    'logistics.quote.deleted',
    caller,
    jsonb_build_object('quote_id', target_quote, 'previous_status', chosen.status),
    request_key
  );

  return true;
end;
$function$;

revoke all on function public.delete_logistics_quote(uuid, uuid) from public, anon;
grant execute on function public.delete_logistics_quote(uuid, uuid) to authenticated;

-- Keep the RLS DELETE policy as defense-in-depth, but remove direct table
-- DELETE from browser roles. The SECURITY DEFINER RPC performs its own
-- explicit actor and operation authorization before deleting.
revoke delete on public.logistics_quotes from public, anon, authenticated;

commit;
