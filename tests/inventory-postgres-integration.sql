\set ON_ERROR_STOP on
-- Seed two real organizations and one accepted operation participant after
-- applying the complete repository migration chain.
insert into auth.users(id) values
 ('10000000-0000-0000-0000-000000000001'),
 ('10000000-0000-0000-0000-000000000002'),
 ('10000000-0000-0000-0000-000000000003');

insert into public.organizations(id,name,status) values
 ('20000000-0000-0000-0000-000000000001','Empresa Uno','active'),
 ('20000000-0000-0000-0000-000000000002','Empresa Dos','active');

insert into public.organization_members(organization_id,user_id,member_role,status) values
 ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','manager','active'),
 ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','manager','active');

insert into public.operations(id,reference,title,status,created_by) values
 ('30000000-0000-0000-0000-000000000001','FIA-INV-0001','Operación inventario','accepted','10000000-0000-0000-0000-000000000001');

insert into public.operation_participants(operation_id,organization_id,participant_role,status,invited_by,accepted_by,accepted_at)
values ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','seller','accepted',
 '10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',now());

set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set role authenticated;
insert into public.inventory_items(id,organization_id,sku,description,created_by)
values ('40000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','SKU-1','Material de prueba','10000000-0000-0000-0000-000000000001');
insert into public.inventory_items(id,organization_id,sku,description,created_by)
values ('40000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','SKU-2','Segundo material','10000000-0000-0000-0000-000000000001');

select public.record_inventory_movement(
 '40000000-0000-0000-0000-000000000001','in',10,'Entrada inicial',
 '50000000-0000-0000-0000-000000000001',null);
select public.reserve_inventory_item(
 '40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',4,
 '50000000-0000-0000-0000-000000000002');

-- Same request key and same payload must return the original row without duplicating it.
select public.record_inventory_movement(
 '40000000-0000-0000-0000-000000000001','in',10,'Entrada inicial',
 '50000000-0000-0000-0000-000000000001',null);
do $$
begin
 if (select count(*) from public.inventory_movements where request_key='50000000-0000-0000-0000-000000000001') <> 1 then
   raise exception 'IDEMPOTENT_RETRY_DUPLICATED_MOVEMENT';
 end if;
 begin
  perform public.reserve_inventory_item(
   '40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',7,
   '50000000-0000-0000-0000-000000000003');
  raise exception 'OVER_RESERVATION_WAS_ALLOWED';
 exception when check_violation then
  if sqlerrm <> 'INSUFFICIENT_AVAILABLE_STOCK' then raise; end if;
 end;
 begin
  perform public.record_inventory_movement(
   '40000000-0000-0000-0000-000000000001','out',7,'Salida excesiva',
   '50000000-0000-0000-0000-000000000004',null);
  raise exception 'OVER_WITHDRAWAL_WAS_ALLOWED';
 exception when check_violation then
  if sqlerrm <> 'INSUFFICIENT_AVAILABLE_STOCK' then raise; end if;
 end;
end $$;

do $$
begin
 if (select count(*) from public.inventory_items) <> 2 then
   raise exception 'OWNER_CANNOT_READ_OWN_ITEM';
 end if;
end $$;
reset role;

set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set role authenticated;
do $$
begin
 if (select count(*) from public.inventory_items) <> 0 then
   raise exception 'CROSS_ORG_ITEM_LEAK';
 end if;
 if (select count(*) from public.inventory_movements) <> 0 then
   raise exception 'CROSS_ORG_MOVEMENT_LEAK';
 end if;
 if (select count(*) from public.inventory_reservations) <> 0 then
   raise exception 'CROSS_ORG_RESERVATION_LEAK';
 end if;
end $$;
reset role;

set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set role authenticated;
select public.release_inventory_reservation(
 (select id from public.inventory_reservations where request_key='50000000-0000-0000-0000-000000000002'),
 'fulfilled');

