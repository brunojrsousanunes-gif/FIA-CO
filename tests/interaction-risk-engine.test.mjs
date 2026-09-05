import assert from 'node:assert/strict';
import { evaluateInteractionRisk, evaluateDemoOperationRisk } from '../core/assistant/interaction-risk-engine.mjs';

const clean = evaluateInteractionRisk({ text: 'presupuestos sin seguimiento' }, { currentTrustLevel: 'L1_ISOLATED' });
assert.equal(clean.riskDetected, false);
assert.equal(clean.inputStored, false);

const sensitive = evaluateInteractionRisk({ text: 'contacto real ejemplo@empresa.es' }, { currentTrustLevel: 'L0_DEMO' });
assert.equal(sensitive.highestSeverity, 'CRITICAL');
assert.ok(sensitive.signals.some(item => item.code === 'REAL_SENSITIVE_VALUE_DETECTED'));

const financial = evaluateInteractionRisk({ text: 'quiero que FIA custodie dinero' }, { currentTrustLevel: 'L4_ADVANCED' });
assert.equal(financial.highestSeverity, 'CRITICAL');
assert.ok(financial.signals.some(item => item.code === 'FINANCIAL_EXECUTION_REQUEST'));

const crossOrg = evaluateInteractionRisk({ text: 'compartir presupuesto con proveedor' }, { currentTrustLevel: 'L2_VERIFIED' });
assert.ok(crossOrg.signals.some(item => item.code === 'CROSS_ORG_BEFORE_L3'));

const op = { id: 'op-1', reference: 'DEMO-1', type: 'sale_transport', completed: true };
const opRisk = evaluateDemoOperationRisk(op, [{ operationId: 'op-1', type: 'Incidencia' }]);
assert.equal(opRisk.highestSeverity, 'CRITICAL');
assert.ok(opRisk.signals.some(item => item.code === 'COMPLETED_WITH_OPEN_INCIDENT'));

console.log('interaction-risk-engine.test.mjs passed');
