# FIA&CO — Trust Transaction v1

Estado: `FOUNDATION_IMPLEMENTED / REAL_DATA_DISABLED`.

## Objetivo

FIA Trust Transaction es el mecanismo de entrada de FIA en una empresa mediante **una única operación aislada**, trazable y controlada. El objetivo no es pedir acceso general a correo, CRM o base de clientes, sino demostrar utilidad y seguridad con el mínimo dato necesario.

Principio comercial:

> No nos des las llaves de tu empresa. Danos una sola operación y demostraremos qué aporta FIA, qué dato utiliza y quién puede verlo.

## 1. Seguridad por niveles

FIA no usa una regla binaria `seguro/no seguro`. El acceso aumenta únicamente cuando aumentan los controles verificados.

Principio técnico:

> `MORE_ACCESS_REQUIRES_MORE_VERIFIED_CONTROLS`

Los niveles se calculan por policy; no deben poder seleccionarse manualmente para saltarse controles.

### `L0_DEMO` — Demo

- datos sintéticos;
- sin integraciones reales;
- sin acciones externas reales;
- sin intercambio entre organizaciones.

Capacidad principal: demostrar FIA sin pedir confianza sobre datos reales.

### `L1_ISOLATED` — Operación aislada

Requiere, entre otros controles:
- organización identificada;
- términos aceptados;
- tenant boundary preparado;
- auditoría preparada;
- contacto de incidente definido.

Desbloquea:
- datos reales limitados en una operación aislada;
- trazabilidad interna;
- sin intercambio con otra organización.

### `L2_VERIFIED` — Empresa verificada

Añade:
- identidad verificada;
- autenticación reforzada;
- gestión de secretos;
- minimización de datos;
- retención definida;
- pruebas de seguridad superadas.

Desbloquea:
- integraciones OAuth previamente aprobadas;
- automatización interna segura;
- sigue sin permitir intercambio interempresa.

### `L3_SHARED` — Operación compartida

Añade:
- Data Permits;
- caducidad y revocación de grants;
- identidad del partner verificada;
- limitación por finalidad;
- pruebas de aislamiento entre organizaciones.

Desbloquea:
- intercambio explícito de campos `PUBLIC`, `INTERNAL` y `COMMERCIAL_CONFIDENTIAL`;
- acciones externas limitadas por policy;
- colaboración A ↔ B sin abrir las bases de datos completas.

`L3_SHARED` es el mínimo para una operación interempresa.

### `L4_ADVANCED` — Flujo avanzado

Añade:
- rol jurídico del tratamiento validado;
- condiciones responsable/encargado cuando correspondan;
- subencargados documentados;
- revisión específica del flujo con datos personales;
- revisión de seguridad reforzada;
- gate de proveedor regulado cuando proceda.

Puede desbloquear flujos con `PERSONAL` únicamente cuando:
- ambas organizaciones alcanzan `L4_ADVANCED`;
- existe finalidad específica;
- existe aprobación humana;
- se ha registrado revisión de datos personales;
- existe referencia de revisión jurídica.

`CRITICAL` continúa sin ser compartible entre organizaciones incluso en `L4_ADVANCED`.

La policy se documenta en `config/trust-security-levels.v1.json` y se ejecuta en `core/trust/trust-security-levels.mjs`.

## 2. Límites permanentes

No se desbloquean por subir de nivel:
- secretos o credenciales compartidos entre organizaciones;
- secretos/credenciales enviados a prompts de IA;
- seguridad basada únicamente en ocultar HTML/JavaScript;
- custodia de fondos por FIA;
- movimiento de fondos por FIA.

Más nivel significa **más controles y capacidades**, no menos restricciones de seguridad.

## 3. Regla interempresa

Una relación comercial entre dos empresas no elimina el aislamiento de tenants.

`ORG_A -> DENY BY DEFAULT -> VERIFIED SECURITY LEVEL -> SHARED GRANT -> ORG_B`

La organización B solo puede ver campos incluidos expresamente en un grant que contenga:
- organización receptora;
- campos exactos;
- finalidad;
- aprobación humana;
- caducidad;
- posibilidad de revocación;
- capacidad mínima exigida por el tipo de dato;
- nivel de seguridad verificado en el momento de conceder el acceso.

El acceso se vuelve a filtrar al construir la vista: si el viewer ya no cumple la capacidad requerida, el dato deja de entregarse.

## 4. Clasificación de datos

