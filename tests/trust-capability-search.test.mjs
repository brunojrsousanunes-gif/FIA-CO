import assert from 'node:assert/strict';
import { searchTrustCapability } from '../core/trust/trust-capability-search.mjs';

const l3 = searchTrustCapability({ query: 'qué puedo hacer en L3' });
assert.equal(l3.explicitLevel, 'L3_SHARED');
assert.equal(l3.outcome, 'LEVEL_OVERVIEW');
assert.ok(l3.capabilities.includes('CROSS_ORG_SHARE'));

const low = searchTrustCapability({ query: 'L2 compartir presupuesto con proveedor' });
assert.equal(low.minimumTrustLevel, 'L3_SHARED');
assert.equal(low.explicitLevel, 'L2_VERIFIED');
assert.equal(low.explicitLevelCompatible, false);

const commercial = searchTrustCapability({ query: 'compartir presupuesto confidencial con otra empresa' });
assert.equal(commercial.inferredDataClass, 'COMMERCIAL_CONFIDENTIAL');
assert.equal(commercial.inferredManagement, 'CROSS_ORG');
assert.equal(commercial.minimumTrustLevel, 'L3_SHARED');

const personal = searchTrustCapability({ query: 'datos personales del cliente con renting' });
assert.equal(personal.inferredDataClass, 'PERSONAL');
assert.equal(personal.inferredManagement, 'CROSS_ORG');
assert.equal(personal.minimumTrustLevel, 'L4_ADVANCED');

const personalL4 = searchTrustCapability({ query: 'L4 datos personales con renting' });
assert.equal(personalL4.explicitLevelCompatible, true);

const critical = searchTrustCapability({ query: 'compartir contraseña con proveedor' });
assert.equal(critical.inferredDataClass, 'CRITICAL');
assert.equal(critical.outcome, 'NEVER_ALLOWED');
assert.equal(critical.minimumTrustLevel, null);
assert.equal(critical.permanentBoundaries.crossOrganizationCriticalData, false);

const funds = searchTrustCapability({ query: 'en qué nivel FIA puede custodiar fondos' });
assert.equal(funds.outcome, 'PERMANENT_BOUNDARY');
assert.equal(funds.minimumTrustLevel, null);
assert.equal(funds.permanentBoundaries.fiaFundCustody, false);
assert.equal(funds.permanentBoundaries.fiaFundMovement, false);

const isolated = searchTrustCapability({ query: 'dato real de presupuesto dentro de mi empresa' });
assert.equal(isolated.minimumTrustLevel, 'L1_ISOLATED');

const integration = searchTrustCapability({ query: 'integración OAuth interna con Gmail' });
assert.equal(integration.minimumTrustLevel, 'L2_VERIFIED');

console.log('trust-capability-search.test.mjs passed');
