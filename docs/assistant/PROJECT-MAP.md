# FIA&CO — mapa maestro del proyecto

- **Función:** índice de navegación para personas y asistentes IA.
- **Alcance:** documentación, producto, código, base de datos, seguridad, pruebas y operación.
- **Revisión de estructura:** 2026-11-14.
- **Rama inspeccionada:** `integration/fia-co-verified-snapshot-2026-11-14`.
- **Nota:** el mapa describe rutas encontradas en el repositorio. No certifica que cada capacidad esté desplegada o lista para uso real.

## 1. Cómo orientarse en menos de dos minutos

| Necesidad | Empieza aquí |
|---|---|
| Entender el proyecto y sus reglas | [README](../../README.md) → [Skills del proyecto](../../skills/fia-co-project/SKILL.md) |
| Saber qué está hecho y qué falta | [Traspaso de trabajo](PROJECT-HANDOFF.md) |
| Encontrar el documento correcto | Este mapa → [Catálogo documental](DOCUMENTATION-CATALOG.md) |
| Retomar una tarea técnica | [Registro de trabajo interno](WORK-REGISTER.md) → código y pruebas relacionadas |
| Resolver una cuestión de seguridad | [Skill de seguridad](../../skills/fia-co-security-review/SKILL.md) → [arquitectura y límites](../FIA-CO-ARCHITECTURE-BOUNDARIES.md) |
| Entender la experiencia de usuario | `frontend/` → `frontend/index.html`, `frontend/app-beta.html`, `frontend/operation-center.html` |
| Entender el motor de operaciones | `core/operations/` → `tests/core-operation-contract.test.mjs` y pruebas de alcance |
| Entender identidad y permisos | `core/identity/`, `core/trust/` → pruebas de identidad, jerarquía y acceso |
| Entender dinero, costes y límites | `core/finance/`, `core/economics/`, `config/financial-boundary.json` → `tests/financial-*` |
| Cambios de base de datos | `supabase/migrations/`, `supabase/baseline/`, `tests/*postgres*.sql` |
| Preparar el piloto | [Playbook](../PILOT-PLAYBOOK.md), `docs/pilot/`, `core/pilot/`, `config/synthetic-*.json` |
| Contratos y compraventas | `docs/legal/`; conservar los documentos aunque no estén en el MVP |
| Proveedores e integraciones | `core/marketplace/`, adaptadores de `frontend/js/`, `config/provider-*.json`, `docs/architecture/` |

## 2. Mapa de alto nivel: cómo se relacionan las piezas

```text
README.md
  └── docs/assistant/  ← mapa, traspaso y catálogo para continuar el trabajo
       ├── PROJECT-MAP.md
       ├── PROJECT-HANDOFF.md
       ├── DOCUMENTATION-CATALOG.md
       └── WORK-REGISTER.md

frontend/  ← interfaz web y experiencia de usuario
  └── frontend/js/  ← conecta pantallas con servicios y capacidades

core/  ← lógica de negocio y controles compartidos
  ├── identity/ trust/ access/  ← identidad, niveles y permisos
  ├── operations/ repositories/ ← expediente y ciclo de operación
  ├── finance/ economics/       ← límites y cálculo económico
  ├── evidence/ audit/ proof/   ← evidencias y trazabilidad
  ├── legal/ compliance/        ← controles jurídicos y de cumplimiento
  ├── privacy/ security/        ← privacidad y seguridad
  ├── pilot/ preprod/ recover/  ← preparación, validación y recuperación
  └── ai/ assistant/            ← contexto autorizado e interacción

supabase/
  ├── migrations/  ← cambios incrementales de esquema y políticas
  ├── baseline/    ← referencias de esquema inicial; no ejecutar como migración sin revisar
  └── database.types.ts

config/  ← políticas, perfiles, gates y escenarios declarativos
scripts/  ← construcción, validaciones y ejecución de campañas
tests/    ← pruebas unitarias, contratos, integración y SQL
skills/   ← instrucciones operativas para asistentes y revisión de seguridad
docs/     ← especificaciones, decisiones de producto, legal, comercial y evidencias
```

