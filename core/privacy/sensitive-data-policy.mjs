const LABELS = Object.freeze({
  DNI_NIE_NIF: /\b(?:\d{8}[A-Z]|[XYZ]\d{7}[A-Z]|[A-Z]\d{7}[A-Z0-9])\b/i,
  IBAN: /\b[A-Z]{2}\d{2}(?:[\s-]?[A-Z0-9]){11,30}\b/i,
  PAYMENT_CARD: /(?:\d[\s-]?){13,19}/,
  AUTH_SECRET: /\b(?:password|contrasena|contraseña|token|api[ _-]?key|clave privada|private key|cvv|cvc)\b/i
});

export function classifySensitiveText(value) {
  const text = String(value ?? '').slice(0, 8000);
  const categories = Object.entries(LABELS).filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
  return Object.freeze({
    sensitive: categories.length > 0,
    categories: Object.freeze(categories),
    historyPolicy: categories.length ? 'EXCLUDE_AND_PURGE' : 'STANDARD_RETENTION',
    analyticsPolicy: categories.length ? 'DROP_RAW_VALUE' : 'MINIMIZED_EVENT_ONLY',
    aiContextAllowed: categories.length === 0
  });
}

export function buildSafeSearchRecord(input = {}) {
  const result = classifySensitiveText(input.query);
  if (result.sensitive) {
    return Object.freeze({
      stored: false,
      query: null,
      queryHash: null,
      categories: result.categories,
      deletionRequired: true,
      reason: 'SENSITIVE_SEARCH_CONTENT'
    });
  }
  return Object.freeze({
    stored: Boolean(input.historyEnabled),
    query: input.historyEnabled ? String(input.query ?? '').trim().slice(0, 1200) : null,
    queryHash: null,
    categories: Object.freeze([]),
    deletionRequired: false,
    reason: input.historyEnabled ? 'STANDARD_RETENTION' : 'HISTORY_DISABLED'
  });
}
