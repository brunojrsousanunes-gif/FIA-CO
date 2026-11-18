# FIA&CO — registro de trabajo

**Corte inicial:** 2026-11-14.  
Este registro es la cola de trabajo compartida. Verificar cada estado contra GitHub, CI, código y entorno antes de actuar.

## Estados permitidos

- **PENDIENTE:** todavía no iniciado.
- **EN REVISIÓN:** recopilando evidencia, sin cambios destructivos.
- **EN CURSO:** trabajo autorizado en ejecución.
- **BLOQUEADO:** falta una decisión, acceso o requisito imprescindible.
- **VERIFICADO:** resultado comprobado con evidencia identificada.
- **APLAZADO:** decisión consciente de no priorizar ahora.
- **CERRADO:** trabajo terminado y verificado; incluir evidencia.

No marcar como VERIFICADO por haber editado un archivo o creado un commit.

## Cola de trabajo

| ID | Prioridad | Trabajo | Estado al corte | Condición para cerrar |
|---|---|---|---|---|
| W-001 | Alta | Comparar PR #184 con #185 y detectar contenido exclusivo útil | PENDIENTE | Comparación de commits y archivos; clasificación y decisión presentada antes de cerrar/retirar nada |
| W-002 | Alta | Verificar CI de los cambios de seguridad y aislamiento multiempresa integrados en #185 | VERIFICADO | Run 43602202278 completado con éxito en PostgreSQL 16 y 17.6 para el commit 7a923d713a1f2d8cf6f4ae54fd5deae8910573d3; incluye la batería automática y la cadena completa de migraciones/prueba de inventario en CI; no ejecutó migraciones en Supabase remoto |
| W-003 | Alta | Probar el flujo con tres identidades y organizaciones separadas | PENDIENTE | Evidencia de pruebas aisladas, datos sintéticos, permisos permitidos y denegaciones |
| W-004 | Media | Revisar PR #127 y protección de búsquedas/memoria sensibles | PENDIENTE | Inspección de diff, dependencias, pruebas y valor exclusivo; conservar lo útil |
| W-005 | Media | Auditar documentos legales, contratos y activos comerciales para catalogarlos | PENDIENTE | Inventario con estado y referencias; ninguna eliminación por defecto |
| W-006 | Media | Reconciliar la matriz de consolidación histórica con #185 | PENDIENTE | Actualización trazable que preserve el historial de #184 y refleje el estado actual |
| W-007 | Alta antes de piloto real | Revisar Supabase remoto en modo lectura y planificar cualquier migración por separado | EN REVISIÓN | Inventario remoto realizado en solo lectura; divergencia con PR #192 y riesgo de revocación documentados; reconciliar datos, esquema y orden de migraciones antes de proponer un plan reversible; autorización específica antes de escribir |
| W-008 | Media | Verificar la arquitectura de recuperación y distinguir módulos demo de capacidades integradas | PENDIENTE | Mapa de imports, llamadas reales, pruebas y límites de producto documentados |
| W-009 | Media | Crear navegación maestra y comprobar enlaces de continuidad documental | VERIFICADO | README, mapa maestro, catálogo, traspaso y registros revisados; 98 documentos Markdown de docs y 135 enlaces del mapa comprobados contra el árbol; cero documentos sin clasificar y cero enlaces rotos |
| W-010 | Alta | Reconciliar espacios empresariales, departamentos, roles y permisos configurables con la estructura existente | EN REVISIÓN | Inventario de tablas, RLS, funciones, consumidores y pruebas; reutilizar organizaciones y pertenencias existentes; no crear duplicidades |
| W-011 | Alta | Diseñar el circuito humano obligatorio entre asistentes FIA&CO y la IA Maestra | PENDIENTE | Probar que no existe canal IA-a-IA; envío iniciado por personal FIA&CO autenticado, con selección mínima, autorización y auditoría |
| W-012 | Alta | Diseñar y reconciliar acceso Premium de responsables desde dispositivos seguros a FIA&CO/IA Maestra | EN REVISIÓN | Auditar Auth, sesiones, permisos, derecho Premium, registro/revocación de dispositivos, transporte cifrado y pasarela humana; pruebas negativas con dispositivos sintéticos. El Centro de Alta y Seguridad de Dispositivos queda APLAZADO hasta estructurar la seguridad de la IA Maestra; no implementarlo ahora |
| W-013 | Alta | Diseñar la propuesta Premium basada en seguridad demostrable, automatización y ROI | EN REVISIÓN | Definir panel de confianza, catálogo y límites de automatización, línea base, fórmulas ROI y costes completos; validar con piloto sin promesas ni precios inventados |
| W-014 | Crítica antes de piloto con datos reales | Reconciliar las migraciones de seguridad de PR #192 con Supabase remoto y cerrar brechas de autorización/privilegios | EN REVISIÓN | Revisión remota read-only del 18-11 confirma bypass del creador en `can_access_operation`/`can_manage_operation`, `search_path` no vacío en nueve helpers SECURITY DEFINER privados, política UPDATE de borradores sin pertenencia activa en USING, SELECT heredado de amount_cents/currency y grants INSERT/UPDATE en organizations/organization_members y privilegios por defecto abiertos para nuevas funciones/tablas/secuencias públicas. Las diez migraciones PR #192 siguen pendientes; CI #727 y #780 pasaron en PostgreSQL 16/17.6 efímero para commits distintos, sin aplicar cambios al remoto. Correspondencia nominal de las 22 migraciones aplicadas mapeada contra 22/32 archivos locales; 10 versiones remotas difieren del prefijo local. Falta validar efectos SQL reales, backup/restauración y pruebas aisladas. Detalle en `docs/SUPABASE-MIGRATION-PLAN-2026-11-18.md`. No aplicar cambios remotos sin autorización específica |

