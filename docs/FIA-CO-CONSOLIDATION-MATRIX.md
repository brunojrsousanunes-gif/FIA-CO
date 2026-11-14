# FIA&CO — matriz de consolidación técnica y seguridad

**Corte de auditoría:** 2026-11-14  
**Repositorio:** `brunojrsousanunes-gif/FIA-CO`  
**Rama de trabajo:** `test/ceo-organization-data-boundaries-ci3`  
**PR principal:** #184 (abierta, borrador)  
**HEAD de código revisado antes de esta actualización:** `527e40f6874cb41fcd410735c030fd9138cbd1c2`

Esta matriz registra cambios y comprobaciones. No autoriza fusionar, desplegar en producción, borrar ramas ni modificar la base Supabase alojada.

## 1. Estado de ramas y PR

| Referencia | Estado comprobado | Decisión |
|---|---|---|
| `main` | Base estable; sin cambios realizados durante esta auditoría | Mantener intacta |
| PR #184 — `test/ceo-organization-data-boundaries-ci3` | Abierta, borrador; 78 commits por delante y 0 por detrás de `main` en la última comparación | Mantener como línea de integración y completar CI/revisión |
| PR #177 — `fix/supabase-migration-history-sync` | Abierta, no fusionada | Sus cambios de historial y baseline se han reconciliado selectivamente en #184; no fusionar ambas líneas a ciegas |
| PR #178 — `fia/architecture-public-private-boundary` | Abierta, borrador | Se han incorporado a #184 el control seguro de ruta de salida, su prueba y el documento `docs/FIA-CO-ARCHITECTURE-BOUNDARIES.md`; se corrigió en él la referencia a la versión de la migración de confianza tras alinear el historial |
| PR #180 — piloto de tres empresas | Antecedente funcional de #184 | Conservar como referencia, sin duplicar su integración |

No se han cerrado PR ni borrado ramas.

## 2. Historial de migraciones: reconciliación #177 → #184

**COMPROBADO en Supabase remoto, solo lectura:** hay 12 versiones registradas en `supabase_migrations.schema_migrations`.

**COMPROBADO en la rama #184:**
- Los 12 archivos ejecutables iniciales ahora usan los nombres/versiones que constan en el historial remoto.
- Los contenidos de las migraciones renombradas se contrastaron y coinciden con los originales por SHA/contenido.
- Se recuperó la migración `20261113212950_inventory_stock_view_privileges_hardening.sql`, que faltaba en la cadena de #184.
- Los dos scripts históricos `20260916112600` y `20260916113200` están en `supabase/baseline/`, fuera de la carpeta ejecutable de migraciones. Sus contenidos coinciden con los scripts históricos anteriores.
- Hay 7 migraciones nuevas posteriores a las 12 versiones remotas: protección de reclamaciones antiguas, autorización L3, vinculación/revocación de autoridad CEO, aislamiento de datos financieros, índices de FK y endurecimiento de funciones/vista.

La batería de contrato comprueba que los archivos de migración coinciden exactamente con las 12 versiones remotas más esas 7 migraciones nuevas, y que los dos scripts baseline no vuelven a entrar en la cadena ejecutable.

**Importante:** no se deben aplicar los dos scripts baseline al proyecto Supabase existente. CI los aplica solo a una base vacía para reconstruir el esquema de pruebas.

## 3. Frontera pública / privada: reconciliación #178 → #184

**COMPROBADO:**
- La allowlist de Pages es idéntica en las ramas #178 y #184; no se ha duplicado ni ampliado.
- El constructor de Pages de #184 incorporó `scripts/public-output-path.mjs`, que limita el destino de salida y bloquea rutas que podrían borrar el repositorio o directorios no autorizados.
- Se añadió `tests/pages-public-private-boundary.test.mjs` y se integró en `scripts/run-mvp-tests.sh`.
- La prueba verifica que las rutas privadas no entren en la allowlist ni en el artefacto público y que se rechacen destinos peligrosos.
- El workflow de #184 conserva la prueba de construcción pública.
- La batería SQL también comprueba que las tablas públicas tengan RLS, que las vistas expuestas a usuarios autenticados usen `security_invoker` y que `anon` no pueda ejecutar funciones públicas.

**Riesgo que permanece:** el repositorio GitHub es público. La allowlist protege el artefacto de Pages, pero no hace privados los archivos versionados en GitHub. La visibilidad del repositorio requiere una decisión separada porque puede afectar Pages, CI y alojamiento. No se ha cambiado.

