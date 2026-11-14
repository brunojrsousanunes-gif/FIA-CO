# FIA&CO — estado de trabajo y traspaso entre IAs

**Última verificación:** 14-11-2026  
**Repositorio:** `brunojrsousanunes-gif/FIA-CO`  
**Rama activa autorizada para integración:** `integration/fia-co-verified-snapshot-2026-11-14`  
**HEAD verificado:** `cbe7a174360e72608286dab0ebaac849af67369b`  
**PR de integración:** [#185](https://github.com/brunojrsousanunes-gif/FIA-CO/pull/185) — abierta, borrador, base `main`.  
**SHA de `main` verificado:** `63ec6df05fb5a24fa12a83de5989b617bae3a22d`.

> Este documento es el punto de traspaso operativo. Una IA que retome el trabajo debe leerlo primero, comprobar que el HEAD sigue vigente y actualizarlo cuando cierre un bloque. No confiar únicamente en el historial de conversación.

## 1. Objetivo del producto

FIA&CO es una plataforma B2B de coordinación y evidencia de operaciones entre empresas. Flujo de referencia: vendedor → transportista → comprador; acuerdo → preparación → seguimiento → entrega → incidencia (si existe) → revisión → cierre.

El producto gestiona operaciones y sus confirmaciones, evidencias, responsabilidades, costes y trazabilidad. No debe describirse como entidad financiera, prestamista, custodio o garante de dinero. Los pagos reales y proveedores regulados no se consideran disponibles hasta que exista integración y revisión legal demostrable.

## 2. Situación comprobada en este corte

### Repositorio y cambios
- La rama de trabajo es `integration/fia-co-verified-snapshot-2026-11-14`.
- La PR #185 permanece abierta como borrador; no se ha fusionado con `main`.
- En este corte, #185 tiene HEAD `cbe7a174360e72608286dab0ebaac849af67369b`.
- La PR #171 se cerró sin fusionar después de integrar selectivamente su trabajo útil en #185. Su rama `fix/security-skill-alignment-2026-10-15` se comprobó todavía existente; no eliminarla.
- #171 no debe confundirse con #185: la primera está cerrada sin merge; la segunda es la rama consolidada de integración.

### CI
- Workflow run [43601293253](https://github.com/brunojrsousanunes-gif/FIA-CO/actions/runs/43601293253): **success**.
- Jobs PostgreSQL 16 y PostgreSQL 17.6 completados con éxito.
- Pasaron sintaxis JavaScript, contrato de publicación Pages, batería automatizada MVP y cadena completa de migraciones/prueba de inventario en bases de CI.
- Esto valida el código y las migraciones en los entornos de CI; no prueba el runtime desplegado ni el comportamiento con tres empresas reales.

### Alcance de los últimos cambios de seguridad
- El módulo heredado `frontend/js/unified-app.js` usa `sessionStorage` para su estado de demo, en lugar de `localStorage`.
- Se añadieron aserciones de seguridad en `tests/unified-app.test.js` y `tests/security-skill-alignment.test.mjs`.
- El nuevo test de alineación está incluido en `scripts/run-mvp-tests.sh`.
- `config/security-prepilot.json` deja claro que describe una política DEMO_ONLY/prepiloto y no certifica el runtime desplegado.
- Las reglas operativas aclaran que el almacenamiento del navegador no es autorización ni registro oficial.
- Se añadió `docs/security-review-2026-11-14.md` con alcance, cambios y bloqueos del prepiloto.

## 3. Límites y acciones que NO se han realizado

- No se ha fusionado #185 en `main`.
- No se ha desplegado deliberadamente a producción desde esta actuación.
- No se ha modificado Supabase remoto ni aplicado migraciones al proyecto alojado.
- No se han eliminado contratos, documentación legal, modelos de negocio ni funciones de valor futuro.
- No se ha borrado la rama de #171.
- No se ha verificado un piloto real con tres cuentas y tres organizaciones independientes.
- El éxito de CI no constituye certificación de seguridad ni autorización para datos reales o dinero real.

## 4. Arquitectura documental y fuentes de referencia

| Tema | Fuente que debe consultarse |
|---|---|
| Reglas generales del proyecto | `skills/fia-co-project/SKILL.md` |
| Operación, seguridad, pruebas y cambios | `skills/fia-co-project/references/operating-rules.md` |
| Revisión de seguridad | `skills/fia-co-security-review/SKILL.md` y sus referencias |
| Arquitectura y frontera público/privado | `docs/FIA-CO-ARCHITECTURE-BOUNDARIES.md` |
| Estado de seguridad de esta revisión | `docs/security-review-2026-11-14.md` |
| Skills e índice de recuperación | `docs/assistant/FIA-CO-MASTER-SKILLS.md`, `docs/assistant/FIA-SKILLS-INDEX.md` |
| Contratos y documentación de compraventa | `docs/legal/compraventa-particulares-vehiculos.md` y resto de `docs/legal/` |
| Modelo operativo, comercial y logística | `docs/OPERATION-ENGINE.md`, `docs/COMMERCIAL-OPS-V1.md`, `docs/pilot/`, `docs/transport/` |
| Costes y modelo financiero | `docs/FINANCIAL-MODEL-36M.md`, `docs/PRICING-PILOT-VALIDATION.md`, `docs/investor-lean-cost-model` si existe en la rama |
| Estrategia comercial y verticales futuras | `docs/COMMERCIAL-KIT.md`, `docs/ANCHOR-NETWORK-MAP.md` si existe en la rama |

### Advertencia sobre documentos históricos
`docs/FIA-CO-CONSOLIDATION-MATRIX.md` contiene referencias a la línea #184 y a un corte anterior. Es útil como evidencia histórica, pero no debe utilizarse como estado actual sin reconciliar sus referencias con #185. No sobrescribir su historia: preparar una actualización trazable cuando se audite su contenido completo.

## 5. Clasificación obligatoria del conocimiento

Antes de cambiar o retirar cualquier archivo, clasificarlo como:

1. **NÚCLEO ACTUAL:** necesario para producto, seguridad, operación o pruebas.
2. **VALOR FUTURO:** contratos, plantillas, modelos de negocio, verticales, estrategias, documentación jurídica o capacidades que pueden generar ingresos después. Conservar aunque no se implementen ahora.
3. **REFERENCIA HISTÓRICA:** decisiones o versiones anteriores que explican cómo se llegó al estado actual. Conservar y etiquetar como histórico.
4. **DUPLICADO CONFIRMADO:** solo si se demuestra que no aporta cláusulas, requisitos, código, decisiones o referencias únicas. No borrar hasta conservar y enlazar cualquier diferencia útil.
5. **OBSOLETO CONFIRMADO:** solo si el código, las pruebas y las dependencias demuestran que ya no se usa y no conserva valor contractual, legal, comercial o histórico.
6. **PENDIENTE DE VALIDAR:** no modificar ni eliminar hasta investigar.

La ausencia de implementación no significa falta de valor. En particular, no eliminar documentos de compraventa ni contratos por estar fuera del MVP.

## 6. Procedimiento obligatorio para cualquier IA que continúe

1. Leer este documento y el README.
2. Verificar rama actual, HEAD, estado de PR y último CI.
3. Inspeccionar los archivos afectados y sus referencias antes de editar.
4. Revisar dependencias, duplicidades, seguridad, coste y efectos secundarios.
5. Separar hechos comprobados, hipótesis, pendientes y no verificables.
6. Proponer el cambio mínimo y reversible; no tocar producción ni `main` sin autorización.
7. Añadir pruebas que reproduzcan el problema y cubran el caso negativo.
8. Ejecutar las pruebas disponibles y comprobar su resultado real.
9. Actualizar este documento al cerrar un bloque: fecha, SHA, archivos, decisión, pruebas, resultado y pendientes.
10. Informar qué cambió y qué no cambió. No afirmar despliegue, integración real o finalización sin evidencia.

## 7. Próximas tareas conocidas

| Prioridad | Tarea | Estado |
|---|---|---|
| 1 | Auditar PR #184 frente a #185 y actualizar la matriz sin perder su historial | Pendiente |
| 2 | Revisar #127 y su protección del historial de búsquedas sensibles | Pendiente de inspección completa |
| 3 | Auditar documentos/PR de valor comercial y legal, conservándolos | Pendiente |
| 4 | Verificar tres cuentas/organizaciones reales en entorno de prueba separado, con datos sintéticos | Pendiente |
| 5 | Comprobar el estado remoto de Supabase mediante lectura antes de proponer cualquier migración | Pendiente |

## 8. Registro de cambios de este documento

- **14-11-2026:** creado como punto único de traspaso para asistentes. Resume el estado verificado de #185, CI run 43601293253 y la integración selectiva de seguridad procedente de #171. No modifica ni sustituye los documentos históricos o jurídicos.
