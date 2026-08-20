# PLR-3/4 — Soporte, escalado y continuidad

## Soporte
Severidades: P0 seguridad/datos/operación crítica; P1 bloqueo de flujo; P2 degradación; P3 consulta o mejora. Mantener rutas diferenciadas para técnica, seguridad, operativa y jurídico/compliance.

## Recuperación
Antes de una prueba real debe existir restore test documentado, validación de integridad y simulación de indisponibilidad de proveedor/servicio con degradación segura.

Los objetivos iniciales de diseño heredados de SEC-4 son RPO <= 24 horas y RTO <= 8 horas para piloto; deben comprobarse antes de tratarlos como capacidad demostrada.

Los mecanismos de fallback y circuit breaker no pueden activar por sí solos proveedores productivos ni ampliar permisos.
