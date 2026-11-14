# FIA&CO — traspaso operativo entre asistentes

**Corte:** 14-11-2026.  
**Repositorio:** `brunojrsousanunes-gif/FIA-CO`.  
**Rama de integración:** `integration/fia-co-verified-snapshot-2026-11-14`.  
**PR:** [#185](https://github.com/brunojrsousanunes-gif/FIA-CO/pull/185), abierta como borrador y con base `main`.  
**Importante:** al abrir este documento, consulta GitHub para obtener el HEAD actual. No uses un SHA histórico como si fuera el HEAD vigente.

## 1. Empieza aquí

1. [Mapa maestro](PROJECT-MAP.md): localización de documentación, módulos, base de datos, pruebas y relaciones.
2. [Catálogo documental](DOCUMENTATION-CATALOG.md): jerarquía de fuentes y cómo resolver discrepancias.
3. [README](../../README.md): entrada general del repositorio.
4. [Skill principal](../../skills/fia-co-project/SKILL.md) y [reglas operativas](../../skills/fia-co-project/references/operating-rules.md).
5. [Skill de seguridad](../../skills/fia-co-security-review/SKILL.md) si el cambio afecta seguridad, permisos, privacidad, secretos o integraciones.
6. [Registro de trabajo](WORK-REGISTER.md): tareas, dependencias y condiciones de cierre.

El [registro de decisiones](DECISION-LOG.md) es solo una referencia interna opcional del asistente para recordar límites duraderos. El usuario no tiene que mantenerlo ni consultarlo.

## 2. Objetivo del producto

FIA&CO es una plataforma B2B para coordinar y dejar evidencia de operaciones entre empresas: vendedor, transportista y comprador. Flujo de referencia: acuerdo → preparación → seguimiento → entrega → incidencia (si existe) → revisión → cierre.

El producto gestiona estados, confirmaciones, evidencias, responsabilidades, costes y trazabilidad. No describir FIA&CO como prestamista, entidad financiera, custodio o garante de dinero. Pagos reales y proveedores regulados solo se consideran disponibles cuando exista integración, controles y revisión legal verificables.

## 3. Estado técnico comprobado en el corte

### Repositorio
- La rama de integración corresponde a la PR #185.
- #185 sigue abierta como borrador; no está fusionada.
- `main` se comprobó en SHA `63ec6df05fb5a24fa12a83de5989b617bae3a22d`; verificarlo de nuevo antes de actuar.
- La PR #171 se cerró sin fusionar después de incorporar selectivamente mejoras de seguridad a #185. Su rama se conservó en la última comprobación; no borrarla sin autorización.
- La PR #184 todavía requiere comparación con #185. No cerrarla hasta inspeccionar contenido exclusivo y presentar resultado.

### CI de aplicación
- Workflow más reciente verificado: [43602202278](https://github.com/brunojrsousanunes-gif/FIA-CO/actions/runs/43602202278), completado con éxito en el commit `7a923d713a1f2d8cf6f4ae54fd5deae8910573d3`.
- Jobs PostgreSQL 16 y PostgreSQL 17.6: ambos success. Pasaron sintaxis JS, contrato público Pages, batería automatizada y cadena completa de migraciones/prueba de inventario en CI.
- Workflow anterior [43601816440](https://github.com/brunojrsousanunes-gif/FIA-CO/actions/runs/43601816440) también completó con éxito en ambos motores.
- Workflow anterior [43601293253](https://github.com/brunojrsousanunes-gif/FIA-CO/actions/runs/43601293253) también pasó en PostgreSQL 16 y 17.6 para la validación de seguridad de #185.
- No presentar esas pruebas como CI del último SHA si no se ha ejecutado sobre él. Consultar los checks de la PR y el commit actual.

### Vista previa Cloudflare
- La integración de Cloudflare generó automáticamente una vista previa de rama para #185 y devolvió check `Cloudflare Pages: success` en el commit `7a923d713a1f2d8cf6f4ae54fd5deae8910573d3`. La URL de vista previa de rama comunicada por el check fue [integration-fia-co-verified.fia-co.pages.dev](https://integration-fia-co-verified.fia-co.pages.dev).
- Esto es una vista previa de rama, no una fusión a `main` ni una publicación deliberada de producción.
- No se cambió el plan ni se contrató un servicio desde esta actuación. No hay acceso a facturación para certificar el coste exacto de la vista previa.

### Cambios de seguridad ya integrados selectivamente
- El estado heredado de demo en `frontend/js/unified-app.js` pasó a `sessionStorage`, con clave de sesión, en vez de persistencia `localStorage`.
- Se añadieron pruebas para almacenamiento y contrato de seguridad.
- `config/security-prepilot.json` distingue política de prepiloto y runtime no verificado.
- Se documentó que el log en memoria es demo/test, no auditoría productiva persistente.
- `tests/security-skill-alignment.test.mjs` se incluye en `scripts/run-mvp-tests.sh`.
- Revisión: [security-review-2026-11-14.md](../security-review-2026-11-14.md).

## 4. Límites confirmados

- No fusionar #185 a `main` sin autorización expresa.
- No aplicar migraciones ni cambiar datos de Supabase remoto sin autorización específica.
- No borrar contratos de compraventa, documentos legales, modelos comerciales, estrategias o funciones con valor futuro.
- No borrar ramas o cerrar PRs que puedan contener mejoras exclusivas sin comparar antes.
- No confundir demo, simulación, pruebas CI y funcionamiento real.
- No afirmar que el piloto con tres empresas reales está validado: esa prueba sigue pendiente.
- La separación financiera documentada en #185 es por organización titular de la operación; no describirla como tres contabilidades independientes.

## 5. Relación entre áreas

Para cualquier tarea, seguir el mapa:
- Producto y requisitos: documentos especializados de `docs/`.
- Interfaz: `frontend/`.
- Lógica de negocio: `core/`.
- Configuración: `config/`.
- Persistencia y seguridad de datos: `supabase/`.
- Verificación: `tests/` y `.github/workflows/`.
- Reglas de trabajo: `skills/`.

El [mapa maestro](PROJECT-MAP.md) contiene rutas y enlaces detallados. No deducir que una función está activa solo porque exista una pantalla, archivo de configuración o documento.

## 6. Próximos trabajos conocidos

Consultar siempre el [registro de trabajo](WORK-REGISTER.md), que es la cola operativa. En el corte actual destacan:
1. Comparar #184 frente a #185 y preservar cualquier contenido útil exclusivo.
2. Verificar el flujo con tres identidades y organizaciones independientes en entorno de prueba.
3. Revisar PR #127 y su protección de búsquedas/memoria sensibles.
4. Catalogar documentos legales y activos comerciales sin eliminarlos.
5. Reconciliar la matriz histórica de consolidación con el estado real de #185.
6. Revisar Supabase remoto en modo lectura antes de proponer cualquier migración.

## 7. Método de continuación

1. Consultar el HEAD real de la rama y el estado de #185.
2. Leer mapa y reglas de la Skill.
3. Inspeccionar código, configuración, pruebas y referencias de la tarea.
4. Identificar dependencias, duplicidades, riesgos, costes y alcance autorizado.
5. Hacer el cambio mínimo y reversible.
6. Ejecutar pruebas en el commit resultante y revisar los checks exactos.
7. Actualizar este traspaso y el registro de trabajo solo con resultados comprobados.
8. Informar claramente qué se cambió y qué no.

No se declara terminado un bloque solo porque exista un commit. Debe existir evidencia de la comprobación correspondiente.
