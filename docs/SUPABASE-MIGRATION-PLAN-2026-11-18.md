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



### F. Integridad
- Recuentos de datos existentes preservados salvo fixtures de staging.
- Sin huérfanos, referencias rotas, duplicados de auditoría ni reservas inconsistentes.
- Políticas, grants, vistas y funciones coinciden con matriz aprobada.
- CI completo correcto en PostgreSQL 16 y 17.6.
- Restauración desde backup probada en entorno aislado.

### G. Alta, pertenencia y continuidad operativa

- El alta de cuenta no puede crear por sí sola pertenencias o elevar roles.
- Solicitud de acceso a organización sigue funcionando por el canal autorizado y no permite al cliente escribir directamente `organization_members` ni elevar `member_role`.
- Invitación, aceptación y revocación siguen funcionando por RPC/flujo autorizado, con actor autenticado y auditoría.
- Verificar que el recorte de INSERT/UPDATE en `organizations`, `organization_members` y `pilot_access_requests` no rompe el flujo legítimo de alta/revisión; si lo rompe, corregir el flujo servidor antes de desplegar, nunca reabrir grants generales como atajo.
- Confirmar que una persona con acceso a varias empresas cambia de contexto explícitamente y que los datos de la empresa anterior no quedan disponibles tras cambiar o revocar pertenencia.

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


## 7. Revisión remota posterior a la limpieza — 18-11-2026 (solo lectura)

### Estado actual confirmado

- Proyecto `etttredbkbcgqwciipls`: `ACTIVE_HEALTHY`, PostgreSQL 17.6.1, región `eu-west-1`.
- Historial remoto: 22 migraciones; última versión `20261114184756`, cuyo nombre corresponde a `20261114240000_create_three_party_operation_draft`. La comparación exhaustiva con los 32 archivos locales confirma que las 22 entradas remotas encuentran un archivo por nombre: 12 coinciden también en prefijo de versión y 10 conservan el nombre local pero tienen una versión remota distinta.
- Las diez migraciones de endurecimiento de PR #192 (`20261115000000` a `20261115100000`, sin archivo `15030000`) siguen ausentes del historial remoto.
- Las seis organizaciones y tres operaciones sintéticas se eliminaron y verificaron; las consultas posteriores muestran 0 organizaciones y operaciones sintéticas.
- `auth.users` conserva una única cuenta tras la eliminación autorizada de la cuenta secundaria Pepitogrillo. No se ha modificado la cuenta restante.
- No existen branches de desarrollo de Supabase en este proyecto. No se ha creado ninguna para evitar coste no confirmado.

### Hallazgos de autorización y privilegios confirmados en remoto

1. `private.can_access_operation(uuid)` permite acceso por `created_by` sin exigir que el creador siga siendo miembro activo de la organización propietaria. El acceso alternativo por participante sí comprueba pertenencia activa. Su `search_path` remoto sigue siendo `pg_catalog, public`, no vacío.
2. `private.can_manage_operation(uuid)` permite gestión por `created_by` y estado de operación, sin exigir pertenencia activa al propietario. Su `search_path` remoto también sigue siendo `pg_catalog, public`.
3. La política remota `operations_creator_draft_update` no exige pertenencia activa en `USING`; su `WITH CHECK` permite `owner_organization_id IS NULL` o pertenencia activa. Esto difiere de la política endurecida de PR #192.
4. La política remota de visibilidad de organizaciones solo contempla organización sintética o pertenencia directa; no incorpora todavía la visibilidad limitada de contrapartes participantes preparada en PR #192.
5. `authenticated` conserva SELECT sobre `operations.amount_cents` y `operations.currency`, pese a que PR #192 revoca expresamente esas columnas heredadas.
6. `authenticated` conserva INSERT/UPDATE sobre `organization_members` y `organizations`; PR #192 revoca esas escrituras directas para exigir flujos autorizados.
7. `logistics_quotes` y `operation_cost_items` mantienen permisos de escritura a nivel de tabla, sujetos a RLS. Sus políticas llaman a `can_manage_operation`; por tanto, la debilidad de esa función también afecta a esas rutas.

Estos son defectos estructurales de autorización/privilegios que deben cerrarse antes de datos reales. No se ha observado una extracción ni un acceso indebido; el proyecto está sin organizaciones/operaciones sintéticas tras la limpieza y no hay evidencia de actividad de usuarios que permita afirmar una brecha explotada.

### Elementos que no son bloqueos en esta fase

