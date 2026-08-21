import assert from 'node:assert/strict';
import { PREPROD_CHECKS, evaluatePreproductionGate } from '../core/preprod/preprod-gate.mjs';

const blocked = evaluatePreproductionGate({});
assert.equal(blocked.status, 'PREPROD_BLOCKED');
assert.equal(blocked.technicalReady, false);
assert.equal(blocked.missing.length, PREPROD_CHECKS.length);
assert.equal(blocked.productionExecutionEnabled, false);
assert.equal(blocked.realFundsEnabled, false);
assert.equal(blocked.realPiiEnabled, false);
assert.equal(blocked.externalProviderActivationAllowed, false);
assert.equal(blocked.noAutomaticProductionPromotion, true);

const all = Object.fromEntries(PREPROD_CHECKS.map(name => [name, true]));
const ready = evaluatePreproductionGate(all);
assert.equal(ready.status, 'PREPROD_TECHNICAL_READY');
assert.equal(ready.technicalReady, true);
assert.deepEqual(ready.missing, []);
assert.equal(ready.productionExecutionEnabled, false);
assert.equal(ready.externalProviderActivationAllowed, false);
assert.equal(ready.explicitFounderAuthorizationRequiredForExternalActivation, true);

const almost = evaluatePreproductionGate({ ...all, auditIntegrity: false });
assert.equal(almost.status, 'PREPROD_BLOCKED');
assert.deepEqual(almost.missing, ['auditIntegrity']);

console.log('Preproduction technical gate OK');
