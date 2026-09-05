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

La demo privada ya muestra los tres escenarios y mantiene Partner Coordination como capacidad posterior.

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

### 7. Economía genérica y límites de coste

`core/economics/operation-economics.mjs`

Registra ingreso, coste IA, infraestructura, proveedor, otros variables y minutos humanos. Calcula margen de contribución, coste variable e ingreso por hora humana sin inventar valores ausentes.

`core/economics/cost-circuit-breaker.mjs`

Evalúa límites diarios/mensuales y porcentaje de coste variable. Puede producir `ALLOW`, `WARN` o `BLOCK`, pero no compra servicios ni modifica presupuestos externos.

### 8. Incident response y kill switches

`core/security/incident-response.mjs` + `docs/FIA-INCIDENT-RUNBOOK-V1.md`

Clasifica y genera un plan de contención sin ejecutar acciones ni emitir conclusiones jurídicas. Incluye drills sintéticos para acceso, datos, auth, IA, costes, integraciones, disponibilidad y frontera financiera.

`core/security/kill-switch.mjs`

Modelo multinivel para bloquear FIA, organización, workflow, integración u operación. Está probado en memoria; la ejecución productiva requerirá backend e infraestructura reales.

### 9. Retención

`core/security/retention-policy.mjs`

Calcula cuándo un expediente llega a `DELETE_DUE` o debe mantenerse por hold. No elimina datos reales automáticamente en esta fase.

### 10. Snapshot cliente con evidencia

Los OWNER/ADMIN pueden recibir en el client snapshot un resumen seguro de qué controles están respaldados por evidencia y cuáles están retenidos por necesitar verificación no automática. No se exponen source refs, hashes internos ni detalles innecesarios a viewers/partners.

### 11. Sesiones firmadas de preproducción

`core/identity/preprod-session-token.mjs`

Permite emitir y verificar sesiones HMAC-SHA256 de corta duración para pruebas locales/preproducción. Están marcadas expresamente como `preproductionOnly` y `productionIdentityVerified=false`.

No sustituyen OAuth, MFA ni identidad productiva.

### 12. Frontera servidor/cliente de preproducción

`core/preprod/preprod-client-service.mjs`

Usa sesión firmada + organización + repositorios en memoria para construir el snapshot en servidor/core antes de devolverlo al cliente. Una organización diferente no puede leer la operación aunque conozca los IDs.

`core/repositories/trust-transaction-repository.mjs` añade persistencia en memoria para pruebas, no base de datos productiva.

### 13. Frontera determinista de IA

`core/ai/authorized-context.mjs`

- proyección autorizada separada del contenido no confiable;
- documentos/emails nunca se marcan como instrucciones ejecutables;
- secretos por claves sensibles se rechazan;
- el modelo no puede ampliar permisos;
- propuestas para mover/custodiar fondos, cambiar nivel de seguridad, conceder acceso interempresa, firmar contratos o cambiar precio/descuento se bloquean en el core;
- acciones sensibles allowlisted pueden exigir aprobación humana.

### 14. Legal readiness sin auto-certificación

`config/prepilot-legal-readiness.v1.json`

Mantiene explícitamente en `REVIEW_REQUIRED` roles de tratamiento, DPA/encargo cuando proceda, privacidad, comunicaciones, incidentes, subencargados, Proof Pack y frontera financiera. `autoApprovalAllowed=false`.

### 15. Apoyo humano inicial de datos con mínimo privilegio

`core/data/data-steward-delegation.mjs`

Permite preparar tareas limitadas de normalización, estructura, demo sintética y calidad de agregados mediante delegaciones temporales. Está pensado para apoyo operativo inicial incluso cuando la persona conoce el proyecto solo a nivel general.

No concede:

- acceso interempresa;
- datos CRITICAL;
- pagos;
- cambio de Trust Level;
- activación productiva;
- aprobación jurídica;
- secretos.

La persona necesita onboarding y cualquier escalado sensible exige revisión independiente.

## Sigue bloqueado porque requiere gasto, infraestructura o validación humana/externa

- autenticación productiva, MFA/OAuth y hosting persistente real;
- identidad empresarial/partner verificada;
- aceptación contractual real;
- contacto responsable de incidentes real;
- revisión jurídica/DPA/roles RGPD;
- OAuth verificado/Marketplace/Play/App Store;
- auditoría externa/CASA/ISO cuando tenga sentido;
- proveedor de pagos regulado y verificado;
- KMS/HSM/sello de tiempo externo;
- base de datos/backups/monitorización productivos;
- operación con datos reales;
- comunicaciones automáticas externas;
- cualquier ejecución/custodia/movimiento de fondos por FIA.

## Regla

Código preparado no equivale a control verificado. Los artefactos de este bloque reducen trabajo pendiente y hacen comprobables los controles automatizables, pero no transforman un requisito humano/externo en PASS.