do $$
declare s record;
begin
 select * into s from public.inventory_stock where item_id='40000000-0000-0000-0000-000000000001';
 if s.on_hand <> 6 or s.reserved <> 0 or s.available <> 6 then
   raise exception 'FULFILLMENT_BALANCE_WRONG: %, %, %',s.on_hand,s.reserved,s.available;
 end if;
 if (select count(*) from public.inventory_movements where movement_type='out') <> 1 then
   raise exception 'FULFILLMENT_MOVEMENT_MISSING';
 end if;
end $$;

do $$
begin
 begin
  perform public.record_inventory_movement(
   '40000000-0000-0000-0000-000000000001','in',9,'payload distinto',
   '50000000-0000-0000-0000-000000000001',null);
  raise exception 'IDEMPOTENCY_CHECK_FAILED';
 exception when sqlstate '22023' then
  if sqlerrm <> 'IDEMPOTENCY_KEY_REUSED' then raise; end if;
 end;
 begin
  perform public.record_inventory_movement(
   '40000000-0000-0000-0000-000000000002','in',10,'Entrada inicial',
   '50000000-0000-0000-0000-000000000001',null);
  raise exception 'CROSS_ITEM_IDEMPOTENCY_CHECK_FAILED';
 exception when sqlstate '22023' then
  if sqlerrm <> 'IDEMPOTENCY_KEY_REUSED' then raise; end if;
 end;
end $$;
reset role;


-- Incident resolution guard: authorized resolver may resolve once, but cannot
-- rewrite the incident's identity/scope or reopen it afterwards.
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set role authenticated;
insert into public.operation_incidents
 (id,operation_id,incident_type,description,status,blocks_progress,opened_by)
values
 ('60000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  'logistics','Incidencia de prueba','open',true,
  '10000000-0000-0000-0000-000000000001');

do $incident_rejection$
begin
  begin
    update public.operation_incidents
    set status='resolved',
        resolved_by='10000000-0000-0000-0000-000000000002',
        resolved_at=now(),
        resolution_note='Resuelta por otro usuario'
    where id='60000000-0000-0000-0000-000000000001';
    raise exception 'INCIDENT_WRONG_RESOLVER_WAS_ACCEPTED';
  exception when insufficient_privilege then
    if sqlerrm <> 'INCIDENT_RESOLVER_MUST_BE_CALLER' then raise; end if;
  end;

  begin
    update public.operation_incidents
    set status='resolved',
        resolved_by='10000000-0000-0000-0000-000000000001',
        resolved_at=now(),
        resolution_note='  '
    where id='60000000-0000-0000-0000-000000000001';
    raise exception 'INCIDENT_EMPTY_RESOLUTION_NOTE_WAS_ACCEPTED';
  exception when invalid_parameter_value then
    if sqlerrm <> 'INCIDENT_RESOLUTION_DETAILS_REQUIRED' then raise; end if;
  end;
end $incident_rejection$;

do $incident_timestamp$
declare recorded_at timestamptz;
begin
  update public.operation_incidents
  set status='resolved',
      resolved_by='10000000-0000-0000-0000-000000000001',
      resolved_at='2099-01-01 00:00:00+00',
      resolution_note='Resuelta en prueba'
  where id='60000000-0000-0000-0000-000000000001';

  select resolved_at into recorded_at
  from public.operation_incidents
  where id='60000000-0000-0000-0000-000000000001';

  if recorded_at is distinct from statement_timestamp() then
    raise exception 'INCIDENT_RESOLUTION_TIMESTAMP_NOT_DATABASE_CONTROLLED';
  end if;
end $incident_timestamp$;

