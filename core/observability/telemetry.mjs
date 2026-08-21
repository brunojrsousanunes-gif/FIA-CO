const REDACTED = '[REDACTED]';
const sensitivePattern = /(password|secret|token|authorization|cookie|email|phone|iban|card|privatekey|seed|credential)/i;

function sanitize(value, key = '', depth = 0) {
  if (sensitivePattern.test(key)) return REDACTED;
  if (depth > 5) return '[MAX_DEPTH]';
  if (Array.isArray(value)) return value.slice(0, 100).map(item => sanitize(item, '', depth + 1));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).slice(0, 100).map(([childKey, childValue]) => [childKey, sanitize(childValue, childKey, depth + 1)])
    );
  }
  if (typeof value === 'string') return value.slice(0, 500);
  if (['number', 'boolean'].includes(typeof value) || value === null) return value;
  return String(value ?? '').slice(0, 500);
}

export function createTelemetryEvent({ level = 'info', event, correlationId, organizationId, meta = {} } = {}) {
  const safeLevel = ['debug', 'info', 'warn', 'error'].includes(level) ? level : 'info';
  const safeEvent = String(event || '').trim().slice(0, 100);
  if (!safeEvent) throw new Error('INVALID_TELEMETRY_EVENT');
  return Object.freeze({
    level: safeLevel,
    event: safeEvent,
    correlationId: String(correlationId || '').trim().slice(0, 120) || null,
    organizationId: String(organizationId || '').trim().slice(0, 80) || null,
    meta: Object.freeze(sanitize(meta))
  });
}

export async function createHealthReport({ repository, auditLog, organizationId } = {}) {
  const checks = {
    repositoryAvailable: Boolean(repository && typeof repository.list === 'function'),
    auditAvailable: Boolean(auditLog && typeof auditLog.verify === 'function'),
    auditIntegrity: false
  };

  if (checks.auditAvailable && organizationId) {
    try {
      checks.auditIntegrity = await auditLog.verify(organizationId);
    } catch {
      checks.auditIntegrity = false;
    }
  }

  const ok = checks.repositoryAvailable && checks.auditAvailable && (!organizationId || checks.auditIntegrity);
  return Object.freeze({ ok, checks: Object.freeze(checks), mode: 'preproduction', realFunds: false, realPii: false });
}
