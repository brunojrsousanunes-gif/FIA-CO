\set ON_ERROR_STOP on

-- Database-level three-company rehearsal in isolated CI PostgreSQL.
-- The three operational roles use three different auth.users identities.
-- A fourth active carrier-company member is a negative control: membership
-- alone must not let that account act for the accepted carrier user.
-- This does not create Supabase Auth users or call the hosted Supabase project.

insert into auth.users(id) values
 ('71000000-0000-0000-0000-000000000001'),
 ('71000000-0000-0000-0000-000000000002'),
 ('71000000-0000-0000-0000-000000000003'),
 ('71000000-0000-0000-0000-000000000004');

insert into public.organizations(id,name,status) values
 ('72000000-0000-0000-0000-000000000001','Vendedor Demo CI','active'),
 ('72000000-0000-0000-0000-000000000002','Comprador Demo CI','active'),
 ('72000000-0000-0000-0000-000000000003','Transportista Demo CI','active');

insert into public.organization_members(organization_id,user_id,member_role,status) values
 ('72000000-0000-0000-0000-000000000001','71000000-0000-0000-0000-000000000001','manager','active'),
 ('72000000-0000-0000-0000-000000000002','71000000-0000-0000-0000-000000000002','manager','active'),
 ('72000000-0000-0000-0000-000000000003','71000000-0000-0000-0000-000000000003','manager','active'),
 ('72000000-0000-0000-0000-000000000003','71000000-0000-0000-0000-000000000004','member','active');

insert into private.organization_security_profiles
 (organization_id,trust_level,verification_status,verified_controls,verified_at,valid_until,verified_by)
values
 ('72000000-0000-0000-0000-000000000001','L3_SHARED','verified',
  '{"organizationIdentified":true,"termsAccepted":true,"tenantBoundaryReady":true,"auditReady":true,"incidentContactDefined":true,"identityVerified":true,"strongAuthenticationReady":true,"secretsManaged":true,"dataMinimizationReady":true,"retentionPolicyReady":true,"securityTestsPassed":true,"dataPermitsReady":true,"grantExpiryReady":true,"grantRevocationReady":true,"partnerIdentityVerified":true,"purposeLimitationReady":true,"crossOrgIsolationTestsPassed":true}'::jsonb,
  now(),now()+interval '30 days','71000000-0000-0000-0000-000000000001'),
 ('72000000-0000-0000-0000-000000000002','L3_SHARED','verified',
  '{"organizationIdentified":true,"termsAccepted":true,"tenantBoundaryReady":true,"auditReady":true,"incidentContactDefined":true,"identityVerified":true,"strongAuthenticationReady":true,"secretsManaged":true,"dataMinimizationReady":true,"retentionPolicyReady":true,"securityTestsPassed":true,"dataPermitsReady":true,"grantExpiryReady":true,"grantRevocationReady":true,"partnerIdentityVerified":true,"purposeLimitationReady":true,"crossOrgIsolationTestsPassed":true}'::jsonb,
  now(),now()+interval '30 days','71000000-0000-0000-0000-000000000001'),
 ('72000000-0000-0000-0000-000000000003','L3_SHARED','verified',
  '{"organizationIdentified":true,"termsAccepted":true,"tenantBoundaryReady":true,"auditReady":true,"incidentContactDefined":true,"identityVerified":true,"strongAuthenticationReady":true,"secretsManaged":true,"dataMinimizationReady":true,"retentionPolicyReady":true,"securityTestsPassed":true,"dataPermitsReady":true,"grantExpiryReady":true,"grantRevocationReady":true,"partnerIdentityVerified":true,"purposeLimitationReady":true,"crossOrgIsolationTestsPassed":true}'::jsonb,
  now(),now()+interval '30 days','71000000-0000-0000-0000-000000000001');

insert into public.operations(id,reference,title,status,amount_cents,currency,created_by)
values ('73000000-0000-0000-0000-000000000001','FIA-PILOT-3ROLE-001',
        'Pieza industrial ficticia — ensayo de tres empresas','draft',125000,'EUR',
        '71000000-0000-0000-0000-000000000001');

insert into public.operation_participants
 (operation_id,organization_id,participant_role,status,invited_by)
values
 ('73000000-0000-0000-0000-000000000001','72000000-0000-0000-0000-000000000001','seller','invited','71000000-0000-0000-0000-000000000001'),
 ('73000000-0000-0000-0000-000000000001','72000000-0000-0000-0000-000000000002','buyer','invited','71000000-0000-0000-0000-000000000001'),
 ('73000000-0000-0000-0000-000000000001','72000000-0000-0000-0000-000000000003','carrier','invited','71000000-0000-0000-0000-000000000001');

-- Seller creates the invitation only when all three organizations are L3.
set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000001';
set role authenticated;
select public.transition_operation(
 '73000000-0000-0000-0000-000000000001','invited',1,
 '74000000-0000-0000-0000-000000000001');
reset role;

-- Each role accepts through its own authenticated subject.
set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000001';
set role authenticated;
select public.accept_operation_invitation(
 '73000000-0000-0000-0000-000000000001','seller',
 '74000000-0000-0000-0000-000000000002');
reset role;

set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000002';
set role authenticated;
select public.accept_operation_invitation(
 '73000000-0000-0000-0000-000000000001','buyer',
 '74000000-0000-0000-0000-000000000003');
reset role;

set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000003';
set role authenticated;
select public.accept_operation_invitation(
 '73000000-0000-0000-0000-000000000001','carrier',
 '74000000-0000-0000-0000-000000000004');
reset role;

