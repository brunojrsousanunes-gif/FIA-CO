# FIA&CO — Preproducción P6 · Observability & Recovery

## Objetivo
Completar la preparación técnica autónoma con dos capacidades transversales: observabilidad segura y recuperación verificable de operaciones.

## Observabilidad
`core/observability/telemetry.mjs` genera eventos estructurados con:
- nivel;
- nombre de evento;
- correlationId;
- organizationId;
- metadata sanitizada.

Campos sensibles como secretos, tokens, autorización, cookies, email, teléfono, IBAN, tarjeta, claves privadas, seeds o credenciales se redactan automáticamente.

`createHealthReport` comprueba disponibilidad del repositorio y del audit log y, cuando se proporciona organización, verifica la integridad de su cadena de auditoría.

## Recuperación
`core/recovery/operation-backup.mjs` permite:
- exportar operaciones por organización mediante paginación;
- restaurar un backup versión 1 en un repositorio compatible;
- rechazar backups inválidos o con mezcla de organizaciones.

La implementación probada sigue siendo local/en memoria. Un storage productivo deberá implementar los mismos contratos y añadir cifrado, retención, backups gestionados y pruebas de restore reales.

## Gate
P6 amplía el gate técnico con:
- `recoveryRoundTripVerified`
- `observabilitySafe`

## Límites
- No hay proveedor externo de logs/metrics.
- No hay backup cloud productivo.
- No hay secrets manager real.
- No hay PII ni fondos reales.
- No se autoriza producción.

## Estado
`PREPROD_P6_READY` cuando CI completo esté en verde.