**Regla de lectura:** la interfaz puede mostrar una capacidad, pero la implementación real se comprueba siguiendo su llamada hacia `core/` o Supabase y su prueba en `tests/`. Una pantalla, un adaptador demo o un JSON de configuración por sí solos no prueban que el flujo productivo esté operativo.

## 3. Documentación: índice por materia

### A. Arquitectura, estado y consolidación
- [Límites de arquitectura y publicación](../FIA-CO-ARCHITECTURE-BOUNDARIES.md)
- [Matriz de consolidación](../FIA-CO-CONSOLIDATION-MATRIX.md) — documento histórico; sus referencias a #184 deben reconciliarse con #185 antes de usarlo como estado actual.
- [Inventario del núcleo preproducción](../PREPROD-CORE-INVENTORY.md)
- [Cierre V1](../V1-CLOSEOUT.md)
- [Escaneo de consolidación V1](../V1-CONSOLIDATION-SCAN.md)
- [Autorización técnica V1](../V1-TECHNICAL-AUTHORIZATION.md)
- [Arquitectura de bajo riesgo B2](../B2-LOW-RISK-ARCHITECTURE.md)
- [Cloudflare y Supabase](../CLOUDFLARE_SUPABASE.md)
- [Migración CSP SEC2](../CSP-MIGRATION-SEC2.md)
- [Estado CSP SEC3](../CSP-SEC3-STATUS.md)

### B. Producto, operaciones y experiencia
- [Motor de operaciones](../OPERATION-ENGINE.md)
- [Operaciones comerciales V1](../COMMERCIAL-OPS-V1.md)
- [Kit comercial](../COMMERCIAL-KIT.md)
- [Preparación comercial V1](../COMMERCIAL-READINESS-V1.md)
- [Kit de descubrimiento B2B](../B2B-DISCOVERY-KIT.md)
- [Guía de marketing](../MARKETING-GUIDANCE-V1.md)
- [Parcel Enterprise](../PARCEL-ENTERPRISE.md)
- [Acciones del fundador](../FOUNDER-ACTIONS-V1.md)
- [Modelos de formulario y cobertura](../../config/form-coverage.v1.json)

### C. Confianza, identidad y acceso
- [Entrada con primer contacto controlado](../FIA-FIRST-CONTACT-GATED-V1.md)
- [Entrada Trust V1](../FIA-TRUST-ENTRY-V1.md)
- [Transacción Trust V1](../FIA-TRUST-TRANSACTION-V1.md)
- [Niveles de presencia humana](../FIA-HUMAN-PRESENCE-CHECK-V1.md)
- [Seguridad multiusuario](../MULTIUSER-SECURITY.md)
- [Modelo de autorización para inversores](../AUTHORIZATION-PACK-INVESTOR-READY.md)
- [Arquitectura de niveles de información](../../config/information-access-levels.v1.json)
- [Niveles de seguridad Trust](../../config/trust-security-levels.v1.json)
- [Estrategia de maximización de utilidad de seguridad](../FIA-SECURITY-UTILITY-MAXIMIZATION-V1.md)

### D. Finanzas, economía y pagos
- [Modelo financiero a 36 meses](../FINANCIAL-MODEL-36M.md)
- [Validación de precios del piloto](../PRICING-PILOT-VALIDATION.md)
- [Estrategia de precios premium](../NEXT-STEPS-PREMIUM-PRICING.md)
- [Agente de transacciones premium](../PREMIUM-TRANSACTION-AGENT.md)
- [Adaptadores de pago V1](../PAYMENT-ADAPTERS-V1.md)
- [Arquitectura wallet/crypto/banco](../architecture/wallet-crypto-bank.md)
- [Frontera financiera](../../config/financial-boundary.v1.json)
- [Flujo de transacción](../../config/tx-flow.json)
- [Operación de piloto TX](../pilot/TX-PILOT-OPS.md)