- Protección de Auth contra contraseñas filtradas: permanece desactivada por decisión expresa del usuario para esta fase sin datos sensibles. No modificar ahora; añadirla al gate de auditoría oficial/preproducción.
- Las nueve funciones `SECURITY DEFINER` del esquema `public` consultadas tienen `search_path` vacío, EXECUTE para `authenticated` y no para `anon`. Además, el inventario de funciones privadas detecta nueve helpers `SECURITY DEFINER` con `search_path` no vacío: `after_confirmation_insert`, `after_incident_change`, `after_participant_acceptance`, `append_operation_audit`, `can_access_operation`, `can_manage_operation`, `enqueue_operation_notice`, `is_org_member` y `validate_evidence_role`. Algunas se ejecutan desde políticas RLS o triggers; PR #192 programa su endurecimiento. La mera presencia de funciones `SECURITY DEFINER` no demuestra vulnerabilidad: hay que revisar sus permisos y cuerpos.
- Todas las tablas base del esquema `public` comprobadas tienen RLS activado; no se detectaron grants de lectura/escritura a `anon` en el inventario consultado. Varias tablas conservan grants de escritura a `authenticated`, sujetos a RLS; la migración 150000 retira escrituras directas donde deben usarse RPC/flujo autorizado. Tres tablas privadas tienen RLS activado y no conceden SELECT/INSERT a `anon` ni `authenticated`; ese cierre de privilegios es intencionado y no debe abrirse para silenciar avisos.

### Estado de CI y límites

- PR #192 continúa abierta y sin fusionar, HEAD `d58e72e5142fec2256e2675fe5066ccffe5884cc`.
- Workflow run #727 (`43756661322`) completado con `success`; la cadena y pruebas se ejecutaron en PostgreSQL efímero 16 y 17.6, no en Supabase remoto.
- La PR #194 continúa abierta en borrador. Los documentos de limpieza se han actualizado en un commit documental posterior; no equivale a CI ni a despliegue.
- La tabla de correspondencia nominal ya está construida. Las 10 versiones remotas distintas de los prefijos locales son: `20261114183219` → `20261114130000_prevent_legacy_participant_claim`; `20261114183223` → `20261114150000_authorize_l3_by_company_head_or_zone_manager`; `20261114183228` → `20261114170000_bind_ceo_membership_to_l3_authority`; `20261114183232` → `20261114180000_revoke_ceo_authority_when_membership_ends`; `20261114183540` → `20261114190000_company_data_isolation`; `20261114183546` → `20261114200000_index_uncovered_foreign_keys`; `20261114183552` → `20261114210000_harden_finance_definer_search_paths`; `20261114183640` → `20261114220000_harden_financial_trigger_search_path`; `20261114183718` → `20261114230000_index_l3_authority_foreign_keys`; `20261114184756` → `20261114240000_create_three_party_operation_draft`. Los otros 12 nombres coinciden también en versión. Esto resuelve la correspondencia por nombre, pero no prueba por sí solo que todos los efectos SQL locales coincidan con el estado remoto actual. La documentación oficial de Supabase describe `migration repair` como una modificación del historial remoto, no como una comprobación inocua. No ejecutar `db push`, `migration repair`, ni aplicar migraciones hasta validar los efectos reales de cada archivo contra esquema/funciones/policies/grants y preparar backup/restauración.
- No se ha confirmado backup descargable, PITR ni restauración de ensayo. No crear branches/proyectos de Supabase porque pueden generar coste.

### Próximo orden seguro

1. Construir una tabla exhaustiva de correspondencia entre las 22 migraciones locales aplicadas y las 22 entradas remotas (versión, nombre y archivo exacto); comparar contenido y estado de objetos, no solo etiquetas.
2. Revisar el SQL completo de las diez migraciones pendientes y su compatibilidad con el estado remoto actual; confirmar especialmente grants, columnas, policies, funciones y triggers.
3. Preparar pruebas negativas de revocación/creador, lectura financiera y escrituras directas; ejecutar solo en PostgreSQL aislado gratuito/efímero ya disponible en CI.
4. Verificar desde el panel el plan, la política de backups/PITR y la posibilidad real de restauración. No inferirlo de que el proyecto esté activo.
5. Tras esos pasos, redactar un plan remoto final con precondiciones, orden, rollback y comprobación. La ejecución remota requerirá autorización específica separada.

**Dictamen actualizado:** UNRESOLVED para uso con datos reales. Los hallazgos de autorización están confirmados en remoto; las correcciones existen en PR #192 y CI pasó en entorno efímero, pero no se han aplicado a Supabase remoto.
