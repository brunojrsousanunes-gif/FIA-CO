# FIA&CO — Revisión de seguridad del Paso 2

## Estado

Revisión inicial del MVP en `fia-development` antes de integrar cambios en `main`.

## Riesgo actual

El MVP es un frontend estático de demostración. No existe backend, autenticación, base de datos, custodia de fondos ni integración de pagos reales. Por tanto, el riesgo financiero directo es bajo, pero el código se diseña para no crear hábitos inseguros que luego se trasladen a producción.

## Controles aplicados

- `main` permanece sin modificaciones directas.
- No se almacenan secretos, tokens, credenciales financieras ni claves privadas.
- El carrito solo guarda `productId` y cantidad en `localStorage`.
- Los datos del carrito se validan al cargar y guardar, con límites de cantidad y número de líneas.
- Los identificadores de producto aceptados siguen una allowlist de formato.
- El checkout valida formato y longitud de nombre y correo.
- El método de pago se valida contra una allowlist (`bank`, `card`, `crypto`).
- Las referencias de orden demo se generan con `crypto.getRandomValues` y no son secuenciales.
- La interfaz usa `textContent`/nodos DOM para contenido dinámico y evita insertar datos de usuario como HTML.
- El frontend se declara explícitamente no autoritativo sobre precio, stock, impuestos, estados financieros o finalización de pagos.

## Controles obligatorios antes de pagos reales

1. Backend como única autoridad de catálogo, precios, stock, impuestos, descuentos y total.
2. Validación de toda entrada en servidor independientemente de la validación del navegador.
3. Autenticación y autorización con mínimo privilegio.
4. Gestión de secretos fuera del repositorio y del frontend.
5. Registro de auditoría inmutable para eventos de orden, pago y transferencia.
6. Protección CSRF cuando se usen sesiones basadas en cookies y política CORS restrictiva cuando exista API.
7. Cabeceras de seguridad y Content Security Policy compatibles con la arquitectura final.
8. Rate limiting y protección frente a abuso en endpoints de autenticación, checkout y pagos.
9. Webhooks de PSP/CASP autenticados criptográficamente y procesados de forma idempotente.
10. Ningún estado `PAID`, `COMPLETED`, `SETTLED` o `FINALIZED` será aceptado por información enviada por el cliente.
11. Minimización de datos personales, política de retención y controles RGPD antes de almacenar datos reales.
12. Escaneo automático de secretos y dependencias cuando se introduzca una cadena de build/dependencias.

## Decisión de integración

Este MVP puede continuar como demostración sin dinero real. No debe considerarse apto para producción financiera hasta implementar los controles anteriores y completar una nueva revisión de seguridad.
