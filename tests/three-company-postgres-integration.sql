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
 ('71000000-0000-0000-0000-000000000004'),
 ('71000000-0000-0000-0000-000000000005'),
 ('71000000-0000-0000-0000-000000000006'),
 ('71000000-0000-0000-0000-000000000007');

insert into public.organizations(id,name,status) values
 ('72000000-0000-0000-0000-000000000001','Vendedor Demo CI','active'),
 ('72000000-0000-0000-0000-000000000002','Comprador Demo CI','active'),
 ('72000000-0000-0000-0000-000000000003','Transportista Demo CI','active');

insert into public.organization_members(organization_id,user_id,member_role,status) values
 ('72000000-0000-0000-0000-000000000001','71000000-0000-0000-0000-000000000001','ceo','active'),
 ('72000000-0000-0000-0000-000000000002','71000000-0000-0000-0000-000000000002','manager','active'),
 ('72000000-0000-0000-0000-000000000003','71000000-0000-0000-0000-000000000003','ceo','active'),
 ('72000000-0000-0000-0000-000000000003','71000000-0000-0000-0000-000000000004','member','active'),
 ('72000000-0000-0000-0000-000000000002','71000000-0000-0000-0000-000000000001','member','active'),
 ('72000000-0000-0000-0000-000000000001','71000000-0000-0000-0000-000000000006','manager','active'),
 ('72000000-0000-0000-0000-000000000001','71000000-0000-0000-0000-000000000007','manager','active');

-- Draft creation must replay only an identical business request.
set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000001';
set role authenticated;
do $draft_creation_request_key_is_payload_bound$
declare
  first_id uuid;
  retry_id uuid;
begin
  first_id := public.create_operation_draft(
    'Pedido de prueba de idempotencia','standard',
    '72000000-0000-0000-0000-000000000001',
    '72000000-0000-0000-0000-000000000001',
    '72000000-0000-0000-0000-000000000003',
    '72000000-0000-0000-0000-000000000002',
    '74000000-0000-0000-0000-000000000020'
  );
  retry_id := public.create_operation_draft(
    'Pedido de prueba de idempotencia','standard',
    '72000000-0000-0000-0000-000000000001',
    '72000000-0000-0000-0000-000000000001',
    '72000000-0000-0000-0000-000000000003',
    '72000000-0000-0000-0000-000000000002',
    '74000000-0000-0000-0000-000000000020'
  );
  if first_id is distinct from retry_id then
    raise exception 'IDENTICAL_DRAFT_RETRY_CREATED_DUPLICATE_OPERATION';
  end if;
  begin
    perform public.create_operation_draft(
      'Pedido diferente con la misma clave','standard',
      '72000000-0000-0000-0000-000000000001',
      '72000000-0000-0000-0000-000000000001',
      '72000000-0000-0000-0000-000000000003',
      '72000000-0000-0000-0000-000000000002',
      '74000000-0000-0000-0000-000000000020'
    );
    raise exception 'DRAFT_REQUEST_KEY_REUSED_WITH_DIFFERENT_PAYLOAD';
  exception when invalid_parameter_value then
    if sqlerrm <> 'IDEMPOTENCY_KEY_REUSED' then raise; end if;
  end;
  begin
    perform public.create_operation_draft(
      'Pedido sin clave','standard',
      '72000000-0000-0000-0000-000000000001',
      '72000000-0000-0000-0000-000000000001',
      '72000000-0000-0000-0000-000000000003',
      '72000000-0000-0000-0000-000000000002',null
    );
    raise exception 'DRAFT_WITH_NULL_REQUEST_KEY_ACCEPTED';
  exception when invalid_parameter_value then
    if sqlerrm <> 'ALL_PARTIES_AND_REQUEST_KEY_REQUIRED' then raise; end if;
  end;
end
$draft_creation_request_key_is_payload_bound$;
reset role;

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

insert into public.operations(id,reference,title,status,amount_cents,currency,created_by,owner_organization_id)
values ('73000000-0000-0000-0000-000000000001','FIA-PILOT-3ROLE-001',
        'Pieza industrial ficticia — ensayo de tres empresas','draft',125000,'EUR',
        '71000000-0000-0000-0000-000000000001','72000000-0000-0000-0000-000000000001');

insert into public.operation_participants
 (operation_id,organization_id,participant_role,status,invited_by)
values
 ('73000000-0000-0000-0000-000000000001','72000000-0000-0000-0000-000000000001','seller','invited','71000000-0000-0000-0000-000000000001'),
 ('73000000-0000-0000-0000-000000000001','72000000-0000-0000-0000-000000000002','buyer','invited','71000000-0000-0000-0000-000000000001'),
 ('73000000-0000-0000-0000-000000000001','72000000-0000-0000-0000-000000000003','carrier','invited','71000000-0000-0000-0000-000000000001');

-- A legacy collision across two operations must not silently replay one draft.
select private.append_operation_audit(
 '73000000-0000-0000-0000-000000000001',
 'test.idempotency.collision',
 '71000000-0000-0000-0000-000000000001',
 '{}'::jsonb,
 '74000000-0000-0000-0000-000000000020'
);
set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000001';
set role authenticated;
do $draft_request_key_rejects_multiple_audit_events$
begin
  begin
    perform public.create_operation_draft(
      'Pedido de prueba de idempotencia','standard',
      '72000000-0000-0000-0000-000000000001',
      '72000000-0000-0000-0000-000000000001',
      '72000000-0000-0000-0000-000000000003',
      '72000000-0000-0000-0000-000000000002',
      '74000000-0000-0000-0000-000000000020'
    );
    raise exception 'DRAFT_REQUEST_KEY_WITH_MULTIPLE_EVENTS_REPLAYED';
  exception when invalid_parameter_value then
    if sqlerrm <> 'IDEMPOTENCY_KEY_REUSED' then raise; end if;
  end;
end
$draft_request_key_rejects_multiple_audit_events$;
reset role;


