# FIA&CO

Plataforma B2B para coordinar y dejar evidencia de operaciones entre empresas (vendedor, comprador y transportista), con control de permisos, seguimiento, entregas, incidencias, documentos y gestión económica por operación.

## Punto de entrada obligatorio para personas e IAs

1. Lee [el estado y traspaso de trabajo vigente](docs/assistant/PROJECT-HANDOFF.md).
2. Consulta el [catálogo documental](docs/assistant/DOCUMENTATION-CATALOG.md), el [registro de decisiones](docs/assistant/DECISION-LOG.md) y el [registro de trabajo](docs/assistant/WORK-REGISTER.md).
3. Lee [las reglas maestras del proyecto](skills/fia-co-project/SKILL.md) y, antes de tocar código, [las reglas de operación](skills/fia-co-project/references/operating-rules.md).
4. Para cambios de seguridad, lee también [la Skill de revisión de seguridad](skills/fia-co-security-review/SKILL.md).
5. Consulta la documentación especializada del área afectada; no supongas que un plan está implementado.
5. Antes de modificar, verifica la rama, el commit, los archivos reales y las pruebas actuales.

## Mapa de documentación

| Área | Ubicación de referencia |
|---|---|
| Estado actual, ramas, PR, CI y próximos pasos | [docs/assistant/PROJECT-HANDOFF.md](docs/assistant/PROJECT-HANDOFF.md) |
| Catálogo y jerarquía documental | [docs/assistant/DOCUMENTATION-CATALOG.md](docs/assistant/DOCUMENTATION-CATALOG.md) |
| Decisiones duraderas | [docs/assistant/DECISION-LOG.md](docs/assistant/DECISION-LOG.md) |
| Cola de tareas | [docs/assistant/WORK-REGISTER.md](docs/assistant/WORK-REGISTER.md) |
| Instrucciones maestras para asistentes | [docs/assistant/FIA-CO-MASTER-SKILLS.md](docs/assistant/FIA-CO-MASTER-SKILLS.md) |
| Índice de Skills y fuentes | [docs/assistant/FIA-SKILLS-INDEX.md](docs/assistant/FIA-SKILLS-INDEX.md) |
| Arquitectura y límites público/privado | [docs/FIA-CO-ARCHITECTURE-BOUNDARIES.md](docs/FIA-CO-ARCHITECTURE-BOUNDARIES.md) |
| Matriz histórica de consolidación | [docs/FIA-CO-CONSOLIDATION-MATRIX.md](docs/FIA-CO-CONSOLIDATION-MATRIX.md) |
| Modelo operativo y motor | [docs/OPERATION-ENGINE.md](docs/OPERATION-ENGINE.md), [docs/COMMERCIAL-OPS-V1.md](docs/COMMERCIAL-OPS-V1.md) |
| Piloto y pruebas | [docs/PILOT-PLAYBOOK.md](docs/PILOT-PLAYBOOK.md), [docs/pilot/](docs/pilot/) |
| Seguridad y privacidad | [docs/SECURITY-OPERATING-BASELINE.md](docs/SECURITY-OPERATING-BASELINE.md), [docs/security/](docs/security/), [docs/legal/](docs/legal/) |
| Compraventas y marco jurídico | [docs/legal/compraventa-particulares-vehiculos.md](docs/legal/compraventa-particulares-vehiculos.md), [docs/legal/](docs/legal/) |
| Transporte y requisitos | [docs/transport/](docs/transport/) |
| Finanzas, costes y precios | [docs/FINANCIAL-MODEL-36M.md](docs/FINANCIAL-MODEL-36M.md), [docs/PRICING-PILOT-VALIDATION.md](docs/PRICING-PILOT-VALIDATION.md), [docs/](docs/) |
| Comercial e inversores | [docs/COMMERCIAL-KIT.md](docs/COMMERCIAL-KIT.md), [docs/INVESTOR-ONE-PAGER.md](docs/INVESTOR-ONE-PAGER.md) |

## Reglas de conservación

- No borrar contratos, plantillas de compraventa, documentación legal, modelos comerciales, estrategias, funciones útiles ni ideas de valor futuro por no estar activas hoy.
- Clasificar antes de retirar: esencial, valor futuro, duplicado demostrado, obsoleto demostrado o pendiente de validar.
- No mover ni renombrar documentos en bloque. Primero crear índices y relaciones; cualquier reorganización física exige comprobar enlaces y referencias.
- No duplicar reglas de negocio: enlazar la fuente vigente y señalar explícitamente los documentos históricos.
- Nunca convertir una propuesta o simulación en una capacidad LIVE sin pruebas.

## Reglas de cambio

- Trabajar en la rama autorizada; no modificar `main`, producción o Supabase remoto sin autorización específica.
- No desplegar, fusionar, borrar ramas, contratar servicios ni activar costes sin autorización expresa.
- Cambios pequeños, reversibles y con pruebas positivas y negativas.
- Al terminar cada bloque de trabajo, actualizar el estado de traspaso con commit, archivos, pruebas, resultado y pendientes.
- Si dos documentos discrepan, no elegir uno silenciosamente: registrar el conflicto y verificar cuál refleja el código y la configuración actuales.

El README es un índice, no una certificación técnica. El estado verificable más reciente está en el documento de traspaso y en las evidencias enlazadas desde él.
