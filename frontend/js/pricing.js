(function (global) {
  'use strict';

  const PRICING_VERSION = 'pilot-2026-08';

  function round2(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function quote(amount) {
    amount = Number(amount);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Importe no válido');

    if (amount < 3000) {
      return { tier: 'BASE', rate: 0.029, fee: round2(clamp(amount * 0.029, 0.99, 19.90)), enhancedControls: false };
    }

    let rate, min, max;
    if (amount < 5000) { rate = 0.0095; min = 24.90; max = 39.90; }
    else if (amount < 10000) { rate = 0.0075; min = 39.90; max = 59.90; }
    else if (amount < 25000) { rate = 0.0055; min = 59.90; max = 99.90; }
    else { rate = 0.0035; min = 99.90; max = 199.90; }

    return { tier: 'PLUS', rate, fee: round2(clamp(amount * rate, min, max)), enhancedControls: true };
  }

  function economics(amount, costs) {
    const q = quote(amount);
    costs = costs || {};
    const paymentCost = round2((q.fee * Number(costs.paymentRate || 0)) + Number(costs.paymentFixed || 0));
    const variableCost = round2(Number(costs.variable || 0) + Number(costs.support || 0) + Number(costs.security || 0) + paymentCost);
    const contribution = round2(q.fee - variableCost);
    const margin = q.fee ? round2((contribution / q.fee) * 100) : 0;
    return Object.assign({}, q, { amount: Number(amount), paymentCost, variableCost, contribution, contributionMarginPct: margin, profitable: contribution >= 0 });
  }

  global.FIACOPricing = { version: PRICING_VERSION, quote, economics };
})(typeof window !== 'undefined' ? window : globalThis);