do $financial_amount_columns_are_private$
begin
  if has_column_privilege('authenticated','public.operations','amount_cents','SELECT')
     or has_column_privilege('authenticated','public.operations','currency','SELECT') then
    raise exception 'LEGACY_OPERATION_FINANCIAL_COLUMNS_EXPOSED';
  end if;
end
$financial_amount_columns_are_private$;

set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000001';
set role authenticated;
do $participants_can_identify_counterpart_companies$
declare visible_count integer;
begin
  select count(*) into visible_count
  from public.organizations
  where id in (
    '72000000-0000-0000-0000-000000000001',
    '72000000-0000-0000-0000-000000000002',
    '72000000-0000-0000-0000-000000000003'
  );
  if visible_count <> 3 then
    raise exception 'PARTICIPANT_COMPANY_NAMES_NOT_VISIBLE:%',visible_count;
  end if;
end
$participants_can_identify_counterpart_companies$;
reset role;


-- Creator access is also tenant-scoped: creator status alone is not a permanent grant.
insert into public.operations(id,reference,title,status,created_by,owner_organization_id)
values ('73000000-0000-0000-0000-000000000003','FIA-PILOT-OWNER-REVOKE-001',
        'Revocación de pertenencia del creador — ensayo','draft',
        '71000000-0000-0000-0000-000000000007','72000000-0000-0000-0000-000000000001');
insert into public.operation_participants
 (operation_id,organization_id,participant_role,status,invited_by)
values
 ('73000000-0000-0000-0000-000000000003','72000000-0000-0000-0000-000000000001','seller','invited','71000000-0000-0000-0000-000000000007'),
 ('73000000-0000-0000-0000-000000000003','72000000-0000-0000-0000-000000000002','buyer','invited','71000000-0000-0000-0000-000000000007'),
 ('73000000-0000-0000-0000-000000000003','72000000-0000-0000-0000-000000000003','carrier','invited','71000000-0000-0000-0000-000000000007');

set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000007';
set role authenticated;
do $creator_access_requires_active_owner_membership$
begin
  if not private.can_access_operation('73000000-0000-0000-0000-000000000003')
     or not private.can_manage_operation('73000000-0000-0000-0000-000000000003') then
    raise exception 'ACTIVE_OWNER_CREATOR_ACCESS_NOT_GRANTED';
  end if;
end
$creator_access_requires_active_owner_membership$;
reset role;

update public.organization_members
set status='revoked'
where organization_id='72000000-0000-0000-0000-000000000001'
  and user_id='71000000-0000-0000-0000-000000000007';

-- The creator still belongs to a different participating company. Read access
-- is legitimate through that participation, but owner-only management is not.
insert into public.organization_members(organization_id,user_id,member_role,status)
values ('72000000-0000-0000-0000-000000000002',
        '71000000-0000-0000-0000-000000000007','member','active');

set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000007';
set role authenticated;
do $revoked_owner_creator_cannot_manage_via_other_participant$
begin
  if not private.can_access_operation('73000000-0000-0000-0000-000000000003') then
    raise exception 'ACTIVE_PARTICIPANT_READ_ACCESS_NOT_GRANTED';
  end if;
  if private.can_manage_operation('73000000-0000-0000-0000-000000000003') then
    raise exception 'REVOKED_OWNER_RETAINED_MANAGEMENT_ACCESS';
  end if;
  if not exists(select 1 from public.operations where id='73000000-0000-0000-0000-000000000003') then
    raise exception 'ACTIVE_PARTICIPANT_CANNOT_READ_OPERATION';
  end if;
  begin
    perform public.transition_operation(
      '73000000-0000-0000-0000-000000000003','cancelled',1,
      '74000000-0000-0000-0000-000000000121');
    raise exception 'REVOKED_OWNER_CANCELLED_VIA_OTHER_PARTICIPANT';
  exception when insufficient_privilege then
    if sqlerrm <> 'TRANSITION_NOT_ALLOWED' then raise; end if;
  end;
  begin
    update public.operations
    set title='Unauthorized edit after owner membership revocation'
    where id='73000000-0000-0000-0000-000000000003';
    if found then
      raise exception 'REVOKED_OWNER_UPDATED_DRAFT';
    end if;
  exception when insufficient_privilege then
    null;
  end;
end
$revoked_owner_creator_cannot_manage_via_other_participant$;
reset role;


do $explicit_owner_is_not_inferred_from_memberships$
begin
  if private.operation_owner_organization('73000000-0000-0000-0000-000000000001')
     <> '72000000-0000-0000-0000-000000000001'::uuid then
    raise exception 'OPERATION_OWNER_NOT_BOUND_TO_EXPLICIT_COMPANY';
  end if;
  begin
    update public.operations
    set owner_organization_id='72000000-0000-0000-0000-000000000002'
    where id='73000000-0000-0000-0000-000000000001';
    raise exception 'OPERATION_OWNER_WAS_CHANGED';
  exception when insufficient_privilege then
    if sqlerrm <> 'OPERATION_OWNER_IMMUTABLE' then raise; end if;
  end;
end
$explicit_owner_is_not_inferred_from_memberships$;

-- L3 requires an explicit, traceable company authorization from a
-- verified CEO OR a verified zone manager. A normal member cannot
-- authorize, and cannot create or read the trusted role-verification record.
insert into private.organization_l3_authority_verifications
 (organization_id,user_id,authority_type,verification_status,evidence_ref,verified_by,verified_at,valid_until)
values
 ('72000000-0000-0000-0000-000000000001','71000000-0000-0000-0000-000000000001',
  'ceo','verified','ci://authority/ceo-1','71000000-0000-0000-0000-000000000005',now(),now()+interval '90 days'),
 ('72000000-0000-0000-0000-000000000002','71000000-0000-0000-0000-000000000002',
  'zone_manager','verified','ci://authority/zone-manager-2','71000000-0000-0000-0000-000000000005',now(),now()+interval '90 days'),
 ('72000000-0000-0000-0000-000000000003','71000000-0000-0000-0000-000000000003',
  'ceo','verified','ci://authority/ceo-3','71000000-0000-0000-0000-000000000005',now(),now()+interval '90 days'),
 ('72000000-0000-0000-0000-000000000001','71000000-0000-0000-0000-000000000006',
  'ceo','verified','ci://authority/ceo-role-mismatch','71000000-0000-0000-0000-000000000005',now(),now()+interval '90 days');

