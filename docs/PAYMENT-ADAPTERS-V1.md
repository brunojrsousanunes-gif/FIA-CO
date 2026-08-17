# FIA&CO — Payment Adapters v1

Objetivo: ganar interoperabilidad sin alterar el núcleo del proyecto, asumir custodia ni añadir integraciones cuyo coste/alcance no esté validado.

## Implementar ahora
- Google Pay: únicamente adapter/sandbox. Google Pay actúa como método de pago tokenizado y el PSP/gateway procesa el pago. No se activa producción ni credenciales reales.
- Guardrail económico: ningún método/canal se habilita si el coste incremental hace negativa la contribución esperada.

## Preparar, no activar
- TikTok Shop: tratar como posible canal de comercio/conciliación. Sus Finance APIs permiten consultar statements, payments y transacciones para reconciliación de sellers; no se modela como pasarela universal de FIA&CO.
- Meta/Instagram/Facebook: mantener interfaz conceptual, desactivada hasta confirmar acceso, permisos, condiciones y economics de un programa aplicable.

## No implementar
- Custodia FIA&CO de fondos.
- Integraciones directas que exijan cambiar el motor de operaciones o el pricing central antes de validar retorno.
- Dependencias específicas de plataforma que creen lock-in sin evidencia comercial.
- Procesamiento directo de tarjetas/PCI si un PSP compatible puede tokenizar/procesar.

## Regla de decisión
Una integración pasa de READINESS_ONLY a SANDBOX_ONLY si: existe API/programa oficial aplicable, no requiere rediseño material, tiene coste incremental compatible con margen y aporta conversión, conciliación o distribución medible.

Pasa a producción solo tras proveedor elegido, seguridad/legal, unit economics y autorización de producción.