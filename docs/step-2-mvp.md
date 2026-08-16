# FIA&CO — Paso 2: MVP seguro

## Objetivo
Materializar un flujo de demostración seguro y de coste prácticamente nulo para validar la experiencia antes de conectar pagos reales.

Flujo:

`Inicio → Catálogo → Carrito → Checkout → Orden de demostración`

## Principios de seguridad

- El frontend nunca es autoridad sobre precios, descuentos, impuestos, stock ni estados financieros.
- No se almacenan secretos, credenciales, claves privadas ni tokens en el repositorio ni en el navegador.
- El checkout de esta fase no mueve dinero real.
- El navegador solo conserva información no sensible de la demo.
- Los datos enviados por el usuario deben volver a validarse en servidor cuando exista backend.
- Los identificadores públicos futuros deben ser no secuenciales y no predecibles.
- Los estados de pedido y de pago se modelan por separado.

## Estados iniciales

Pedido:

`CREATED → PENDING_PAYMENT → PAID → PROCESSING → FULFILLED`

Excepciones: `CANCELLED`, `REFUNDED`.

Pago:

`CREATED → AUTHORIZED → PROCESSING → COMPLETED → SETTLED`

Excepciones: `FAILED`, `RETURNED`, `DISPUTED`.

## Alcance de este ciclo

- Catálogo de demostración local y reemplazable.
- Carrito persistente en `localStorage` sin datos sensibles.
- Checkout de demostración con validación básica de interfaz.
- Confirmación de orden local claramente marcada como simulación.
- Preparación de una capa `api.js` para sustituir la lógica local por backend sin rehacer la UI.

## Fuera de alcance

- Custodia de fondos.
- Procesamiento real de tarjetas, transferencias o criptoactivos.
- KYC/AML real.
- Autenticación de usuarios.
- Base de datos de producción.

## Coste esperado del paso 2

Objetivo: 0 € adicionales. No se contrata infraestructura de pago, base de datos premium ni hosting de pago durante este ciclo.
