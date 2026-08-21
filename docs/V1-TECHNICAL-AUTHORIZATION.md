# FIA&CO — Autorización de transición a V1 técnica

Fecha: 2026-08-21

## Decisión

Se autoriza el cierre del Bloque 6 (Production Gate) **a efectos de transición a V1 técnica**.

## Alcance autorizado

- Continuar el desarrollo y consolidación de V1.
- Mantener y ampliar módulos demo, validaciones, operaciones, seguridad, trazabilidad y preparación comercial.
- Usar entornos simulados y datos de prueba.
- Continuar mediante ramas, PR y CI.

## No autorizado por esta decisión

- Activar producción real.
- Procesar o custodiar fondos reales.
- Usar PII real.
- Introducir secretos o credenciales productivas.
- Activar facturación real.
- Contratar o conectar PSP/KYC productivos sin nueva autorización.
- Aceptar contratos, deuda, inversión, dilución o términos vinculantes en nombre de FIA&CO.

## Estado operativo

`V1_TECHNICAL_AUTHORIZED / DEMO_ONLY`

El Production Gate continúa siendo bloqueante para cualquier actividad productiva real. La autorización de esta fase no sustituye los prerrequisitos legales, de seguridad, privacidad, pagos, monitorización, backup, retención o contratos definidos en el gate.

## Regla de continuidad

`V1 técnica → validación → CI → revisión → autorización productiva explícita separada`.
