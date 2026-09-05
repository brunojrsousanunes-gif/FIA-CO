import assert from 'node:assert/strict';
import {
  detectPurchaseIntent,
  buildTransparentPurchaseSearchPlan,
  rankPurchaseCandidates,
  buildManagerPurchaseDecisionReceipt
} from '../core/search/purchase-search-transparency.mjs';

assert.equal(detectPurchaseIntent('buscar tractor usado en Galicia menos de 50000 euros'), true);

const l0 = buildTransparentPurchaseSearchPlan({
  query: 'buscar tractor usado en Galicia menos de 50000 euros',
  securityLevel: 'L0_DEMO',
  requestedInformation: [{ key: 'internalBudget', dataClass: 'INTERNAL', sourceType: 'AUTHORIZED_ISOLATED_ORG_DATA' }]
});
assert.equal(l0.informationLevel, 'I0_PUBLIC');
assert.equal(l0.canExecuteWithRequestedInformation, false);
assert.equal(l0.deniedInformation[0].reason, 'DATA_CLASS_ABOVE_INFORMATION_LEVEL');
assert.ok(l0.dataUsed.includes('SYNTHETIC_PRODUCT_DATA'));
assert.ok(l0.dataNotUsed.includes('CREDENTIALS'));

const l2 = buildTransparentPurchaseSearchPlan({
  query: 'buscar equipo nuevo',
  securityLevel: 'L2_VERIFIED',
  requestedInformation: [{ key: 'approvedBudget', dataClass: 'COMMERCIAL_CONFIDENTIAL', sourceType: 'APPROVED_INTERNAL_INTEGRATION' }]
});
assert.equal(l2.informationLevel, 'I2_CONNECTED_INTERNAL');
assert.equal(l2.canExecuteWithRequestedInformation, true);

const l2CrossOrg = buildTransparentPurchaseSearchPlan({
  query: 'buscar equipo nuevo',
  securityLevel: 'L2_VERIFIED',
  requestedInformation: [{ key: 'partnerStock', dataClass: 'COMMERCIAL_CONFIDENTIAL', sourceType: 'EXPLICIT_CROSS_ORG_GRANT' }]
});
assert.equal(l2CrossOrg.canExecuteWithRequestedInformation, false);

const l4 = buildTransparentPurchaseSearchPlan({
  query: 'buscar vehiculo',
  securityLevel: 'L4_ADVANCED',
  requestedInformation: [{ key: 'deliveryContact', dataClass: 'PERSONAL', sourceType: 'REVIEWED_PERSONAL_DATA_WORKFLOW', personalWorkflowReviewed: true }]
});
assert.equal(l4.informationLevel, 'I4_REVIEWED_PERSONAL');
assert.equal(l4.canExecuteWithRequestedInformation, true);

const candidates = [
  { id: 'b', title: 'B opción patrocinada', synthetic: true, sponsored: true, metrics: { fit: 80, totalCost: 80, risk: 80, availability: 80, distance: 80 } },
  { id: 'a', title: 'A opción no patrocinada', synthetic: true, sponsored: false, metrics: { fit: 80, totalCost: 80, risk: 80, availability: 80, distance: 80 } },
  { id: 'c', title: 'C incompleta', synthetic: true, metrics: { fit: 90, totalCost: 90 } }
];
const ranked = rankPurchaseCandidates({ candidates, sourceMode: 'SYNTHETIC' });
assert.equal(ranked[0].id, 'a');
assert.equal(ranked[1].id, 'b');
assert.equal(ranked[0].score, ranked[1].score);
assert.equal(ranked[1].sponsorshipInfluencedRanking, false);
assert.equal(ranked[2].recommendationEligible, false);
assert.ok(ranked[2].missingData.length > 0);

assert.throws(() => rankPurchaseCandidates({
  sourceMode: 'LIVE',
  candidates: [{ id: 'x', title: 'Sin fuente', synthetic: false, metrics: { fit: 90 } }]
}), /LIVE_CANDIDATE_SOURCE_EVIDENCE_REQUIRED/);

const demoReceipt = buildManagerPurchaseDecisionReceipt({
  query: 'buscar tractor usado',
  securityLevel: 'L0_DEMO',
  candidates,
  generatedAt: '2026-09-05T00:00:00.000Z'
});
assert.equal(demoReceipt.recommendationStatus, 'DEMO_ONLY_NO_LIVE_RECOMMENDATION');
assert.equal(demoReceipt.recommendedCandidateId, null);
assert.ok(demoReceipt.topScoredDemoCandidateId);
assert.equal(demoReceipt.managerExplanation.securityAndInformationLevelsVisible, true);
assert.equal(demoReceipt.managerExplanation.commercialRelationshipVisible, true);
assert.equal(demoReceipt.permanentBoundaries.criticalDataInSearch, false);
assert.equal(demoReceipt.permanentBoundaries.fiaFundCustody, false);

console.log('purchase-search-transparency.test.mjs passed');
