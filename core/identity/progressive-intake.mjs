const FIELD_RULES = Object.freeze({
  account: Object.freeze({
    display_name: 'Nombre visible para identificar la cuenta.',
    verified_contact: 'Canal de contacto verificado para proteger y recuperar la cuenta.'
  }),
  service: Object.freeze({
    transport: Object.freeze({
      origin: 'Necesario para organizar la recogida.',
      destination: 'Necesario para organizar la entrega.',
      cargo_description: 'Necesario para determinar la capacidad y condiciones del transporte.',
      operational_contact: 'Necesario para coordinar este servicio.'
    }),
    b2b_goods: Object.freeze({
      goods_description: 'Necesario para identificar los bienes objeto del servicio.',
      quantity: 'Necesario para preparar la operación.',
      delivery_location: 'Necesario cuando el servicio incluye entrega.',
      operational_contact: 'Necesario para coordinar este servicio.'
    }),
    b2b_service: Object.freeze({
      service_scope: 'Necesario para delimitar el servicio contratado.',
      operational_contact: 'Necesario para coordinar este servicio.'
    }),
    provider_qualification: Object.freeze({
      service_categories: 'Necesario para clasificar la actividad del proveedor.',
      coverage_area: 'Necesario para comprobar si puede atender el ámbito solicitado.',
      operational_contact: 'Necesario para gestionar la colaboración.'
    })
  }),
  organization_relationship: Object.freeze({
    organization_id: 'Identifica la organización a la que se solicita vincular la cuenta.',
    requested_role: 'Define la función solicitada dentro de esa organización.',
    permission_scope: 'Delimita las acciones para las que se solicita autorización.',
    approver_confirmation: 'Confirma la aprobación de un administrador autorizado de la organización.'
  }),
  capability: Object.freeze({
    team_management: Object.freeze({
      team_members: 'Necesario para dar acceso a las personas que el administrador indique.',
      role_assignments: 'Necesario para asignar permisos individuales y limitados.'
    }),
    external_integration: Object.freeze({
      system_name: 'Identifica el sistema que se pretende conectar.',
      integration_purpose: 'Define la finalidad concreta de la conexión.',
      requested_scopes: 'Delimita los permisos técnicos mínimos solicitados.',
      technical_contact: 'Permite coordinar la configuración y resolver incidencias.'
    }),
    personal_data_workflow: Object.freeze({
      data_categories: 'Identifica las categorías de datos personales estrictamente necesarias.',
      processing_purpose: 'Define la finalidad concreta del tratamiento.',
      recipient_scope: 'Delimita quién necesita acceder a esos datos.',
      retention_rule: 'Define cuánto tiempo se necesitan conservar.',
      legal_review_reference: 'Acredita que el flujo ha pasado la revisión jurídica y de privacidad requerida.'
    })
  })
});

function normalizeAvailable(fields) {
  if (!Array.isArray(fields)) throw new Error('AVAILABLE_FIELDS_MUST_BE_ARRAY');
  return new Set(fields.map(field => {
    if (typeof field !== 'string' || !/^[a-z][a-z0-9_]{1,63}$/.test(field)) {
      throw new Error('INVALID_AVAILABLE_FIELD');
    }
    return field;
  }));
}

/**
 * Builds a data request for one concrete onboarding step.
 * This function only determines which fields may be requested; it does not
 * authenticate users, verify organizations, grant permissions, or persist data.
 * alreadySatisfiedFields must come from trusted server-side state, never directly
 * from browser-supplied claims.
 */
export function buildProgressiveDataRequest(input = {}) {
  const { stage, serviceType, capability, risk = 'STANDARD', alreadySatisfiedFields = [] } = input;
  const available = normalizeAvailable(alreadySatisfiedFields);
  let rules;

  if (stage === 'account') {
    rules = FIELD_RULES.account;
  } else if (stage === 'service') {
    rules = FIELD_RULES.service[serviceType];
    if (!rules) throw new Error('UNSUPPORTED_SERVICE_TYPE');
  } else if (stage === 'organization_relationship') {
    if (!['STANDARD', 'HIGH'].includes(risk)) throw new Error('INVALID_RISK');
    rules = {
      ...FIELD_RULES.organization_relationship,
      ...(risk === 'HIGH' ? {
        authorization_evidence: 'Necesaria para revisar una autorización de representación de riesgo elevado.'
      } : {})
    };
  } else if (stage === 'capability') {
    rules = FIELD_RULES.capability[capability];
    if (!rules) throw new Error('UNSUPPORTED_CAPABILITY');
  } else {
    throw new Error('UNSUPPORTED_INTAKE_STAGE');
  }

  const fields = Object.entries(rules)
    .filter(([key]) => !available.has(key))
    .map(([key, reason]) => Object.freeze({ key, required: true, reason }));

  return Object.freeze({
    schemaVersion: 'progressive-data-request.v1',
    stage,
    purpose: stage === 'service' ? serviceType : stage === 'capability' ? capability : stage,
    status: fields.length ? 'DATA_REQUIRED' : 'NO_ADDITIONAL_DATA_REQUIRED',
    privacyNoticeRequired: fields.length > 0,
    fields: Object.freeze(fields)
  });
}

export const progressiveIntakeStages = Object.freeze(Object.keys(FIELD_RULES));
