# FIA&CO

Plataforma B2B para coordinar y dejar evidencia de operaciones entre empresas (vendedor, comprador y transportista), con control de permisos, seguimiento, entregas, incidencias, documentos y gestión económica por operación.

## Por dónde empezar

1. [Mapa maestro del proyecto](docs/assistant/PROJECT-MAP.md): dónde está cada materia y cómo se relaciona.
2. [Estado y traspaso de trabajo](docs/assistant/PROJECT-HANDOFF.md): rama, PR, CI, hechos verificados y próximos pasos.
3. [Catálogo documental](docs/assistant/DOCUMENTATION-CATALOG.md): jerarquía y selección de fuentes.
4. [Reglas del proyecto](skills/fia-co-project/SKILL.md) y [reglas operativas](skills/fia-co-project/references/operating-rules.md).
5. Para cambios de seguridad, [Skill de revisión de seguridad](skills/fia-co-security-review/SKILL.md).

## Estructura principal

| Carpeta | Qué contiene |
|---|---|
| `frontend/` | Portada, aplicación, centro de operaciones, estilos, recursos y lógica de interfaz |
| `core/` | Lógica de negocio, identidad, permisos, operaciones, finanzas, evidencias, seguridad y recuperación |
| `supabase/` | Migraciones, baseline y tipos de base de datos |
| `config/` | Políticas, límites, perfiles y escenarios declarativos |
| `tests/` | Pruebas unitarias, contratos, seguridad e integración SQL |
| `scripts/` | Construcción, validaciones y ejecución de pruebas/campañas |
| `docs/` | Especificaciones de producto, arquitectura, legal, comercial, finanzas y piloto |
| `skills/` | Instrucciones versionadas para asistentes y revisión de seguridad |

## Reglas de conservación y seguridad

- No borrar contratos, plantillas de compraventa, documentación legal, modelos comerciales, estrategias ni funciones útiles para el futuro.
- Clasificar antes de retirar: núcleo actual, valor futuro, histórico, duplicado demostrado, obsoleto demostrado o pendiente de validar.
- No mover ni renombrar documentos en bloque: primero revisar enlaces, imports, pruebas y referencias.
- No presentar una propuesta, demo o simulación como capacidad operativa real.
- No modificar `main`, producción o Supabase remoto, ni desplegar, fusionar, borrar ramas o generar costes sin autorización expresa.
- Actualizar el traspaso con commit, archivos, pruebas y resultado después de cada bloque relevante.

El mapa es una guía de navegación, no una certificación. Verificar siempre rama, SHA, código, pruebas y entorno.
