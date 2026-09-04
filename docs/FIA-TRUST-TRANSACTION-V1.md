# FIA&CO — Trust Transaction v1

Estado: `FOUNDATION_IMPLEMENTED / REAL_DATA_DISABLED`.

## Objetivo

FIA Trust Transaction es el mecanismo de entrada de FIA en una empresa mediante **una única operación aislada**, trazable y controlada. El objetivo no es pedir acceso general a correo, CRM o base de clientes, sino demostrar utilidad y seguridad con el mínimo dato necesario.

Principio comercial:

> No nos des las llaves de tu empresa. Danos una sola operación y demostraremos qué aporta FIA, qué dato utiliza y quién puede verlo.

## 1. Escalera de confianza

1. `S0_SYNTHETIC`: demo con datos ficticios.
2. `S1_ISOLATED_OPERATION`: una operación real introducida de forma controlada, sin integraciones generales.
3. `S2_LIMITED_DATA`: permisos explícitos sobre campos concretos.
4. `S3_INTEGRATION`: integración mínima necesaria con sistemas autorizados.
5. `S4_AUTOMATION`: automatizaciones limitadas por policy y acción.
6. `S5_SHARED_OPERATION`: otra organización participa mediante grants explícitos y temporales.

No saltar niveles por comodidad comercial.

## 2. Regla interempresa

Una relación comercial entre dos empresas no elimina el aislamiento de tenants.

`ORG_A -> DENY BY DEFAULT -> SHARED GRANT -> ORG_B`

La organización B solo puede ver campos incluidos expresamente en un grant que contenga:
- organización receptora;
- campos exactos;
- finalidad;
- aprobación humana;
- caducidad;
- posibilidad de revocación.

En v1 no se permite compartir entre organizaciones campos clasificados como `PERSONAL` o `CRITICAL`.

## 3. Clasificación de datos

- `PUBLIC`: información pública.
- `INTERNAL`: estados y referencias internas con sensibilidad baja/moderada.
- `COMMERCIAL_CONFIDENTIAL`: precios, condiciones u otra información comercial no pública.
- `PERSONAL`: datos personales.
- `CRITICAL`: secretos, credenciales, información especialmente sensible o material que no debe exponerse a un flujo general.

La IA no decide qué datos puede consultar. La policy y el contexto de acceso filtran primero.

## 4. Quién ve qué

La experiencia web/app privada debe mostrar al cliente:
- quién tiene acceso a la operación;
- qué campos exactos puede ver cada organización;
- finalidad del permiso;
- fecha de caducidad;
- si el permiso está revocado;
- qué datos no se comparten;
- qué acciones requieren aprobación humana.

La seguridad no puede depender de ocultar elementos en JavaScript. El servidor/policy debe entregar ya un snapshot filtrado.

## 5. Trazabilidad

Trust Transaction reutiliza:
- motor de operaciones determinista;
- control de acceso por organización;
- audit log encadenado con SHA-256;
- evidencia e hitos de la operación.

La vista cliente explica los eventos, pero no sustituye el registro de auditoría de backend.

## 6. Frontera financiera permanente

FIA mantiene un modelo `NON_CUSTODIAL`.

FIA:
- no recibe fondos de clientes;
- no custodia fondos;
- no mueve fondos;
- no mantiene saldos de clientes;
- no emite cuentas de pago;
- no garantiza la liquidación.

Cuando una operación requiera un pago real, la ejecución corresponde a una entidad financiera o proveedor de servicios de pago legalmente habilitado y validado para producción.

Texto corto aprobado:

> **FIA no recibe, custodia ni mueve fondos. Los pagos reales se ejecutan mediante un proveedor de servicios de pago o entidad financiera legalmente habilitada.**

No afirmar que los fondos de los clientes están depositados en el Banco de España. El Banco de España autoriza, registra o supervisa determinadas entidades y actividades según el marco aplicable; la protección concreta de los fondos corresponde al proveedor regulado bajo las reglas que le resulten aplicables.

La frontera está definida en `config/financial-boundary.v1.json` y ejecutada por `core/finance/financial-boundary.mjs`.

## 7. Gate de proveedor de pagos

Antes de activar cualquier proveedor en producción deben existir al menos:
- razón social;
- tipo de proveedor permitido;
- referencia oficial de autorización/registro cuando corresponda;
- términos legales del proveedor;
- fecha y responsable de la verificación.

Si falta cualquiera de esos elementos: `PAYMENT_PROVIDER_NOT_READY` y ninguna función de pago real debe activarse.

## 8. Web y app

La primera superficie es `frontend/trust-transaction-private-demo.html`:
- solo datos sintéticos;
- `noindex`;
- `connect-src 'none'`;
- fuera del allowlist público de GitHub Pages;
- responsive para representar experiencia web/móvil.

No introducir datos reales en esa demo. La futura superficie autenticada deberá consumir snapshots generados por policy/servidor.

## 9. Primer Founding Anchor

El objetivo del primer gerente no es autorizar una integración completa. Es aceptar una operación limitada y comprender:
- qué valor aporta FIA;
- qué información usa;
- qué información no usa;
- quién puede verla;
- qué eventos quedan registrados;
- cómo se revoca un permiso;
- que FIA no toma control de sus fondos.

Solo después de demostrarlo se propone el siguiente nivel de acceso.

## 10. Regla de promoción

Cuando una promoción, propuesta o pantalla mencione pagos, seguridad transaccional o coordinación económica debe incluir de forma clara la frontera `NON_CUSTODIAL` y evitar cualquier frase que implique que FIA es banco, entidad de pago, custodio o garante de fondos.
