# FIA&CO — Paquetería B2B

## Propuesta
FIA&CO actúa como capa de orquestación entre una operación comercial, eventos del transportista y un proveedor financiero autorizado. La plataforma no se presenta como transportista, banco ni custodio de fondos.

## Flujo objetivo
1. Crear operación y condiciones.
2. Asociar un identificador logístico, evitando datos personales innecesarios.
3. Recibir eventos autenticados del transportista mediante API/webhook.
4. Normalizar eventos e impedir repeticiones mediante idempotencia.
5. Evaluar reglas server-side.
6. Ante entrega válida, solicitar aceptación cuando proceda.
7. Generar instrucción para el proveedor de pagos autorizado.
8. Ante incidencia, congelar la instrucción y abrir trazabilidad/disputa.

## Seguridad obligatoria antes de integrar una empresa real
- Backend HTTPS aislado; nunca secretos en GitHub Pages.
- Credenciales de socios en gestor de secretos y rotación periódica.
- Webhooks firmados, timestamp, nonce/idempotency key y protección anti-replay.
- Autorización por empresa/tenant y mínimo privilegio.
- Base de datos transaccional y registro de auditoría inmutable o resistente a manipulación.
- Cifrado en tránsito y reposo, minimización y retención limitada de datos.
- No almacenar datos de tarjeta, claves privadas, biometría bruta o credenciales bancarias.
- Separación estricta demo/staging/producción.
- Límites de importe/riesgo y revisión humana para excepciones.
- Evaluación jurídica, protección de datos y contratos con cada proveedor antes de fondos reales.

## API futura (contrato conceptual)
- POST /v1/shipments — alta de operación/envío.
- POST /v1/logistics/events — webhook autenticado del socio.
- GET /v1/operations/:id — estado autorizado de la operación.
- POST /v1/operations/:id/accept — aceptación del destinatario.
- POST /v1/operations/:id/dispute — incidencia/disputa.
- POST /v1/operations/:id/release — servicio interno que solicita al PSP la ejecución; nunca se expone directamente al cliente.

## Demo comercial
`parcel-demo.html` utiliza únicamente estado local y datos ficticios. Sirve para enseñar el recorrido a empresas e inversores sin conectar infraestructura sensible. La integración real se desarrollará en staging con credenciales de sandbox del socio antes de cualquier producción.