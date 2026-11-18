# Estado de limpieza de datos sintéticos de Supabase — 18-11-2026

**Proyecto inspeccionado:** FIA-CO (`etttredbkbcgqwciipls`, eu-west-1, PostgreSQL 17.6.1)  
**Tipo de actuación realizada en esta revisión:** solo lectura.  
**Estado:** DATOS DE EMPRESAS/OPERACIONES SINTÉTICAS ELIMINADOS Y VERIFICADOS EL 18-11-2026. Las dos cuentas Auth se conservaron; no se borró ninguna identidad.

## 1. Recuento observado

Consulta de solo lectura realizada el 18-11-2026:

| Tabla / relación | Filas observadas |
|---|---:|
| `public.organizations` con `is_synthetic=true` | 6 |
| `public.organizations` no sintéticas | 0 |
| `public.operations` con `is_synthetic=true` | 3 |
| `public.operations` no sintéticas | 0 |
| `public.organization_members` ligadas a organizaciones sintéticas | 1 |
| Usuarios Auth distintos ligados a esas pertenencias | 1 |
| `public.pilot_access_requests` | 1 |
| `public.logistics_quotes` de operaciones sintéticas | 2 |
| `public.operation_audit_events` de operaciones sintéticas | 13 |
| `public.operation_cost_items` de operaciones sintéticas | 3 |
| `public.operation_financials` de operaciones sintéticas | 3 |
| `public.operation_participants` de operaciones sintéticas | 9 |
| Verificaciones de organización | 0 |
| Verificaciones L3 | 0 |
| Eventos de autorización L3 | 0 |
| Inventario, movimientos y reservas | 0 |
| `auth.users` total en el proyecto | 2 |

El usuario Auth vinculado a la pertenencia sintética no tiene otras pertenencias a organizaciones no sintéticas en la consulta actual. **No se debe borrar la cuenta Auth**: podría ser una cuenta personal legítima y no forma parte del alcance de limpieza de empresas/operaciones.

Estos datos son registros sintéticos heredados. No son empresas, operaciones ni clientes reales y no deben emplearse como evidencia funcional o comercial.

## 2. Causa técnica del intento fallido

El trigger `operation_cost_items_recalculate` ejecuta `private.after_financial_change()`. Esa función recalcula el margen y llama a `private.append_operation_audit(..., auth.uid(), ...)`.

En una ejecución administrativa sin identidad JWT, `auth.uid()` devuelve NULL. La tabla `operation_audit_events.actor_id` exige un actor no nulo y la función de auditoría falla con SQLSTATE `23502`. El bloque transaccional de borrado anterior terminó con error.

El trigger contiene una condición especial de `current_setting('fia_co.migration_mode', true) = 'company_data_isolation'` que omite recálculo y auditoría. **No debe activarse como atajo de limpieza** sin una operación administrativa revisada y sin garantizar cómo se registra el motivo y responsable del borrado.

Además, `operation_audit_events.operation_id` tiene FK `ON DELETE RESTRICT`; la operación no puede borrarse mientras existan esos eventos. Hay otras referencias con `RESTRICT` desde pertenencias, solicitudes, cotizaciones, costes, finanzas y tablas de inventario. La limpieza requiere un orden explícito y conciliación de todas las dependencias.

## 3. Límites de seguridad

- No se ha borrado ni modificado ningún registro en esta revisión.
- No se ha modificado Auth, RLS, grants, triggers, funciones, migraciones ni historial.
- No se ha verificado un backup restaurable ni PITR disponible.
- Las herramientas conectadas disponibles no exponen una operación para listar/descargar y restaurar un backup bajo control de esta revisión.
- No crear un usuario Auth ficticio ni suplantar `auth.uid()` para satisfacer la auditoría.
- No eliminar el usuario Auth real vinculado a la pertenencia sintética.
- No desactivar triggers, no usar el GUC de migración como bypass y no alterar FK/policies para forzar el borrado.
- No borrar las filas de auditoría sin un procedimiento de retención/limpieza aprobado que conserve una constancia verificable de la intervención.

## 4. Camino seguro pendiente

1. Obtener desde Supabase Dashboard evidencia de backup/PITR y completar una restauración de ensayo en entorno aislado. No basta con que el panel muestre que existe un backup.
2. Preparar una migración/procedimiento administrativo de limpieza que:
   - seleccione exclusivamente filas marcadas sintéticas y compruebe recuentos/IDs antes de modificar;
   - preserve íntegra la tabla `auth.users` y cualquier identidad personal;
   - registre el actor administrativo y el motivo de la limpieza sin falsificar una sesión de usuario;
   - resuelva las referencias `RESTRICT` en orden y mantenga consistencia transaccional;
   - incluya precondiciones y aserciones posteriores que aborten si aparece una fila no sintética o una relación inesperada.
