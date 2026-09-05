import { getTrustLevelDefinition, TRUST_SECURITY_LEVELS } from './trust-security-levels.mjs';

export const TRUST_VALUE_FRAMEWORK_VERSION = 'trust-value-framework.v1';

const FRAMES = Object.freeze({
  L0_DEMO: Object.freeze({
    security: Object.freeze([
      'Solo datos sintéticos',
      'Sin credenciales ni conexiones externas',
      'Sin acciones reales ni fondos gestionados por FIA'
    ]),
    utility: Object.freeze([
      'Entender cómo FIA representa una operación',
      'Visualizar trazabilidad, permisos y límites',
      'Detectar dónde existe una fricción medible sin exponer datos reales'
    ]),
    maximization: Object.freeze([
      'Seleccionar el caso con mayor potencial antes de integrar nada',
      'Evitar coste técnico y riesgo prematuros'
    ])
  }),
  L1_ISOLATED: Object.freeze({
    security: Object.freeze([
      'Una sola organización y una sola operación controlada',
      'Datos minimizados y auditados',
      'Sin intercambio interempresa ni acciones externas'
    ]),
    utility: Object.freeze([
      'Medir una operación real con trazabilidad',
      'Crear baseline de tiempos, incidencias y resultado',
      'Comprobar utilidad con un alcance limitado'
    ]),
    maximization: Object.freeze([
      'Identificar qué parte del proceso merece automatización',
      'Priorizar mejoras reutilizables antes de ampliar accesos'
    ])
  }),
  L2_VERIFIED: Object.freeze({
    security: Object.freeze([
      'Identidad, autenticación fuerte y secretos controlados',
      'Minimización y retención definidas',
      'Integraciones oficiales aprobadas y pruebas de seguridad'
    ]),
    utility: Object.freeze([
      'Automatización interna segura',
      'Integraciones OAuth limitadas al alcance necesario',
      'Menos tareas repetitivas y mejor seguimiento interno'
    ]),
    maximization: Object.freeze([
      'Aumentar capacidad operativa sin abrir acceso interempresa',
      'Concentrar automatización donde el baseline demuestre valor'
    ])
  }),
  L3_SHARED: Object.freeze({
    security: Object.freeze([
      'Aislamiento entre organizaciones probado',
      'Permisos por finalidad, campos, caducidad y revocación',
      'Identidad del partner verificada y acceso DENY por defecto'
    ]),
    utility: Object.freeze([
      'Coordinar dos empresas dentro de una operación',
      'Compartir solo el evento o dato necesario',
      'Reducir fricción de llamadas, emails y esperas entre participantes'
    ]),
    maximization: Object.freeze([
      'Reutilizar el mismo flujo con partners recurrentes',
      'Capturar valor adicional de coordinación sin compartir empresas completas'
    ])
  }),
  L4_ADVANCED: Object.freeze({
    security: Object.freeze([
      'Revisión jurídica y técnica reforzada',
      'Subencargados y flujos personales documentados',
      'Datos críticos siguen fuera del intercambio interempresa'
    ]),
    utility: Object.freeze([
      'Habilitar procesos avanzados que requieren datos personales bajo controles específicos',
      'Incorporar metadatos de proveedores regulados cuando proceda',
      'Orquestar más etapas de una operación manteniendo límites explícitos'
    ]),
    maximization: Object.freeze([
      'Extender FIA a procesos de mayor complejidad solo cuando existe evidencia y control suficiente',
      'Aumentar automatización y coordinación sin convertir FIA en custodio financiero'
    ])
  })
});

const ORDER = Object.freeze(Object.values(TRUST_SECURITY_LEVELS));

function cloneList(values = []) {
  return Object.freeze([...values]);
}

export function getTrustValueFrame(level) {
  const frame = FRAMES[level];
  if (!frame) throw new Error('UNKNOWN_TRUST_VALUE_LEVEL');
  const definition = getTrustLevelDefinition(level);
  return Object.freeze({
    policyVersion: TRUST_VALUE_FRAMEWORK_VERSION,
    level,
    security: cloneList(frame.security),
    utility: cloneList(frame.utility),
    maximization: cloneList(frame.maximization),
    capabilities: cloneList(definition.capabilities),
    requirements: cloneList(definition.requirements)
  });
}

export function buildTrustValueProgression(profile = {}) {
  const level = profile.level || TRUST_SECURITY_LEVELS.L0_DEMO;
  const index = ORDER.indexOf(level);
  if (index < 0) throw new Error('UNKNOWN_TRUST_VALUE_LEVEL');
  const nextLevel = ORDER[index + 1] || null;
  return Object.freeze({
    policyVersion: TRUST_VALUE_FRAMEWORK_VERSION,
    principle: 'SECURITY_UNLOCKS_UTILITY_AND_MAXIMIZATION',
    current: getTrustValueFrame(level),
    next: nextLevel ? getTrustValueFrame(nextLevel) : null,
    missingForNextLevel: Object.freeze([...(profile.missingForNextLevel || [])]),
    claimsPolicy: Object.freeze({
      guaranteedSavings: false,
      guaranteedRevenue: false,
      inventedOptimizationPercentages: false,
      valueMustBeMeasuredAgainstBaseline: true
    })
  });
}