### E. Legal, privacidad y cumplimiento
- [Estado jurídico del proyecto](../legal/ESTADO-JURIDICO-PROYECTO.md)
- [Identidad sin biometría](../legal/IDENTIDAD-SIN-BIOMETRIA.md)
- [Implementación legal 2026](../legal/IMPLEMENTATION-LEGAL-2026.md)
- [Matriz legal 2A](../legal/LEGAL-2A-USE-CASE-MATRIX.md)
- [Fuentes de jurisdicción 2B](../legal/LEGAL-2B-JURISDICTION-SOURCES.md)
- [Arquitectura de políticas 2C](../legal/LEGAL-2C-POLICY-ARCHITECTURE.md)
- [Validación prepiloto 2D](../legal/LEGAL-2D-PREPILOT-VALIDATION.md)
- [Compraventa de vehículos entre particulares](../legal/compraventa-particulares-vehiculos.md) — conservar.
- [Conciliación y límites](../legal/conciliacion-limites.md)
- [Marco DAC7](../../core/tax/dac7-readiness.mjs) y [prueba DAC7](../../tests/dac7-readiness.test.mjs)

### F. Seguridad, riesgos y respuesta a incidentes
- [Línea base operativa de seguridad](../SECURITY-OPERATING-BASELINE.md)
- [Línea base de seguridad](../SECURITY_BASELINE.md)
- [Matriz de riesgos](../SECURITY-RISK-MATRIX.md)
- [Modelo de amenazas SEC2](../THREAT-MODEL-SEC2.md)
- [Estrategia dual de proveedores](../SECURITY-DUAL-VENDOR-V1.md)
- [Runbook de incidentes](../FIA-INCIDENT-RUNBOOK-V1.md)
- [Revisión de seguridad 14-11-2026](../security-review-2026-11-14.md)
- [Revisión de seguridad paso 2](../security-review-step-2.md)
- [Seguridad prepiloto SEC4](../security/SEC-4-PREPILOT.md)
- [Guía de acceso y secretos](../../skills/fia-co-security-review/references/secrets-permissions.md)
- [Revisión de código](../../skills/fia-co-security-review/references/code-security-review.md)
- [Evaluación de Skills externas](../../skills/fia-co-security-review/references/skill-vetting.md)

### G. Piloto, preparación y recuperación
- [Playbook del piloto](../PILOT-PLAYBOOK.md)
- [Gate de piloto controlado](../FIA-CONTROLLED-PREPILOT-GATE-V1.md)
- [Seis bloqueos prepiloto](../FIA-PREPILOT-SIX-BLOCKERS-V1.md)
- [Cierre de brechas sin coste](../FIA-ZERO-COST-GAP-CLOSURE-V1.md)
- [Kit de transporte para piloto](../pilot/PILOT-PACK-TRANSPORT.md)
- [Excepciones de seguridad del piloto](../pilot/PILOT-SECURITY-EXCEPTIONS.md)
- [Continuidad PLR](../pilot/PLR-CONTINUITY-SUPPORT.md)
- [Operaciones PLR](../pilot/PLR-OPERATIONS.md)
- [Modelo comercial PLR premium](../pilot/PLR-PREMIUM-COMMERCIAL.md)
- [Supervisión de transporte especial](../pilot/SPECIAL-TRANSPORT-SUPERVISION.md)
- [Recuperación: modelo operativo](../FIA-RECOVER-OPERATING-MODEL-V1.md)
- [Recuperación: playbook del piloto](../FIA-RECOVER-PILOT-PLAYBOOK-V1.md)
- [Recuperación: primer demostrador](../FIA-RECOVER-FIRST-DEMONSTRATOR-V1.md)
- [Estado del bloque Recover](../FIA-RECOVER-BLOCK-STATUS.md)
- [Inventario de preproducción](../PREPROD-CORE-INVENTORY.md)
- [Contratos de repositorio P2](../PREPROD-P2-REPOSITORY-CONTRACT.md)
- [Acceso por organización P3](../PREPROD-P3-ORG-ACCESS.md)
- [Evidencia de auditoría P4](../PREPROD-P4-AUDIT-EVIDENCE.md)
- [Gate técnico P5](../PREPROD-P5-TECHNICAL-GATE.md)
- [Observabilidad y recuperación P6](../PREPROD-P6-OBSERVABILITY-RECOVERY.md)

