# Plan de reconciliación y migración de seguridad Supabase — 2026-11-18

## Estado

**PLAN PREPARADO — NO EJECUTADO.** La autorización recibida permite preparar secuencia y pruebas; no autoriza modificar el proyecto Supabase remoto.

Proyecto: `etttredbkbcgqwciipls`, región `eu-west-1`, PostgreSQL 17.6.1.
PR #192: `feat/operation-center-supabase-three-party-pilot`, HEAD `d58e72e5142fec2256e2675fe5066ccffe5884cc`.
PR #194: `feature/progressive-participant-onboarding`.
CI #727 de PR #192: éxito en PostgreSQL 16 y 17.6; ejecutó batería, cadena completa en PostgreSQL efímero, pruebas SQL de inventario/tres empresas/consistencia financiera y concurrencia. No tocó Supabase remoto.

## 1. Estado remoto observado (solo lectura)

Historial remoto hasta `20261114240000_create_three_party_operation_draft`; las diez migraciones enumeradas abajo no aparecen aplicadas.

Recuentos agregados (2026-11-18):

| Relación | Filas |
|---|---:|
| auth.users | 2 |
| organizations | 6 |
| organization_members | 1 |
| operations | 3 |
| operation_participants | 9 |
| operation_financials | 3 |
| operation_audit_events | 13 |
| inventory_items / movements / reservations | 0 / 0 / 0 |

Las seis organizaciones y las tres operaciones están marcadas como sintéticas. Hay nueve participantes (3 aceptados, 6 invitados), una pertenencia activa y 13 eventos de auditoría. No se consultaron identificadores, correos ni contenido de operaciones.

**La base no está vacía.** El estado sintético también debe preservarse: hay relaciones, datos financieros y trazabilidad persistente.

### Bloqueo de historial

Supabase devuelve, por ejemplo, versión `20261114183540` con nombre que incluye `20261114190000_company_data_isolation`. El campo `version` remoto no coincide literalmente con el prefijo del archivo local en varias migraciones aplicadas.

Antes de usar `supabase db push`, hay que comparar `supabase migration list` local/remoto y explicar esa correspondencia. No ejecutar `db push`, `migration repair` ni reescribir el historial hasta reconciliarlo.

## 2. Orden de migraciones pendientes

Orden cronológico por archivo; no existe un archivo `20261115030000` en PR #192, por lo que la secuencia pasa de 150200 a 150400.

| Orden | Archivo | Propósito / control principal |
|---:|---|---|
| 1 | `20261115000000_owner_membership_access_hardening.sql` | Exige pertenencia activa al creador; endurece política de borradores, columnas financieras heredadas, grants y privilegios por defecto. Revisar ACL y todas las rutas de acceso. |
| 2 | `20261115010000_make_l3_authorization_retry_idempotent.sql` | Evita que reintentos L3 amplíen caducidad o reutilicen clave con otra solicitud. |
| 3 | `20261115020000_harden_operation_rpc_idempotency.sql` | Endurece aceptación, creación/transición y recuperación sintética: actor, payload, rol, versión, bloqueos y auditoría. |
| 4 | `20261115040000_harden_l3_revocation_and_reservation_retries.sql` | Endurece revocación L3 y cierre/reintento de reservas, con comprobación de autorización tras bloqueos. |
| 5 | `20261115050000_harden_logistics_quote_selection.sql` | Selección de oferta por RPC auditada/idempotente; bloquea cambios directos de campos. Debe preceder a las restricciones posteriores. |
| 6 | `20261115060000_harden_logistics_quote_deletion.sql` | Borrado auditado por RPC; impide borrar oferta seleccionada y revoca DELETE directo. |
| 7 | `20261115070000_minimize_company_verification_column_visibility.sql` | Reduce SELECT a columnas permitidas manteniendo RLS. Verificar consultas frontend y revisión de servidor. No contiene BEGIN/COMMIT explícitos: confirmar atomicidad del runner o añadir transacción explícita en PR y pasar CI antes de programar. |
| 8 | `20261115080000_authorize_carrier_logistics_quote_submission.sql` | Sustituye inserción general por autorización exclusiva del transportista que aceptó la invitación. |
| 9 | `20261115090000_precheck_inventory_authorization_before_item_locks.sql` | Comprueba permisos de inventario antes y después del bloqueo; vincula movimientos/reservas a actor y clave. |
| 10 | `20261115100000_restore_financial_recalculation_triggers.sql` | Crea solo triggers de recálculo que falten. En remoto ya existen `operation_cost_items_recalculate` y `logistics_quotes_recalculate`; debería ser no-op si los nombres/dependencias siguen iguales. |

### Dependencias y riesgos

- La migración 150000 cambia privilegios por defecto del rol `postgres`; futuras tablas y RPC deben recibir grants explícitos.
- 150500 instala política de inserción de cotizaciones que 150800 reemplaza por autorización específica de transportista. No alterar orden.
- 150500/150600 crean o endurecen RPC `SECURITY DEFINER`: validar autorización dentro de cada función, no solo en frontend.
- 150700 retira SELECT de tabla y concede columnas concretas. Los campos `tax_id_last4`, `evidence_ref` y `verified_by` quedan fuera de lectura cliente. Confirmar que ninguna consulta de frontend dependa de ellos.
- 151000 debe dejar exactamente un trigger por tabla, sin borrar/recrear los existentes.
- No hay rollback universal seguro para cambios de funciones, políticas y privilegios. Reversión requiere snapshot restaurable y scripts revisados objeto por objeto.

## 3. Preparación obligatoria

