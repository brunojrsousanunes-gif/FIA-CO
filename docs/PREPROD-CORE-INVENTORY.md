# FIA&CO — Inventario DEMO → CORE para preproducción

## Objetivo

Clasificar las piezas actuales del backend/operaciones para decidir qué se conserva como núcleo reutilizable, qué pertenece exclusivamente a demo y qué debe refactorizarse antes de V1.1/preproducción.

## Resultado ejecutivo

### CORE CANDIDATE

#### `operation-engine.js`
Responsabilidad actual:
- máquina de estados de operaciones;
- transiciones permitidas;
- condiciones verificables;
- evidencias;
- disputas;
- solicitud de liberación mediante instrucción `PSP_ONLY`.

Motivo para conservar:
- no depende de clientes demo A/B;
- expresa lógica de dominio reutilizable;
- mantiene humano/condiciones antes de liberar;
- no ejecuta pagos reales.

Refactor recomendado antes de producción:
- mover a un módulo `core/operations/`;
- sustituir generación de IDs fallback con `Math.random` por un generador inyectable/seguro en servidor;
- separar reloj (`Date`) mediante dependencia inyectable para testabilidad;
- versionar formalmente el contrato de estados/evidencias;
- hacer explícita la política de concurrencia/versionado optimista.

Clasificación: `CORE_REUSABLE / NEEDS_HARDENING`.

---

### DEMO + INFRASTRUCTURE CANDIDATE

#### `server/demo-store.mjs`
Responsabilidad actual:
- estado inicial con `Cliente A` y `Cliente B`;
- balances demo;
- operaciones y auditoría;
- persistencia opcional en fichero JSON;
- escritura atómica mediante fichero temporal + rename;
- cola serializada de transacciones;
- rollback en memoria ante error;
- validación estricta del estado y cadena hash de auditoría.

Partes reutilizables:
- interfaz conceptual `load / transact / snapshot / reset`;
- transacciones serializadas como patrón de demo;
- validación antes de persistir;
- rollback ante error;
- integridad hash de eventos como idea de auditoría.

Partes demo que deben desaparecer del core:
- clientes A/B obligatorios;
- balances almacenados localmente;
- límites/modelo P2P específico;
- persistencia JSON como almacenamiento productivo;
- `reset` a fixtures demo.

Refactor recomendado:
- definir interfaz `OperationRepository` / `AuditRepository`;
- crear implementación `FileDemoRepository` solo para demo/tests;
- crear posteriormente implementación persistente real mediante DB;
- separar auditoría de balances/estado transaccional;
- introducir `tenantId / organizationId` antes de datos multiempresa.

Clasificación: `DEMO_STORE / EXTRACT_REPOSITORY_CONTRACT`.

---

### DEMO API + SECURITY PRIMITIVES

#### `server/demo-api.mjs`
Responsabilidad actual:
- servidor HTTP demo;
- secretos A/B por variables de entorno;
- sesiones bearer en memoria;
- TTL y rotación de sesión;
- rate limiting en memoria por IP;
- allowlist CORS;
- límites de cuerpo y cantidad;
- validación de idempotency key;
- cabeceras de seguridad;
- endpoints `/health`, `/session`, `/logout`, `/state`, `/operations`, decisión de operación;
- auditoría hash-chain;
- actualización de balances exclusivamente demo.

Partes reutilizables como conceptos:
- límites de payload;
- idempotencia;
- allowlist de orígenes;
- security headers;
- sesiones con expiración/rotación como requisito;
- rate limiting;
- health endpoint;
- separación de operaciones visibles por actor;
- auditoría append-only;
- validación fail-safe.

Partes que NO deben pasar a producción tal cual:
- clientes/secretos A/B;
- sesiones almacenadas en `Map` local;
- rate limiter local;
- autenticación por secreto compartido de demo;
- balances internos;
- decisión/transferencia P2P demo;
- dependencia directa de `createDemoStore`;
- identificación por `remoteAddress` como único control de rate;
- estado single-process.