-- Consent cannot outlive the verified authority that grants it.
set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000001';
set role authenticated;
do $authorization_cannot_outlive_authority$
begin
  begin
    perform public.authorize_organization_l3(
      '72000000-0000-0000-0000-000000000001',
      '74000000-0000-0000-0000-000000000100',now()+interval '120 days');
    raise exception 'L3_CONSENT_OUTLIVED_AUTHORITY_VERIFICATION';
  exception when invalid_parameter_value then
    if sqlerrm <> 'AUTHORIZATION_EXCEEDS_AUTHORITY_VERIFICATION' then raise; end if;
  end;
end
$authorization_cannot_outlive_authority$;
reset role;

do $l3_rpc_parameter_names_preserved$
begin
  if pg_get_function_arguments(
    'public.authorize_organization_l3(uuid,uuid,timestamptz)'::regprocedure
  ) not like '%request_key uuid%' then
    raise exception 'L3_AUTHORIZE_RPC_PARAMETER_NAME_CHANGED';
  end if;
  if pg_get_function_arguments(
    'public.revoke_organization_l3_authorization(uuid,uuid)'::regprocedure
  ) not like '%request_key uuid%' then
    raise exception 'L3_REVOKE_RPC_PARAMETER_NAME_CHANGED';
  end if;
end
$l3_rpc_parameter_names_preserved$;

set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000001';
set role authenticated;
select public.authorize_organization_l3(
 '72000000-0000-0000-0000-000000000001',
 '74000000-0000-0000-0000-000000000101',now()+interval '30 days');
do $l3_request_key_cannot_change_payload$
begin
  begin
    perform public.authorize_organization_l3(
      '72000000-0000-0000-0000-000000000001',
      '74000000-0000-0000-0000-000000000101',now()+interval '31 days');
    raise exception 'L3_REQUEST_KEY_REUSED_WITH_DIFFERENT_EXPIRY';
  exception when invalid_parameter_value then
    if sqlerrm <> 'IDEMPOTENCY_KEY_REUSED' then raise; end if;
  end;
end
$l3_request_key_cannot_change_payload$;

-- Reusing a request key with the default expiry must return the original
-- authorization instead of treating a newly calculated 90-day expiry as a
-- changed payload. The default expiry is capped at the verified authority expiry.
select public.authorize_organization_l3(
 '72000000-0000-0000-0000-000000000001',
 '74000000-0000-0000-0000-000000000108',null);
select pg_sleep(0.01);
select public.authorize_organization_l3(
 '72000000-0000-0000-0000-000000000001',
 '74000000-0000-0000-0000-000000000108',null);
reset role;
do $l3_default_expiry_retry_is_idempotent$
begin
  if (select count(*) from private.organization_l3_authorization_events
      where request_key='74000000-0000-0000-0000-000000000108'
        and organization_id='72000000-0000-0000-0000-000000000001'
        and action='authorized') <> 1 then
    raise exception 'L3_DEFAULT_EXPIRY_RETRY_CREATED_DUPLICATE_AUTHORIZATION';
  end if;
end
$l3_default_expiry_retry_is_idempotent$;
reset role;

set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000002';
set role authenticated;
select public.authorize_organization_l3(
 '72000000-0000-0000-0000-000000000002',
 '74000000-0000-0000-0000-000000000102',now()+interval '30 days');
select public.revoke_organization_l3_authorization(
 '72000000-0000-0000-0000-000000000002',
 '74000000-0000-0000-0000-000000000103');
select public.revoke_organization_l3_authorization(
 '72000000-0000-0000-0000-000000000002',
 '74000000-0000-0000-0000-000000000103');
reset role;

-- The same key cannot silently refer to a different authority verification.
insert into private.organization_l3_authority_verifications
 (organization_id,user_id,authority_type,verification_status,evidence_ref,verified_by,verified_at,valid_until)
values
 ('72000000-0000-0000-0000-000000000002','71000000-0000-0000-0000-000000000002',
  'zone_manager','verified','ci://authority/zone-manager-2-renewed',
  '71000000-0000-0000-0000-000000000005',now(),now()+interval '90 days');
set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000002';
set role authenticated;
do $l3_revoke_key_bound_to_verification$
begin
  begin
    perform public.revoke_organization_l3_authorization(
      '72000000-0000-0000-0000-000000000002',
      '74000000-0000-0000-0000-000000000103');
    raise exception 'L3_REVOKE_KEY_REUSED_FOR_NEW_VERIFICATION';
  exception when invalid_parameter_value then
    if sqlerrm <> 'IDEMPOTENCY_KEY_REUSED' then raise; end if;
  end;
end
$l3_revoke_key_bound_to_verification$;
reset role;

do $l3_revocation_closes_shared_access$
begin
  if private.organization_has_trust_level(
    '72000000-0000-0000-0000-000000000002','L3_SHARED') then
    raise exception 'REVOKED_COMPANY_AUTHORIZATION_STILL_ALLOWS_L3';
  end if;
end
$l3_revocation_closes_shared_access$;

set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000002';
set role authenticated;
select public.authorize_organization_l3(
 '72000000-0000-0000-0000-000000000002',
 '74000000-0000-0000-0000-000000000104',now()+interval '30 days');
reset role;

set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000003';
set role authenticated;
select public.authorize_organization_l3(
 '72000000-0000-0000-0000-000000000003',
 '74000000-0000-0000-0000-000000000105',now()+interval '30 days');
reset role;

set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000006';
set role authenticated;
do $verified_ceo_without_ceo_membership_is_rejected$
begin
  begin
    perform public.authorize_organization_l3(
      '72000000-0000-0000-0000-000000000001',
      '74000000-0000-0000-0000-000000000107',now()+interval '30 days');
    raise exception 'NON_CEO_MEMBER_USED_CEO_AUTHORITY';
  exception when insufficient_privilege then
    if sqlerrm <> 'CEO_ROLE_MEMBERSHIP_REQUIRED' then raise; end if;
  end;
