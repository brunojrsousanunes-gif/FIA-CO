# Bloque R — Arquitectura de proveedores

Estado: DESIGN_ONLY / SANDBOX_ONLY / DEMO_ONLY.

## R1 — KYC/KYB
Contrato desacoplado `IdentityVerificationAdapter` con operaciones de requisitos, validación de forma, estado y explicación. Ningún proveedor concreto forma parte del dominio. La selección será por configuración de entorno y nunca desde la UI.

## R2 — PSP / pagos
Contrato `PaymentProviderAdapter` separado de la lógica de operación. Capacidades previstas: cotización, validación, preparación y consulta de estado. La ejecución monetaria real permanece deshabilitada. FIA&CO conserva una capa explícita de custodia/no custodia y no asume custodia por defecto.

## R3 — Antifraude
Contrato de señales y explicaciones. El motor puede observar, puntuar y explicar, pero el proveedor externo no puede bloquear ni cerrar una operación directamente. Cualquier futura acción sensible pasa por política interna y, cuando corresponda, revisión humana.

## R4 — Fortinet / SIEM / Zero Trust
Integración futura mediante `SecurityTelemetryAdapter`. El núcleo emite eventos normalizados y el adaptador decide exportación a SIEM/Fortinet. No existe dependencia directa del dominio con Fortinet y la exportación externa sigue deshabilitada en beta.

## R5 — Agente Premium transaccional
El agente usa un `TransactionAgentAdapter` separado. Modos previstos: `shadow-read-only`, `recommend`, y en una fase futura `authorized-action`. Solo `shadow-read-only` está permitido ahora. No puede ejecutar pagos, bloquear operaciones, alterar evidencias ni modificar estados autoritativos.

## R6 — Sandbox de proveedores
Todo adaptador debe poder simular: éxito, timeout, latencia, error transitorio, error permanente, respuesta inválida y circuito abierto. Los writes transaccionales futuros requieren idempotency key y retry limitado. El sandbox nunca hace llamadas de red.

## R7 — Gate de proveedor
Un proveedor productivo no puede activarse sin: revisión de seguridad, LEGAL-2 aplicable, DPA/contrato cuando proceda, rollback, observabilidad, runbook de caída, límites de datos, aprobación del entorno y autorización explícita. `productionEnabled=false` por defecto.

## R8 — Portabilidad
La selección de proveedor se hace por capacidades y contrato, no por SDK propietario. El dominio no conoce nombres comerciales. Cada categoría admite al menos `mock` + `future-primary` + `future-secondary`. Migrar proveedor no debe cambiar los modelos de operación de FIA&CO.

## R9 — Integración
Solo merge con CI verde. Este bloque no habilita dinero real, PII real, proveedores productivos, exportación SIEM ni enforcement. LEGAL-2 se ejecutará antes de cualquier activación real del caso de uso correspondiente.
