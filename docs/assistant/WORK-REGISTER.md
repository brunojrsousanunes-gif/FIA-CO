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
| W-007 | Alta antes de piloto real | Revisar Supabase remoto en modo lectura y planificar cualquier migración por separado | PENDIENTE | Comparación de esquema y migraciones; plan reversible; autorización específica antes de escribir |
| W-008 | Media | Verificar la arquitectura de recuperación y distinguir módulos demo de capacidades integradas | PENDIENTE | Mapa de imports, llamadas reales, pruebas y límites de producto documentados |
| W-009 | Media | Crear navegación maestra y comprobar enlaces de continuidad documental | VERIFICADO | README, mapa maestro, catálogo, traspaso y registros revisados; 98 documentos Markdown de docs y 135 enlaces del mapa comprobados contra el árbol; cero documentos sin clasificar y cero enlaces rotos |
| W-010 | Alta | Reconciliar espacios empresariales, departamentos, roles y permisos configurables con la estructura existente | EN REVISIÓN | Inventario de tablas, RLS, funciones, consumidores y pruebas; reutilizar organizaciones y pertenencias existentes; no crear duplicidades |
| W-011 | Alta | Diseñar el circuito humano obligatorio entre asistentes FIA&CO y la IA Maestra | PENDIENTE | Probar que no existe canal IA-a-IA; envío iniciado por personal FIA&CO autenticado, con selección mínima, autorización y auditoría |
| W-012 | Alta | Diseñar y reconciliar acceso Premium de responsables desde dispositivos seguros a FIA&CO/IA Maestra | EN REVISIÓN | Auditar Auth, sesiones, permisos, derecho Premium, registro/revocación de dispositivos, transporte cifrado y pasarela humana; pruebas negativas con dispositivos sintéticos |

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