1. Fijar HEAD de PR #192; si cambia, repetir revisión y CI.
2. Comparar historial local/remoto (versión, nombre, orden y contenido/checksum); resolver el desajuste descrito.
3. Obtener snapshot verificable de esquema, funciones, políticas, grants, triggers y datos. Confirmar que el backup/PITR disponible puede restaurarse. Disponibilidad de PITR y restauración real: no verificadas.
4. Registrar recuentos y estados antes/después, preservando organizaciones, operaciones, participantes, finanzas y auditoría existentes.
5. Reproducir estructura y datos sintéticos en entorno aislado (branch/staging/DB efímera); no ensayar en el proyecto remoto.
6. Aplicar allí la cadena completa desde baseline y en el orden anterior. Comparar esquema y ejecutar batería completa.
7. Validar consultas frontend afectadas por permisos de columna y los flujos Auth.
8. Solo después, redactar plan remoto separado con backup, ventana, responsable, monitorización, comprobación y reversión. Requiere autorización expresa específica.

## 4. Pruebas de aceptación

### A. Revocación — bloqueo crítico
- Creador con pertenencia activa: acceso solo a lo permitido.
- Mismo creador con pertenencia `revoked` o `suspended`: sin acceso por ser creador histórico; SELECT/UPDATE y `can_access_operation`/`can_manage_operation` denegados.
- Participante solo accede con invitación válida y pertenencia activa en su organización.
- Pertenencia activa en B no da acceso a operaciones de A.
- Anónimo, usuario ajeno y organización no participante: denegados.
- Cambio directo de propietario/creador/estado/datos financieros: denegado por grants/RLS.
- Probar todas las RPC que dependan de estas funciones.

### B. Idempotencia y concurrencia
- Misma clave, actor y payload: mismo resultado, sin filas/eventos duplicados ni extensión de vigencia.
- Misma clave con actor, empresa, rol, oferta, payload o versión diferentes: rechazo.
- Dos solicitudes simultáneas con misma clave: un único efecto persistente.
- Revocación mientras una RPC espera un bloqueo: segunda comprobación deniega.
- Reintento de aceptación no permite que otra identidad reclame el rol.
- Reintento L3 no amplía autorización ni reactiva una revocada.

### C. Cotizaciones y transportista
- Solo el usuario que aceptó la invitación de transportista y conserva pertenencia activa inserta oferta.
- Vendedor, comprador, propietario y terceros no suplantan al transportista.
- Selección por RPC; una sola oferta seleccionada.
- UPDATE/DELETE directo desde navegador denegado.
- Borrado de oferta no seleccionada genera un único evento; oferta seleccionada no se borra.
- Clave reutilizada para otra oferta/actor se rechaza.
- Recálculo financiero correcto tras crear, seleccionar y borrar.

### D. Inventario
- Usuario sin permiso no bloquea ni modifica artículo; autorización se comprueba antes y después del bloqueo.
- Organización A no mueve/reserva inventario de B.
- Reserva requiere operación aceptada y participante de la misma organización.
- Stock insuficiente/cantidad inválida se rechazan.
- Reintento idéntico devuelve resultado; payload distinto con misma clave se rechaza.
- Cierre repetido no duplica efecto; cumplimiento crea un único movimiento de salida.

### E. Privacidad, grants y triggers
- RLS activo en todas las tablas expuestas.
- Cliente solo lee columnas autorizadas; campos fiscales, evidencias y verificadores no se exponen.
- Miembro de A no lee verificación de B.
- RPC intencionales tienen EXECUTE explícito; funciones internas no se exponen por privilegios por defecto; anon no ejecuta RPC privilegiadas.
- Exactamente un trigger de recálculo por tabla y márgenes coherentes.
- Grants por defecto no rompen nuevas tablas/RPC legítimas.



### G. Alta, pertenencia y continuidad operativa

- El alta de cuenta no puede crear por sí sola pertenencias o elevar roles.
- Solicitud de acceso a organización sigue funcionando por el canal autorizado y no permite al cliente escribir directamente `organization_members` ni elevar `member_role`.
- Invitación, aceptación y revocación siguen funcionando por RPC/flujo autorizado, con actor autenticado y auditoría.
- Verificar que el recorte de INSERT/UPDATE en `organizations`, `organization_members` y `pilot_access_requests` no rompe el flujo legítimo de alta/revisión; si lo rompe, corregir el flujo servidor antes de desplegar, nunca reabrir grants generales como atajo.
- Confirmar que una persona con acceso a varias empresas cambia de contexto explícitamente y que los datos de la empresa anterior no quedan disponibles tras cambiar o revocar pertenencia.

### F. Integridad
- Recuentos de datos existentes preservados salvo fixtures de staging.
- Sin huérfanos, referencias rotas, duplicados de auditoría ni reservas inconsistentes.
- Políticas, grants, vistas y funciones coinciden con matriz aprobada.
- CI completo correcto en PostgreSQL 16 y 17.6.
- Restauración desde backup probada en entorno aislado.

## 5. Gates antes de autorizar remoto

- [ ] Desajuste de historial explicado y reconciliado.
- [ ] PR #192 fijada y revisada en commit exacto.
- [ ] Backup y restauración comprobados.
- [ ] Cadena completa superada en staging.
- [ ] Pruebas A–F superadas.
- [ ] Consultas frontend y permisos por columna validados.
- [ ] Recuentos de datos antes/después conciliados.
- [ ] Plan de reversión, responsable y ventana definidos.
- [ ] Autorización expresa para el cambio remoto concreto.

## 6. Límites actuales

No se aplicaron migraciones ni se modificaron Auth, datos, grants, políticas, funciones o triggers remotos. No se creó backup ni se probó restauración. CI usa PostgreSQL efímero, no una copia del proyecto remoto. No está verificado que Supabase CLI pueda reconciliar automáticamente el historial remoto. Dictamen **UNRESOLVED** para datos reales hasta cerrar todos los gates.
