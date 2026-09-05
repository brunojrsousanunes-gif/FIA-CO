import assert from 'node:assert/strict';
import { buildLocalShadowAggregate, assertLocalShadowExportSafe } from '../core/shadow/local-shadow.mjs';

const aggregate = buildLocalShadowAggregate([
  { id: 'q1', clientEmail: 'one@example.invalid', amount: 1000, followedUp: true, responded: true, cycleHours: 24 },
  { id: 'q2', customerName: 'Synthetic Person', amount: 2500, followedUp: false, responded: false, blocked: true, missingRequiredInput: true, cycleHours: 72 },
  { id: 'q3', phone: '+000000', amount: 500, followedUp: true, responded: false, handoffHours: 10 }
], { kind: 'QUOTE_RECOVERY' });

assert.equal(aggregate.totalObserved, 3);
assert.equal(aggregate.followedUpCount, 2);
assert.equal(aggregate.responseCount, 1);
assert.equal(aggregate.blockedCount, 1);
assert.equal(aggregate.totalObservedValue, 4000);
assert.equal(aggregate.sensitiveInputFieldCountDetected >= 3, true);
assert.equal(aggregate.sourceValuesExported, false);
assert.equal(aggregate.identifiersExported, false);
assert.equal(aggregate.rawTextExported, false);
assert.equal(aggregate.localSourceRetentionByFiaCore, false);
assert.equal(JSON.stringify(aggregate).includes('one@example.invalid'), false);
assert.equal(JSON.stringify(aggregate).includes('Synthetic Person'), false);
assert.equal(assertLocalShadowExportSafe(aggregate), true);

assert.throws(() => assertLocalShadowExportSafe({
  sourceValuesExported: false,
  identifiersExported: false,
  rawTextExported: false,
  clientEmail: 'leak@example.invalid'
}), /SHADOW_EXPORT_CONTAINS_FORBIDDEN_FIELD/);

console.log('FIA Local Shadow aggregate privacy contract OK');
