const SENSITIVE_KEY_PATTERN = /(name|email|phone|mobile|address|dni|nif|passport|iban|account|secret|token|password|credential|message|body|thread|document|file|customer|client)/i;

function finiteNonNegative(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function round2(value) {
  return Math.round((finiteNonNegative(value) + Number.EPSILON) * 100) / 100;
}

function bool(value) {
  return value === true;
}

function collectSensitiveFieldCount(records) {
  const names = new Set();
  for (const record of records) {
    if (!record || typeof record !== 'object') continue;
    for (const key of Object.keys(record)) {
      if (SENSITIVE_KEY_PATTERN.test(key)) names.add(key);
    }
  }
  return names.size;
}

function outputHasForbiddenKey(value) {
  if (Array.isArray(value)) return value.some(outputHasForbiddenKey);
  if (!value || typeof value !== 'object') return false;
  for (const [key, child] of Object.entries(value)) {
    if (SENSITIVE_KEY_PATTERN.test(key) || /raw|records|rows|items|sourceData/i.test(key)) return true;
    if (outputHasForbiddenKey(child)) return true;
  }
  return false;
}

export function buildLocalShadowAggregate(records = [], options = {}) {
  if (!Array.isArray(records)) throw new Error('INVALID_SHADOW_RECORDS');
  const kind = String(options.kind || 'GENERIC_OPERATION').trim().toUpperCase().slice(0, 60);
  let followedUp = 0;
  let responded = 0;
  let blocked = 0;
  let missingRequiredInput = 0;
  let totalValue = 0;
  let cycleHoursTotal = 0;
  let cycleHoursCount = 0;
  let handoffHoursTotal = 0;
  let handoffHoursCount = 0;

  for (const record of records) {
    if (!record || typeof record !== 'object') continue;
    if (bool(record.followedUp)) followedUp += 1;
    if (bool(record.responded)) responded += 1;
    if (bool(record.blocked)) blocked += 1;
    if (bool(record.missingRequiredInput)) missingRequiredInput += 1;
    totalValue += finiteNonNegative(record.amount);
    if (Number.isFinite(Number(record.cycleHours)) && Number(record.cycleHours) >= 0) {
      cycleHoursTotal += Number(record.cycleHours);
      cycleHoursCount += 1;
    }
    if (Number.isFinite(Number(record.handoffHours)) && Number(record.handoffHours) >= 0) {
      handoffHoursTotal += Number(record.handoffHours);
      handoffHoursCount += 1;
    }
  }

  const total = records.filter(record => record && typeof record === 'object').length;
  const aggregate = Object.freeze({
    schemaVersion: 'local-shadow-aggregate.v1',
    mode: 'LOCAL_AGGREGATE_ONLY',
    kind,
    totalObserved: total,
    followedUpCount: followedUp,
    responseCount: responded,
    blockedCount: blocked,
    missingRequiredInputCount: missingRequiredInput,
    followUpRate: total ? round2(followedUp / total) : 0,
    responseRate: total ? round2(responded / total) : 0,
    totalObservedValue: round2(totalValue),
    averageCycleHours: cycleHoursCount ? round2(cycleHoursTotal / cycleHoursCount) : null,
    averageHandoffHours: handoffHoursCount ? round2(handoffHoursTotal / handoffHoursCount) : null,
    sensitiveInputFieldCountDetected: collectSensitiveFieldCount(records),
    sourceValuesExported: false,
    identifiersExported: false,
    rawTextExported: false,
    sourceRecordsRetainedByFiaCore: false,
    note: 'El agregado está diseñado para salir del entorno local sin incluir filas, identificadores ni contenido textual original.'
  });

  assertLocalShadowExportSafe(aggregate);
  return aggregate;
}

export function assertLocalShadowExportSafe(payload = {}) {
  if (!payload || typeof payload !== 'object') throw new Error('INVALID_SHADOW_EXPORT');
  if (outputHasForbiddenKey(payload)) throw new Error('SHADOW_EXPORT_CONTAINS_FORBIDDEN_FIELD');
  if (payload.sourceValuesExported !== false || payload.identifiersExported !== false || payload.rawTextExported !== false) {
    throw new Error('SHADOW_EXPORT_NOT_MINIMIZED');
  }
  return true;
}
