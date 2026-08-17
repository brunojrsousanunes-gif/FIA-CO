# FIA&CO — Security Operating Baseline

## Alcance
Baseline previa a cualquier uso con clientes o datos reales. No certifica cumplimiento ni sustituye auditoría externa.

## Requisitos mínimos
- Separación demo/staging/producción.
- MFA para cuentas administrativas y acceso de mínimo privilegio.
- Secretos fuera del repositorio; rotación y revocación documentadas.
- Dependencias actualizadas y revisión de vulnerabilidades en cada release.
- Logs de auditoría para acciones críticas, evitando PII y secretos innecesarios.
- Idempotencia y prevención de doble instrucción en acciones críticas.
- Backups cifrados y restauración ensayada.
- Monitorización de disponibilidad, errores y eventos de seguridad.
- Rate limiting y controles antiabuso cuando exista backend público.
- Política de retención, exportación y borrado de datos.
- Procedimiento de respuesta a incidentes con responsable, severidad, contención, recuperación y retrospectiva.

## Controles FIA&CO Plus
Para operaciones de alto valor: doble confirmación en hitos críticos, revisión humana, trazabilidad reforzada y escalado prioritario de incidencias. Estos controles no constituyen seguro ni garantía financiera.

## Gates de producción
No activar PII, autenticación de clientes, cobros, pagos o integraciones financieras sin: revisión de arquitectura, threat model, pentest externo o revisión equivalente, validación de privacidad/RGPD y resolución de hallazgos críticos.

## Presupuesto de seguridad
La seguridad debe escalar con usuarios, GMV, volumen Plus y superficie técnica. No reducirla para mantener artificialmente margen positivo; si el coste de operar con seguridad vuelve negativo un segmento, marcarlo NO_SCALE y revisar precio/alcance.