const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const code = fs.readFileSync('frontend/js/pricing.js', 'utf8');
const sandbox = { globalThis: {} };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const pricing = sandbox.globalThis.FIACOPricing;

assert.strictEqual(pricing.version, 'beta-2026-08-v6-pilot-bridge');
assert.strictEqual(pricing.regulatoryMode, 'DEMO_ONLY');
assert.strictEqual(pricing.productionBillingEnabled, false);
assert.strictEqual(pricing.microPaymentsStrategy, 'SECONDARY_RND');
assert.deepStrictEqual(Array.from(pricing.participants), ['PERSON', 'BUSINESS']);

assert.strictEqual(pricing.relation('PERSON', 'PERSON'), 'P2P');
assert.strictEqual(pricing.relation('PERSON', 'BUSINESS'), 'MIXED');
assert.strictEqual(pricing.relation('BUSINESS', 'BUSINESS'), 'B2B');
assert.strictEqual(pricing.quote(5).fee, 0.10);
assert.strictEqual(pricing.quote(20).fee, 0.29);
assert.strictEqual(pricing.quote(50).fee, 0.49);
assert.strictEqual(pricing.quote(100).fee, 0.90);
assert.strictEqual(pricing.quote(250).fee, 3.00);
assert.strictEqual(pricing.quote(500).fee, 7.50);
assert.strictEqual(pricing.quote(1000).fee, 17.50);
assert.strictEqual(pricing.quote(20).tier, 'ADOPTION_SECONDARY');
assert.strictEqual(pricing.quote(20).microPaymentsStrategy, 'SECONDARY_RND');
assert.strictEqual(pricing.quote(100).microPaymentsStrategy, 'CORE_READY');

const b2bVolume = pricing.quote(1000, { fromType: 'BUSINESS', toType: 'BUSINESS', monthlyTransactions: 100 });
assert.strictEqual(b2bVolume.relation, 'B2B');
assert.strictEqual(b2bVolume.volumeDiscountPct, 15);
assert.strictEqual(b2bVolume.fee, 14.88);

const cancelled = pricing.quote(100, { cancelledBeforeExecution: true });
assert.strictEqual(cancelled.fee, 0);
assert.strictEqual(cancelled.tier, 'CANCELLED');
assert.strictEqual(cancelled.productionBillingEnabled, false);

const operation = pricing.economics(100,{ paymentRate:0.015,paymentFixed:0.25,payoutRate:0.0025,payoutFixed:0.10,expectedRiskRate:0.001,variable:0.10 },{ fromType:'BUSINESS',toType:'PERSON',monthlyTransactions:20 });
assert.strictEqual(operation.relation, 'MIXED');
assert.strictEqual(operation.paymentCost, 1.75);
assert.strictEqual(operation.payoutCost, 0.35);
assert.strictEqual(operation.riskCost, 0.10);
assert.strictEqual(operation.productionBillingEnabled, false);

const founder = pricing.founderLedSimulation();
assert.strictEqual(founder.strategy, 'FOUNDER_LED_AI');
assert.strictEqual(founder.dataSource, 'PLANNING_BASELINE');
assert.strictEqual(founder.months.length, 12);
assert.strictEqual(founder.months[0].operatingResult, -120);
assert.strictEqual(founder.months[2].operatingResult, 95);
assert.strictEqual(founder.months[11].operatingResult, 5875);
assert.strictEqual(founder.months[11].founderHours, 15);
assert.strictEqual(founder.breakEvenMonth, 3);
assert.strictEqual(founder.yearRevenue, 33480);
assert.strictEqual(founder.yearCashExpense, 10050);
assert.strictEqual(founder.yearOperatingResult, 23430);

const bridge = pricing.pilotToRunwayOptions({operations:20,automationPct:60,totalManualMinutes:400,totalHumanMinutes:160,escalationRatePct:25,riskEvents:2},{operationsM12:300,automationM12:90});
assert.strictEqual(bridge.source, 'PILOT_AGGREGATE');
assert.strictEqual(bridge.containsPersonalData, false);
assert.strictEqual(bridge.operationsM1, 20);
assert.strictEqual(bridge.automationM1, 60);
assert.strictEqual(bridge.minutesPerManagementBeforeAutomation, 20);
assert.strictEqual(bridge.operationsM12, 300);
assert.strictEqual(bridge.automationM12, 90);
assert.strictEqual(bridge.observedEscalationRatePct, 25);

const pilotSim = pricing.founderLedSimulation(Object.assign({}, bridge, {dataSource:'PILOT_AGGREGATE',revenuePerManagement:24,expenseM1:600,expenseM12:1325,humanOpsHourlyCashCost:20}));
assert.strictEqual(pilotSim.dataSource, 'PILOT_AGGREGATE');
assert.strictEqual(pilotSim.months[0].operations, 20);
assert.strictEqual(pilotSim.months[0].automationPct, 60);
assert.strictEqual(pilotSim.months[0].founderHours, 2.67);
assert.strictEqual(pilotSim.months[0].variableHumanCashCost, 53.4);
assert.strictEqual(pilotSim.productionBillingEnabled, false);

const custom = pricing.founderLedSimulation({useDefaultPath:false,operationsM1:15,operationsM12:150,automationM1:10,automationM12:75,expenseM1:500,expenseM12:1000,revenuePerManagement:16,initialCash:1000,founderShadowHourlyCost:20});
assert.strictEqual(custom.months[0].operations, 15);
assert.strictEqual(custom.months[11].operations, 150);
assert.strictEqual(custom.months[11].automationPct, 75);
assert(custom.months[11].economicResult < custom.months[11].operatingResult);

assert.throws(() => pricing.pilotToRunwayOptions({operations:0}), /al menos una gestión/);
assert.throws(() => pricing.quote(0), /Importe no válido/);
assert.throws(() => pricing.economics(100, {}, { targetMarginPct: 100 }), /Margen objetivo no válido/);
console.log('pricing tests passed');