end
$verified_ceo_without_ceo_membership_is_rejected$;
reset role;

set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000004';
set role authenticated;
do $ordinary_member_cannot_authorize_l3$
begin
  begin
    update public.organization_members set member_role='ceo'
    where organization_id='72000000-0000-0000-0000-000000000003'
      and user_id='71000000-0000-0000-0000-000000000004';
    raise exception 'ORDINARY_MEMBER_PROMOTED_SELF_TO_CEO';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.authorize_organization_l3(
      '72000000-0000-0000-0000-000000000003',
      '74000000-0000-0000-0000-000000000106',now()+interval '30 days');
    raise exception 'ORDINARY_MEMBER_AUTHORIZED_L3';
  exception when insufficient_privilege then
    if sqlerrm <> 'L3_AUTHORITY_NOT_VERIFIED' then raise; end if;
  end;
  begin
    perform count(*) from private.organization_l3_authority_verifications;
    raise exception 'ORDINARY_MEMBER_READ_AUTHORITY_VERIFICATIONS';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into private.organization_l3_authority_verifications
      (organization_id,user_id,authority_type,verification_status,evidence_ref)
    values
      ('72000000-0000-0000-0000-000000000003',
       '71000000-0000-0000-0000-000000000004',
       'ceo','pending','ci://unauthorized-write');
    raise exception 'ORDINARY_MEMBER_CREATED_AUTHORITY_VERIFICATION';
  exception when insufficient_privilege then null;
  end;
end
$ordinary_member_cannot_authorize_l3$;
reset role;

do $l3_authority_approval_gate$
begin
  if not private.organization_has_trust_level(
    '72000000-0000-0000-0000-000000000001','L3_SHARED')
     or not private.organization_has_trust_level(
    '72000000-0000-0000-0000-000000000002','L3_SHARED')
     or not private.organization_has_trust_level(
    '72000000-0000-0000-0000-000000000003','L3_SHARED') then
    raise exception 'VERIFIED_HEAD_OR_ZONE_MANAGER_APPROVAL_NOT_ACCEPTED';
  end if;
end
$l3_authority_approval_gate$;

-- Revoking the verified authority itself (not only the consent event)
-- immediately disables L3 for that organization.
update private.organization_l3_authority_verifications
set verification_status='revoked'
where organization_id='72000000-0000-0000-0000-000000000002'
  and user_id='71000000-0000-0000-0000-000000000002';
do $revoked_zone_manager_loses_l3$
begin
  if private.organization_has_trust_level(
    '72000000-0000-0000-0000-000000000002','L3_SHARED') then
    raise exception 'REVOKED_ZONE_MANAGER_AUTHORITY_STILL_ALLOWS_L3';
  end if;
end
$revoked_zone_manager_loses_l3$;
update private.organization_l3_authority_verifications
set verification_status='verified'
where organization_id='72000000-0000-0000-0000-000000000002'
  and user_id='71000000-0000-0000-0000-000000000002';

-- Seller creates the invitation only when all three organizations are L3.
set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000001';
set role authenticated;
do $transition_requires_expected_version$
begin
  begin
    perform public.transition_operation(
      '73000000-0000-0000-0000-000000000001','invited',null,
      '74000000-0000-0000-0000-000000000013');
    raise exception 'TRANSITION_ACCEPTED_NULL_EXPECTED_VERSION';
  exception when invalid_parameter_value then
    if sqlerrm <> 'EXPECTED_VERSION_REQUIRED' then raise; end if;
  end;
end
$transition_requires_expected_version$;

select public.transition_operation(
 '73000000-0000-0000-0000-000000000001','invited',1,
 '74000000-0000-0000-0000-000000000001');

do $transition_request_key_binds_expected_version$
begin
  begin
    perform public.transition_operation(
      '73000000-0000-0000-0000-000000000001','invited',0,
      '74000000-0000-0000-0000-000000000001');
    raise exception 'TRANSITION_REQUEST_KEY_REUSED_WITH_DIFFERENT_VERSION';
  exception when invalid_parameter_value then
    if sqlerrm <> 'IDEMPOTENCY_KEY_REUSED' then raise; end if;
  end;
end
$transition_request_key_binds_expected_version$;
reset role;

-- A different authenticated identity cannot replay another participant's transition.
set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000002';
set role authenticated;
do $transition_request_key_binds_actor$
begin
  begin
    perform public.transition_operation(
      '73000000-0000-0000-0000-000000000001','invited',1,
      '74000000-0000-0000-0000-000000000001');
    raise exception 'TRANSITION_REQUEST_KEY_REUSED_BY_DIFFERENT_ACTOR';
  exception when invalid_parameter_value then
    if sqlerrm <> 'IDEMPOTENCY_KEY_REUSED' then raise; end if;
  end;
end
$transition_request_key_binds_actor$;
reset role;

-- Each role accepts through its own authenticated subject.
set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000001';
set role authenticated;
select public.accept_operation_invitation(
 '73000000-0000-0000-0000-000000000001','seller',
 '74000000-0000-0000-0000-000000000002');
do $invitation_acceptance_retry_and_key_collision$
begin
  perform public.accept_operation_invitation(
    '73000000-0000-0000-0000-000000000001','seller',
    '74000000-0000-0000-0000-000000000002');
  begin
    perform public.accept_operation_invitation(
      '73000000-0000-0000-0000-000000000001','buyer',
      '74000000-0000-0000-0000-000000000002');
    raise exception 'INVITATION_REQUEST_KEY_REUSED_FOR_DIFFERENT_ROLE';
  exception when invalid_parameter_value then
    if sqlerrm <> 'IDEMPOTENCY_KEY_REUSED' then raise; end if;
  end;
  begin
    perform public.accept_operation_invitation(
      '73000000-0000-0000-0000-000000000001','seller',null);
    raise exception 'INVITATION_ACCEPTED_WITH_NULL_REQUEST_KEY';
  exception when invalid_parameter_value then
    if sqlerrm <> 'OPERATION_AND_REQUEST_KEY_REQUIRED' then raise; end if;
  end;
