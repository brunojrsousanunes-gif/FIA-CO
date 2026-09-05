# FIA&CO — Incident Response Runbook v1

Estado: `PREPRODUCTION / PLAN_ONLY`.

## Objetivo

Definir cómo detectar, clasificar y contener incidentes sin depender de improvisación. Este runbook no sustituye asesoramiento jurídico ni determina por sí solo obligaciones de notificación.

## Principios

- preservar evidencia antes de borrar o modificar;
- contener primero, diagnosticar después;
- usar kill switches por organización/workflow/integración cuando proceda;
- no permitir que una IA decida obligaciones legales;
- no enviar comunicaciones externas automáticas sobre brechas;
- mantener FIA permanentemente `NON_CUSTODIAL`;
- registrar tiempos, decisiones y alcance del incidente.

## Severidades

### LOW
Evento sin evidencia de exposición, compromiso o impacto material.

### MEDIUM
Anomalía de acceso, caída, integración defectuosa o pico de coste sin evidencia de exposición crítica.

### HIGH
Posible exposición de datos personales, compromiso de autenticación o bypass relevante de policy.

### CRITICAL
Exposición entre tenants, secreto comprometido o instrucción financiera no autorizada.

## Secuencia mínima

1. Crear registro del incidente.
2. Preservar audit log, hashes, timestamps y policy versions.
3. Clasificar severidad con `core/security/incident-response.mjs`.
4. Aplicar manualmente el kill switch recomendado cuando exista capacidad productiva.
5. Revocar sesiones/tokens si procede.
6. Congelar grants interempresa si existe riesgo cross-tenant.
7. Activar circuit breaker de costes si existe consumo anómalo.
8. Determinar el alcance técnico.
9. Escalar a revisión jurídica/privacidad cuando el plan lo marque.
10. Restaurar solo después de identificar causa y prueba de corrección.
11. Ejecutar retrospectiva y añadir test preventivo.

## Drills sintéticos sin coste

Antes de producción ejecutar periódicamente simulaciones de:

- acceso sospechoso;
- exposición de datos;
- credencial comprometida;
- bypass de política IA;
- pico de coste;
- caída de integración;
- indisponibilidad;
- instrucción financiera que intente saltarse `NON_CUSTODIAL`.

Los drills usan datos sintéticos y no activan comunicaciones ni proveedores externos.

## Información que debe registrar un incidente futuro

- incidentId;
- organización afectada;
- operación/workflow afectado;
- primera señal y timestamp;
- severidad inicial y revisiones;
- policy version;
- actor/sistema que detectó el evento;
- acciones de contención;
- sesiones/tokens/grants revocados;
- datos potencialmente afectados, por categoría y no por copia innecesaria;
- causa raíz;
- restauración;
- tests añadidos;
- revisiones humanas/jurídicas requeridas cuando proceda.

## Límites

El motor actual genera planes `PLAN_ONLY`. No ejecuta kill switches reales, no rota secretos y no notifica a autoridades o clientes. Esas capacidades requieren infraestructura productiva, permisos y validación aplicable.
