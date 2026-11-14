# FIA&CO — mapa de arquitectura y límites de publicación

**Estado:** auditoría de código fuente; no equivale a certificación de seguridad ni a validación de producción.  
**Referencia auditada:** `main` en `63ec6df05fb5a24fa12a83de5989b617bae3a22d`.  
**Objetivo:** reducir duplicidades, preservar el núcleo y evitar que una superficie privada se incorpore por error al sitio público.

## 1. Hechos comprobados

- El repositorio GitHub `brunojrsousanunes-gif/FIA-CO` es público en la referencia auditada. Por tanto, los archivos versionados pueden consultarse desde GitHub aunque no se publiquen en GitHub Pages.
- GitHub Pages se construye mediante `scripts/build-pages-public.mjs` a partir de `config/pages-public-allowlist.txt`. La lista limita el artefacto de Pages; **no convierte en privados los archivos del repositorio**.
- La allowlist auditada incluye `operation-center.html` y no incluye `operation-center-private.html`, `js/operation-center-private.js`, `css/operation-center-private.css` ni `css/pilot-access.css`.
- La página privada y su JavaScript existen en el repositorio. La página contiene `noindex`, una política CSP y una conexión al proyecto Supabase. Estas medidas no sustituyen el control de acceso del servidor ni ocultan el código fuente publicado en GitHub.
- El archivo `frontend/js/supabase-public-config.js` contiene una clave publicable de Supabase. Una clave publicable no debe tratarse como secreto: la protección de datos depende de RLS, privilegios y controles del backend. No se ha encontrado aquí una clave `service_role` ni una credencial privada; esta observación no constituye un escaneo exhaustivo de todo el historial Git.
- El Centro privado consulta Supabase directamente desde el navegador mediante el cliente propio. No se ha demostrado en esta auditoría que la interfaz completa haya superado una prueba funcional con usuarios y permisos reales.
- El motor JavaScript de `core/operations` y su repositorio en memoria forman una vía de referencia/local. El Centro privado consulta el backend Supabase directamente. No se debe describir el motor JavaScript como autoridad productiva sin demostrar una integración.
- `core/audit/audit-log.mjs` mantiene un registro en memoria/hash-chain. Es distinto de las tablas y funciones de auditoría persistente de Supabase.
- FIA Recover dispone de motor, gates y pruebas propios. No se ha demostrado que ese motor esté integrado en el flujo productivo del backend. La recuperación sintética de piezas del Centro privado no debe confundirse con FIA Recover comercial.

## 2. Mapa funcional recomendado

Mantener un único producto modular, no crear microservicios por cada área:

1. Identidad, organizaciones, confianza y permisos.
2. Operaciones y expediente compartido.
3. Logística y entregas.
4. Documentos, evidencias y auditoría.
5. Incidencias y resolución.
6. Seguimiento comercial / FIA Recover básico.
7. Compras e inventario.
8. Administración, seguridad y continuidad.

Capacidades transversales: notificaciones esenciales, costes/márgenes, integraciones autorizadas y asistencia inteligente.

## 3. Fuente de verdad: decisión pendiente de cerrar

| Dominio | Lo comprobado | Regla de arquitectura propuesta |
|---|---|---|
| Operaciones persistentes | Centro privado lee/escribe recursos Supabase; existen políticas y RPC en migraciones | Supabase debe ser la autoridad de los expedientes persistentes, sujeto a revisión de RLS/RPC |
| Motor JS | Servicios encadenados sobre motor/repositorio local | Conservar como modelo/contrato de dominio hasta verificar usos; no duplicar reglas de negocio |
| Auditoría | Log JS en memoria y tablas/funciones SQL separadas | El registro persistente del backend debe ser la evidencia operativa; el log local no debe presentarse como auditoría productiva |
| FIA Recover | Motor autónomo y tests; integración backend no demostrada | Mantener seguimiento básico; no activar pagos ni automatizaciones externas |
| Demos | Hay superficies sintéticas separadas | Etiquetar siempre como demo; no introducir datos reales |

Esta tabla es una propuesta de gobierno técnico, no una declaración de que todos los flujos ya estén integrados o validados.

### 3.1 Contrato observado en el Centro privado

La entrada `frontend/js/operation-center-private.js` importa la configuración publicable y el cliente HTTP propio de Supabase; no importa los módulos `core/operations` ni `core/recover`.

En ese cliente se han identificado llamadas REST a:
- `operations`, `organization_members` y `pilot_access_requests`;
- `operation_participants`, `operation_confirmations`, `logistics_quotes`, `operation_cost_items`, `operation_incidents` y `operation_audit_events`;
- `inventory_items`, `inventory_movements`, `inventory_reservations` e `inventory_stock`.

