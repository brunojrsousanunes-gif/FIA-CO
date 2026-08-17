# FIA&CO — Cierre técnico v1

Este documento cierra la fase técnica/demo previa a cualquier actividad productiva real. No certifica cumplimiento legal, seguridad productiva ni autorización regulatoria.

## 1. Investor Readiness Pack interno
- Preparación conjunta FOUNDER + AI_ASSIST.
- Solo después del gate de consolidación.
- Resume métricas observadas, narrativa, hitos, uso de fondos y preguntas de reunión.
- No contacta inversores, no recomienda valoración y no acepta términos.

## 2. Auditoría y trazabilidad
- Eventos estructurados en memoria con identificadores sintéticos.
- Sin PII, secretos, IBAN, tarjetas, emails ni descripciones libres de clientes.
- Sin log remoto ni persistencia en la fase demo.

## 3. CI / Security hardening
- GitHub Actions fijadas a commits SHA verificados en repositorios oficiales de GitHub.
- Permisos mínimos por job y credenciales de checkout no persistentes.
- Tests de sintaxis, batería funcional y verificación estática de pinning.

## 4. Provider Guard
- LOCAL_MOCK es el proveedor por defecto y mantiene coste API 0 €.
- Allowlist de acciones, límite de reintentos, límite de acciones por gestión y presupuesto estimado por gestión.
- Acciones financieras, destructivas o sensibles siguen bloqueadas.
- Riesgo o prompt injection deriva a intervención humana.

## 5. Pilot Readiness
- Piso de preparación: 15 gestiones de muestra; objetivo base: 20.
- Founder mantiene ventas y soporte en la fase inicial.
- Requiere baseline de seguridad, incidentes, métricas y revisión legal/comercial previa.
- No habilita clientes reales, PII real, dinero real ni contratos.

## 6. Production Gate
La producción permanece DEMO_ONLY hasta completar, entre otros: revisión legal, partner de pagos autorizado, privacidad, threat model, revisión externa de seguridad/pentest, backend de secretos, incidentes, backup/restauración, monitorización, retención/borrado y términos/contratos.

Incluso con todos los prerequisitos cubiertos, el resultado máximo es `READY_FOR_EXPLICIT_PRODUCTION_AUTHORIZATION`. Nunca activa producción automáticamente.

## Próxima autorización reservada
Se requiere nueva autorización explícita antes de cualquiera de estos pasos: contratar PSP/KYC o proveedores con coste real relevante; introducir secretos/credenciales productivas; procesar fondos reales; usar PII real; firmar contratos o términos vinculantes en nombre de FIA&CO; aceptar deuda, inversión o dilución; o activar ejecución productiva real.
