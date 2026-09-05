const SECRET_KEY_PATTERN = /(password|secret|token|apiKey|api_key|credential|privateKey|private_key)/i;
const PROHIBITED_ACTIONS = new Set([
  'MOVE_FUNDS',
  'CUSTODY_FUNDS',
  'CHANGE_SECURITY_LEVEL',
  'GRANT_CROSS_ORG_ACCESS',
  'ALTER_PERMISSIONS',
  'SIGN_CONTRACT',
  'CHANGE_PRICE',
  'CHANGE_DISCOUNT'
]);

function cleanText(value, max = 4000) {
  return String(value ?? '').replace(/\u0000/g, '').slice(0, max);
}

function assertNoSecretKeys(value, path = '') {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoSecretKeys(item, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (SECRET_KEY_PATTERN.test(key)) throw new Error(`AI_CONTEXT_SECRET_KEY_FORBIDDEN:${path}${key}`);
    assertNoSecretKeys(child, `${path}${key}.`);
  }
}

export function buildAuthorizedAiContext(input = {}) {
  const projection = input.authorizedProjection && typeof input.authorizedProjection === 'object'
    ? input.authorizedProjection
    : {};
  assertNoSecretKeys(projection);

  const untrusted = Array.isArray(input.untrustedContent) ? input.untrustedContent : [];
  const blocks = untrusted.map((item, index) => Object.freeze({
    blockId: String(item?.blockId || `untrusted-${index + 1}`).slice(0, 80),
    kind: String(item?.kind || 'UNTRUSTED_DATA').slice(0, 40),
    content: cleanText(item?.content, Number(input.maxUntrustedChars) || 4000),
    instructionsExecutable: false,
    canChangePermissions: false,
    canAuthorizeActions: false
  }));

  return Object.freeze({
    schemaVersion: 'authorized-ai-context.v1',
    authorizedProjection: Object.freeze(JSON.parse(JSON.stringify(projection))),
    untrustedBlocks: Object.freeze(blocks),
    securityBoundary: 'DETERMINISTIC_CORE_NOT_MODEL',
    modelMayExpandPermissions: false,
    documentsAndMessagesAreInstructions: false
  });
}

export function validateAiActionProposal(proposal = {}, policy = {}) {
  const action = String(proposal.action || '').trim().toUpperCase();
  const allowed = new Set((policy.allowedActions || []).map(value => String(value).trim().toUpperCase()));
  if (!action) return Object.freeze({ allowed: false, reason: 'ACTION_REQUIRED' });
  if (PROHIBITED_ACTIONS.has(action)) return Object.freeze({ allowed: false, reason: 'PROHIBITED_BY_FIA_CORE' });
  if (!allowed.has(action)) return Object.freeze({ allowed: false, reason: 'ACTION_NOT_ALLOWLISTED' });
  if (proposal.requiresHumanApproval === true && policy.humanApprovalPresent !== true) {
    return Object.freeze({ allowed: false, reason: 'HUMAN_APPROVAL_REQUIRED' });
  }
  return Object.freeze({ allowed: true, reason: 'ALLOWLISTED_BY_DETERMINISTIC_POLICY' });
}