### H. Simulaciones y pruebas de resistencia
- [Informe consolidado de simulación](../FIA-CONSOLIDATED-SIMULATION-REPORT-V1.md)
- [Campaña adversarial sintética](../FIA-SYNTHETIC-ADVERSARIAL-CAMPAIGN-V1.md)
- [Informe de aseguramiento sintético](../FIA-SYNTHETIC-ASSURANCE-REPORT-V1.md)
- [Protocolos de fallo sintéticos](../FIA-SYNTHETIC-FAILURE-PROTOCOLS-V1.md)
- [Fraude y disputas sintéticas](../FIA-SYNTHETIC-FRAUD-DISPUTES-V1.md)
- [Ciclo de vida sintético de operación](../FIA-SYNTHETIC-OPERATION-LIFECYCLE-V1.md)
- [Resiliencia operativa sintética](../FIA-SYNTHETIC-OPERATIONAL-RESILIENCE-V1.md)
- [Ensayo sintético de piloto](../FIA-SYNTHETIC-PILOT-REHEARSAL-V1.md)

### I. Transporte y verticales
- [Requisitos de transporte animal](../transport/ANIMAL-TRANSPORT-REQUIREMENTS.md)
- [Perfiles de transporte animal](../transport/ANIMAL-PROFILES-PREP.md)
- [Revisión legal de transporte](../transport/LEGAL-CHECK.md)
- [Roles del servicio de transporte](../transport/SERVICE-ROLE.md)
- [Supervisión de transporte especial](../pilot/SPECIAL-TRANSPORT-SUPERVISION.md)

### J. Proveedores, integraciones y ecosistema
- [Arquitectura de proveedores R](../architecture/PROVIDERS-R.md)
- [Lista corta de proveedores](../PROVIDER-SHORTLIST-V1.md)
- [Evaluación de seguridad dual](../SECURITY-DUAL-VENDOR-V1.md)
- [Arquitectura de ecosistema de integraciones](../../config/integration-ecosystem.json)
- [Preparación de integraciones](../../config/integration-readiness.json)
- [Arquitectura de proveedores](../../config/provider-architecture.json)
- [Evaluación de proveedores](../../config/provider-evaluation.json)
- [Adaptadores de transportista preparados](../../config/carrier-adapter-prep.json)

### K. Financiación e inversión
- [Resumen para inversores](../INVESTOR-ONE-PAGER.md)
- [Esquema del pitch](../INVESTOR-PITCH-OUTLINE.md)
- [Gate de preparación para inversión](../INVESTOR-READY-GATE.md)
- [Hoja de ruta de financiación 18 meses](../FUNDING-ROADMAP-18M.md)
- [Lista corta de financiación](../FUNDING-SHORTLIST-V1.md)
- [Estrategia de reserva de equity](../EQUITY-RESERVE-STRATEGY.md)
- [Data room](../DATA-ROOM-INDEX.md)

## 4. Código: dónde vive cada capacidad

### Interfaz y experiencia
- `frontend/index.html`: portada.
- `frontend/app-beta.html`, `frontend/beta-mobile.html`: entradas de aplicación beta.
- `frontend/operation-center.html`, `frontend/operation-center-private.html`: centro de operaciones público/privado.
- `frontend/legal-center.html`: centro legal.
- `frontend/form-models.html`: modelos y formularios.
- `frontend/integrations.html`: vista de integraciones.
- `frontend/js/`: lógica de interfaz, búsqueda, guías, permisos visuales, Supabase y adaptadores.
- `frontend/css/`: estilos; `frontend/assets/`: imágenes, iconos y recursos visuales.
- `frontend/_headers`, `frontend/robots.txt`, `frontend/sitemap.xml`, `frontend/manifest.json`, `frontend/sw.js`: publicación, indexación y PWA.

