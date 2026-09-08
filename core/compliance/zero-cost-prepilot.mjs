import { classifySensitiveText } from '../privacy/sensitive-data-policy.mjs';
import { createContractAcceptance } from '../contracts/versioned-contract.mjs';

function required(value, code) {
  const result = String(value || '').trim();
  if (!result) throw new Error(code);
  return result;
}

export function prepareZeroCostPrepilot(input = {}) {
  if (input.demoMode !== true) throw new Error('DEMO_MODE_REQUIRED');
  if (input.realMoney === true) throw new Error('REAL_MONEY_FORBIDDEN');
  if (input.realPeople === true || input.realCustomerData === true) throw new Error('REAL_PERSONAL_DATA_FORBIDDEN');
  if (input.externalServiceRequired === true) throw new Error('PAID_OR_EXTERNAL_SERVICE_FORBIDDEN');

  const scan = classifySensitiveText(JSON.stringify(input));
  if (scan.sensitive) {
    const error = new Error('SENSITIVE_DATA_DETECTED');
    error.categories = scan.categories;
    throw error;
  }

  const contract = createContractAcceptance(input.contract);
  const scenarioId = required(input.scenarioId, 'MISSING_SCENARIO_ID');

  return Object.freeze({
    schemaVersion: 'zero-cost-prepilot.v1',
    scenarioId,
    status: 'SIMULATION_READY',
    contract,
    protections: Object.freeze({
      realMoneyAllowed: false,
      realPersonalDataAllowed: false,
      biometricDataAllowed: false,
      networkSubmissionAllowed: false,
      productionEffectsAllowed: false,
      localEphemeralExecutionOnly: true
    }),
    remainingHumanGates: Object.freeze([
      'LEGAL_IDENTITY_AND_ADDRESS',
      'LEGAL_CONTACT_CHANNEL',
      'EXTERNAL_LEGAL_REVIEW',
      'PSP_SELECTION',
      'PRODUCTION_HOSTING'
    ])
  });
}
