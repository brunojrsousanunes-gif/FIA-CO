(function (global) {
  'use strict';
  const STATES = ['LEAD','QUALIFIED','OPPORTUNITY','PROPOSAL','ONBOARDING','ACTIVE_OPERATION','CLOSED','REPEAT_REFERRAL'];
  const SEGMENTS = ['TRANSPORT','INDUSTRIAL_AGRI','CONSTRUCTION','OTHER'];

  function normalize(record) {
    const r = Object.assign({}, record);
    if (!STATES.includes(r.state)) throw new Error('Estado comercial no válido');
    if (!SEGMENTS.includes(r.segment)) throw new Error('Segmento no válido');
    r.amount = Number(r.amount || 0);
    r.fee = Number(r.fee || 0);
    r.externalCost = Number(r.externalCost || 0);
    r.founderHours = Number(r.founderHours || 0);
    r.founderHourlyValue = Number(r.founderHourlyValue || 0);
    r.shadowFounderCost = r.founderHours * r.founderHourlyValue;
    r.cashContribution = r.fee - r.externalCost;
    r.economicContribution = r.cashContribution - r.shadowFounderCost;
    r.scaleDecision = r.cashContribution < 0 || r.economicContribution < 0 ? 'NO_SCALE' : 'VALIDATE';
    return r;
  }

  function summarize(records) {
    const normalized = records.map(normalize);
    const byState = Object.fromEntries(STATES.map(s => [s, 0]));
    const bySegment = Object.fromEntries(SEGMENTS.map(s => [s, 0]));
    let gmv = 0, revenue = 0, externalCost = 0, founderCost = 0;
    normalized.forEach(r => {
      byState[r.state]++;
      bySegment[r.segment]++;
      gmv += r.amount; revenue += r.fee; externalCost += r.externalCost; founderCost += r.shadowFounderCost;
    });
    return {
      count: normalized.length, byState, bySegment,
      gmv, revenue, externalCost, founderCost,
      cashContribution: revenue - externalCost,
      economicContribution: revenue - externalCost - founderCost,
      noScaleCount: normalized.filter(r => r.scaleDecision === 'NO_SCALE').length
    };
  }

  global.FIACOCommercial = { STATES, SEGMENTS, normalize, summarize };
})(typeof window !== 'undefined' ? window : globalThis);
