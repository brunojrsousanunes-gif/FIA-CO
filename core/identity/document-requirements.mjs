const DOCUMENT_TIERS = Object.freeze({
  D1_BASIC: Object.freeze({
    label: 'Identidad y contacto',
    purpose: 'Identificar la cuenta y mantener un canal de contacto seguro.',
    rule: 'La creación de una cuenta no exige por defecto subir un documento oficial.'
  }),
  D2_ACTIVITY: Object.freeze({
    label: 'Actividad profesional o empresarial',
    purpose: 'Acreditar únicamente la actividad, capacidad o habilitación necesaria para un servicio.',
    rule: 'Los justificantes dependen del sector, servicio y obligación aplicable.'
  }),
  D3_AUTHORITY: Object.freeze({
    label: 'Representación y autorizaciones especiales',
    purpose: 'Comprobar que una persona puede realizar una gestión concreta en nombre de otra persona u organización.',
    rule: 'La evidencia se exige de forma proporcional al riesgo y se revisa antes de habilitar la facultad.'
  })
});

const TASKS = Object.freeze({
  account: Object.freeze({
    tier: 'D1_BASIC',
    documents: [],
    optionalProfileFields: [],
    controls: []
  }),
  service_provider: Object.freeze({
    tier: 'D2_ACTIVITY',
    documents: Object.freeze([
      { key: 'business_activity_proof', condition: 'requiresFormalQualification', reason: 'Acreditar la actividad profesional cuando la cualificación formal sea necesaria.' },
      { key: 'sector_authorization', condition: 'requiresSectorAuthorization', reason: 'Acreditar la habilitación sectorial cuando la actividad esté regulada o la gestión la exija.' },
      { key: 'insurance_evidence', condition: 'requiresInsuranceProof', reason: 'Comprobar la cobertura exigida para el servicio concreto.' }
    ]),
    optionalProfileFields: Object.freeze([
      { key: 'service_categories', purpose: 'Encontrar solicitudes compatibles con los servicios ofrecidos.' },
      { key: 'coverage_area', purpose: 'Evitar propuestas fuera de la zona de servicio.' },
      { key: 'capacity', purpose: 'Ajustar las propuestas a la capacidad disponible.' },
      { key: 'availability', purpose: 'Reducir esperas y contactos que no pueden convertirse en servicio.' },
      { key: 'equipment', purpose: 'Comprobar compatibilidad operativa antes de coordinar.' }
    ]),
    controls: []
  }),
  transport_provider: Object.freeze({
    tier: 'D2_ACTIVITY',
    documents: Object.freeze([
      { key: 'transport_authorization', condition: 'requiresTransportAuthorization', reason: 'Acreditar la autorización de transporte cuando sea exigible para el servicio.' },
      { key: 'insurance_evidence', condition: 'requiresInsuranceProof', reason: 'Comprobar la cobertura exigida para la carga o servicio.' },
      { key: 'vehicle_capacity_proof', condition: 'requiresVehicleProof', reason: 'Comprobar la capacidad o características del vehículo cuando sean determinantes.' }
    ]),
    optionalProfileFields: Object.freeze([
      { key: 'fleet_capacity', purpose: 'Proponer cargas compatibles con la capacidad disponible.' },
      { key: 'vehicle_types', purpose: 'Evitar asignaciones incompatibles con el vehículo.' },
      { key: 'coverage_area', purpose: 'Encontrar trayectos y servicios dentro de la zona habitual.' },
      { key: 'availability', purpose: 'Reducir tiempos muertos y consultas sin disponibilidad.' },
      { key: 'equipment', purpose: 'Identificar medios de carga, descarga o manipulación disponibles.' }
    ]),
    controls: []
  }),
  organization_relationship: Object.freeze({
    tier: 'D1_BASIC',
    documents: [],
    optionalProfileFields: [],
    controls: Object.freeze([
      { key: 'organization_admin_approval', reason: 'La organización debe aprobar la vinculación y el alcance de permisos.' }
    ])
  }),
  high_risk_authority: Object.freeze({
    tier: 'D3_AUTHORITY',
    documents: Object.freeze([
      { key: 'representation_authority', condition: 'always', reason: 'Aportar poder, mandato, nombramiento u otra evidencia adecuada al acto que se pretende realizar.' }
    ]),
    optionalProfileFields: [],
    controls: Object.freeze([
      { key: 'authorized_reviewer_approval', reason: 'Una persona revisora autorizada debe validar la evidencia y el alcance antes de habilitar la facultad.' }
    ])
  })
});

function normalizeKeys(values, errorCode) {
  if (!Array.isArray(values)) throw new Error(errorCode);
  return new Set(values.map(value => {
    if (typeof value !== 'string' || !/^[a-z][a-z0-9_]{1,63}$/.test(value)) {
      throw new Error('INVALID_DOCUMENT_KEY');
    }
    return value;
  }));
}

/**
 * Selects document requirements for one concrete task.
 * This is a policy selector only: it does not inspect documents, verify evidence,
 * grant permissions, authenticate users, or persist data.
 * alreadyVerifiedDocuments must be built from trusted server-side records and
 * scoped to the same participant, purpose, jurisdiction and validity period.
 */
export function buildDocumentRequirementRequest(input = {}) {
  const { task, conditions = {}, alreadyVerifiedDocuments = [] } = input;
  const taskPolicy = TASKS[task];
  if (!taskPolicy) throw new Error('UNSUPPORTED_DOCUMENT_TASK');

  const verified = normalizeKeys(alreadyVerifiedDocuments, 'VERIFIED_DOCUMENTS_MUST_BE_ARRAY');
  const documents = taskPolicy.documents
    .filter(item => item.condition === 'always' || conditions[item.condition] === true)
    .filter(item => !verified.has(item.key))
    .map(item => Object.freeze({
      key: item.key,
      tier: taskPolicy.tier,
      required: true,
      reason: item.reason,
      reviewRequired: true
    }));

  const tier = DOCUMENT_TIERS[taskPolicy.tier];
  return Object.freeze({
    schemaVersion: 'document-requirements.v1',
    task,
    documentTier: taskPolicy.tier,
    tierLabel: tier.label,
    purpose: tier.purpose,
    notice: documents.length
      ? 'Para esta gestión necesitamos la documentación indicada. Explicaremos quién la revisa, para qué se utiliza y durante cuánto tiempo se conserva.'
      : task === 'account'
        ? 'Puedes crear tu cuenta sin subir documentos oficiales. Solo se verificará el canal de acceso que corresponda.'
        : 'No se necesita aportar documentación adicional para este paso.',
    documents: Object.freeze(documents),
    optionalProfileFields: Object.freeze(taskPolicy.optionalProfileFields.map(field => Object.freeze({
      ...field,
      required: false,
      voluntary: true
    }))),
    requiredControls: Object.freeze(taskPolicy.controls.map(control => Object.freeze({ ...control }))),
    permissionGrant: false,
    verificationPerformed: false,
    persistencePerformed: false
  });
}

export const documentTierDefinitions = DOCUMENT_TIERS;
export const supportedDocumentTasks = Object.freeze(Object.keys(TASKS));