reset role;
-- Exercise the trigger itself as table owner while retaining auth.uid() for
-- the resolver identity. The authenticated role's RLS policy may hide resolved
-- rows from UPDATE, which would otherwise make a zero-row UPDATE look like a
-- trigger rejection.
do $incident_guard$
begin
  begin
    update public.operation_incidents
    set description='Texto manipulado'
    where id='60000000-0000-0000-0000-000000000001';
    raise exception 'RESOLVED_INCIDENT_WAS_MUTABLE';
  exception when insufficient_privilege then
    if sqlerrm <> 'INCIDENT_IDENTITY_IMMUTABLE' then raise; end if;
  end;
  begin
    update public.operation_incidents
    set status='open'
    where id='60000000-0000-0000-0000-000000000001';
    raise exception 'RESOLVED_INCIDENT_WAS_REOPENED';
  exception when insufficient_privilege then
    if sqlerrm <> 'INCIDENT_TRANSITION_NOT_ALLOWED' then raise; end if;
  end;

  begin
    update public.operation_incidents
    set resolved_by='10000000-0000-0000-0000-000000000002',
        resolved_at=now() + interval '1 day',
        resolution_note='Nota sustituida'
    where id='60000000-0000-0000-0000-000000000001';
    raise exception 'RESOLVED_INCIDENT_DETAILS_WERE_MUTABLE';
  exception when insufficient_privilege then
    if sqlerrm <> 'INCIDENT_TRANSITION_NOT_ALLOWED' then raise; end if;
  end;
  if (select count(*) from public.operation_incidents
      where id='60000000-0000-0000-0000-000000000001'
        and status='resolved'
        and description='Incidencia de prueba') <> 1 then
    raise exception 'INCIDENT_RESOLUTION_STATE_INVALID';
  end if;
end $incident_guard$;
reset role;


-- Three-party confirmation gate: invited users cannot confirm; buyer closure
-- cannot bypass a persisted buyer receipt confirmation.
reset role;
insert into public.organizations(id,name,status)
values ('20000000-0000-0000-0000-000000000003','Empresa Transportista','active');
insert into private.organization_security_profiles
 (organization_id,trust_level,verification_status,verified_controls,verified_at,valid_until,verified_by)
select id,'L3_SHARED','verified',
 jsonb_build_object(
 'organizationIdentified',true,'termsAccepted',true,'tenantBoundaryReady',true,'auditReady',true,'incidentContactDefined',true,
 'identityVerified',true,'strongAuthenticationReady',true,'secretsManaged',true,'dataMinimizationReady',true,'retentionPolicyReady',true,'securityTestsPassed',true,
 'dataPermitsReady',true,'grantExpiryReady',true,'grantRevocationReady',true,'partnerIdentityVerified',true,'purposeLimitationReady',true,'crossOrgIsolationTestsPassed',true
 ),now(),now()+interval '30 days','10000000-0000-0000-0000-000000000001'
from public.organizations where id in ('20000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003');
insert into public.organization_members(organization_id,user_id,member_role,status) values
 ('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','manager','active'),
 ('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003','manager','active');

-- The creator can invite three L3 organizations before their users accept,
-- and can still cancel an invitation if a trust check later expires.
insert into public.operations(id,reference,title,status,created_by)
values ('30000000-0000-0000-0000-000000000002','FIA-INV-0002','Operación de invitación','draft',
        '10000000-0000-0000-0000-000000000001');
insert into public.operation_participants
 (operation_id,organization_id,participant_role,status,invited_by)
values
 ('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','seller','invited','10000000-0000-0000-0000-000000000001'),
 ('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','buyer','invited','10000000-0000-0000-0000-000000000001'),
 ('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003','carrier','invited','10000000-0000-0000-0000-000000000001');
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set role authenticated;
select public.transition_operation(
 '30000000-0000-0000-0000-000000000002','invited',1,
 '50000000-0000-0000-0000-000000000012');
do $invitation_transition$
begin
 if (select status from public.operations where id='30000000-0000-0000-0000-000000000002') <> 'invited' then
   raise exception 'L3_INVITATION_TRANSITION_FAILED';
 end if;
end $invitation_transition$;
reset role;

update private.organization_security_profiles set trust_level='L2_VERIFIED'
where organization_id='20000000-0000-0000-0000-000000000003';
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set role authenticated;
select public.transition_operation(
 '30000000-0000-0000-0000-000000000002','cancelled',2,
 '50000000-0000-0000-0000-000000000013');
do $invitation_cancellation$
begin
 if (select status from public.operations where id='30000000-0000-0000-0000-000000000002') <> 'cancelled' then
   raise exception 'INVITATION_CANCELLATION_BLOCKED_BY_TRUST_GATE';
 end if;
