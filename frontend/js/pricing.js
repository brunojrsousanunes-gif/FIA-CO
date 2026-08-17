(function (global) {
  'use strict';

  const PRICING_VERSION = 'beta-2026-08-v6-pilot-bridge';
  const REGULATORY_MODE = 'DEMO_ONLY';
  const DEFAULT_TARGET_MARGIN_PCT = 15;
  const PARTICIPANTS = ['PERSON', 'BUSINESS'];
  const MICRO_PAYMENTS_STRATEGY = 'SECONDARY_RND';

  const SCHEDULE = [
    { upTo: 10, fixed: 0.10, rate: 0 },
    { upTo: 25, fixed: 0.29, rate: 0 },
    { upTo: 50, fixed: 0.49, rate: 0 },
    { upTo: 100, fixed: 0, rate: 0.009 },
    { upTo: 250, fixed: 0, rate: 0.012 },
    { upTo: 500, fixed: 0, rate: 0.015 },
    { upTo: Infinity, fixed: 0, rate: 0.0175 }
  ];

  const FOUNDER_LED_DEFAULTS = {
    operations: [20, 25, 30, 40, 55, 75, 100, 130, 165, 205, 250, 300],
    automationPct: [20, 30, 40, 50, 58, 65, 70, 74, 78, 81, 83, 85],
    operatingExpense: [600, 610, 625, 650, 685, 730, 790, 860, 950, 1050, 1175, 1325],
    revenuePerManagement: 24,
    minutesPerManagementBeforeAutomation: 20,
    initialCash: 0,
    founderCashSalary: 0,
    founderShadowHourlyCost: 0,
    humanOpsHourlyCashCost: 0,
    microPaymentsStrategy: MICRO_PAYMENTS_STRATEGY,
    customerSupportMode: 'FOUNDER_LED',
    commercialMode: 'FOUNDER_LED',
    operationsMode: 'AI_ASSISTED'
  };

  function round2(value) { return Math.round((Number(value) + Number.EPSILON) * 100) / 100; }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, Number(value))); }
  function participant(value) { value = String(value || 'PERSON').toUpperCase(); return PARTICIPANTS.includes(value) ? value : 'PERSON'; }
  function relation(a, b) {
    a = participant(a); b = participant(b);
    if (a === 'PERSON' && b === 'PERSON') return 'P2P';
    if (a === 'BUSINESS' && b === 'BUSINESS') return 'B2B';
    return 'MIXED';
  }
  function bandFor(amount) { return SCHEDULE.find(function (band) { return amount <= band.upTo; }); }
  function interpolate(start, end, index, lastIndex) {
    if (lastIndex <= 0) return round2(start);
    return round2(Number(start) + ((Number(end) - Number(start)) * (index / lastIndex)));
  }

  function quote(amount, options) {
    amount = Number(amount); options = options || {};
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Importe no válido');
    if (options.cancelledBeforeExecution === true) return { tier:'CANCELLED', fee:0, rate:0, relation:relation(options.fromType, options.toType), productionBillingEnabled:false, regulatoryMode:REGULATORY_MODE };
    const band = bandFor(amount);
    const rel = relation(options.fromType, options.toType);
    let fee = band.fixed || (amount * band.rate);
    const volumeDiscount = rel === 'B2B' && Number(options.monthlyTransactions || 0) >= 100 ? 0.85 : 1;
    fee = round2(fee * volumeDiscount);
    return {
      tier: amount <= 50 ? 'ADOPTION_SECONDARY' : (rel === 'B2B' ? 'BUSINESS_VOLUME' : 'STANDARD'),
      relation: rel,
      fromType: participant(options.fromType),
      toType: participant(options.toType),
      amount: amount,
      rate: band.rate,
      fee: fee,
      volumeDiscountPct: volumeDiscount === 1 ? 0 : 15,
      microPaymentsStrategy: amount <= 50 ? MICRO_PAYMENTS_STRATEGY : 'CORE_READY',
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
    if (targetMarginPct < 0 || targetMarginPct >= 100) throw new Error('Margen objetivo no válido');
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

  function pilotToRunwayOptions(report, overrides) {
    report = report || {}; overrides = overrides || {};
    const operations = Math.max(0, Math.round(Number(report.operations || 0)));
    if (!operations) throw new Error('La muestra piloto necesita al menos una gestión');
    const automationPct = clamp(Number(report.automationPct || 0), 0, 100);
    const totalManualMinutes = Math.max(0, Number(report.totalManualMinutes || 0));
    const manualMinutesPerManagement = totalManualMinutes > 0 ? round2(totalManualMinutes / operations) : FOUNDER_LED_DEFAULTS.minutesPerManagementBeforeAutomation;
    const targetOperationsM12 = Math.max(operations, Math.round(Number(overrides.operationsM12 || FOUNDER_LED_DEFAULTS.operations[11])));
    const targetAutomationM12 = clamp(Number(overrides.automationM12 == null ? FOUNDER_LED_DEFAULTS.automationPct[11] : overrides.automationM12), automationPct, 100);
    return {
      source: 'PILOT_AGGREGATE',
      containsPersonalData: false,
      useDefaultPath: false,
      operationsM1: operations,
      operationsM12: targetOperationsM12,
      automationM1: automationPct,
      automationM12: targetAutomationM12,
      minutesPerManagementBeforeAutomation: manualMinutesPerManagement,
      observedHumanMinutes: Math.max(0, Number(report.totalHumanMinutes || 0)),
      observedEscalationRatePct: clamp(Number(report.escalationRatePct || 0), 0, 100),
      observedRiskEvents: Math.max(0, Math.round(Number(report.riskEvents || 0)))
    };
  }

  function founderLedSimulation(options) {
    options = options || {};
    const useDefaultPath = options.useDefaultPath !== false;
    const revenuePerManagement = Number.isFinite(Number(options.revenuePerManagement)) ? Number(options.revenuePerManagement) : FOUNDER_LED_DEFAULTS.revenuePerManagement;
    const initialCash = Number.isFinite(Number(options.initialCash)) ? Number(options.initialCash) : FOUNDER_LED_DEFAULTS.initialCash;
    const minutesBase = Number.isFinite(Number(options.minutesPerManagementBeforeAutomation)) ? Number(options.minutesPerManagementBeforeAutomation) : FOUNDER_LED_DEFAULTS.minutesPerManagementBeforeAutomation;
    const founderCashSalary = Math.max(0, Number(options.founderCashSalary || FOUNDER_LED_DEFAULTS.founderCashSalary));
    const shadowHourly = Math.max(0, Number(options.founderShadowHourlyCost || FOUNDER_LED_DEFAULTS.founderShadowHourlyCost));
    const humanOpsHourlyCashCost = Math.max(0, Number(options.humanOpsHourlyCashCost || FOUNDER_LED_DEFAULTS.humanOpsHourlyCashCost));
    if (revenuePerManagement < 0 || minutesBase < 0) throw new Error('Supuestos founder-led no válidos');

    const months = [];
    let cash = round2(initialCash);
    let cumulativeOperatingResult = 0;
    let breakEvenMonth = null;
    let cashPositiveMonth = initialCash >= 0 ? 0 : null;

    for (let i = 0; i < 12; i += 1) {
      const operations = useDefaultPath
        ? Number(FOUNDER_LED_DEFAULTS.operations[i])
        : Math.round(interpolate(Number(options.operationsM1 || 20), Number(options.operationsM12 || 300), i, 11));
      const automationPct = useDefaultPath
        ? Number(FOUNDER_LED_DEFAULTS.automationPct[i])
        : interpolate(Number(options.automationM1 || 20), Number(options.automationM12 || 85), i, 11);
      const operatingExpense = useDefaultPath
        ? Number(FOUNDER_LED_DEFAULTS.operatingExpense[i])
        : interpolate(Number(options.expenseM1 || 600), Number(options.expenseM12 || 1325), i, 11);
      const revenue = round2(operations * revenuePerManagement);
      const founderHours = round2((operations * minutesBase * (1 - (automationPct / 100))) / 60);
      const shadowFounderCost = round2(founderHours * shadowHourly);
      const variableHumanCashCost = round2(founderHours * humanOpsHourlyCashCost);
      const cashExpense = round2(operatingExpense + founderCashSalary + variableHumanCashCost);
      const operatingResult = round2(revenue - cashExpense);
      const economicResult = round2(operatingResult - shadowFounderCost);
      cumulativeOperatingResult = round2(cumulativeOperatingResult + operatingResult);
      cash = round2(cash + operatingResult);
      if (breakEvenMonth === null && operatingResult >= 0) breakEvenMonth = i + 1;
      if (cashPositiveMonth === null && cash >= 0) cashPositiveMonth = i + 1;
      months.push({
        month: i + 1,
        operations,
        automationPct,
        revenue,
        operatingExpense,
        founderCashSalary,
        variableHumanCashCost,
        cashExpense,
        operatingResult,
        economicResult,
        cumulativeOperatingResult,
        cash,
        founderHours,
        shadowFounderCost
      });
    }

    const last = months[months.length - 1];
    const negativeBurnMonths = months.filter(function (m) { return m.operatingResult < 0; });
    const maxMonthlyBurn = negativeBurnMonths.length ? Math.max.apply(null, negativeBurnMonths.map(function (m) { return Math.abs(m.operatingResult); })) : 0;
    const runwayAtM1 = months[0].operatingResult < 0 && initialCash > 0 ? round2(initialCash / Math.abs(months[0].operatingResult)) : null;

    return {
      strategy: 'FOUNDER_LED_AI',
      dataSource: options.dataSource || (useDefaultPath ? 'PLANNING_BASELINE' : 'CUSTOM_ASSUMPTIONS'),
      customerSupportMode: 'FOUNDER_LED',
      commercialMode: 'FOUNDER_LED',
      operationsMode: 'AI_ASSISTED',
      microPaymentsStrategy: MICRO_PAYMENTS_STRATEGY,
      productionBillingEnabled: false,
      regulatoryMode: REGULATORY_MODE,
      assumptions: { revenuePerManagement, initialCash, minutesPerManagementBeforeAutomation: minutesBase, founderCashSalary, founderShadowHourlyCost: shadowHourly, humanOpsHourlyCashCost, useDefaultPath },
      months,
      breakEvenMonth,
      cashPositiveMonth,
      maxMonthlyBurn: round2(maxMonthlyBurn),
      runwayAtM1,
      yearRevenue: round2(months.reduce(function (sum, m) { return sum + m.revenue; }, 0)),
      yearCashExpense: round2(months.reduce(function (sum, m) { return sum + m.cashExpense; }, 0)),
      yearOperatingResult: round2(cumulativeOperatingResult),
      endCash: last.cash,
      endOperations: last.operations,
      endAutomationPct: last.automationPct,
      endFounderHours: last.founderHours
    };
  }

  global.FIACOPricing = {
    version: PRICING_VERSION,
    regulatoryMode: REGULATORY_MODE,
    productionBillingEnabled: false,
    microPaymentsStrategy: MICRO_PAYMENTS_STRATEGY,
    participants: PARTICIPANTS,
    schedule: SCHEDULE,
    founderLedDefaults: FOUNDER_LED_DEFAULTS,
    relation: relation,
    quote: quote,
    economics: economics,
    pilotToRunwayOptions: pilotToRunwayOptions,
    founderLedSimulation: founderLedSimulation
  };
})(typeof window !== 'undefined' ? window : globalThis);