Refactor recomendado:
1. extraer handlers/casos de uso del servidor HTTP;
2. introducir `IdentityProvider` y `SessionStore` como contratos;
3. introducir `RateLimiter` como contrato;
4. sustituir `clientId A/B` por `userId + organizationId + roles`;
5. separar `OperationService` de transporte HTTP;
6. extraer `AuditService` para no duplicar lógica de hash con el store;
7. mantener pagos reales detrás de `PaymentProviderAdapter` y Production Gate;
8. no almacenar dinero real ni autoridad financiera en el core.

Clasificación: `DEMO_API / SECURITY_PATTERNS_REUSABLE`.

## Duplicidades detectadas

### Auditoría
`demo-api.mjs` genera eventos/hash y `demo-store.mjs` valida/reconstruye la cadena. La responsabilidad está repartida entre API y store.

Acción: crear un único contrato/servicio de auditoría que genere y valide eventos; el repositorio solo persiste.

### Reglas de dominio
Existen dos modelos de operación:
- P2P demo en `demo-api.mjs` (`PENDING_RECIPIENT`, `CONFIRMED_DEMO`, etc.);
- operación genérica en `operation-engine.js` (`DRAFT → ... → CLOSED`).

Acción: `operation-engine.js` debe convertirse en el modelo canónico; la API demo puede mantenerse temporalmente como demo legacy hasta migrar tests/UI.

## Riesgos antes de preproducción

### P1 — Modelo de identidad demo
A/B no sirve para aislamiento real entre empresas. Se necesita organización/tenant/roles antes de PII real.

### P1 — Persistencia en fichero
Adecuada para demo, no para concurrencia, backups, HA ni escalado productivo.

### P1 — Dos modelos de operación
Mantener ambos en producción crearía contradicciones de estados y reglas.

### P2 — Sesiones/rate limit locales
No funcionan correctamente al escalar a múltiples instancias.

### P2 — Auditoría repartida
Puede provocar divergencias si una capa cambia independientemente.

### P2 — Generación de ID fallback en navegador
`Math.random` no debe ser fuente de IDs de seguridad/negocio en producción.

## Frontera objetivo V1.1

```text
HTTP/API
  ↓
Auth / Organization / Roles
  ↓
Application Services
  ↓
Operation Engine (CORE)
  ↓                 ↓
Evidence/Audit      Provider Adapters
  ↓                 ↓
Repositories        PSP/KYC/Bank/etc.
  ↓
Persistent DB
```

La capa HTTP no debe conocer detalles de persistencia ni proveedores reales.

## Orden recomendado de formación

### Bloque P1 — Core Operation Contract
- declarar `operation-engine` modelo canónico;
- mover/copiar a estructura core sin romper compatibilidad;
- tests de transiciones/invariantes;
- no tocar pagos reales.

### Bloque P2 — Repository Contract
- interfaz de repositorio;
- adaptar `demo-store` a implementación demo;
- tests contractuales de repositorio.

### Bloque P3 — Audit/Evidence Service
- única fuente de generación/validación de eventos;
- append-only e integridad;
- separar evidencia de estado mutable.

### Bloque P4 — Identity / Organization / Roles
- usuarios;
- organizaciones;
- roles mínimos;
- aislamiento tenant.

### Bloque P5 — Application/API Layer
- endpoints llaman a casos de uso;
- auth y rate limiting mediante adapters;
- demo API queda como compatibilidad temporal.

### Bloque P6 — Persistent Preprod Store
- DB de preproducción;
- migraciones;
- backup/restore;
- health/readiness;
- sin PII/fondos reales hasta gates posteriores.

## Decisión actual

`operation-engine.js` es el mejor candidato a primer componente CORE.

`demo-store.mjs` y `demo-api.mjs` contienen patrones útiles, pero no deben promoverse tal cual a producción.

## Regla de migración

No reescribir todo de una vez. Aplicar **strangler migration**:
1. crear contratos nuevos;
2. envolver piezas demo existentes;
3. migrar tests/casos de uso uno por uno;
4. retirar legacy solo cuando la batería complete siga verde.

Estado: `INVENTORY_COMPLETE / READY_FOR_CORE_EXTRACTION`.