do $three_independent_acceptors$
begin
  if (select count(*) from public.operation_participants
      where operation_id='73000000-0000-0000-0000-000000000001'
        and status='accepted') <> 3 then
    raise exception 'THREE_ROLE_ACCEPTANCE_INCOMPLETE';
  end if;
  if (select count(distinct accepted_by) from public.operation_participants
      where operation_id='73000000-0000-0000-0000-000000000001') <> 3 then
    raise exception 'THREE_ROLES_DID_NOT_USE_DISTINCT_AUTH_IDENTITIES';
  end if;
  if exists (
    select 1 from public.operation_participants
    where operation_id='73000000-0000-0000-0000-000000000001'
      and (
        (participant_role='seller' and accepted_by<>'71000000-0000-0000-0000-000000000001'::uuid)
        or (participant_role='buyer' and accepted_by<>'71000000-0000-0000-0000-000000000002'::uuid)
        or (participant_role='carrier' and accepted_by<>'71000000-0000-0000-0000-000000000003'::uuid)
      )
  ) then
    raise exception 'ROLE_ACCEPTED_BY_WRONG_ACCOUNT';
  end if;
end
$three_independent_acceptors$;

-- All three acceptances are required before the operation becomes accepted.
set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000001';
set role authenticated;
select public.transition_operation(
 '73000000-0000-0000-0000-000000000001','accepted',2,
 '74000000-0000-0000-0000-000000000005');

-- Seller and buyer cannot perform the carrier's dispatch transition.
do $seller_cannot_dispatch$
begin
  begin
    perform public.transition_operation(
      '73000000-0000-0000-0000-000000000001','in_transit',3,
      '74000000-0000-0000-0000-000000000006');
    raise exception 'SELLER_PERFORMED_CARRIER_TRANSITION';
  exception when insufficient_privilege then
    if sqlerrm <> 'TRANSITION_NOT_ALLOWED' then raise; end if;
  end;
end
$seller_cannot_dispatch$;
reset role;

set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000002';
set role authenticated;
do $buyer_cannot_dispatch$
begin
  begin
    perform public.transition_operation(
      '73000000-0000-0000-0000-000000000001','in_transit',3,
      '74000000-0000-0000-0000-000000000007');
    raise exception 'BUYER_PERFORMED_CARRIER_TRANSITION';
  exception when insufficient_privilege then
    if sqlerrm <> 'TRANSITION_NOT_ALLOWED' then raise; end if;
  end;
end
$buyer_cannot_dispatch$;
reset role;

-- A second active member of the carrier organization cannot impersonate
-- the account that accepted the carrier role.
set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000004';
set role authenticated;
do $other_carrier_member_cannot_dispatch$
begin
  begin
    perform public.transition_operation(
      '73000000-0000-0000-0000-000000000001','in_transit',3,
      '74000000-0000-0000-0000-000000000008');
    raise exception 'NON_ACCEPTING_CARRIER_MEMBER_PERFORMED_TRANSITION';
  exception when insufficient_privilege then
    if sqlerrm <> 'TRANSITION_NOT_ALLOWED' then raise; end if;
  end;
end
$other_carrier_member_cannot_dispatch$;
reset role;

-- Only the carrier identity that accepted the role can dispatch and deliver.
set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000003';
set role authenticated;
select public.transition_operation(
 '73000000-0000-0000-0000-000000000001','in_transit',3,
 '74000000-0000-0000-0000-000000000009');
select public.transition_operation(
 '73000000-0000-0000-0000-000000000001','delivered',4,
 '74000000-0000-0000-0000-000000000010');

-- Buyer cannot close the operation until its own receipt confirmation exists.
reset role;
set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000002';
set role authenticated;
do $buyer_must_confirm_receipt$
begin
  begin
    perform public.transition_operation(
      '73000000-0000-0000-0000-000000000001','completed',5,
      '74000000-0000-0000-0000-000000000011');
    raise exception 'BUYER_CLOSED_WITHOUT_RECEIPT_CONFIRMATION';
  exception when insufficient_privilege then
    if sqlerrm <> 'TRANSITION_NOT_ALLOWED' then raise; end if;
  end;
end
$buyer_must_confirm_receipt$;

insert into public.operation_confirmations
 (operation_id,participant_role,confirmation_type,confirmed_by)
values
 ('73000000-0000-0000-0000-000000000001','buyer','receipt',
  '71000000-0000-0000-0000-000000000002');

select public.transition_operation(
 '73000000-0000-0000-0000-000000000001','completed',5,
 '74000000-0000-0000-0000-000000000012');
reset role;

do $three_company_pilot_result$
begin
  if (select status from public.operations
      where id='73000000-0000-0000-0000-000000000001') <> 'completed' then
    raise exception 'THREE_COMPANY_PILOT_DID_NOT_COMPLETE';
  end if;
  if (select version from public.operations
      where id='73000000-0000-0000-0000-000000000001') <> 6 then
    raise exception 'THREE_COMPANY_PILOT_VERSION_SEQUENCE_INVALID';
  end if;
  if (select count(*) from public.operation_audit_events
      where operation_id='73000000-0000-0000-0000-000000000001'
        and event_type='operation.transition') <> 5 then
    raise exception 'THREE_COMPANY_PILOT_TRANSITION_AUDIT_INCOMPLETE';
  end if;
  if (select count(*) from public.operation_audit_events
      where operation_id='73000000-0000-0000-0000-000000000001'
        and event_type='participant.accepted') <> 3 then
    raise exception 'THREE_COMPANY_PILOT_ACCEPTANCE_AUDIT_INCOMPLETE';
  end if;
end
$three_company_pilot_result$;

select 'THREE INDEPENDENT IDENTITIES / THREE COMPANIES / FULL POSTGRES FLOW: PASS' as result;