- `PUBLIC`: información pública.
- `INTERNAL`: estados y referencias internas con sensibilidad baja/moderada.
- `COMMERCIAL_CONFIDENTIAL`: precios, condiciones u otra información comercial no pública.
- `PERSONAL`: datos personales.
- `CRITICAL`: secretos, credenciales o material que no debe exponerse a un flujo compartido general.

La IA no decide qué datos puede consultar. La policy y el contexto de acceso filtran primero.

## 5. Snapshot cliente seguro

La web/app no debe recibir el expediente bruto y ocultar campos en frontend.

`core/trust/trust-client-snapshot.mjs` construye una representación mínima para el viewer:
- verifica organización y rol;
- aplica grants y nivel de seguridad;
- entrega solo campos autorizados;
- la organización colaboradora no recibe el timeline interno del propietario;
- la matriz completa `quién ve qué` solo se entrega a `OWNER/ADMIN` de la organización propietaria;
- la frontera financiera `NON_CUSTODIAL` viaja con la operación.

Regla:

> Si el dispositivo no está autorizado a conocer un dato, ese dato no debe llegar al dispositivo.

## 6. Quién ve qué

La experiencia web/app privada debe mostrar al cliente:
- nivel de seguridad actual;
- capacidades desbloqueadas;
- controles pendientes para el siguiente nivel;
- quién tiene acceso a la operación;
- qué campos exactos puede ver cada organización;
- finalidad del permiso;
- fecha de caducidad;
- si el permiso está revocado;
- qué datos no se comparten;
- qué acciones requieren aprobación humana.

## 7. Trazabilidad

Trust Transaction reutiliza:
- motor de operaciones determinista;
- control de acceso por organización;
- audit log encadenado con SHA-256;
- evidencia e hitos de la operación.

La vista cliente explica los eventos, pero no sustituye el registro de auditoría de backend.

## 8. FIA Security Receipt

`core/trust/trust-security-receipt.mjs` genera un resumen verificable de:
- operación y versión;
- número de eventos de auditoría;
- estado de integridad del audit log;
- nivel de seguridad;
- capacidades desbloqueadas;
- organizaciones/campos compartidos;
- revocación/caducidad;
- frontera financiera;
- estado del proveedor de pagos cuando exista.

El recibo incluye digest SHA-256 para detectar alteraciones.

No debe presentarse como firma electrónica cualificada, certificación externa, garantía financiera ni prueba jurídica definitiva.

## 9. Frontera financiera permanente

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

No afirmar que los fondos de los clientes están depositados en el Banco de España.

La frontera está definida en `config/financial-boundary.v1.json` y ejecutada por `core/finance/financial-boundary.mjs`.

## 10. Gate de proveedor de pagos

Antes de activar cualquier proveedor en producción deben existir al menos:
- razón social;
- tipo de proveedor permitido;
- referencia oficial de autorización/registro cuando corresponda;
- términos legales del proveedor;
- fecha y responsable de la verificación.

Si falta cualquiera de esos elementos: `PAYMENT_PROVIDER_NOT_READY` y ninguna función de pago real debe activarse.

## 11. Web y app

La primera superficie es `frontend/trust-transaction-private-demo.html`:
- solo datos sintéticos;
- `noindex`;
- `connect-src 'none'`;
- fuera del allowlist público de GitHub Pages;
- responsive para representar experiencia web/móvil;
- muestra la progresión de niveles de seguridad.

No introducir datos reales en esa demo. La futura superficie autenticada deberá consumir snapshots generados por policy/servidor.

## 12. Primer Founding Anchor

El objetivo del primer gerente no es autorizar una integración completa. Es avanzar progresivamente:

`L0_DEMO -> L1_ISOLATED -> L2_VERIFIED -> L3_SHARED`

Solo alcanzar `L4_ADVANCED` si el caso de uso real necesita datos personales interempresa y supera la revisión específica.

En cada nivel el gerente debe comprender:
- qué valor aporta FIA;
- qué información usa;
- qué información no usa;
- quién puede verla;
- qué controles han permitido el nuevo acceso;
- qué eventos quedan registrados;
- cómo se revoca un permiso;
- que FIA no toma control de sus fondos.

## 13. Regla de promoción

La seguridad se promociona como control verificable, no como una promesa absoluta.

No usar expresiones como `100% seguro`, `riesgo cero` o `imposible de hackear`.

Cuando una promoción, propuesta o pantalla mencione pagos, seguridad transaccional o coordinación económica debe incluir de forma clara la frontera `NON_CUSTODIAL` y evitar cualquier frase que implique que FIA es banco, entidad de pago, custodio o garante de fondos.