## 4. Auditoría de permisos y RLS

### 4.1 Base Supabase alojada — comprobaciones de solo lectura

- Las tablas relevantes consultadas (`operations`, `operation_participants`, `organization_members`, `operation_cost_items`, `operation_audit_events` e inventario) tienen RLS habilitado y políticas de acceso por usuario/organización.
- `inventory_stock` usa `security_invoker=true`.
- `private.organization_security_profiles` tiene RLS habilitado, no tiene políticas y no concede acceso de cliente. Es un cierre deliberado, no una invitación a abrir la tabla.
- Se inspeccionaron las 6 RPC públicas `SECURITY DEFINER` señaladas por el asesor: las seis tienen `search_path=''`, no son ejecutables por `anon` y sí por `authenticated`. Sus cuerpos obtienen la identidad mediante `auth.uid()` y aplican comprobaciones de pertenencia, rol, estado, idempotencia o límites de inventario. El aviso del asesor no justifica retirar esos permisos sin romper funciones legítimas.
- El asesor sigue mostrando desactivada la protección de contraseñas filtradas de Supabase Auth. Es una mejora pendiente de configuración; no se ha activado ni alterado ningún ajuste remoto.

### 4.2 Cambios de seguridad en la rama #184 — todavía no desplegados

- La migración `20261114190000_company_data_isolation.sql` asigna titularidad financiera explícita a la organización creadora cuando puede determinarse sin ambigüedad; los casos dudosos no se asignan por aproximación.
- Los costes quedan limitados al titular de la operación y a sus administradores/CEO; las finanzas no se exponen a las otras empresas participantes.
- `operation_financials` tiene RLS y lectura condicionada al titular y a su rol financiero.
- La migración `20261114210000_harden_finance_definer_search_paths.sql` fija `search_path=''` en tres funciones financieras `SECURITY DEFINER` y hace que `operation_audit_timeline` use `security_invoker=true`, para respetar la RLS de la tabla de auditoría subyacente.
- La prueba SQL ampliada exige RLS en las tablas públicas, vistas expuestas con `security_invoker` y ausencia de ejecución anónima de funciones públicas.

**Límite funcional:** el diseño actual protege las finanzas de una empresa titular por operación. Todavía no crea tres libros de costes independientes para vendedor, transportista y comprador. Esa ampliación requiere definir quién registra cada coste, ingresos, márgenes y reglas de conciliación.

## 5. CI y validación

El workflow de #184 se ha ampliado para ejecutar:
- PostgreSQL 16 y 17.6.
- Baseline histórico en base vacía.
- Las 12 migraciones que corresponden al historial remoto.
- Las 7 migraciones nuevas de la rama.
- Pruebas de inventario, permisos y flujo de tres empresas.
- Prueba de frontera pública/privada de Pages.

**PENDIENTE:** la CI correspondiente a los últimos cambios de código y documentación está en ejecución. No se declara superada hasta que ambas versiones de PostgreSQL finalicen correctamente.

## 6. Estado real del entorno remoto

**COMPROBADO por consulta de solo lectura:**
- Supabase remoto conserva 12 migraciones aplicadas.
- `public.operations.owner_organization_id` todavía no existe en remoto.
- `public.operation_financials` todavía no existe en remoto.
- No se ha aplicado ninguna de las migraciones nuevas de #184 a Supabase alojado.

Por tanto, la separación financiera y los nuevos permisos están validados en el código y en CI aislada cuando esta finalice, pero todavía no están activos en el proyecto Supabase remoto.

## 7. Secuencia segura restante

1. Esperar y revisar CI PostgreSQL 16/17.6 tras los últimos cambios.
2. Corregir cualquier fallo real y repetir solo las pruebas necesarias.
3. Revisar el diff final y confirmar que el historial de migraciones coincide con el remoto.
4. Validar Auth, Storage, permisos reales y el flujo con identidades empresariales de prueba en un entorno separado.
5. Decidir por separado si se activa la protección de contraseñas filtradas y si se cambia la visibilidad del repositorio.
6. Solo con autorización específica, preparar el plan de aplicación remota y la integración en `main`.

## 8. Límites y garantías

- No se ha fusionado ninguna PR.
- `main` no se ha modificado.
- No se ha ejecutado ninguna migración ni escritura en Supabase remoto.
- No se han modificado secretos, usuarios, datos ni ajustes de Auth.
- No se han borrado ramas ni PR.
- Los resultados de CI usan una base aislada y datos sintéticos; no certifican producción ni sustituyen pruebas con usuarios reales.
