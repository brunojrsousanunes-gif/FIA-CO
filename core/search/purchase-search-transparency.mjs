const DEFAULT_WEIGHTS = Object.freeze({ fit: 35, totalCost: 25, risk: 20, availability: 10, distance: 10 });
const METRICS = Object.freeze(Object.keys(DEFAULT_WEIGHTS));
const PURCHASE_WORDS = /\b(comprar|compra|adquirir|adquisicion|busco|buscar|necesito|encontrar|precio|precios|oferta|ofertas)\b/;
const PRODUCT_WORDS = /\b(tractor|tractores|maquina|maquinaria|equipo|equipos|vehiculo|vehiculos|furgoneta|camion|herramienta|herramientas|pieza|piezas|recambio|recambios|producto|productos|material|materiales|aperos?|desbrozadora|remolque)\b/;

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1600);
}

function clampScore(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(0, Math.min(100, number));
}

function parseBudget(text) {
  const match = text.match(/(?:menos de|hasta|max(?:imo)?|presupuesto(?: de)?|por debajo de)?\s*([0-9]{2,3}(?:[.\s][0-9]{3})+|[0-9]{4,7})\s*(?:€|eur|euros)?/);
  if (!match) return null;
  const amount = Number(match[1].replace(/[.\s]/g, ''));
  return Number.isFinite(amount) ? amount : null;
}

function inferCondition(text) {
  if (/\b(segunda mano|usado|usada|ocasion|ocasión)\b/.test(text)) return 'USED';
  if (/\b(nuevo|nueva|a estrenar)\b/.test(text)) return 'NEW';
  return null;
}

function inferLocation(text) {
  const known = ['galicia', 'lugo', 'coruna', 'a coruna', 'santiago', 'pontevedra', 'ourense', 'asturias', 'leon', 'madrid', 'barcelona'];
  return known.find(item => text.includes(item)) || null;
}

export function detectPurchaseIntent(query) {
  const text = normalize(query);
  return PURCHASE_WORDS.test(text) && PRODUCT_WORDS.test(text);
}

export function parsePurchaseCriteria(query) {
  const text = normalize(query);
  return Object.freeze({
    budgetMax: parseBudget(text),
    condition: inferCondition(text),
    location: inferLocation(text),
    rawProductDescriptionStored: false
  });
}

export function buildTransparentPurchaseSearchPlan(input = {}) {
  const query = String(input.query ?? '');
  const criteria = parsePurchaseCriteria(query);
  const sourceMode = String(input.sourceMode || 'DISCONNECTED').toUpperCase();
  const liveSourcesConnected = sourceMode === 'LIVE';
  return Object.freeze({
    schemaVersion: 'transparent-purchase-search-plan.v1',
    intent: detectPurchaseIntent(query) ? 'PURCHASE_SEARCH' : 'UNKNOWN',
    searchMode: liveSourcesConnected ? 'LIVE' : 'DEMO_NO_LIVE_SOURCES',
    liveSourcesConnected,
    queryStored: false,
    securityLevel: String(input.securityLevel || 'L0_DEMO'),
    criteria,
    weights: Object.freeze({ ...DEFAULT_WEIGHTS }),
    dataUsed: Object.freeze(['QUERY_CRITERIA', 'PUBLIC_PRODUCT_DATA_WHEN_CONNECTED']),
    dataNotUsed: Object.freeze(['PRIVATE_COMPANY_DATA_BY_DEFAULT', 'CREDENTIALS', 'PAYMENT_DATA']),
    disclosures: Object.freeze({
      rankingFormulaVisible: true,
      sourceVisible: true,
      fetchedAtVisible: true,
      missingDataVisible: true,
      sponsorshipInfluencesRanking: false,
      syntheticMustBeLabelled: true
    }),
    actionsNotTaken: Object.freeze(['NO_SELLER_CONTACT', 'NO_PURCHASE_EXECUTION', 'NO_PAYMENT_EXECUTION', 'NO_FUND_CUSTODY'])
  });
}

function validateCandidate(candidate, sourceMode) {
  if (!candidate || !candidate.id || !candidate.title) throw new Error('PURCHASE_CANDIDATE_ID_TITLE_REQUIRED');
  const mode = String(sourceMode || 'SYNTHETIC').toUpperCase();
  const synthetic = candidate.synthetic === true;
  if (mode === 'LIVE') {
    if (synthetic) throw new Error('LIVE_CANDIDATE_MUST_NOT_BE_SYNTHETIC');
    if (!candidate.source?.name || !candidate.source?.url || !candidate.source?.fetchedAt) {
      throw new Error('LIVE_CANDIDATE_SOURCE_EVIDENCE_REQUIRED');
    }
  }
  if (mode !== 'LIVE' && !synthetic) throw new Error('DEMO_CANDIDATE_MUST_BE_SYNTHETIC');
}

