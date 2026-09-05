function parseDate(value, label) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error(`INVALID_${label}`);
  return date;
}

export function evaluateRetention(input = {}, options = {}) {
  const retentionDays = Math.max(1, Math.min(3650, Math.floor(Number(input.retentionDays) || 30)));
  const anchor = parseDate(input.closedAt || input.createdAt, 'RETENTION_ANCHOR');
  const now = parseDate(options.now || new Date().toISOString(), 'NOW');
  const deleteAfter = new Date(anchor.getTime() + retentionDays * 24 * 60 * 60 * 1000);
  const legalHold = input.legalHold === true;
  const due = now >= deleteAfter;

  return Object.freeze({
    schemaVersion: 'retention-policy.v1',
    decision: legalHold ? 'HOLD' : (due ? 'DELETE_DUE' : 'KEEP'),
    retentionDays,
    anchorAt: anchor.toISOString(),
    deleteAfter: deleteAfter.toISOString(),
    legalHold,
    deletionDue: due && !legalHold,
    automaticDeletionExecuted: false,
    rule: 'El evaluador determina vencimiento; la eliminación real requiere repositorio productivo y auditoría de borrado.'
  });
}
