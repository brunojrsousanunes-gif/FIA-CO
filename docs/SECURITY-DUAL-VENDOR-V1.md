# Estrategia de ciberseguridad dual — V1

## Estado
`DEMO_ONLY` · diseño preparado, sin credenciales ni enforcement productivo.

## Fortinet: puntos fuertes para FIA&CO

Fortinet se evalúa como candidato principal de telemetría/detección por su encaje en SIEM, SOAR, EDR, seguridad de red, inteligencia de amenazas y conectividad multivendor.

Rol inicial recomendado: `SecurityTelemetryAdapter -> Fortinet` para ingestión/correlación y alertas. La respuesta que afecte usuarios, pagos o reglas de negocio permanece bajo aprobación humana.

No se recomienda adoptar todo el stack desde V1. FortiSOAR se reserva para una fase de SOC más madura; la primera necesidad es observabilidad, detección y evidencia.

## Segunda capa independiente

FIA&CO no debe depender de un único fabricante. Se reserva `secondary-security` para un proveedor distinto que reciba una copia normalizada de eventos relevantes y pueda validar detecciones de forma independiente.

Objetivos:
- evitar punto único de fallo y lock-in;
- detectar discrepancias entre motores;
- conservar una ruta secundaria de logs/evidencias;
- disponer de escalado alternativo durante incidentes;
- permitir sustitución gradual de cualquier proveedor.

## Arquitectura

`FIA&CO -> SecurityTelemetryAdapter -> Event Normalizer -> Evidence Store vendor-neutral`

Desde el normalizador:
- `-> Fortinet / primary-security`
- `-> secondary-security / proveedor independiente`

Las alertas regresan a `SecurityCorrelationLayer` en modo shadow. Si ambos proveedores coinciden, aumenta la confianza del incidente; si discrepan, se abre revisión. Ningún proveedor obtiene autoridad financiera.

## Regla de doble seguridad

Duplicar seguridad no significa duplicar ciegamente cada producto. Se buscan controles independientes y complementarios. El segundo proveedor debe cubrir al menos una superficie crítica de forma independiente (SIEM/XDR/EDR/cloud detection) y no compartir el mismo punto único de control.

## Gates antes de producción

1. Revisar tratamiento y residencia de logs.
2. Aprobar política de retención.
3. Definir runbook de incidentes y responsables.
4. Probar rollback y pérdida de un proveedor.
5. Evaluar proveedor secundario con evidencia real.
6. Verificar que el Evidence Store siga siendo exportable/vendor-neutral.
7. Autorización explícita Founder.

## Founder action requerida más adelante

- solicitar PoC/propuesta de Fortinet o partner autorizado;
- aportar precio, licencias, mínimos, SLA y condiciones de datos;
- decidir presupuesto de ciberseguridad;
- aprobar shortlist del segundo proveedor;
- autorizar cualquier credencial o automatización productiva.
