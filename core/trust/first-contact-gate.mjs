export const FIRST_CONTACT_SECURITY_LEVEL = 'L0_DEMO';
export const FIRST_CONTACT_INFORMATION_LEVEL = 'I0_PUBLIC';

export const FIRST_CONTACT_TOPICS = Object.freeze({
  FIA_OVERVIEW: 'FIA_OVERVIEW',
  SECURITY_AND_CONTROL: 'SECURITY_AND_CONTROL',
  TRUST_LEVELS_OVERVIEW: 'TRUST_LEVELS_OVERVIEW',
  QUOTE_RECOVERY_OVERVIEW: 'QUOTE_RECOVERY_OVERVIEW',
  DOCUMENT_FLOW_OVERVIEW: 'DOCUMENT_FLOW_OVERVIEW',
  TRUST_TRANSACTION_OVERVIEW: 'TRUST_TRANSACTION_OVERVIEW',
  PARTNER_COORDINATION_OVERVIEW: 'PARTNER_COORDINATION_OVERVIEW',
  PURCHASE_SEARCH_OVERVIEW: 'PURCHASE_SEARCH_OVERVIEW',
  CONTACT_AND_NEXT_STEP: 'CONTACT_AND_NEXT_STEP'
});

const BLOCKED_CAPABILITIES = new Set([
  'SHOW_SOLUTION',
  'RUN_SIMULATION',
  'RUN_PURCHASE_RANKING',
  'RUN_LIVE_PURCHASE_SEARCH',
  'OPEN_OPERATIONAL_AREA',
  'USE_REAL_DATA',
  'TAKE_EXTERNAL_ACTION'
]);

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1200);
}

function containsSensitiveValue(raw) {
  const text = String(raw ?? '');
  return /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text)
    || /\bES\d{22}\b/i.test(text.replace(/\s+/g, ''))
    || /\b(?:\d{8}[A-Z]|[XYZ]\d{7}[A-Z])\b/i.test(text)
    || /\b(?:api[_ -]?key|token|secret|password|contrasena)\s*[:=]\s*\S{6,}/i.test(text);
}

export function classifyFirstContactTopic(query) {
  const text = normalize(query);
  if (/\b(comprar|compra|buscar.*(?:tractor|maquina|maquinaria|equipo|vehiculo)|ofertas? de|comparar compra)\b/.test(text)) return FIRST_CONTACT_TOPICS.PURCHASE_SEARCH_OVERVIEW;
  if (/\b(presupuesto|seguimiento|oportunidad|cliente olvidado|recover)\b/.test(text)) return FIRST_CONTACT_TOPICS.QUOTE_RECOVERY_OVERVIEW;
  if (/\b(documento|papel|expediente|documentacion|document flow)\b/.test(text)) return FIRST_CONTACT_TOPICS.DOCUMENT_FLOW_OVERVIEW;
  if (/\b(proveedor|taller|partner|otra empresa|coordinacion|interempresa)\b/.test(text)) return FIRST_CONTACT_TOPICS.PARTNER_COORDINATION_OVERVIEW;
  if (/\b(operacion|trazabilidad|evidencia|trust transaction)\b/.test(text)) return FIRST_CONTACT_TOPICS.TRUST_TRANSACTION_OVERVIEW;
  if (/\b(l[0-4]|nivel|niveles|trust level)\b/.test(text)) return FIRST_CONTACT_TOPICS.TRUST_LEVELS_OVERVIEW;
  if (/\b(seguridad|permiso|acceso|quien ve|control|datos)\b/.test(text)) return FIRST_CONTACT_TOPICS.SECURITY_AND_CONTROL;
  if (/\b(contacto|hablar|reunion|demo|demostracion|siguiente paso|comercial)\b/.test(text)) return FIRST_CONTACT_TOPICS.CONTACT_AND_NEXT_STEP;
  return FIRST_CONTACT_TOPICS.FIA_OVERVIEW;
}

export function evaluateFirstContactQuery(input = {}) {
  const query = String(input.query ?? '');
  const ownerApproval = input.ownerApproval === true;
  const topic = classifyFirstContactTopic(query);
  const text = normalize(query);
  const asksForRestrictedCapability = /\b(simula|simulacion|ensena(?:me)?|muestra(?:me)?|solucion|resuelve|ranking|mejor opcion|mejores opciones|busca ofertas|buscar ofertas|abre la app|ejecuta|automatiza)\b/.test(text);

  if (containsSensitiveValue(query)) {
    return Object.freeze({
      schemaVersion: 'first-contact-gate.v1',
      securityLevel: FIRST_CONTACT_SECURITY_LEVEL,
      informationLevel: FIRST_CONTACT_INFORMATION_LEVEL,
      topic,
      outcome: 'SENSITIVE_INPUT_REJECTED',
      ownerApprovalRequired: true,
      rawQueryStored: false,
      mayShowSolution: false,
      mayRunSimulation: false,
      mayRunRanking: false,
      mayOpenOperationalArea: false
    });
  }

  const gated = asksForRestrictedCapability && !ownerApproval;
  return Object.freeze({
    schemaVersion: 'first-contact-gate.v1',
    securityLevel: FIRST_CONTACT_SECURITY_LEVEL,
    informationLevel: FIRST_CONTACT_INFORMATION_LEVEL,
    topic,
    outcome: gated ? 'OWNER_APPROVAL_REQUIRED' : 'ORIENTATION_ONLY',
    ownerApprovalRequired: gated || !ownerApproval,
    rawQueryStored: false,
    mayShowSolution: ownerApproval,
    mayRunSimulation: ownerApproval,
    mayRunRanking: ownerApproval,
    mayOpenOperationalArea: ownerApproval
  });
}

export function assertFirstContactCapability(capability, input = {}) {
  const normalized = String(capability || '').toUpperCase();
  if (BLOCKED_CAPABILITIES.has(normalized) && input.ownerApproval !== true) {
    throw new Error(`FIRST_CONTACT_OWNER_APPROVAL_REQUIRED:${normalized}`);
  }
  return true;
}

export function updateFirstContactProfile(current = {}, input = {}) {
  const topic = classifyFirstContactTopic(input.query || '');
  const previousCounts = current.topicCounts && typeof current.topicCounts === 'object' ? current.topicCounts : {};
  const visitCount = Number(current.visitCount || 0) + (input.newVisit === true ? 1 : 0);
  const sectorHints = Array.from(new Set([...(Array.isArray(current.sectorHints) ? current.sectorHints : []), ...(Array.isArray(input.sectorHints) ? input.sectorHints : [])]))
    .map(value => String(value).slice(0, 60))
    .slice(0, 8);

  return Object.freeze({
    schemaVersion: 'first-contact-profile.v1',
    securityLevel: FIRST_CONTACT_SECURITY_LEVEL,
    informationLevel: FIRST_CONTACT_INFORMATION_LEVEL,
    topicCounts: Object.freeze({ ...previousCounts, [topic]: Number(previousCounts[topic] || 0) + 1 }),
    sectorHints: Object.freeze(sectorHints),
    visitCount,
    lastSeenAt: input.now || new Date().toISOString(),
    humanPresenceVerdict: input.humanPresenceVerdict || current.humanPresenceVerdict || 'PENDING',
    rawQueryStored: false,
    freeTextNotesStored: false,
    personalDataStored: false
  });
}