end
$invitation_acceptance_retry_and_key_collision$;
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

-- Diagnostic snapshot after acceptance, executed as the migration-test owner.
select status as diagnostic_operation_status, version as diagnostic_operation_version
from public.operations where id='73000000-0000-0000-0000-000000000001';
select count(*) as diagnostic_accepted_participants
from public.operation_participants
where operation_id='73000000-0000-0000-0000-000000000001' and status='accepted';
select private.operation_has_shared_trust('73000000-0000-0000-0000-000000000001') as diagnostic_shared_trust;

-- L3 is an expiring, control-backed server fact: missing controls, expiry,
-- or suspension must remove shared-operation eligibility.
update private.organization_security_profiles
set verified_controls = verified_controls - 'crossOrgIsolationTestsPassed'
where organization_id='72000000-0000-0000-0000-000000000003';
do $l3_missing_control_is_rejected$
begin
  if private.operation_has_shared_trust('73000000-0000-0000-0000-000000000001') then
    raise exception 'L3_ACCEPTED_WITH_MISSING_ISOLATION_CONTROL';
  end if;
end
$l3_missing_control_is_rejected$;
update private.organization_security_profiles
set verified_controls = jsonb_set(verified_controls,'{crossOrgIsolationTestsPassed}','true'::jsonb,true)
where organization_id='72000000-0000-0000-0000-000000000003';

update private.organization_security_profiles
set verified_at=now()-interval '60 days',valid_until=now()-interval '1 day'
where organization_id='72000000-0000-0000-0000-000000000003';
do $l3_expired_profile_is_rejected$
begin
  if private.operation_has_shared_trust('73000000-0000-0000-0000-000000000001') then
    raise exception 'EXPIRED_L3_PROFILE_ALLOWED_SHARED_OPERATION';
  end if;
end
$l3_expired_profile_is_rejected$;
update private.organization_security_profiles
set verified_at=now(),valid_until=now()+interval '30 days'
where organization_id='72000000-0000-0000-0000-000000000003';

update private.organization_security_profiles
set verification_status='suspended'
where organization_id='72000000-0000-0000-0000-000000000003';
do $l3_suspended_profile_is_rejected$
begin
  if private.operation_has_shared_trust('73000000-0000-0000-0000-000000000001') then
    raise exception 'SUSPENDED_L3_PROFILE_ALLOWED_SHARED_OPERATION';
  end if;
end
$l3_suspended_profile_is_rejected$;
update private.organization_security_profiles
set verification_status='verified'
where organization_id='72000000-0000-0000-0000-000000000003';


-- The third acceptance automatically advances invited -> accepted.
-- This behavior is implemented by operation_participant_auto_accept and
-- audited as operation.accepted; do not issue a duplicate transition RPC.
-- Seller and buyer cannot perform the carrier's dispatch transition.
set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000001';
set role authenticated;
do $seller_cannot_dispatch$
begin
  begin
    perform public.transition_operation(
      '73000000-0000-0000-0000-000000000001','in_transit',
      (select version from public.operations where id='73000000-0000-0000-0000-000000000001'),
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
      '73000000-0000-0000-0000-000000000001','in_transit',
      (select version from public.operations where id='73000000-0000-0000-0000-000000000001'),
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
      '73000000-0000-0000-0000-000000000001','in_transit',
      (select version from public.operations where id='73000000-0000-0000-0000-000000000001'),
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
 '73000000-0000-0000-0000-000000000001','in_transit',
      (select version from public.operations where id='73000000-0000-0000-0000-000000000001'),
 '74000000-0000-0000-0000-000000000009');
select public.transition_operation(
 '73000000-0000-0000-0000-000000000001','delivered',
      (select version from public.operations where id='73000000-0000-0000-0000-000000000001'),
 '74000000-0000-0000-0000-000000000010');

