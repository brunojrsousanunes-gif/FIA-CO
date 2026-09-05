export const KILL_SWITCH_SCOPES = Object.freeze({
  FIA: 'FIA',
  ORGANIZATION: 'ORGANIZATION',
  WORKFLOW: 'WORKFLOW',
  INTEGRATION: 'INTEGRATION',
  OPERATION: 'OPERATION'
});

function clean(value, max = 120) {
  return String(value ?? '').replace(/[<>\r\n\t]/g, ' ').trim().slice(0, max);
}

export function createKillSwitchState() {
  return { version: 0, entries: [], events: [] };
}

export function setKillSwitch(state, input = {}, options = {}) {
  if (!state || typeof state !== 'object' || !Array.isArray(state.entries)) throw new Error('INVALID_KILL_SWITCH_STATE');
  const scope = clean(input.scope, 30).toUpperCase();
  if (!Object.values(KILL_SWITCH_SCOPES).includes(scope)) throw new Error('INVALID_KILL_SWITCH_SCOPE');
  const key = scope === KILL_SWITCH_SCOPES.FIA ? '*' : clean(input.key, 120);
  if (!key) throw new Error('KILL_SWITCH_KEY_REQUIRED');
  const enabled = input.enabled !== false;
  const reason = clean(input.reason || 'unspecified', 200);
  const actorId = clean(input.actorId || 'system', 120);
  const at = new Date(options.now || new Date().toISOString()).toISOString();

  const existing = state.entries.find(item => item.scope === scope && item.key === key);
  if (existing) {
    existing.enabled = enabled;
    existing.reason = reason;
    existing.updatedAt = at;
  } else {
    state.entries.push({ scope, key, enabled, reason, updatedAt: at });
  }
  state.version += 1;
  state.events.push({ version: state.version, scope, key, enabled, reason, actorId, at });
  return Object.freeze({ version: state.version, scope, key, enabled, reason, at });
}

function match(entry, context = {}) {
  if (!entry.enabled) return false;
  if (entry.scope === KILL_SWITCH_SCOPES.FIA) return true;
  if (entry.scope === KILL_SWITCH_SCOPES.ORGANIZATION) return entry.key === String(context.organizationId || '');
  if (entry.scope === KILL_SWITCH_SCOPES.WORKFLOW) return entry.key === String(context.workflowId || '');
  if (entry.scope === KILL_SWITCH_SCOPES.INTEGRATION) return entry.key === String(context.integrationId || '');
  if (entry.scope === KILL_SWITCH_SCOPES.OPERATION) return entry.key === String(context.operationId || '');
  return false;
}

export function evaluateKillSwitch(state, context = {}) {
  if (!state || typeof state !== 'object' || !Array.isArray(state.entries)) throw new Error('INVALID_KILL_SWITCH_STATE');
  const blockers = state.entries.filter(entry => match(entry, context)).map(entry => Object.freeze({
    scope: entry.scope,
    key: entry.key,
    reason: entry.reason,
    updatedAt: entry.updatedAt
  }));
  return Object.freeze({
    schemaVersion: 'kill-switch.v1',
    blocked: blockers.length > 0,
    decision: blockers.length ? 'DENY' : 'ALLOW',
    blockers: Object.freeze(blockers),
    failClosed: true
  });
}
