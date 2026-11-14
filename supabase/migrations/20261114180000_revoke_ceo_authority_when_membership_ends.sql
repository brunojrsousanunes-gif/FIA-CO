begin;

-- A CEO's L3 authority must stop immediately when the CEO role or active
-- membership is removed. Do not leave an old verified attestation usable.
create or replace function private.revoke_ceo_authority_on_membership_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if old.member_role = 'ceo' then
      update private.organization_l3_authority_verifications
      set verification_status = 'revoked',
          updated_at = statement_timestamp()
      where organization_id = old.organization_id
        and user_id = old.user_id
        and authority_type = 'ceo'
        and verification_status <> 'revoked';
    end if;
    return old;
  end if;

  if old.member_role = 'ceo'
     and (new.member_role is distinct from 'ceo'
          or new.status is distinct from 'active') then
    update private.organization_l3_authority_verifications
    set verification_status = 'revoked',
        updated_at = statement_timestamp()
    where organization_id = old.organization_id
      and user_id = old.user_id
      and authority_type = 'ceo'
      and verification_status <> 'revoked';
  end if;
  return new;
end;
$$;
revoke all on function private.revoke_ceo_authority_on_membership_change()
  from public, anon, authenticated;

create trigger revoke_ceo_l3_when_membership_ends
after update of member_role, status or delete
on public.organization_members
for each row
execute function private.revoke_ceo_authority_on_membership_change();

commit;
