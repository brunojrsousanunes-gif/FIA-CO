# FIA&CO — matriz de consolidación técnica

**Corte de auditoría:** 2026-11-14  
**Repositorio:** `brunojrsousanunes-gif/FIA-CO`  
**Rama de referencia para el trabajo actual:** `test/ceo-organization-data-boundaries-ci3`  
**PR de trabajo:** #184  
**Alcance:** inventario y clasificación de ramas/PR. Esta matriz no autoriza fusionar, desplegar, borrar ramas ni modificar Supabase alojado.

## 1. Referencias comprobadas

- `main` es la rama predeterminada del repositorio.
- PR #184 permanece abierta, en borrador y no fusionada. Su HEAD auditado es `5636256f0cae87d2145d0ae51e0839b1795b7b6f (commit validado por CI #520)`.
- En el HEAD actual de esta matriz, PR #184 está 58 commits por delante de `main` y 0 por detrás.
- CI #520 figura como SUCCESS para ese HEAD, con pruebas JavaScript, contrato Pages, batería MVP, cadena PostgreSQL 16, inventario e integración de tres empresas.
- PR #184 está 20 commits por delante de `test/three-independent-company-pilot`; la rama de tres empresas es una base anterior de ese trabajo, no una línea que deba fusionarse de nuevo sin necesidad.
- El repositorio contiene numerosas ramas históricas. La búsqueda paginada devolvió 184 referencias de rama en dos páginas; esto no significa que todas estén activas ni que deban integrarse.

## 2. Clasificación de líneas relevantes

| Rama / PR | Estado observado frente a main | Clasificación | Tratamiento |
|---|---:|---|---|
| `main` | Referencia predeterminada | Base estable actual | No alterar durante esta consolidación |
| `test/ceo-organization-data-boundaries-ci3` / #184 | +57 / -0 | Integración de trabajo más reciente | Mantener como línea principal de integración hasta cerrar revisión |
| `test/three-independent-company-pilot` / #180 | +37 / -0 | Antecedente funcional de #184 | Conservar como evidencia histórica; no duplicar su integración |
| `fix/supabase-migration-history-sync` / #177 | +28 / -0 | Cambio pendiente de historial y nombres de migración | Portar/reconciliar con #184; no aplicar sus migraciones sobre Supabase alojado sin plan y verificación |
| `fia/architecture-public-private-boundary` / #178 | +9 / -0 | Endurecimiento de publicación Pages y documentación | Portar/reconciliar con #184; comprobar solapamiento de workflow y pruebas |
| `feat/supabase-operations-backend` / #157 | +9 / -63, divergente | Backend anterior | No fusionar directamente; recuperar solo piezas justificadas tras comparación |
| `release/v1-stable-baseline` | 0 / -279 | Snapshot histórico de recuperación | Conservar como referencia histórica; no usar como base actual ni borrar sin verificar política de retención |
| `chore/v1-stable-baseline-record` / #96 | PR abierta, draft; mergeable false | Registro histórico de baseline | Revisar por separado; no mezclar con la línea de permisos actual |

Los valores +/− indican commits por delante/por detrás de `main`, no un juicio automático de calidad. Las ramas divergentes requieren comparación de contenido, no fusión ciega.

## 3. Matriz funcional y de seguridad

| Dominio | Evidencia en CI / código | Estado de consolidación |
|---|---|---|
| CEO y gerente de zona como vías alternativas de autoridad L3 | Migraciones y pruebas en #184; CI #520 SUCCESS | Implementado en rama de trabajo; despliegue real pendiente |
| Revocación de autoridad CEO por baja, suspensión o cambio de cargo | Migración y prueba de integración en #184 | Probado en PostgreSQL aislado |
| Flujo de tres empresas | Prueba con identidades separadas en #184 | Probado en CI; cuentas piloto reales pendientes |
| Aislamiento de información financiera | Migración de límites por organización y pruebas negativas | Probado en CI; revisión de runtime alojado pendiente |
| Inventario | Integración y pruebas de inventario | Probado en CI |
| Historial de migraciones Supabase | PR #177 alinea nombres y separa baseline histórica | Pendiente de reconciliar con #184 |
| Frontera pública/privada de Pages | PR #178 incorpora allowlist, test de artefacto y validación de ruta de salida | Pendiente de reconciliar con #184 |
| Fuente de verdad entre motor JS y backend SQL | PR #178 documenta diferencias entre máquina de estados JS y SQL | Decisión de arquitectura y verificación de integración pendientes |
| Storage, evidencias y permisos de archivos | No queda acreditada aquí una prueba completa del entorno real | Pendiente |
| Autenticación real y comprobación documental de cargos | CI utiliza identidades/fixtures sintéticos | Pendiente antes de piloto con empresas |
| Matriz exhaustiva de todos los roles y privilegios | Solo se han validado los límites concretos descritos arriba | Pendiente de cierre |

## 4. Riesgo importante de publicación

El repositorio GitHub es público. La allowlist de GitHub Pages limita lo que se publica en el sitio Pages, pero **no vuelve privados los archivos versionados en GitHub**. La PR #178 documenta que el código del Centro privado está presente en el repositorio y que la clave publicable de Supabase no es un secreto. La confidencialidad debe descansar en Auth, RLS, privilegios y controles de servidor, no en ocultar rutas o usar `noindex`.

Antes de incorporar la frontera Pages a la línea principal, revisar también si los archivos fuente privados deben permanecer en un repositorio público. No introducir secretos en el repositorio ni en el frontend.

## 5. Secuencia segura de consolidación

1. Mantener `main` sin cambios y conservar las ramas históricas.
2. Reconciliar primero PR #177 (historial de migraciones) con la cadena de migraciones que ejecuta #184.
3. Reconciliar PR #178 (frontera Pages y documentación) con el workflow y los tests de #184.
4. Ejecutar una sola batería completa tras resolver los solapamientos; añadir PostgreSQL 17.6 si se conserva la cobertura de #177.
5. Revisar el diff final y la matriz de permisos positiva/negativa, incluyendo CEO, gerente de zona, operador, miembro y usuario con varias organizaciones.
6. Verificar Auth, RLS, Storage y configuración real en un entorno de pruebas separado.
7. Solo después de revisión y autorización expresa, decidir qué PR integrar en `main`. No borrar ramas antiguas hasta comprobar que existe una referencia de recuperación adecuada.

## 6. Límites de esta auditoría

- Se consultaron metadatos de repositorio, ramas, PR y comparaciones de commits; no se descargó ni ejecutó localmente el repositorio completo.
- Los resultados de CI son pruebas aisladas con datos sintéticos, no certificación de producción.
- No se ha fusionado ni desplegado ninguna PR.
- No se ha modificado Supabase alojado, secretos, cuentas, datos ni configuración de producción.
- No se han eliminado ramas.
