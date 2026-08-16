# FIA&CO — Paquetería B2B

## Propuesta
FIA&CO actúa como capa de orquestación entre una operación comercial, la empresa de paquetería, el repartidor verificado y un proveedor financiero autorizado. La plataforma no se presenta como transportista, banco ni custodio de fondos.

## Flujo objetivo
1. Crear operación y condiciones.
2. Asociar un identificador logístico, evitando datos personales innecesarios.
3. La empresa de paquetería asigna un repartidor y emite/valida su credencial profesional.
4. FIA&CO recibe solo el estado mínimo necesario: identificador profesional, empresa emisora, verificación, vigencia y revocación.
5. Bloquear recogida/entrega si la credencial no está vigente o el repartidor no coincide con el asignado.
6. Recibir eventos autenticados del transportista mediante API/webhook.
7. Normalizar eventos e impedir repeticiones mediante idempotencia y protección anti-replay.
8. Evaluar reglas server-side.
9. Ante entrega válida, solicitar aceptación cuando proceda.
10. Marcar la operación como apta para cobro y generar una instrucción interna al proveedor de pagos autorizado.
11. Actualizar el estado únicamente tras confirmación del proveedor financiero.
12. Ante incidencia, congelar la instrucción y abrir trazabilidad/disputa.

## Verificación del repartidor
- La identidad primaria debe validarla la empresa de paquetería o un proveedor KYC/identidad autorizado/contratado para ese fin.
- FIA&CO no necesita conservar copias de DNI/pasaporte en la demo ni biometría bruta.
- La credencial de repartidor deberá ser firmada o verificable, con caducidad, revocación y vinculación al tenant/empresa.
- Puede añadirse segundo factor o autenticación del dispositivo para evitar suplantación.
- Los eventos sensibles (recogida, entrega, cambio de repartidor) requieren sesión válida y autorización server-side.

## Aceptación de pagos
FIA&CO determina cuándo una operación cumple las condiciones comerciales, pero el movimiento de dinero real lo ejecuta un PSP/banco/proveedor autorizado. La arquitectura evita almacenar datos completos de tarjeta, credenciales bancarias o fondos.

Casos comerciales previstos:
- pago tras entrega;
- pago condicionado a aceptación;
- contra reembolso digitalizado mediante PSP;
- retención/autorización previa y captura posterior cuando el proveedor lo soporte legalmente;
- bloqueo automático ante incidencia o disputa.

## Seguridad obligatoria antes de integrar una empresa real
- Backend HTTPS aislado; nunca secretos en GitHub Pages.
- Credenciales de socios en gestor de secretos y rotación periódica.
- Webhooks firmados, timestamp, nonce/idempotency key y protección anti-replay.
- Autorización por empresa/tenant, repartidor y rol con mínimo privilegio.
- Base de datos transaccional y registro de auditoría inmutable o resistente a manipulación.
- Cifrado en tránsito y reposo, minimización y retención limitada de datos.
- No almacenar datos de tarjeta, claves privadas, biometría bruta o credenciales bancarias.
- Separación estricta demo/staging/producción.
- Límites de importe/riesgo y revisión humana para excepciones.
- Evaluación jurídica, protección de datos y contratos con transportista, proveedor de identidad y PSP antes de fondos reales.

## API futura (contrato conceptual)
- POST /v1/shipments — alta de operación/envío.
- POST /v1/couriers/assign — asignación de repartidor autorizada por la empresa.
- POST /v1/couriers/verify — registro/consulta del estado de credencial profesional.
- POST /v1/logistics/events — webhook autenticado del socio.
- GET /v1/operations/:id — estado autorizado de la operación.
- POST /v1/operations/:id/accept — aceptación del destinatario.
- POST /v1/operations/:id/dispute — incidencia/disputa.
- POST /v1/operations/:id/release — servicio interno que solicita al PSP la ejecución; nunca se expone directamente al cliente.
- POST /v1/payments/webhook — confirmación firmada del PSP para actualizar el estado.

## Demo comercial
`parcel-demo.html` utiliza únicamente estado local y datos ficticios. Permite mostrar a empresas e inversores el recorrido completo: repartidor asignado → verificación → recogida → tránsito → entrega → aceptación → pago aceptado/liquidado en modo demo. La integración real se desarrollará en staging con credenciales sandbox del socio antes de cualquier producción.