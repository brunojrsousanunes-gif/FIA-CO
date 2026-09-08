import fs from 'node:fs';
import assert from 'node:assert/strict';

const profile=JSON.parse(fs.readFileSync('config/project-legal-profile.v1.json','utf8'));
assert.equal(profile.tradeName,'FIA&CO');
assert.equal(profile.legalStatus,'PROJECT_NOT_CONSTITUTED');
assert.equal(profile.operatingArea.city,'Lugo');
assert.equal(profile.publicServiceAddress,null);
assert.equal(profile.publicLegalContact,null);
assert.equal(profile.customDomain,null);
assert.equal(profile.commercialActivityEnabled,false);
assert.equal(profile.realCustomerOnboardingEnabled,false);
assert.equal(profile.costStrategy,'ZERO_COST_UNTIL_CONTROLLED_PREPILOT');
assert.ok(profile.activationBlockers.includes('VALID_SERVICE_ADDRESS'));
assert.ok(profile.activationBlockers.includes('LEGAL_CONTACT_CHANNEL'));
console.log('project-legal-profile: ok');
