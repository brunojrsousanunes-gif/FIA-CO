import assert from 'node:assert/strict';
import { createOperation } from '../core/operations/operation-engine.mjs';
import { createMemoryOperationRepository } from '../core/repositories/operation-repository.mjs';
import { createTrustTransaction } from '../core/trust/trust-transaction.mjs';
import { createMemoryTrustTransactionRepository } from '../core/repositories/trust-transaction-repository.mjs';
import { issuePreprodSession } from '../core/identity/preprod-session-token.mjs';
import { createPreprodClientService } from '../core/preprod/preprod-client-service.mjs';

let seq = 0;
const deps = {
  idFactory: prefix => `${prefix}_PRE_${++seq}`,
  clock: () => '2026-09-05T02:00:00Z'
};
const secret = '0123456789abcdef0123456789abcdef';

const operation = createOperation({
  organizationId: 'org-a',
  amount: 1500,
  kind: 'synthetic',
  actor: 'owner-a'
}, deps);
const transaction = createTrustTransaction({
  ownerOrganizationId: 'org-a',
  operationId: operation.id,
  title: 'Synthetic server boundary',
  actor: 'owner-a',
  fields: [
    { key: 'reference', value: 'SYN-1', classification: 'INTERNAL', sourceOrganizationId: 'org-a' },
    { key: 'internalMargin', value: 123, classification: 'COMMERCIAL_CONFIDENTIAL', sourceOrganizationId: 'org-a' }
  ]
}, deps);

const operationRepository = createMemoryOperationRepository([operation]);
const trustRepository = createMemoryTrustTransactionRepository([transaction]);
const service = createPreprodClientService({ operationRepository, trustRepository, sessionSecret: secret });

const ownerToken = issuePreprodSession({ actorId: 'owner-a', organizationId: 'org-a', role: 'OWNER' }, {
  secret,
  now: '2026-09-05T02:00:00Z',
  ttlSeconds: 900
});
const snapshot = await service.getSnapshot({
  sessionToken: ownerToken,
  operationId: operation.id,
  transactionId: transaction.id
}, { now: '2026-09-05T02:05:00Z' });
assert.equal(snapshot.viewer.organizationId, 'org-a');
assert.equal(snapshot.security.sourceDataFilteredBeforeClient, true);
assert.equal(snapshot.security.clientSideHidingIsSecurityBoundary, false);
assert.equal(service.productionActivation, false);
assert.equal(service.realUserVerification, false);

const wrongOrgToken = issuePreprodSession({ actorId: 'owner-b', organizationId: 'org-b', role: 'OWNER' }, {
  secret,
  now: '2026-09-05T02:00:00Z',
  ttlSeconds: 900
});
await assert.rejects(() => service.getSnapshot({
  sessionToken: wrongOrgToken,
  operationId: operation.id,
  transactionId: transaction.id
}, { now: '2026-09-05T02:05:00Z' }), /ACCESS_DENIED/);

console.log('FIA server-side preproduction client boundary OK');
