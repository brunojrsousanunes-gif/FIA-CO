import assert from 'node:assert/strict';
import fs from 'node:fs';
import {evaluateComplianceGate,assertComplianceGate} from '../core/legal/compliance-gate.mjs';

const policy=JSON.parse(fs.readFileSync('config/compliance-gates.v1.json','utf8'));
assert.equal(policy.legalReadyForPilot,false);
assert.equal(policy.capabilities.BIOMETRICS,false);
assert.equal(evaluateComplianceGate(policy,{capability:'REAL_PII'}).allowed,false);
assert.equal(evaluateComplianceGate(policy,{capability:'CLIENT_FUNDS_CUSTODY'}).reason,'PERMANENT_BOUNDARY');
assert.equal(evaluateComplianceGate(policy,{capability:'BIOMETRICS'}).reason,'PERMANENT_BOUNDARY');
assert.equal(evaluateComplianceGate(policy,{capability:'BINDING_AUTOMATED_DECISION'}).reason,'PERMANENT_BOUNDARY');
assert.throws(()=>assertComplianceGate(policy,{capability:'REAL_MONEY'}),/COMPLIANCE_EVIDENCE_MISSING/);
console.log('Compliance gates passed');