-- Buyer cannot close the operation until its own receipt confirmation exists.
reset role;
set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000002';
set role authenticated;
do $buyer_must_confirm_receipt$
begin
  begin
    perform public.transition_operation(
      '73000000-0000-0000-0000-000000000001','completed',
      (select version from public.operations where id='73000000-0000-0000-0000-000000000001'),
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

-- The receipt confirmation trigger automatically advances delivered -> completed.
-- The confirmation itself is the authoritative completion event.
reset role;

do $three_company_pilot_result$
begin
  if (select status from public.operations
      where id='73000000-0000-0000-0000-000000000001') <> 'completed' then
    raise exception 'THREE_COMPANY_PILOT_DID_NOT_COMPLETE';
  end if;
  if (select version from public.operations
      where id='73000000-0000-0000-0000-000000000001') <> 6 then
    raise exception 'THREE_COMPANY_PILOT_VERSION_SEQUENCE_INVALID_EXPECTED_6';
  end if;
  if (select count(*) from public.operation_audit_timeline
      where operation_id='73000000-0000-0000-0000-000000000001'
        and event_type='operation.transition') <> 3 then
    raise exception 'THREE_COMPANY_PILOT_TRANSITION_AUDIT_INCOMPLETE';
  end if;
  if (select count(*) from public.operation_audit_timeline
      where operation_id='73000000-0000-0000-0000-000000000001'
        and event_type='participant.accepted') <> 3 then
    raise exception 'THREE_COMPANY_PILOT_ACCEPTANCE_AUDIT_INCOMPLETE';
  end if;
  if (select count(*) from public.operation_audit_timeline
      where operation_id='73000000-0000-0000-0000-000000000001'
        and event_type='operation.accepted') <> 1 then
    raise exception 'THREE_COMPANY_PILOT_AUTOMATIC_ACCEPTANCE_AUDIT_INCOMPLETE';
  end if;
  if (select count(*) from public.operation_audit_timeline
      where operation_id='73000000-0000-0000-0000-000000000001'
        and event_type='confirmation.receipt') <> 1 then
    raise exception 'THREE_COMPANY_PILOT_RECEIPT_AUDIT_INCOMPLETE';
  end if;
end
$three_company_pilot_result$;

select 'THREE INDEPENDENT IDENTITIES / THREE COMPANIES / FULL POSTGRES FLOW: PASS' as result;


-- Legacy accepted rows without an accepting identity must not be claimed by
-- another active member of the same organization.
insert into public.operations(id,reference,title,status,amount_cents,currency,created_by)
values ('73000000-0000-0000-0000-000000000002','FIA-PILOT-LEGACY-001',
        'Aceptación heredada sin identidad — control de seguridad','accepted',100,'EUR',
        '71000000-0000-0000-0000-000000000001');
insert into public.operation_participants
 (operation_id,organization_id,participant_role,status,invited_by,accepted_at,accepted_by)
values
 ('73000000-0000-0000-0000-000000000002',
  '72000000-0000-0000-0000-000000000003','carrier','accepted',
  '71000000-0000-0000-0000-000000000001',now(),null);

set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000004';
set role authenticated;
do $legacy_acceptance_cannot_be_claimed$
begin
  begin
    perform public.accept_operation_invitation(
      '73000000-0000-0000-0000-000000000002','carrier',
      '74000000-0000-0000-0000-000000000012');
    raise exception 'LEGACY_ACCEPTED_ROLE_CLAIMED_BY_UNVERIFIED_MEMBER';
  exception when insufficient_privilege then
    if sqlerrm <> 'LEGACY_ACCEPTANCE_REQUIRES_REVALIDATION' then raise; end if;
  end;
end
$legacy_acceptance_cannot_be_claimed$;
reset role;

do $legacy_acceptance_remains_unbound$
begin
  if (select accepted_by from public.operation_participants
      where operation_id='73000000-0000-0000-0000-000000000002'
        and participant_role='carrier') is not null then
    raise exception 'LEGACY_ACCEPTANCE_IDENTITY_WAS_CHANGED';
  end if;
end
$legacy_acceptance_remains_unbound$;

select 'LEGACY ACCEPTANCE CLAIM BLOCKED: PASS' as security_result;



insert into private.organization_l3_authority_verifications
 (organization_id,user_id,authority_type,verification_status,evidence_ref,verified_by,verified_at,valid_until)
values
 ('72000000-0000-0000-0000-000000000001','71000000-0000-0000-0000-000000000006',
  'zone_manager','verified','ci://authority/zone-manager-finance-boundary',
  '71000000-0000-0000-0000-000000000005',now(),now()+interval '90 days');

-- Separación entre información compartida y finanzas internas.
update public.operations set margin_floor_cents=10000 where id='73000000-0000-0000-0000-000000000001';
insert into public.operation_cost_items(operation_id,organization_id,category,label,amount_cents,currency,created_by)
values('73000000-0000-0000-0000-000000000001','72000000-0000-0000-0000-000000000001',
'service','Coste interno del vendedor',2000,'EUR','71000000-0000-0000-0000-000000000001');

set request.jwt.claim.sub='71000000-0000-0000-0000-000000000001';
set role authenticated;
do $company_ceo_can_read_own_finance$
declare visible_rows integer; own_costs integer; own_margin bigint;
begin
select count(*),max(calculated_margin_cents) into visible_rows,own_margin
from public.operation_financials where operation_id='73000000-0000-0000-0000-000000000001'
and organization_id='72000000-0000-0000-0000-000000000001';
select count(*) into own_costs from public.operation_cost_items where operation_id='73000000-0000-0000-0000-000000000001';
if visible_rows<>1 or own_costs<>1 or own_margin<>123000 then raise exception 'CEO_CANNOT_READ_OWN_COMPANY_FINANCE'; end if;
end $company_ceo_can_read_own_finance$;

set request.jwt.claim.sub='71000000-0000-0000-0000-000000000006';
set role authenticated;
do $zone_manager_cannot_read_company_finance$
declare finance_rows integer; cost_rows integer;
begin
  select count(*) into finance_rows from public.operation_financials
  where operation_id='73000000-0000-0000-0000-000000000001';
  select count(*) into cost_rows from public.operation_cost_items
  where operation_id='73000000-0000-0000-0000-000000000001';
  if finance_rows<>0 or cost_rows<>0 then
    raise exception 'ZONE_MANAGER_AUTHORITY_GRANTED_INTERNAL_FINANCE';
  end if;
end
$zone_manager_cannot_read_company_finance$;
reset role;

-- Execute the negative column-access assertions as a real participant,
-- not as the migration owner (which bypasses ordinary grants).
set request.jwt.claim.sub='71000000-0000-0000-0000-000000000002';
set role authenticated;
do $shared_operation_hides_private_columns$
begin
begin perform margin_floor_cents from public.operations where id='73000000-0000-0000-0000-000000000001';
raise exception 'PARTICIPANT_CAN_READ_MARGIN_FLOOR';
exception when insufficient_privilege then null; end;
begin perform event_data from public.operation_audit_events where operation_id='73000000-0000-0000-0000-000000000001';
raise exception 'PARTICIPANT_CAN_READ_RAW_AUDIT_DATA';
exception when insufficient_privilege then null; end;
begin perform metadata from public.operation_confirmations limit 1;
raise exception 'PARTICIPANT_CAN_READ_CONFIRMATION_METADATA';
exception when insufficient_privilege then null; end;
begin perform storage_path from public.operation_evidence limit 1;
raise exception 'PARTICIPANT_CAN_READ_PRIVATE_EVIDENCE_PATH';
exception when insufficient_privilege then null; end;
begin perform resolution_note from public.operation_incidents limit 1;
raise exception 'PARTICIPANT_CAN_READ_PRIVATE_RESOLUTION_NOTE';
exception when insufficient_privilege then null; end;
end $shared_operation_hides_private_columns$;
reset role;

set request.jwt.claim.sub='71000000-0000-0000-0000-000000000002';
set role authenticated;
do $other_company_cannot_read_seller_finance$
declare finance_rows integer; cost_rows integer;
begin
select count(*) into finance_rows from public.operation_financials where operation_id='73000000-0000-0000-0000-000000000001';
select count(*) into cost_rows from public.operation_cost_items where operation_id='73000000-0000-0000-0000-000000000001';
if finance_rows<>0 or cost_rows<>0 then raise exception 'BUYER_READS_SELLER_PRIVATE_FINANCE'; end if;
end $other_company_cannot_read_seller_finance$;
reset role;
select 'AISLAMIENTO FINANCIERO Y METADATOS PRIVADOS: PASS' as security_result;

-- Removing the CEO role or suspending that membership immediately revokes
-- the trusted CEO attestation, so an old L3 consent cannot remain active.
update public.organization_members
set status='suspended'
where organization_id='72000000-0000-0000-0000-000000000001'
  and user_id='71000000-0000-0000-0000-000000000001';

do $ceo_membership_suspension_revokes_l3$
begin
  if exists (
    select 1 from private.organization_l3_authority_verifications
    where organization_id='72000000-0000-0000-0000-000000000001'
      and user_id='71000000-0000-0000-0000-000000000001'
      and authority_type='ceo'
      and verification_status='verified'
  ) then
    raise exception 'SUSPENDED_CEO_RETAINED_VERIFIED_AUTHORITY';
  end if;
  if private.organization_has_trust_level(
    '72000000-0000-0000-0000-000000000001','L3_SHARED'
  ) then
    raise exception 'SUSPENDED_CEO_MEMBERSHIP_RETAINED_L3';
  end if;
end
$ceo_membership_suspension_revokes_l3$;

select 'CEO MEMBERSHIP SUSPENSION REVOKES L3: PASS' as security_result;


-- Synthetic part recovery is isolated to synthetic companies and retries are
-- idempotent: the same key/payload returns the same child operation.
insert into public.organization_members(organization_id,user_id,member_role,status)
select o.id,'71000000-0000-0000-0000-000000000001','ceo','active'
from public.organizations o where o.demo_code='SYN-NARINO';

insert into public.operations(
 id,reference,title,status,operation_type,created_by,owner_organization_id,is_synthetic
) values (
 '73000000-0000-0000-0000-000000000011','FIA-SYN-PARENT-CI-001',
 'Tractor sintético bloqueado para ensayo','blocked','machinery_purchase',
 '71000000-0000-0000-0000-000000000001',
 (select id from public.organizations where demo_code='SYN-NARINO'),true
);
insert into public.operation_participants
 (operation_id,organization_id,participant_role,status,invited_by)
values
 ('73000000-0000-0000-0000-000000000011',(select id from public.organizations where demo_code='SYN-FRAN'),'seller','invited','71000000-0000-0000-0000-000000000001'),
 ('73000000-0000-0000-0000-000000000011',(select id from public.organizations where demo_code='SYN-GSM'),'carrier','invited','71000000-0000-0000-0000-000000000001'),
 ('73000000-0000-0000-0000-000000000011',(select id from public.organizations where demo_code='SYN-NARINO'),'buyer','invited','71000000-0000-0000-0000-000000000001');
insert into public.operation_incidents(
 operation_id,incident_type,description,status,blocks_progress,opened_by
) values (
 '73000000-0000-0000-0000-000000000011','logistics',
 'Incidencia de bloqueo para probar la recuperación sintética','open',true,
 '71000000-0000-0000-0000-000000000001'
);

set request.jwt.claim.sub = '71000000-0000-0000-0000-000000000001';
set role authenticated;
do $synthetic_recovery_retry_is_idempotent$
declare
  first_recovery public.operations;
  retry_recovery public.operations;
begin
  first_recovery := public.create_synthetic_part_recovery(
    '73000000-0000-0000-0000-000000000011',
    'SYN-FRAN','SYN-GSM','Bomba hidráulica',
    '74000000-0000-0000-0000-000000000030'
  );
  retry_recovery := public.create_synthetic_part_recovery(
    '73000000-0000-0000-0000-000000000011',
    'SYN-FRAN','SYN-GSM','Bomba hidráulica',
    '74000000-0000-0000-0000-000000000030'
  );
  if first_recovery.id is distinct from retry_recovery.id then
    raise exception 'SYNTHETIC_RECOVERY_RETRY_CREATED_DUPLICATE';
  end if;
  begin
    perform public.create_synthetic_part_recovery(
      '73000000-0000-0000-0000-000000000011',
      'SYN-FRAN','SYN-GSM','Alternador',
      '74000000-0000-0000-0000-000000000030'
    );
    raise exception 'SYNTHETIC_RECOVERY_KEY_REUSED_WITH_DIFFERENT_PART';
  exception when invalid_parameter_value then
    if sqlerrm <> 'IDEMPOTENCY_KEY_REUSED' then raise; end if;
  end;
  if (select count(*) from public.operations
      where parent_operation_id='73000000-0000-0000-0000-000000000011'
        and is_synthetic and operation_type='repair_part_delivery') <> 1 then
    raise exception 'SYNTHETIC_RECOVERY_CREATED_MORE_THAN_ONE_CHILD';
  end if;
end
$synthetic_recovery_retry_is_idempotent$;
reset role;


-- Hash-chain sequence and visible timestamps must follow the same per-operation order.
do $operation_audit_chain_is_monotonic$
begin
  if exists (
    select 1
    from (
      select operation_id,id,previous_hash,event_hash,created_at,
        lag(event_hash) over (partition by operation_id order by id) as prior_hash,
        lag(created_at) over (partition by operation_id order by id) as prior_created_at
      from public.operation_audit_events
    ) chain
    where (prior_hash is null and previous_hash is not null)
       or (prior_hash is not null and previous_hash is distinct from prior_hash)
       or (prior_created_at is not null and created_at < prior_created_at)
  ) then
    raise exception 'OPERATION_AUDIT_CHAIN_ORDER_INVALID';
  end if;
end
$operation_audit_chain_is_monotonic$;

select 'OPERATION AUDIT HASH CHAIN AND TIMESTAMP ORDER: PASS' as audit_result;


do $authenticated_write_privileges_are_minimal$
begin
  if has_any_column_privilege('authenticated','public.organization_members','INSERT')
     or has_any_column_privilege('authenticated','public.organization_members','UPDATE')
     or has_any_column_privilege('authenticated','public.organizations','INSERT')
     or has_any_column_privilege('authenticated','public.organizations','UPDATE')
     or has_any_column_privilege('authenticated','public.pilot_access_requests','UPDATE')
     or has_any_column_privilege('authenticated','public.operation_confirmations','UPDATE')
     or has_any_column_privilege('authenticated','public.operation_evidence','UPDATE')
     or has_any_column_privilege('authenticated','public.operation_notifications','INSERT')
     or has_any_column_privilege('authenticated','public.operation_audit_timeline','INSERT')
     or has_any_column_privilege('authenticated','public.operation_audit_timeline','UPDATE') then
    raise exception 'UNNECESSARY_AUTHENTICATED_WRITE_PRIVILEGE_REMAINS';
  end if;

  if has_table_privilege('authenticated','public.operation_notifications','UPDATE')
     or not has_column_privilege('authenticated','public.operation_notifications','read_at','UPDATE')
     or exists (
       select 1
       from information_schema.column_privileges
       where table_schema='public'
         and table_name='operation_notifications'
         and grantee='authenticated'
         and privilege_type='UPDATE'
         and column_name <> 'read_at'
     ) then
    raise exception 'NOTIFICATION_UPDATE_NOT_RESTRICTED_TO_READ_AT';
  end if;
end
$authenticated_write_privileges_are_minimal$;

select 'AUTHENTICATED WRITE PRIVILEGES: LEAST PRIVILEGE PASS' as privilege_result;

do $incident_updates_are_column_scoped$
begin
  if has_table_privilege('authenticated','public.operation_incidents','UPDATE')
     or not has_column_privilege('authenticated','public.operation_incidents','status','UPDATE')
     or not has_column_privilege('authenticated','public.operation_incidents','resolved_by','UPDATE')
     or not has_column_privilege('authenticated','public.operation_incidents','resolved_at','UPDATE')
     or not has_column_privilege('authenticated','public.operation_incidents','resolution_note','UPDATE')
     or has_column_privilege('authenticated','public.operation_incidents','operation_id','UPDATE')
     or has_column_privilege('authenticated','public.operation_incidents','incident_type','UPDATE')
     or has_column_privilege('authenticated','public.operation_incidents','description','UPDATE')
     or has_column_privilege('authenticated','public.operation_incidents','blocks_progress','UPDATE')
     or has_column_privilege('authenticated','public.operation_incidents','opened_by','UPDATE')
     or has_column_privilege('authenticated','public.operation_incidents','created_at','UPDATE') then
    raise exception 'INCIDENT_UPDATE_PRIVILEGES_NOT_COLUMN_SCOPED';
  end if;
end
$incident_updates_are_column_scoped$;

select 'INCIDENT UPDATE PRIVILEGES: RESOLUTION FIELDS ONLY' as privilege_result;


do $internal_margin_helper_is_not_client_callable$
begin
  if has_function_privilege('anon','private.recalculate_operation_margin(uuid)','EXECUTE')
     or has_function_privilege('authenticated','private.recalculate_operation_margin(uuid)','EXECUTE') then
    raise exception 'INTERNAL_MARGIN_RECALCULATION_HELPER_EXPOSED';
  end if;
end
$internal_margin_helper_is_not_client_callable$;

select 'INTERNAL MARGIN HELPER: PRIVATE EXECUTION ONLY' as privilege_result;

do $all_security_definer_functions_use_empty_search_path$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname in ('public','private')
      and p.prosecdef
      and not coalesce(p.proconfig,array[]::text[]) @> array['search_path=""']
  ) then
    raise exception 'SECURITY_DEFINER_SEARCH_PATH_NOT_EMPTY';
  end if;
