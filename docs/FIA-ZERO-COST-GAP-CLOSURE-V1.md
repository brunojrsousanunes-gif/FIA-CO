# FIA&CO — Zero-cost gap closure v1

Estado: `IMPLEMENTATION / NO_PRODUCTION_ACTIVATION`.

## Objetivo

Cerrar todas las carencias identificadas que pueden resolverse con código, configuración, documentación y tests sin contratar servicios, sin usar datos reales y sin fingir verificaciones humanas o externas.

## Implementado en este bloque

### 1. Trust Levels respaldados por evidencia

`core/trust/trust-control-evidence.mjs`

- cada control puede tener evidencia con origen, fecha, caducidad y digest SHA-256;
- evidencia caducada o manipulada no cuenta;
- identidad, términos, contacto de incidentes, validación jurídica, partner y proveedor regulado están marcados como no automatizables;
- un test automático no puede elevar esos controles aunque se etiquete como PASS;
- por defecto evidencia humana/externa tampoco eleva automáticamente hasta que el llamador habilite explícitamente esa modalidad futura.

Fuente de clasificación: `config/trust-control-evidence-policy.v1.json`.

### 2. Manifiesto de evidencia tamper-evident

`core/trust/trust-evidence-manifest.mjs`

Permite agrupar hashes de receipts/evidencias y encadenar manifiestos. Es detección de alteración, no firma electrónica cualificada, KMS/HSM ni sello de tiempo externo.

### 3. Selector de puerta de entrada

`core/discovery/entry-scenario-selector.mjs`

Puntúa de forma determinista:

- Trust Transaction;
- Quote Recovery;
- Document Flow;
- Partner Coordination.

La regla es presentar el problema dominante, no cuatro productos a la vez. Partner Coordination puede aparecer como oportunidad pero no se ejecuta en L0/L1.

### 4. Diversificación sintética

`config/trust-entry-scenarios.v1.json`

Tres demostraciones iniciales sin datos reales:

- maquinaria profesional / operación trazable;
- taller-servicio / documentación bloqueante;
- servicios B2B / seguimiento de presupuestos.

### 5. Local Shadow agregado

`core/shadow/local-shadow.mjs`

Procesa filas en memoria local y devuelve únicamente métricas agregadas. No exporta identificadores, texto original ni filas. Detecta presencia de campos potencialmente sensibles sin copiar sus valores.

Esto es un motor de agregación, no todavía un agente instalable, extensión, binario firmado o conector OAuth.

### 6. Puente L0 -> L1 de preparación

`core/trust/trust-entry-l1-package.mjs`

Genera un paquete sin valores reales con:

- descriptores de campos;
- finalidad;
- Data Permit draft;
- plan de medición;
- retención;
- restricciones;
- requisitos que seguirán pendientes antes de producción.

Rechaza valores/sample/example, campos CRITICAL y Partner Coordination en L1. No activa producción.

### 7. Economía genérica

`core/economics/operation-economics.mjs`

Registra ingreso, coste IA, infraestructura, proveedor, otros variables y minutos humanos. Calcula margen de contribución, coste variable e ingreso por hora humana sin inventar valores ausentes.

### 8. Incident response

`core/security/incident-response.mjs` + `docs/FIA-INCIDENT-RUNBOOK-V1.md`

Clasifica y genera un plan de contención sin ejecutar acciones ni emitir conclusiones jurídicas. Incluye drills sintéticos para acceso, datos, auth, IA, costes, integraciones, disponibilidad y frontera financiera.

### 9. Snapshot cliente con evidencia

Los OWNER/ADMIN pueden recibir en el client snapshot un resumen seguro de qué controles están respaldados por evidencia y cuáles están retenidos por necesitar verificación no automática. No se exponen source refs ni detalles innecesarios a partners.

## Sigue bloqueado porque requiere gasto, infraestructura o validación humana/externa

- autenticación productiva y hosting persistente real;
- identidad empresarial/partner verificada;
- aceptación contractual real;
- contacto responsable de incidentes real;
- revisión jurídica/DPA/roles RGPD;
- OAuth verificado/Marketplace/Play/App Store;
- auditoría externa/CASA/ISO;
- proveedor de pagos regulado y verificado;
- KMS/HSM/sello de tiempo externo;
- operación con datos reales;
- comunicaciones automáticas externas;
- cualquier ejecución/custodia/movimiento de fondos por FIA.

## Regla

Código preparado no equivale a control verificado. Los artefactos de este bloque reducen trabajo pendiente y hacen comprobables los controles automatizables, pero no transforman un requisito humano/externo en PASS.