| W-015 | Alta antes de futuras pruebas integradas | Mantener identidades y escenarios sintéticos versionados fuera de Supabase remoto | EN REVISIÓN | Fixture JSON y catálogo documental creados en PR #194; validar contra contratos/código existentes, incorporar a pruebas PostgreSQL aisladas y no sembrar producción |

| W-016 | Retirada segura de registros sintéticos heredados en Supabase | Eliminar empresas/operaciones sintéticas y dependencias; preservar cuenta restante y retirar la secundaria autorizada | VERIFICADO | 6 organizaciones, 3 operaciones y dependencias eliminadas en transacción; postconsulta confirmó cero filas relacionadas. Después se eliminó por autorización expresa la cuenta secundaria Pepitogrillo y se verificó Auth user 0, identity 0, sessions 0, refresh tokens 0; queda una cuenta Auth preservada. No se ha probado restauración de backup. Evidencia: `docs/testing/SUPABASE-SYNTHETIC-DATA-CLEANUP-STATUS-2026-11-18.md`, run_id `3fdc8e44-dafd-448c-b301-9a1cbf4e9854` |

| W-017 | Media-baja | Corregir el cierre de sesión y confirmar la revocación remota desde el Centro de Operaciones | EN REVISIÓN | Código actualizado en PR #192: el cliente común llama a Auth logout, la sesión local se limpia inmediatamente y la respuesta remota se informa; timeout de 10 s. CI #780 pasó en PostgreSQL 16 y 17.6 para HEAD `0962ba6102ce341ef323d3c7a886d8ef82cbe000`. Pendiente prueba runtime de revocación de refresh token con cuenta sintética en entorno aislado; no desplegado. Evidencia en `docs/SECURITY-AUDIT-SUPABASE-2026-11-18.md`, F-04 |

| W-018 | Baja / defensa en profundidad | Activar RLS en el registro interno `private.synthetic_cleanup_runs` sin abrir acceso cliente | EN REVISIÓN | Asesor Supabase alerta RLS desactivado. Comprobación directa confirma cero grants SELECT/INSERT/UPDATE/DELETE a anon/authenticated/service_role y anon sin USAGE en private; no se observa acceso cliente actual. Script de mantenimiento y test estático actualizados en PR #194 para activar RLS sin políticas. Tabla remota NO modificada; requiere autorización específica para ejecutar `ALTER TABLE private.synthetic_cleanup_runs ENABLE ROW LEVEL SECURITY`. Evidencia: F-11 del informe de seguridad y sección 9 del estado de limpieza |

## Reglas de ejecución

1. Resolver primero tareas de alta prioridad y dependencias.
2. Antes de cada tarea, comprobar que no se haya completado ya por otro commit o PR.
3. Identificar qué se conserva, qué se modifica y qué no se toca.
4. No abrir tareas de pago si existe una alternativa segura sin coste.
5. No hacer varias acciones de riesgo en una sola autorización ambigua.
6. Para cambios destructivos, presentar antes el identificador de PR/archivo y un resumen de una frase; esperar autorización individual.
7. Al cerrar una tarea, registrar commit SHA, PR, archivos, pruebas y resultado.
8. Si falla una prueba, investigar causa raíz y dejar constancia del fallo y su corrección.
9. Si la tarea se aplaza, conservar su contexto y motivo; no borrar su documentación.

## Plantilla de tarea

```markdown
### W-XXX — Título

- Prioridad:
- Estado:
- Objetivo:
- Alcance autorizado:
- No tocar:
- Dependencias:
- Evidencia inicial:
- Cambios realizados:
- Pruebas y resultado:
- Commit / PR:
- Riesgos residuales:
- Siguiente paso:
```