### Núcleo de negocio
| Carpeta | Responsabilidad |
|---|---|
| `core/operations/` | ciclo de operación y servicios con distintos alcances |
| `core/repositories/` | persistencia/repositorios de operación y transacción |
| `core/identity/` | control de acceso, jerarquía y sesión |
| `core/trust/` | niveles de confianza, acceso, evidencia y transacciones |
| `core/finance/` | límites de funciones financieras |
| `core/economics/` | costes, márgenes y circuitos de coste |
| `core/evidence/`, `core/proof/`, `core/audit/` | evidencias, paquetes de prueba y auditoría |
| `core/legal/`, `core/compliance/`, `core/tax/` | clasificación y controles legales/compliance |
| `core/privacy/`, `core/security/` | datos personales, retención, incidentes y kill switch |
| `core/pilot/`, `core/preprod/` | simulación, preparación y puertas de salida |
| `core/recover/`, `core/recovery/` | recuperación, acciones y copias de operación |
| `core/ai/`, `core/assistant/` | contexto autorizado y gestión de riesgos de interacción |
| `core/discovery/`, `core/search/`, `core/marketplace/` | descubrimiento, transparencia de búsqueda y acciones de mercado |
| `core/accessibility/`, `core/observability/`, `core/shadow/` | accesibilidad, telemetría y modo shadow |
| `core/data/`, `core/contracts/` | delegación de custodia de datos y contratos versionados |

### Base de datos y publicación
- `supabase/migrations/`: migraciones incrementales; revisar orden, dependencias y estado remoto antes de aplicar.
- `supabase/baseline/`: scripts de referencia inicial; no asumir que son migraciones aplicables.
- `supabase/database.types.ts`: tipos de base de datos.
- `scripts/build-pages-public.mjs`, `scripts/public-output-path.mjs`: construcción/salida pública.
- `scripts/render-supabase-public-config.mjs`: configuración pública de cliente.
- `scripts/run-*.mjs`, `scripts/run-mvp-tests.sh`: ejecución de pruebas, simulaciones y gates.
- `.github/workflows/`: automatización CI y Pages.
- `.env.example`: nombres de variables de entorno de ejemplo; nunca añadir secretos reales.

### Configuración declarativa
- `config/`: políticas, gates, perfiles, escenarios y readiness.
- Los archivos `synthetic-*.json` describen escenarios de simulación; no son datos de clientes.
- `*gate*.json`, `*policy*.json`, `*boundary*.json` definen controles declarativos; comprobar qué código los consume.
- `provider-*.json` e `integration-*.json` describen arquitectura/evaluación/preparación; no prueban integraciones activas.
- `pages-public-allowlist.txt` participa en la frontera de publicación pública.

## 5. Pruebas: cómo encontrar la verificación correcta

- `tests/`: pruebas automatizadas JavaScript y SQL.
- `tests/*postgres*.sql`, `tests/three-company-postgres-integration.sql`: validación con PostgreSQL y escenarios multiempresa.
- `tests/pages-public-private-boundary.test.mjs`: frontera de publicación.
- `tests/architecture-boundaries.test.mjs`: límites arquitectónicos.
- `tests/company-inventory-mvp.test.mjs`: inventario de compañías.
- `tests/hierarchy-scoped-operation-service.test.mjs`, `tests/hierarchy-security-access.test.mjs`: jerarquía y acceso.
- `tests/financial-boundary.test.mjs`, `tests/financial-copy-boundary.test.mjs`: límites financieros.
- `tests/security-skill-alignment.test.mjs`, `tests/pilot-negative-security-contracts.test.mjs`: controles de seguridad.
- `tests/legal-*.test.js`, `tests/*legal*.test.mjs`: gates jurídicos.
- `tests/synthetic-*.test.mjs`: campañas sintéticas.
- `tests/recover-*.test.mjs`: recuperación.
- `tests/trust-*.test.mjs`: confianza y transacciones.
- `tests/unified-app.test.js`, `tests/homepage-*.test.mjs`, `tests/mobile-visual-cohesion.test.mjs`: experiencia de usuario.

