(function (global) {
  'use strict';

  const PRICING_VERSION = 'beta-2026-08-v1';
  const PLANS = {
    STANDARD: { tier: 'STANDARD', rate: 0.0085, min: 0.99, max: 12.90, enhancedControls: false },
    CONTROL_PLUS: { tier: 'CONTROL_PLUS', rate: 0.0115, min: 0.99, max: 19.90, enhancedControls: true }
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
      return { tier: 'CANCELLED', rate: 0, fee: 0, enhancedControls: false, cancelledBeforeExecution: true };
    }
    const plan = options.controlPlus === true ? PLANS.CONTROL_PLUS : PLANS.STANDARD;
    return {
      tier: plan.tier,
      rate: plan.rate,
      fee: round2(clamp(amount * plan.rate, plan.min, plan.max)),
      enhancedControls: plan.enhancedControls,
      cancelledBeforeExecution: false
    };
  }

  function economics(amount, costs, options) {
    const q = quote(amount, options);
    costs = costs || {};
    const paymentCost = round2((q.fee * Number(costs.paymentRate || 0)) + Number(costs.paymentFixed || 0));
    const variableCost = round2(Number(costs.variable || 0) + Number(costs.support || 0) + Number(costs.security || 0) + paymentCost);
    const contribution = round2(q.fee - variableCost);
    const margin = q.fee ? round2((contribution / q.fee) * 100) : 0;
    return Object.assign({}, q, { amount: Number(amount), paymentCost, variableCost, contribution, contributionMarginPct: margin, profitable: contribution >= 0 });
  }

  global.FIACOPricing = { version: PRICING_VERSION, plans: PLANS, quote, economics };
})(typeof window !== 'undefined' ? window : globalThis);
