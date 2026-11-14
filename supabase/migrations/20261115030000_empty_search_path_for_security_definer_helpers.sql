begin;

-- All referenced relations, helpers and extensions in these SECURITY DEFINER
-- routines are schema-qualified. An empty search_path removes unnecessary
-- name-resolution risk and makes the security boundary explicit.
alter function private.after_confirmation_insert() set search_path = '';
alter function private.after_incident_change() set search_path = '';
alter function private.after_participant_acceptance() set search_path = '';
alter function private.append_operation_audit(uuid,text,uuid,jsonb,uuid) set search_path = '';
alter function private.can_access_operation(uuid) set search_path = '';
alter function private.can_manage_operation(uuid) set search_path = '';
alter function private.enqueue_operation_notice(uuid,text,text) set search_path = '';
alter function private.is_org_member(uuid) set search_path = '';
alter function private.validate_evidence_role() set search_path = '';

commit;
