import { TRUST_SECURITY_LEVELS } from './trust-security-levels.mjs';

const LEVEL_ORDER = Object.freeze([
  TRUST_SECURITY_LEVELS.L0_DEMO,
  TRUST_SECURITY_LEVELS.L1_ISOLATED,
  TRUST_SECURITY_LEVELS.L2_VERIFIED,
  TRUST_SECURITY_LEVELS.L3_SHARED,
  TRUST_SECURITY_LEVELS.L4_ADVANCED
]);

const LEVELS = Object.freeze({
  L0: Object.freeze({
    level: TRUST_SECURITY_LEVELS.L0_DEMO,
    title: 'L0 · Demo',
    capabilities: Object.freeze(['SYNTHETIC_DEMO']),
    limits: Object.freeze(['NO_REAL_DATA', 'NO_EXTERNAL_ACTIONS', 'NO_CROSS_ORG'])
  }),
  L1: Object.freeze({
    level: TRUST_SECURITY_LEVELS.L1_ISOLATED,
    title: 'L1 · Aislado',
    capabilities: Object.freeze(['REAL_DATA_ISOLATED', 'INTERNAL_AUDIT']),
    limits: Object.freeze(['ONE_ORGANIZATION_ONLY', 'NO_CROSS_ORG', 'NO_EXTERNAL_REAL_ACTIONS'])
  }),
  L2: Object.freeze({
    level: TRUST_SECURITY_LEVELS.L2_VERIFIED,
    title: 'L2 · Verificado',
    capabilities: Object.freeze(['APPROVED_OAUTH_INTEGRATION', 'INTERNAL_SAFE_AUTOMATION']),
    limits: Object.freeze(['NO_CROSS_ORG'])
  }),
  L3: Object.freeze({
    level: TRUST_SECURITY_LEVELS.L3_SHARED,
    title: 'L3 · Compartido',
    capabilities: Object.freeze(['EXTERNAL_ACTION_WITH_POLICY', 'CROSS_ORG_SHARE']),
    limits: Object.freeze(['NO_CROSS_ORG_PERSONAL_DATA', 'NO_CROSS_ORG_CRITICAL_DATA'])
  }),
  L4: Object.freeze({
    level: TRUST_SECURITY_LEVELS.L4_ADVANCED,
    title: 'L4 · Avanzado',
    capabilities: Object.freeze(['PERSONAL_DATA_WORKFLOW', 'REGULATED_PROVIDER_METADATA']),
    limits: Object.freeze(['NO_CROSS_ORG_CRITICAL_DATA', 'NO_FIA_CUSTODY_OR_FUND_MOVEMENT'])
  })
});

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1200);
}

function explicitLevel(text) {
  const match = text.match(/\bl\s*([0-4])\b/);
  return match ? LEVELS[`L${match[1]}`] : null;
}

function inferDataClass(text) {
  if (/\b(critico|critical|credencial|contrasena|password|token|secret|secreto|clave privada|private key)\b/.test(text)) return 'CRITICAL';
  if (/\b(personal|persona|dni|nif|telefono|email|direccion|direccion postal|empleado|nomina)\b/.test(text)) return 'PERSONAL';
  if (/\b(margen|precio interno|tarifa interna|presupuesto|oferta|cliente|comercial confidencial|confidencial)\b/.test(text)) return 'COMMERCIAL_CONFIDENTIAL';
  if (/\b(interno|procedimiento interno|nota interna|operacion interna)\b/.test(text)) return 'INTERNAL';
  if (/\b(publico|publica|web|catalogo|catalogo publico)\b/.test(text)) return 'PUBLIC';
  return null;
}

function inferManagement(text) {
  if (/\b(compartir|comparte|partner|proveedor|taller|renting|otra empresa|tercero|interempresa|cross org)\b/.test(text)) return 'CROSS_ORG';
  if (/\b(oauth|gmail|workspace|integracion|integrar|automatizacion interna|automatizar interno)\b/.test(text)) return 'INTERNAL_INTEGRATION';
  if (/\b(pago|fondos|dinero|custodia|transferencia|transferir|cobro)\b/.test(text)) return 'FINANCIAL';
  if (/\b(demo|ficticio|sintetico|sintetica)\b/.test(text)) return 'SYNTHETIC';
  if (/\b(operacion real|dato real|cliente real|expediente real)\b/.test(text)) return 'ISOLATED_REAL';
  return null;
}

