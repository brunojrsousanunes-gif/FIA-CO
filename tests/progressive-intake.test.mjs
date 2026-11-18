import assert from 'node:assert/strict';
import { buildProgressiveDataRequest } from '../core/identity/progressive-intake.mjs';

const account = buildProgressiveDataRequest({ stage: 'account' });
assert.deepEqual(account.fields.map(field => field.key), ['display_name', 'verified_contact']);
assert.equal(account.privacyNoticeRequired, true);
assert.equal(account.fields.some(field => /tax|iban|dni|company/i.test(field.key)), false);

const transport = buildProgressiveDataRequest({ stage: 'service', serviceType: 'transport' });
assert.deepEqual(transport.fields.map(field => field.key), ['origin', 'destination', 'cargo_description', 'operational_contact']);
assert.equal(transport.fields.some(field => field.key === 'bank_account'), false);

const goodsWithoutDelivery = buildProgressiveDataRequest({ stage: 'service', serviceType: 'b2b_goods' });
assert.equal(goodsWithoutDelivery.fields.some(field => field.key === 'delivery_location'), false);
const goodsWithDelivery = buildProgressiveDataRequest({ stage: 'service', serviceType: 'b2b_goods', requiresDelivery: true });
assert.equal(goodsWithDelivery.fields.some(field => field.key === 'delivery_location'), true);

const provider = buildProgressiveDataRequest({ stage: 'service', serviceType: 'provider_qualification' });
assert.deepEqual(provider.fields.map(field => field.key), ['service_categories', 'coverage_area', 'operational_contact']);

const relationship = buildProgressiveDataRequest({ stage: 'organization_relationship', risk: 'STANDARD' });
assert.equal(relationship.fields.some(field => field.key === 'authorization_evidence'), false);
assert.deepEqual(relationship.requiredControls.map(control => control.key), ['organization_admin_approval']);

const highRiskRelationship = buildProgressiveDataRequest({ stage: 'organization_relationship', risk: 'HIGH' });
assert.equal(highRiskRelationship.fields.some(field => field.key === 'authorization_evidence'), true);
assert.deepEqual(highRiskRelationship.requiredControls.map(control => control.key), ['organization_admin_approval', 'authorization_evidence_review']);

const integration = buildProgressiveDataRequest({ stage: 'capability', capability: 'external_integration' });
assert.deepEqual(integration.fields.map(field => field.key), ['system_name', 'integration_purpose', 'requested_scopes', 'technical_contact']);

const personalData = buildProgressiveDataRequest({ stage: 'capability', capability: 'personal_data_workflow' });
assert.deepEqual(personalData.requiredControls.map(control => control.key), ['legal_privacy_review']);
assert.equal(personalData.fields.some(field => field.key === 'legal_review_reference'), false);

const alreadyKnown = buildProgressiveDataRequest({
  stage: 'service',
  serviceType: 'transport',
  alreadySatisfiedFields: ['origin', 'destination', 'operational_contact']
});
assert.deepEqual(alreadyKnown.fields.map(field => field.key), ['cargo_description']);

const complete = buildProgressiveDataRequest({
  stage: 'account',
  alreadySatisfiedFields: ['display_name', 'verified_contact']
});
assert.equal(complete.status, 'NO_ADDITIONAL_DATA_REQUIRED');
assert.equal(complete.privacyNoticeRequired, false);
assert.deepEqual(complete.fields, []);
assert.deepEqual(complete.requiredControls, []);

assert.throws(() => buildProgressiveDataRequest({ stage: 'service', serviceType: 'unknown' }), /UNSUPPORTED_SERVICE_TYPE/);
assert.throws(() => buildProgressiveDataRequest({ stage: 'capability', capability: 'unknown' }), /UNSUPPORTED_CAPABILITY/);
assert.throws(() => buildProgressiveDataRequest({ stage: 'organization_relationship', risk: 'EXTREME' }), /INVALID_RISK/);
assert.throws(() => buildProgressiveDataRequest({ stage: 'unknown' }), /UNSUPPORTED_INTAKE_STAGE/);
assert.throws(() => buildProgressiveDataRequest({ stage: 'account', alreadySatisfiedFields: ['<script>'] }), /INVALID_AVAILABLE_FIELD/);

console.log('Progressive participant intake policy passed');