end
$all_security_definer_functions_use_empty_search_path$;

select 'SECURITY DEFINER SEARCH_PATH: EMPTY FOR ALL PROJECT FUNCTIONS' as security_result;

do $company_verification_column_visibility$
begin
  if has_column_privilege('authenticated','public.organization_verifications','tax_id_last4','SELECT')
     or has_column_privilege('authenticated','public.organization_verifications','evidence_ref','SELECT')
     or has_column_privilege('authenticated','public.organization_verifications','verified_by','SELECT')
     or not has_column_privilege('authenticated','public.organization_verifications','verification_status','SELECT')
     or not has_column_privilege('authenticated','public.organization_verifications','legal_name','SELECT') then
    raise exception 'ORGANIZATION_VERIFICATION_COLUMNS_NOT_MINIMIZED';
  end if;

  if has_column_privilege('authenticated','public.organization_provider_qualifications','evidence_ref','SELECT')
     or has_column_privilege('authenticated','public.organization_provider_qualifications','verified_by','SELECT')
     or not has_column_privilege('authenticated','public.organization_provider_qualifications','qualification_status','SELECT')
     or not has_column_privilege('authenticated','public.organization_provider_qualifications','capability','SELECT') then
    raise exception 'PROVIDER_QUALIFICATION_COLUMNS_NOT_MINIMIZED';
  end if;

  if has_column_privilege('anon','public.organization_verifications','verification_status','SELECT')
     or has_column_privilege('anon','public.organization_provider_qualifications','qualification_status','SELECT') then
    raise exception 'ANONYMOUS_COMPANY_VERIFICATION_READ_REMAINS';
  end if;

  if not has_table_privilege('service_role','public.organization_verifications','SELECT')
     or not has_table_privilege('service_role','public.organization_provider_qualifications','SELECT') then
    raise exception 'SERVICE_ROLE_COMPANY_VERIFICATION_ACCESS_REMOVED';
  end if;
end
$company_verification_column_visibility$;

select 'COMPANY VERIFICATION DATA MINIMIZATION: PASS' as privacy_result;