function minimumFor({ dataClass, management }) {
  if (management === 'SYNTHETIC') return LEVELS.L0;
  if (management === 'FINANCIAL') return null;
  if (dataClass === 'CRITICAL' && management === 'CROSS_ORG') return null;
  if (dataClass === 'PERSONAL' && management === 'CROSS_ORG') return LEVELS.L4;
  if (management === 'CROSS_ORG') return LEVELS.L3;
  if (management === 'INTERNAL_INTEGRATION') return LEVELS.L2;
  if (management === 'ISOLATED_REAL') return LEVELS.L1;
  if (dataClass === 'PERSONAL') return LEVELS.L1;
  if (dataClass === 'COMMERCIAL_CONFIDENTIAL' || dataClass === 'INTERNAL' || dataClass === 'PUBLIC') return LEVELS.L1;
  if (dataClass === 'CRITICAL') return null;
  return null;
}

function buildExplanation({ explicit, dataClass, management, minimum }) {
  if (management === 'FINANCIAL') {
    return Object.freeze({
      outcome: 'PERMANENT_BOUNDARY',
      title: 'Frontera financiera permanente',
      message: 'Ningún Trust Level permite a FIA recibir, custodiar o mover fondos. La ejecución real corresponde a un proveedor o entidad legalmente habilitada.'
    });
  }
  if (dataClass === 'CRITICAL' && management === 'CROSS_ORG') {
    return Object.freeze({
      outcome: 'NEVER_ALLOWED',
      title: 'Dato crítico · no compartible entre empresas',
      message: 'Los datos CRITICAL no se comparten entre organizaciones en ningún nivel FIA.'
    });
  }
  if (dataClass === 'CRITICAL') {
    return Object.freeze({
      outcome: 'SPECIAL_REVIEW_REQUIRED',
      title: 'Dato crítico · tratamiento especial',
      message: 'Un dato CRITICAL no debe entrar en contexto de IA y no se desbloquea automáticamente por subir de nivel. Requiere una política de producción específica y revisión dedicada.'
    });
  }
  if (explicit) {
    return Object.freeze({
      outcome: 'LEVEL_OVERVIEW',
      title: explicit.title,
      message: `Capacidades: ${explicit.capabilities.join(', ')}. Límites: ${explicit.limits.join(', ')}.`
    });
  }
  if (minimum) {
    const scope = management === 'CROSS_ORG' ? 'para esta gestión interempresa' : 'para esta gestión';
    return Object.freeze({
      outcome: 'MINIMUM_LEVEL_FOUND',
      title: `${minimum.title} mínimo`,
      message: `FIA requiere como mínimo ${minimum.level} ${scope}. El acceso adicional solo se habilita después de verificar los controles correspondientes.`
    });
  }
  return Object.freeze({
    outcome: 'MORE_CONTEXT_REQUIRED',
    title: 'Falta contexto para fijar nivel',
    message: 'Indica el tipo de dato o la gestión: demo, operación real aislada, integración interna, compartir con otra empresa, datos personales o datos críticos.'
  });
}

export function searchTrustCapability(input = {}) {
  const text = normalize(input.query ?? input.text);
  const explicit = explicitLevel(text);
  const dataClass = inferDataClass(text);
  const management = inferManagement(text);
  const minimum = minimumFor({ dataClass, management });
  const explanation = buildExplanation({ explicit, dataClass, management, minimum });

  const explicitCompatible = explicit && minimum
    ? LEVEL_ORDER.indexOf(explicit.level) >= LEVEL_ORDER.indexOf(minimum.level)
    : null;

  return Object.freeze({
    schemaVersion: 'trust-capability-search.v1',
    queryStored: false,
    explicitLevel: explicit?.level || null,
    inferredDataClass: dataClass,
    inferredManagement: management,
    minimumTrustLevel: minimum?.level || null,
    explicitLevelCompatible: explicitCompatible,
    outcome: explanation.outcome,
    title: explanation.title,
    message: explanation.message,
    capabilities: Object.freeze([...(explicit || minimum)?.capabilities || []]),
    limits: Object.freeze([...(explicit || minimum)?.limits || []]),
    permanentBoundaries: Object.freeze({
      fiaFundCustody: false,
      fiaFundMovement: false,
      crossOrganizationCriticalData: false,
      credentialsInAiContext: false
    })
  });
}