**Para cada cambio:** localizar el módulo, buscar sus imports/consumidores, localizar la prueba correspondiente, añadir caso positivo y negativo, ejecutar la prueba y la batería indicada por el proyecto.

## 6. Skills para asistentes

- [Skill principal FIA&CO](../../skills/fia-co-project/SKILL.md): modos de trabajo, invariantes y estándar de finalización.
- [Reglas operativas](../../skills/fia-co-project/references/operating-rules.md): proceso y límites del proyecto.
- [Estudio de presentación](../../skills/fia-co-project/references/presentation-study.md): criterios de presentación.
- [Skill de revisión de seguridad](../../skills/fia-co-security-review/SKILL.md): selección del modo de revisión y gates.
- [Revisión de código](../../skills/fia-co-security-review/references/code-security-review.md).
- [Secretos y permisos](../../skills/fia-co-security-review/references/secrets-permissions.md).
- [Evaluación de Skills externas](../../skills/fia-co-security-review/references/skill-vetting.md).
- [Skills maestras del asistente](FIA-CO-MASTER-SKILLS.md).
- [Índice de Skills](FIA-SKILLS-INDEX.md).

## 7. Cómo enlazar información desde el punto de vista de una IA

Para cualquier tarea, construir esta cadena antes de actuar:

1. **Objetivo de negocio:** qué resultado necesita el usuario y qué parte del flujo afecta.
2. **Regla o especificación:** localizar el documento de producto/legal/seguridad que fija el requisito.
3. **Interfaz:** encontrar la pantalla o el punto de entrada en `frontend/`.
4. **Implementación:** seguir imports y llamadas hasta `core/`, adaptadores o Supabase.
5. **Configuración:** identificar los JSON/políticas que gobiernan el comportamiento y comprobar si el código los consume.
6. **Persistencia:** revisar tablas, RLS, funciones y migraciones en `supabase/`.
7. **Verificación:** localizar pruebas correspondientes en `tests/` y workflows en `.github/workflows/`.
8. **Estado de entrega:** verificar rama, commit, PR, CI y entorno; actualizar [traspaso](PROJECT-HANDOFF.md) y [registro de trabajo](WORK-REGISTER.md).

No asumir que dos archivos están relacionados por tener nombres parecidos. Confirmar relación mediante imports, referencias, llamadas, migraciones o pruebas.

## 8. Qué significa cada estado

- **Implementado:** código presente; aún debe probarse.
- **Probado local/CI:** pruebas pasadas en el entorno indicado y commit identificado.
- **Integrado en rama:** cambio incluido en una rama/PR concreta; no significa producción.
- **Publicado:** desplegado en el entorno especificado y comprobado.
- **Operativo real:** validado con dependencias y usuarios reales bajo condiciones controladas.
- **Propuesto:** diseño o intención todavía no implementada.

## 9. Conservación y organización física

- La estructura actual se mantiene para evitar romper rutas e imports.
- Primero se mejoran índices y enlaces; mover archivos solo después de auditar referencias y dependencias.
- Conservar contratos de compraventa, plantillas, documentos legales, modelos comerciales, estrategias y funciones con valor futuro.
- Los documentos históricos no se sobrescriben para ocultar versiones anteriores; se enlazan y se señala cuál es la fuente vigente.
- No convertir un documento antiguo en verdad actual sin comprobar código, pruebas y estado del entorno.

## 10. Mantenimiento del mapa

Actualizar este documento solo cuando cambien rutas, módulos principales o relaciones entre áreas. Para el trabajo ordinario, actualizar el traspaso y el registro de tareas; no generar burocracia documental innecesaria.
