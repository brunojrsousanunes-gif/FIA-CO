import assert from 'node:assert/strict';
import { selectEntryScenario } from '../core/discovery/entry-scenario-selector.mjs';

const quotes = selectEntryScenario({
  quoteVolume: 3,
  followUpPain: 3,
  lostOpportunityRisk: 3,
  manualCommercialWork: 2,
  traceabilityPain: 1
});
assert.equal(quotes.recommendation, 'QUOTE_RECOVERY');
assert.equal(quotes.hasMeaningfulSignal, true);
assert.equal(quotes.recommendationMode, 'DEMO_NOW_UNLOCK_LATER');

const documents = selectEntryScenario({
  documentVolume: 3,
  missingDocumentPain: 3,
  reworkPain: 2,
  documentWaitingTime: 3
}, { currentLevel: 'L1_ISOLATED' });
assert.equal(documents.recommendation, 'DOCUMENT_FLOW');
assert.equal(documents.recommendationMode, 'CURRENT_LEVEL_COMPATIBLE');

const partner = selectEntryScenario({
  partnerFrequency: 3,
  handoffFriction: 3,
  callsAndEmailsPain: 3,
  crossCompanyWaitingTime: 3
}, { currentLevel: 'L1_ISOLATED' });
assert.equal(partner.recommendation, 'PARTNER_COORDINATION');
assert.equal(partner.ranking[0].minimumTrustLevel, 'L3_SHARED');
assert.equal(partner.recommendationMode, 'DEMO_NOW_UNLOCK_LATER');

const weak = selectEntryScenario({ quoteVolume: 1 });
assert.equal(weak.recommendation, null);
assert.equal(weak.recommendationMode, 'MORE_DISCOVERY_REQUIRED');

console.log('FIA entry scenario selector contract OK');
