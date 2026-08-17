(function (global) {
  'use strict';

  const PRICING_VERSION = 'beta-2026-08-v3';
  const PILOT_RATE = 0.029;
  const PILOT_MIN = 0.99;
  const PILOT_MAX = 19.90;
  const DEFAULT_TARGET_MARGIN_PCT = 15;
  const REGULATORY_MODE = 'DEMO_ONLY';

  const PLANS = {
    STANDARD: {
      tier: 'STANDARD',
      rate: PILOT_RATE,
      min: PILOT_MIN,
      max: PILOT_MAX,
      enhancedControls: false,
      pilot: true,
      promotional: true,
      productionBillingEnabled: false
    },
    CONTROL_PLUS: {
      tier: 'CONTROL_PLUS',
      rate: PILOT_RATE,
      min: PILOT_MIN,
      max: PILOT_MAX,
      enhancedControls: true,
      pilot: true,
      promotional: true,
      productionBillingEnabled: false
    }
  };

  function round2(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function quote(amount, options) {
    amount = Number(amount);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Importe no válido');
    options = options || {};

    if (options.cancelledBeforeExecution === true) {
      return {
        tier: 'CANCELLED',
        rate: 0,
        fee: 0,
        enhancedControls: false,
        cancelledBeforeExecution: true,
        pilot: true,
        promotional: true,
        productionBillingEnabled: false,
        regulatoryMode: REGULATORY_MODE
      };
    }

    const plan = options.controlPlus === true ? PLANS.CONTROL_PLUS : PLANS.STANDARD;
    return {
      tier: plan.tier,
      rate: plan.rate,
      fee: round2(clamp(amount * plan.rate, plan.min, plan.max)),
      enhancedControls: plan.enhancedControls,
      cancelledBeforeExecution: false,
      pilot: plan.pilot,
      promotional: plan.promotional,
      productionBillingEnabled: plan.productionBillingEnabled,
      regulatoryMode: REGULATORY_MODE
    };
  }

  function economics(amount, costs, options) {
    amount = Number(amount);
    const q = quote(amount, options);
    costs = costs || {};
    options = options || {};

    // PSP percentage costs are modeled on GMV/transaction amount, not on FIA-CO's fee.
    const paymentCost = round2((amount * Number(costs.paymentRate || 0)) + Number(costs.paymentFixed || 0));
    const directCost = round2(
      Number(costs.variable || 0) +
      Number(costs.support || 0) +
      Number(costs.security || 0) +
      Number(costs.compliance || 0) +
      paymentCost
    );
    const taxes = round2(Number(costs.taxes || 0));
    const totalCost = round2(directCost + taxes);
    const contribution = round2(q.fee - totalCost);
    const contributionMarginPct = q.fee ? round2((contribution / q.fee) * 100) : 0;

    const targetMarginPct = Number.isFinite(Number(options.targetMarginPct))
      ? Number(options.targetMarginPct)
      : DEFAULT_TARGET_MARGIN_PCT;
    if (targetMarginPct < 0 || targetMarginPct >= 100) throw new Error('Margen objetivo no válido');

    const requiredFeeForTargetMargin = round2(totalCost / (1 - (targetMarginPct / 100)));
    const targetMarginMet = contribution > 0 && contributionMarginPct >= targetMarginPct;
    const capAllowsTargetMargin = requiredFeeForTargetMargin <= PILOT_MAX;
    const legalReady = options.legalReady === true;
    const licensedPaymentPartnerReady = options.licensedPaymentPartnerReady === true;

    // Pilot/demo may be evaluated economically, but production charging remains blocked.
    const scaleEligible = targetMarginMet && capAllowsTargetMargin && legalReady && licensedPaymentPartnerReady;
    const decision = scaleEligible ? 'VALIDATE_FOR_SCALE' : 'NO_SCALE';

    return Object.assign({}, q, {
      amount,
      paymentCost,
      directCost,
      taxes,
      totalCost,
      contribution,
      contributionMarginPct,
      profitable: contribution > 0,
      targetMarginPct,
      targetMarginMet,
      requiredFeeForTargetMargin,
      capAllowsTargetMargin,
      legalReady,
      licensedPaymentPartnerReady,
      scaleEligible,
      scaleDecision: decision,
      productionBillingEnabled: false
    });
  }

  global.FIACOPricing = {
    version: PRICING_VERSION,
    pilot: {
      rate: PILOT_RATE,
      min: PILOT_MIN,
      max: PILOT_MAX,
      targetMarginPct: DEFAULT_TARGET_MARGIN_PCT,
      promotional: true,
      regulatoryMode: REGULATORY_MODE,
      productionBillingEnabled: false,
      requiresLegalValidation: true,
      requiresLicensedPaymentPartner: true
    },
    plans: PLANS,
    quote,
    economics
  };
})(typeof window !== 'undefined' ? window : globalThis);
