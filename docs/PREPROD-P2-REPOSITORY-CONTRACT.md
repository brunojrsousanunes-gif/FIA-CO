# FIA&CO — Preproducción P2 · Repository Contract

## Objetivo
Separar la lógica de negocio del almacenamiento para que el core pueda operar hoy con memoria/demo y mañana con persistencia real sin reescribir el motor de operaciones.

## Contrato
`core/repositories/operation-repository.mjs` define la interfaz mínima:
- `getById(id)`
- `save(operation, { expectedVersion })`
- `list(filters)`

La implementación inicial es `memory`, válida para pruebas y preproducción técnica, no para producción.

## Concurrencia
`save` usa `expectedVersion` para detectar escrituras obsoletas. Una actualización concurrente produce `RepositoryConflictError` en lugar de sobrescribir silenciosamente.

## Servicio de aplicación
`core/operations/operation-service.mjs` conecta el motor canónico con el repositorio. El motor sigue sin conocer base de datos, HTTP ni proveedores externos.

## Regla de migración
Una futura base de datos deberá implementar el mismo contrato y superar la misma batería antes de sustituir el repositorio en memoria.

## Límites
- No hay base de datos productiva.
- No hay PII real.
- No hay fondos reales.
- No hay credenciales externas.
- No se elimina la demo legacy.

## Estado
`PREPROD_P2_READY` cuando CI completo esté en verde.