Y llamadas RPC a:
- `accept_operation_invitation`, `select_logistics_quote`, `create_synthetic_part_recovery` y `request_pilot_access`;
- `record_inventory_movement`, `reserve_inventory_item` y `release_inventory_reservation`.

La máquina de estados SQL observada (`draft`, `invited`, `accepted`, `in_transit`, `delivered`, `completed`, `disputed`, `cancelled`) no es una traducción uno a uno de la máquina JS (`DRAFT`, `AWAITING_ACCEPTANCE`, `CONDITIONED`, `IN_PROGRESS`, `DELIVERED`, `ACCEPTED`, `READY_FOR_RELEASE`, `RELEASE_REQUESTED`, `DISPUTED`, `CLOSED`, `CANCELLED`). No deben mezclarse ni conectarse por suposición.

La recuperación de pieza de la interfaz invoca la RPC SQL `create_synthetic_part_recovery`; eso no demuestra que el motor comercial `core/recover/recover-engine.mjs` esté integrado.

Otros límites del código de referencia:
- `createHierarchyScopedOperationService` declara expresamente `productionAuthorization: false`; no debe considerarse autorización productiva.
- `createAuditedOperationService` registra después de ejecutar la mutación y depende de un `auditLog` inyectado. Con `createMemoryAuditLog`, la evidencia es solo memoria. Si se reutiliza, hará falta persistencia transaccional o un patrón outbox para no dejar una mutación sin su evento de auditoría cuando falle el registro.

Estas observaciones describen los archivos revisados; no certifican todas las políticas RLS ni el comportamiento real de usuarios en producción.

## 4. Módulos que se mantienen congelados, no borrados

Hasta que exista un caso real, responsable y prueba de necesidad, no ampliar:
- cartera, criptomonedas y conversión BTC/EUR;
- transporte de animales y paquetería avanzada;
- agente transaccional autónomo Premium;
- integraciones bancarias y pagos;
- proveedores externos KYC/KYB/PSP;
- SIEM/Fortinet y antifraude externo;
- automatizaciones externas de FIA Recover;
- nuevos motores de IA o campañas de simulación duplicadas.

Congelar significa no invertir más desarrollo ahora; no significa eliminar archivos ni invalidar trabajo previo.

## 5. Frontera pública / privada

### Público
Solo los archivos incluidos en la allowlist forman parte del artefacto de GitHub Pages. El contenido publicado debe ser apto para exposición pública y no contener secretos, datos personales ni documentación operativa confidencial.

### Privado
La interfaz privada no debe entrar en la allowlist. El atributo `noindex` es una instrucción a buscadores, no un mecanismo de autenticación. La CSP limita orígenes y recursos, pero no protege el código fuente del repositorio.

### Riesgo abierto
Mientras el repositorio siga siendo público, el código de la interfaz privada y cualquier documentación versionada seguirán siendo visibles en GitHub. Resolverlo requiere una decisión separada sobre visibilidad del repositorio y sus efectos en Pages, CI y alojamiento. Este documento no cambia esa configuración.

## 6. Controles de publicación

- Mantener la allowlist como única fuente de selección de archivos de Pages.
- Ejecutar el constructor y verificar el contenido real del artefacto.
- Fallar si una superficie privada conocida aparece en la allowlist o en el artefacto.
- No añadir la interfaz privada al sitio público para “probarla”.
- Revisar cualquier nuevo archivo público por clasificación de datos y referencias.
- No asumir que un nombre con `private`, `noindex` o una pantalla de login equivale a privacidad del código fuente.

## 7. Secuencia de trabajo

1. Proteger mediante pruebas automáticas la frontera de Pages.
2. Resolver conscientemente la visibilidad del repositorio y la ubicación del código interno.
3. Completar inventario de llamadas, dependencias y contratos entre motor JS, Supabase y Recover.
4. Elegir una única fuente de verdad por dominio y documentar adaptadores.
5. Probar con datos sintéticos el ciclo completo de tres organizaciones, roles, incidencias, auditoría y recuperación.
6. Solo después evaluar integración real, revisión jurídica y habilitación de datos reales.

## 8. Fuera del alcance de este cambio

No cambia la visibilidad del repositorio, GitHub Pages, Supabase, migraciones, RLS, cuentas, sesiones, claves, planes, facturación ni datos. No elimina módulos ni fusiona otras PR.

**Criterio de aceptación:** la compilación pública sigue funcionando y una prueba automatizada demuestra que los archivos del Centro privado conocidos no forman parte del artefacto de Pages.
