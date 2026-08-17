(function (global) {
  'use strict';

  const PRICING_VERSION = 'beta-2026-08-v4-multiparty';
  const REGULATORY_MODE = 'DEMO_ONLY';
  const DEFAULT_TARGET_MARGIN_PCT = 15;
  const PARTICIPANTS = ['PERSON', 'BUSINESS'];

  const SCHEDULE = [
    { upTo: 10, fixed: 0.10, rate: 0 },
    { upTo: 25, fixed: 0.29, rate: 0 },
    { upTo: 50, fixed: 0.49, rate: 0 },
    { upTo: 100, fixed: 0, rate: 0.009 },
    { upTo: 250, fixed: 0, rate: 0.012 },
    { upTo: 500, fixed: 0, rate: 0.015 },
    { upTo: Infinity, fixed: 0, rate: 0.0175 }
  ];

  function round2(value) { return Math.round((Number(value) + Number.EPSILON) * 100) / 100; }
  function participant(value) { value = String(value || 'PERSON').toUpperCase(); return PARTICIPANTS.includes(value) ? value : 'PERSON'; }
  function relation(a, b) {
    a = participant(a); b = participant(b);
    if (a === 'PERSON' && b === 'PERSON') return 'P2P';
    if (a === 'BUSINESS' && b === 'BUSINESS') return 'B2B';
    return 'MIXED';
  }
  function bandFor(amount) { return SCHEDULE.find(function (band) { return amount <= band.upTo; }); }

  function quote(amount, options) {
    amount = Number(amount); options = options || {};
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Importe no válido');
    if (options.cancelledBeforeExecution === true) return { tier:'CANCELLED', fee:0, rate:0, relation:relation(options.fromType, options.toType), productionBillingEnabled:false, regulatoryMode:REGULATORY_MODE };
    const band = bandFor(amount);
    const rel = relation(options.fromType, options.toType);
    let fee = band.fixed || (amount * band.rate);
    // B2B keeps transaction pricing competitive; professional monetisation is modeled separately.
    const volumeDiscount = rel === 'B2B' && Number(options.monthlyTransactions || 0) >= 100 ? 0.85 : 1;
    fee = round2(fee * volumeDiscount);
    return {
      tier: amount <= 50 ? 'ADOPTION' : (rel === 'B2B' ? 'BUSINESS_VOLUME' : 'STANDARD'),
      relation: rel,
      fromType: participant(options.fromType),
      toType: participant(options.toType),
      amount: amount,
      rate: band.rate,
      fee: fee,
      volumeDiscountPct: volumeDiscount === 1 ? 0 : 15,
      promotional: true,
      productionBillingEnabled: false,
      regulatoryMode: REGULATORY_MODE
    };
  }

  function economics(amount, costs, options) {
    costs = costs || {}; options = options || {};
    const q = quote(amount, options);
    const paymentCost = round2((Number(amount) * Number(costs.paymentRate || 0)) + Number(costs.paymentFixed || 0));
    const payoutCost = round2((Number(amount) * Number(costs.payoutRate || 0)) + Number(costs.payoutFixed || 0));
    const riskCost = round2(Number(amount) * Number(costs.expectedRiskRate || 0));
    const operatingCost = round2(Number(costs.variable || 0) + Number(costs.support || 0) + Number(costs.security || 0) + Number(costs.compliance || 0));
    const taxes = round2(Number(costs.taxes || 0));
    const totalCost = round2(paymentCost + payoutCost + riskCost + operatingCost + taxes);
    const transactionContribution = round2(q.fee - totalCost);
    const monthlySubscriptionRevenue = round2(Number(options.monthlySubscriptionRevenue || 0));
    const monthlyTransactions = Math.max(1, Number(options.monthlyTransactions || 1));
    const subscriptionAllocation = round2(monthlySubscriptionRevenue / monthlyTransactions);
    const cohortContribution = round2(transactionContribution + subscriptionAllocation);
    const subsidy = transactionContribution < 0 ? round2(Math.abs(transactionContribution)) : 0;
    const subsidyBudgetPerTransaction = Math.max(0, Number(options.subsidyBudgetPerTransaction || 0));
    const acquisitionSubsidyAllowed = subsidy > 0 && subsidy <= subsidyBudgetPerTransaction && cohortContribution > 0;
    const targetMarginPct = Number.isFinite(Number(options.targetMarginPct)) ? Number(options.targetMarginPct) : DEFAULT_TARGET_MARGIN_PCT;
    const cohortRevenue = round2(q.fee + subscriptionAllocation);
    const cohortMarginPct = cohortRevenue ? round2((cohortContribution / cohortRevenue) * 100) : 0;
    const legalReady = options.legalReady === true;
    const licensedPaymentPartnerReady = options.licensedPaymentPartnerReady === true;
    let decision = 'LOSS';
    if (cohortContribution > 0 && cohortMarginPct >= targetMarginPct) decision = 'PROFITABLE';
    else if (acquisitionSubsidyAllowed) decision = 'ACQUISITION_SUBSIDY';
    else if (cohortContribution > 0) decision = 'NO_SCALE';
    return Object.assign({}, q, {
      paymentCost, payoutCost, riskCost, operatingCost, taxes, totalCost,
      transactionContribution, monthlySubscriptionRevenue, subscriptionAllocation,
      cohortContribution, cohortMarginPct, subsidy, subsidyBudgetPerTransaction,
      acquisitionSubsidyAllowed, targetMarginPct, legalReady, licensedPaymentPartnerReady,
      scaleEligible: decision === 'PROFITABLE' && legalReady && licensedPaymentPartnerReady,
      scaleDecision: decision,
      productionBillingEnabled: false
    });
  }

  global.FIACOPricing = {
    version: PRICING_VERSION,
    regulatoryMode: REGULATORY_MODE,
    productionBillingEnabled: false,
    participants: PARTICIPANTS,
    schedule: SCHEDULE,
    relation: relation,
    quote: quote,
    economics: economics
  };
})(typeof window !== 'undefined' ? window : globalThis);