3. Probar el procedimiento en una restauración aislada con la misma estructura y recuentos.
4. Revisar el SQL, el plan de reversión y los resultados before/after.
5. Ejecutar en remoto únicamente con autorización específica del cambio final y ventana acordada.

## 5. Referencia de pruebas futura

Las identidades de prueba se conservan ahora en [FIA-CO-SYNTHETIC-TEST-DATA-V1.md](FIA-CO-SYNTHETIC-TEST-DATA-V1.md) y el fixture estructurado en `tests/fixtures/fia-co-three-party-synthetic.v1.json`. Son la fuente canónica para nuevas pruebas aisladas; no se deben recrear en Supabase remoto.


## 6. Rutina administrativa preparada (no ejecutada)

Se ha añadido `scripts/maintenance/cleanup-synthetic-supabase.sql` y su contrato estático `tests/synthetic-supabase-cleanup-script.test.mjs`.

La rutina:
- fija los seis UUID de organizaciones y tres UUID de operaciones observados;
- exige que sigan marcados como sintéticos y que el grafo padre/hijos no haya cambiado;
- aborta si aparecen operaciones adicionales, inventario o verificaciones L3 relacionadas;
- fija recuentos observados de pertenencias, solicitud piloto, auditoría, costes, ofertas, participantes y finanzas;
- registra en `private.synthetic_cleanup_runs` una actuación de sistema separada, con motivo e IDs, sin atribuirla falsamente a un usuario;
- conserva todas las filas de `auth.users` y comprueba que sus IDs/recuento no cambien;
- elimina primero auditoría, costes, ofertas, participantes y finanzas; elimina operaciones hijas antes de la operación padre; finalmente elimina las organizaciones;
- usa el GUC de modo de migración solo dentro de esta transacción, para evitar que los triggers financieros intenten recalcular/auditar filas que se están retirando. La constancia independiente de la limpieza queda en la tabla privada de ejecuciones;
- comprueba postcondiciones antes de confirmar la transacción; cualquier discrepancia provoca rollback.

**No ejecutar todavía en Supabase remoto.** Sigue siendo obligatorio comprobar backup restaurable y ensayar el mismo script en una copia aislada. El archivo es un procedimiento de mantenimiento manual, no una migración automática ni una acción ejecutada. El test actual valida el contrato estático, no sustituye una prueba real de PostgreSQL.


## 7. Ejecución remota y verificación (18-11-2026)

La rutina se ejecutó en el proyecto remoto `etttredbkbcgqwciipls` en una única transacción. Resultado de la consulta posterior:

| Comprobación | Resultado |
|---|---:|
| Organizaciones restantes | 0 |
| Organizaciones sintéticas restantes | 0 |
| Operaciones restantes | 0 |
| Operaciones sintéticas restantes | 0 |
| Pertenencias restantes | 0 |
| Solicitudes piloto restantes | 0 |
| Eventos de auditoría de operaciones restantes | 0 |
| Costes restantes | 0 |
| Ofertas logísticas restantes | 0 |
| Participantes restantes | 0 |
| Registros financieros restantes | 0 |
| Confirmaciones / incidencias / notificaciones / evidencias | 0 / 0 / 0 / 0 |
| Cualificaciones / verificaciones / perfiles de seguridad | 0 / 0 / 0 |
| Verificaciones y eventos L3 | 0 / 0 |
| Cuentas `auth.users` conservadas | 2 |
| Registros privados de auditoría de limpieza | 1 |

Registro de la intervención:
- run_id: `3fdc8e44-dafd-448c-b301-9a1cbf4e9854`
- actor_type: `system`
- actor_label: `FIA&CO authorized maintenance`
- actor_user_id: `NULL` deliberadamente; no se atribuyó la acción a una persona.
- estado: `completed`
- alcance registrado: 6 organizaciones y 3 operaciones.
- recuentos retirados: 1 pertenencia, 1 solicitud piloto, 13 eventos de auditoría, 3 costes, 2 ofertas, 9 participantes y 3 registros financieros.

Las cuentas Auth no se tocaron: siguen existiendo 2. Una de ellas no tiene inicio de sesión, pertenencias ni referencias de auditoría; no se eliminó porque no existe evidencia suficiente para asegurar que no sea una cuenta personal. La cuenta que tenía pertenencia también se conservó, aunque su pertenencia de prueba ya no existe.

**Conclusión:** limpieza de empresas, operaciones y datos asociados **COMPROBADA**. Eliminación de cuentas Auth de prueba **PENDIENTE** de identificación inequívoca. No se verificó una restauración de backup; la limpieza se confirmó mediante transacción y consultas posteriores, pero no existe prueba de recuperación desde backup.
