begin;

-- Cover foreign keys introduced by the L3 authority audit tables.
create index if not exists organization_l3_authority_user_idx
  on private.organization_l3_authority_verifications (user_id);
create index if not exists organization_l3_authority_verified_by_idx
  on private.organization_l3_authority_verifications (verified_by);
create index if not exists organization_l3_event_authority_verification_idx
  on private.organization_l3_authorization_events (authority_verification_id);
create index if not exists organization_l3_event_actor_idx
  on private.organization_l3_authorization_events (actor_id);

commit;
