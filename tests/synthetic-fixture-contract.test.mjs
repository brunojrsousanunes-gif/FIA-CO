import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const path = new URL('./fixtures/fia-co-three-party-synthetic.v1.json', import.meta.url);
const fixture = JSON.parse(readFileSync(path, 'utf8'));

assert.equal(fixture.schema_version, '1.0.0');
assert.equal(fixture.fixture_set_id, 'fia-co-three-party-core-v1');
assert.equal(fixture.classification, 'SYNTHETIC_TEST_DATA');
assert.equal(fixture.status, 'DOCUMENTED_NOT_SEEDED');
assert.equal(fixture.production_eligible, false);
assert.equal(fixture.supabase_remote_seed_allowed, false);
assert.equal(fixture.auth_account_creation_allowed, false);
assert.match(fixture.notice, /DATOS SINTÉTICOS/);

const organizations = fixture.organizations;
assert.equal(organizations.length, 3);
assert.deepEqual(
  organizations.map(({ display_name, business_role }) => [display_name, business_role]),
  [
    ['RECAMBIOS DEMO', 'seller'],
    ['AGROTEST NORTE', 'buyer'],
    ['TRANSPORTES PILOTO', 'carrier']
  ]
);

const allIds = [
  ...organizations.map(item => item.fixture_id),
  ...fixture.actors.map(item => item.fixture_id)
];
assert.equal(new Set(allIds).size, allIds.length, 'Fixture IDs must be unique');
for (const id of allIds) assert.ok(id.startsWith('fixture:'), `Non-symbolic fixture ID: ${id}`);

const organizationIds = new Set(organizations.map(item => item.fixture_id));
assert.equal(fixture.actors.length, 3);
for (const actor of fixture.actors) {
  assert.ok(organizationIds.has(actor.organization_fixture_id));
  assert.equal(actor.actor_type, 'synthetic_test_actor');
  assert.equal(typeof actor.permissions_profile, 'string');
  for (const forbidden of ['email', 'phone', 'password', 'token', 'credential', 'auth_user_id']) {
    assert.equal(Object.hasOwn(actor, forbidden), false, `Actor must not contain ${forbidden}`);
  }
}

assert.equal(fixture.scenarios.length, 6);
const scenarioIds = new Set();
for (const scenario of fixture.scenarios) {
  assert.ok(/^SYN-00[1-6]$/.test(scenario.scenario_id));
  assert.equal(scenarioIds.has(scenario.scenario_id), false);
  scenarioIds.add(scenario.scenario_id);
  assert.ok(scenario.participants.length >= 2);
  for (const participant of scenario.participants) assert.ok(organizationIds.has(participant));
  assert.ok(scenario.capabilities_to_verify.length > 0);
}

for (const required of [
  'Never seed production or the remote Supabase project.',
  'Never create real Auth users or credentials from fixture actors.',
  'Resolve fixture IDs to ephemeral identifiers only inside an isolated test database.'
]) assert.ok(fixture.safety_constraints.includes(required));

console.log('FIA&CO synthetic fixture contract passed');