function confidenceFromCompleteness(completeness) {
  if (completeness >= 0.8) return 'HIGH';
  if (completeness >= 0.6) return 'MEDIUM';
  return 'LOW';
}

export function rankPurchaseCandidates(input = {}) {
  const candidates = Array.isArray(input.candidates) ? input.candidates : [];
  const sourceMode = String(input.sourceMode || 'SYNTHETIC').toUpperCase();
  const weights = Object.freeze({ ...DEFAULT_WEIGHTS, ...(input.weights || {}) });
  const weightTotal = METRICS.reduce((sum, key) => sum + Number(weights[key] || 0), 0) || 1;

  const ranked = candidates.map(candidate => {
    validateCandidate(candidate, sourceMode);
    const breakdown = {};
    const missingData = [];
    let weighted = 0;
    let presentWeight = 0;

    for (const metric of METRICS) {
      const score = clampScore(candidate.metrics?.[metric]);
      const weight = Number(weights[metric] || 0);
      if (score === null) {
        missingData.push(metric);
        breakdown[metric] = Object.freeze({ score: null, weight, contribution: 0 });
        continue;
      }
      const contribution = (score * weight) / weightTotal;
      weighted += contribution;
      presentWeight += weight;
      breakdown[metric] = Object.freeze({ score, weight, contribution: Number(contribution.toFixed(2)) });
    }

    const completeness = presentWeight / weightTotal;
    const finalScore = Number((weighted * completeness).toFixed(2));
    const confidence = confidenceFromCompleteness(completeness);
    const recommendationEligible = completeness >= 0.8;

    return Object.freeze({
      id: candidate.id,
      title: candidate.title,
      synthetic: candidate.synthetic === true,
      source: candidate.source ? Object.freeze({ ...candidate.source }) : null,
      commercialRelationship: candidate.commercialRelationship || 'NONE_DECLARED',
      sponsored: candidate.sponsored === true,
      sponsorshipInfluencedRanking: false,
      score: finalScore,
      confidence,
      completeness: Number(completeness.toFixed(2)),
      recommendationEligible,
      scoreBreakdown: Object.freeze(breakdown),
      missingData: Object.freeze(missingData)
    });
  }).sort((a, b) => {
    if (a.recommendationEligible !== b.recommendationEligible) return a.recommendationEligible ? -1 : 1;
    if (b.score !== a.score) return b.score - a.score;
    return a.title.localeCompare(b.title, 'es');
  });

  return Object.freeze(ranked);
}

export function buildManagerPurchaseDecisionReceipt(input = {}) {
  const plan = buildTransparentPurchaseSearchPlan(input);
  const sourceMode = plan.liveSourcesConnected ? 'LIVE' : 'SYNTHETIC';
  const ranked = rankPurchaseCandidates({ candidates: input.candidates || [], sourceMode, weights: input.weights });
  const eligible = ranked.filter(item => item.recommendationEligible);
  const top = eligible[0] || null;

  return Object.freeze({
    schemaVersion: 'manager-purchase-decision-receipt.v1',
    generatedAt: input.generatedAt || new Date().toISOString(),
    mode: plan.searchMode,
    recommendationStatus: plan.liveSourcesConnected
      ? (top ? 'LIVE_RECOMMENDATION_AVAILABLE' : 'INSUFFICIENT_DATA_FOR_RECOMMENDATION')
      : 'DEMO_ONLY_NO_LIVE_RECOMMENDATION',
    recommendedCandidateId: plan.liveSourcesConnected ? top?.id || null : null,
    topScoredDemoCandidateId: plan.liveSourcesConnected ? null : top?.id || null,
    plan,
    rankedCandidates: ranked,
    managerExplanation: Object.freeze({
      whyThisOrderIsVisible: true,
      criteriaAndWeightsVisible: true,
      missingInformationVisible: true,
      sourceAndTimestampVisible: true,
      commercialRelationshipVisible: true,
      sponsorshipInfluencedRanking: false,
      noGuaranteeOfPurchaseOutcome: true
    }),
    permanentBoundaries: Object.freeze({
      fiaAutonomousPurchase: false,
      fiaFundCustody: false,
      fiaFundMovement: false
    })
  });
}
