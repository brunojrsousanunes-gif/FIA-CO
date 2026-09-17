begin;

revoke all on table public.organization_verifications from anon;
revoke all on table public.organization_provider_qualifications from anon;

commit;
