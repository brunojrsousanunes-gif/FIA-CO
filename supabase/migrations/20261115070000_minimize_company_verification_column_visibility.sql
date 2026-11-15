-- Keep organization verification status visible to active members while
-- withholding tax fragments, evidence references and verifier identities.
-- Row-level membership policies remain unchanged; service_role access is
-- intentionally preserved for trusted server-side review workflows.

revoke select on public.organization_verifications
  from public, anon, authenticated;
grant select (
  organization_id,
  verification_status,
  verification_method,
  legal_name,
  verified_at,
  expires_at,
  created_at,
  updated_at
) on public.organization_verifications to authenticated;

revoke select on public.organization_provider_qualifications
  from public, anon, authenticated;
grant select (
  organization_id,
  capability,
  qualification_status,
  verified_at,
  expires_at,
  created_at,
  updated_at
) on public.organization_provider_qualifications to authenticated;
