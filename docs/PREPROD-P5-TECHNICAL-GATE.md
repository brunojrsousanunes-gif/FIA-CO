# FIA&CO — Preproducción P5 · Technical Gate

## Objetivo
Cerrar la fase técnica autónoma de preproducción con un gate explícito que confirme los contratos internos sin habilitar producción real.

## Checks
- `coreOperationContract`
- `repositoryContract`
- `organizationIsolation`
- `auditIntegrity`
- `recoveryProcedureDefined`
- `productionExecutionDisabled`

Todos deben estar en `true` para obtener `PREPROD_TECHNICAL_READY`.

## Invariantes incluso cuando el gate está READY
- `productionExecutionEnabled = false`
- `realFundsEnabled = false`
- `realPiiEnabled = false`
- `externalProviderActivationAllowed = false`
- autorización explícita del fundador requerida para activación externa;
- ninguna promoción automática a producción.

## CI
El workflow de pruebas valida ahora sintaxis de todos los módulos `.js/.mjs` de `frontend/js`, `tests`, `server`, `scripts` y `core`, además del contrato Pages y la batería completa.

## Qué no resuelve este gate
La preparación técnica no sustituye:
- base de datos gestionada y backups reales;
- IdP/MFA productivo;
- secrets manager;
- observabilidad/SIEM productivos;
- pentest;
- revisión legal/privacidad;
- contratos de proveedores;
- PSP/KYC/banco reales;
- decisión de activación del titular.

## Resultado
Este bloque marca el máximo avance técnico razonable sin servicios externos ni decisiones comerciales/regulatorias.