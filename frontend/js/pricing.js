(function (global) {
  'use strict';

  const PRICING_VERSION = 'beta-2026-08-v2';
  const PILOT_RATE = 0.029;
  const PILOT_MIN = 0.99;
  const PILOT_MAX = 19.90;
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
        productionBillingEnabled: false
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
      productionBillingEnabled: plan.productionBillingEnabled
    };
  }

  function economics(amount, costs, options) {
    const q = quote(amount, options);
    costs = costs || {};
    const paymentCost = round2((q.fee * Number(costs.paymentRate || 0)) + Number(costs.paymentFixed || 0));
    const variableCost = round2(Number(costs.variable || 0) + Number(costs.support || 0) + Number(costs.security || 0) + paymentCost);
    const contribution = round2(q.fee - variableCost);
    const margin = q.fee ? round2((contribution / q.fee) * 100) : 0;
    return Object.assign({}, q, {
      amount: Number(amount),
      paymentCost,
      variableCost,
      contribution,
      contributionMarginPct: margin,
      profitable: contribution >= 0
    });
  }

  global.FIACOPricing = {
    version: PRICING_VERSION,
    pilot: {
      rate: PILOT_RATE,
      min: PILOT_MIN,
      max: PILOT_MAX,
      promotional: true,
      productionBillingEnabled: false
    },
    plans: PLANS,
    quote,
    economics
  };
})(typeof window !== 'undefined' ? window : globalThis);
