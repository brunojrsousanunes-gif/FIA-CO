# FIA&CO — Preproducción P4 · Audit & Evidence Contract

## Objetivo
Separar la auditoría técnica del almacenamiento de operaciones y disponer de un registro append-only verificable antes de integrar persistencia externa.

## Contrato
`core/audit/audit-log.mjs` proporciona:
- `append(event)`
- `list(filters)`
- `verify(organizationId)`

La implementación inicial es en memoria y solo sirve para pruebas/preproducción técnica.

## Integridad
Cada organización mantiene su propia secuencia y cadena SHA-256:
`GENESIS -> evento 1 -> evento 2 -> ...`

Cada evento incluye organización, actor, acción, operación, estado, versión, timestamp, hash previo y hash actual.

## Integración
`createAuditedOperationService` envuelve un servicio scoped. Solo registra eventos de mutaciones que terminaron correctamente. Una mutación de dominio fallida no se registra como éxito.

## Separación de responsabilidades
- Evidencia de negocio: sigue dentro del contrato de operación.
- Auditoría técnica: registro externo append-only.
- Persistencia definitiva: pendiente de adapter/repositorio real.

## Límites
- No es WORM storage productivo.
- No existe retención legal configurada.
- No hay PII real.
- No sustituye un SIEM/SOC.

## Estado
`PREPROD_P4_READY` cuando CI completo esté en verde.