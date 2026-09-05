import assert from 'node:assert/strict';
import {
  evaluateFirstContactQuery,
  updateFirstContactProfile,
  assertFirstContactCapability,
  classifyFirstContactTopic
} from '../core/trust/first-contact-gate.mjs';

assert.equal(classifyFirstContactTopic('quiero saber qué es FIA'), 'FIA_OVERVIEW');
assert.equal(classifyFirstContactTopic('tenemos presupuestos sin seguimiento'), 'QUOTE_RECOVERY_OVERVIEW');
assert.equal(classifyFirstContactTopic('quiero buscar un tractor para comprar'), 'PURCHASE_SEARCH_OVERVIEW');

const orientation = evaluateFirstContactQuery({ query: 'qué hace FIA con la seguridad' });
assert.equal(orientation.securityLevel, 'L0_DEMO');
assert.equal(orientation.informationLevel, 'I0_PUBLIC');
assert.equal(orientation.rawQueryStored, false);
assert.equal(orientation.mayShowSolution, false);
assert.equal(orientation.mayRunSimulation, false);
assert.equal(orientation.mayRunRanking, false);

const gated = evaluateFirstContactQuery({ query: 'muéstrame una simulación y las mejores opciones de compra' });
assert.equal(gated.outcome, 'OWNER_APPROVAL_REQUIRED');
assert.equal(gated.ownerApprovalRequired, true);
assert.equal(gated.mayOpenOperationalArea, false);

const sensitive = evaluateFirstContactQuery({ query: 'mi correo es persona@example.com' });
assert.equal(sensitive.outcome, 'SENSITIVE_INPUT_REJECTED');
assert.equal(sensitive.rawQueryStored, false);

assert.throws(
  () => assertFirstContactCapability('RUN_SIMULATION', { ownerApproval: false }),
  /FIRST_CONTACT_OWNER_APPROVAL_REQUIRED:RUN_SIMULATION/
);
assert.equal(assertFirstContactCapability('RUN_SIMULATION', { ownerApproval: true }), true);

const profile = updateFirstContactProfile({}, {
  query: 'busco maquinaria agrícola',
  newVisit: true,
  sectorHints: ['MAQUINARIA'],
  now: '2026-09-05T00:00:00.000Z'
});
assert.equal(profile.visitCount, 1);
assert.equal(profile.topicCounts.PURCHASE_SEARCH_OVERVIEW, 1);
assert.deepEqual(profile.sectorHints, ['MAQUINARIA']);
assert.equal(profile.rawQueryStored, false);
assert.equal(profile.freeTextNotesStored, false);
assert.equal(profile.personalDataStored, false);
assert.equal(Object.hasOwn(profile, 'query'), false);

console.log('first-contact-gate.test.mjs passed');