end $invitation_cancellation$;
reset role;
update private.organization_security_profiles set trust_level='L3_SHARED'
where organization_id='20000000-0000-0000-0000-000000000003';

insert into public.operation_participants
 (operation_id,organization_id,participant_role,status,invited_by,accepted_by,accepted_at)
values
 ('30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002','buyer','invited',
  '10000000-0000-0000-0000-000000000001',null,null),
 ('30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000003','carrier','accepted',
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',now());

set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set role authenticated;
do $confirmation_gate$
begin
  begin
    insert into public.operation_confirmations
      (operation_id,participant_role,confirmation_type,confirmed_by)
    values
      ('30000000-0000-0000-0000-000000000001','buyer','receipt',
       '10000000-0000-0000-0000-000000000002');
    raise exception 'INVITED_BUYER_CONFIRMATION_WAS_ACCEPTED';
  exception when insufficient_privilege then
    null;
  end;
end $confirmation_gate$;
reset role;

-- Accept the buyer invitation through the authorized server function.
select public.accept_operation_invitation(
 '30000000-0000-0000-0000-000000000001','buyer',
 '50000000-0000-0000-0000-000000000009');
-- L2 is insufficient for cross-company confirmations.
reset role;
update private.organization_security_profiles set trust_level='L2_VERIFIED'
where organization_id='20000000-0000-0000-0000-000000000002';
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set role authenticated;
do $trust_gate$
begin
 begin
  insert into public.operation_confirmations(operation_id,participant_role,confirmation_type,confirmed_by)
  values ('30000000-0000-0000-0000-000000000001','buyer','receipt','10000000-0000-0000-0000-000000000002');
  raise exception 'L2_COMPANY_CONFIRMED_SHARED_OPERATION';
 exception when insufficient_privilege then null;
 end;
end $trust_gate$;
reset role;
update private.organization_security_profiles set trust_level='L3_SHARED'
where organization_id='20000000-0000-0000-0000-000000000002';

-- A buyer with L3 cannot confirm when another participant company is only L2.
update private.organization_security_profiles set trust_level='L2_VERIFIED'
where organization_id='20000000-0000-0000-0000-000000000003';
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set role authenticated;
do $all_participant_trust_gate$
begin
  begin
    insert into public.operation_confirmations(operation_id,participant_role,confirmation_type,confirmed_by)
    values ('30000000-0000-0000-0000-000000000001','buyer','receipt','10000000-0000-0000-0000-000000000002');
    raise exception 'L2_PARTICIPANT_COMPANY_ALLOWED_SHARED_CONFIRMATION';
  exception when insufficient_privilege then null;
  end;
end $all_participant_trust_gate$;
reset role;
update private.organization_security_profiles set trust_level='L3_SHARED'
where organization_id='20000000-0000-0000-0000-000000000003';

-- A second active member of the carrier company must not act on the
-- role accepted by a different account.
update public.operations set status='in_transit',version=version+1
where id='30000000-0000-0000-0000-000000000001';
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';
set role authenticated;
do $accepted_account_gate$
begin
  begin
    perform public.transition_operation(
      '30000000-0000-0000-0000-000000000001','delivered',
      (select version from public.operations where id='30000000-0000-0000-0000-000000000001'),
      '50000000-0000-0000-0000-000000000011');
    raise exception 'NON_ACCEPTING_CARRIER_MEMBER_TRANSITION_WAS_ACCEPTED';
  exception when insufficient_privilege then
    if sqlerrm <> 'TRANSITION_NOT_ALLOWED' then raise; end if;
  end;
end $accepted_account_gate$;
reset role;

-- The exact account that accepted the carrier role remains authorized.
-- Retry with the ORIGINAL expected_version to simulate a lost response.
set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set role authenticated;
do $transition_idempotency_replay$
declare
  v_operation_id constant uuid := '30000000-0000-0000-0000-000000000001';
  v_request_key constant uuid := '50000000-0000-0000-0000-000000000014';
  initial_version integer;
  first_result public.operations;
  replay_result public.operations;
  audit_count integer;
begin
  select version into initial_version
  from public.operations where id=v_operation_id;

  first_result := public.transition_operation(
    v_operation_id,'delivered',initial_version,v_request_key);

  if first_result.status is distinct from 'delivered'
     or first_result.version <> initial_version + 1 then
    raise exception 'TRANSITION_FIRST_REQUEST_RESULT_INVALID';
  end if;

  replay_result := public.transition_operation(
    v_operation_id,'delivered',initial_version,v_request_key);

  if replay_result.status is distinct from first_result.status
     or replay_result.version <> first_result.version then
    raise exception 'TRANSITION_IDEMPOTENCY_REPLAY_CHANGED_RESULT';
  end if;

  select count(*) into audit_count
  from public.operation_audit_events
  where operation_id=v_operation_id and request_id=v_request_key;

  if audit_count <> 1 then
    raise exception 'TRANSITION_IDEMPOTENCY_REPLAY_DUPLICATED_AUDIT_EVENT';
  end if;
end $transition_idempotency_replay$;

do $transition_idempotency_reuse$
begin
  begin
    perform public.transition_operation(
      '30000000-0000-0000-0000-000000000001','completed',
      (select version from public.operations where id='30000000-0000-0000-0000-000000000001'),
      '50000000-0000-0000-0000-000000000014');
    raise exception 'TRANSITION_IDEMPOTENCY_KEY_REUSE_ACCEPTED';
  exception when invalid_parameter_value then
    if sqlerrm <> 'IDEMPOTENCY_KEY_REUSED' then raise; end if;
  end;
end $transition_idempotency_reuse$;
reset role;

-- Put the operation at delivered for the closure-specific test.
update public.operations set status='delivered',version=version+1
where id='30000000-0000-0000-0000-000000000001';

set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set role authenticated;
do $completion_gate$
begin
  begin
    perform public.transition_operation(
      '30000000-0000-0000-0000-000000000001','completed',
      (select version from public.operations where id='30000000-0000-0000-0000-000000000001'),
      '50000000-0000-0000-0000-000000000010');
    raise exception 'BUYER_CLOSED_WITHOUT_RECEIPT_CONFIRMATION';
  exception when insufficient_privilege then
    if sqlerrm <> 'TRANSITION_NOT_ALLOWED' then raise; end if;
  end;
end $completion_gate$;

insert into public.operation_confirmations
 (operation_id,participant_role,confirmation_type,confirmed_by)
values
 ('30000000-0000-0000-0000-000000000001','buyer','receipt',
  '10000000-0000-0000-0000-000000000002');

do $completion_result$
begin
  if (select status from public.operations
      where id='30000000-0000-0000-0000-000000000001') <> 'completed' then
    raise exception 'BUYER_RECEIPT_DID_NOT_COMPLETE_OPERATION';
  end if;
end $completion_result$;
reset role;

-- Private role helper is an internal authorization primitive, not a client API.
do $private_role_helper_boundary$
begin
  if has_function_privilege('authenticated','private.has_operation_role(uuid,text)','EXECUTE')
     or has_function_privilege('anon','private.has_operation_role(uuid,text)','EXECUTE') then
    raise exception 'PRIVATE_ROLE_HELPER_EXECUTABLE_BY_CLIENT';
  end if;
end $private_role_helper_boundary$;

-- Trust profiles are internal security state, not part of the public API.
do $trust_profile_boundary$
begin
  if to_regclass('public.organization_security_profiles') is not null then
    raise exception 'TRUST_PROFILE_EXPOSED_IN_PUBLIC_SCHEMA';
  end if;
end $trust_profile_boundary$;

set request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set role authenticated;
do $trust_profile_read$
begin
  begin
    perform count(*) from private.organization_security_profiles;
    raise exception 'AUTHENTICATED_USER_READ_PRIVATE_TRUST_PROFILE';
  exception when insufficient_privilege then
    null;
  end;
end $trust_profile_read$;
reset role;

select 'FULL MIGRATION CHAIN + INCIDENT + TRUST + PRIVATE PROFILE TESTS: PASS' as result;
