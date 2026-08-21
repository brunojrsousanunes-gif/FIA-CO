# FIA&CO — Preproducción P3 · Organization & Access Boundary

## Objetivo
Aislar operaciones por organización y aplicar permisos mínimos por rol antes de integrar un proveedor de identidad real.

## Roles técnicos iniciales
- `OWNER`: crear, leer, actualizar, disputar y solicitar liberación.
- `ADMIN`: mismas capacidades operativas que OWNER en esta fase.
- `OPERATOR`: crear, leer, actualizar y disputar; no puede solicitar liberación.
- `VIEWER`: solo lectura.

## Aislamiento
Cada operación core puede portar `organizationId`. El servicio scoped:
- inyecta la organización al crear;
- filtra listados por organización;
- valida organización antes de cada mutación;
- bloquea lectura o modificación cross-tenant.

## Seguridad
La comprobación de organización se realiza dentro de la misma mutación versionada para evitar una ventana de cambio entre autorización y escritura.

## Límites
- No existe login productivo.
- No existe directorio real de usuarios.
- No existe SSO/MFA productivo.
- No se almacenan PII reales.
- Los roles son contrato interno a conectar más adelante con un IdP.

## Estado
`PREPROD_P3_READY` cuando la batería completa esté en verde.