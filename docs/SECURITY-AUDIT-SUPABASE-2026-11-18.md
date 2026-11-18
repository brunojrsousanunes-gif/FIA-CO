# Revisión técnica inicial de seguridad — 2026-11-18

## Resultado de la revisión

**Dictamen: UNRESOLVED para piloto con datos reales o producción.**

Se han encontrado controles positivos en el código y en la base remota, pero también una divergencia importante: la base Supabase remota no contiene todavía varias migraciones de endurecimiento presentes en la PR #192. Una de las diferencias mantiene un acceso residual de creadores cuya pertenencia empresarial ya no está activa.

Este documento registra una revisión estática y de solo lectura. No es una prueba de penetración, certificación ni auditoría completa.

## Alcance y versiones fijadas

- Repositorio: `brunojrsousanunes-gif/FIA-CO`.
- PR #192, rama `feat/operation-center-supabase-three-party-pilot`, HEAD `d58e72e5142fec2256e2675fe5066ccffe5884cc`.
- PR #194, rama `feature/progressive-participant-onboarding`, HEAD `7f4b6abe2fb003ca830e743d5b75c3805d31e844`.
- Base de ambas PR: `cff58ae24fdd5faa1449fac29bdc0f6e32a646b8`.
- Supabase remoto FIA-CO: proyecto activo, PostgreSQL 17.6.
- Última migración remota listada: `20261114240000_create_three_party_operation_draft`.

## CI comprobado

- PR #192: GitHub Actions #727, éxito en PostgreSQL 16 y 17.6.
- PR #194: GitHub Actions #743, éxito en PostgreSQL 16 y 17.6.
- Los trabajos muestran comprobación de sintaxis JavaScript, contrato de publicación Pages, batería MVP, aplicación de la cadena completa de baseline y migraciones en PostgreSQL efímero, pruebas SQL de inventario/tres empresas/consistencia financiera y prueba de concurrencia.

**Límite:** CI valida el commit probado y el entorno efímero del pipeline. No demuestra que esas migraciones estén aplicadas en Supabase remoto ni valida la configuración real de Auth o la interfaz con cuentas reales.

## Hallazgos

### F-01 — Pertenencia revocada no corta todo el acceso del creador

- **Severidad:** Alta.
- **Confianza:** Alta; comprobado mediante definición SQL remota.
- **Estado:** Abierto en Supabase remoto; corrección presente en PR #192, todavía no aplicada.
- **Evidencia:** en la base remota, `private.can_access_operation` concede acceso al creador histórico sin exigir que conserve una pertenencia activa a la organización titular. `private.can_manage_operation` comprueba creador y estado de operación, pero no comprueba pertenencia activa.
- **Impacto:** una persona retirada de la organización puede conservar acceso a operaciones que creó y capacidad de gestión en funciones que dependen de `can_manage_operation`.
- **Corrección localizada:** la migración `20261115000000_owner_membership_access_hardening.sql` de PR #192 exige pertenencia activa para el creador y endurece la política de actualización de borradores. La batería PostgreSQL contiene pruebas negativas para revocación del creador.
- **Acción:** revisar la cadena completa, validar con datos preservados en entorno aislado y preparar un plan reversible. No aplicar al remoto sin autorización expresa.

### F-02 — Protección frente a contraseñas filtradas desactivada

- **Severidad:** Media.
- **Confianza:** Alta; aviso del asesor de seguridad de Supabase observado el 2026-11-18.
- **Estado:** APLAZADO por decisión expresa del usuario hasta la auditoría oficial/preparación para datos sensibles. No modificar en esta fase y no tratar como bloqueo actual.
- **Impacto:** Auth no comprueba actualmente, mediante la protección integrada, si una contraseña elegida está comprometida.
- **Acción:** valorar activación y probar el registro/cambio de contraseña antes de habilitarlo. No se modificó la configuración.

### F-03 — Permisos internos aún demasiado ligados al creador y sin reconciliación completa de roles

- **Severidad:** Media como brecha de diseño; no se declara explotación confirmada.
- **Confianza:** Alta sobre la diferencia observada.
- **Evidencia:** la lógica de aplicación `core/identity/access-control.mjs` usa OWNER/ADMIN/OPERATOR/VIEWER; la base utiliza `member`, `manager`, `admin`, `ceo`. La función SQL de gestión de operaciones es principalmente creador + pertenencia activa, no un sistema configurable por departamento, recurso, acción y vigencia.
- **Impacto:** todavía no está implementado el modelo de permisos configurables previsto para los espacios empresariales y la gestión móvil.
- **Acción:** definir un mapeo único y autoritativo en servidor antes de habilitar administración empresarial amplia. No crear tablas duplicadas antes de inventariar consumidores y relaciones actuales.

### F-04 — Revocación de sesión desde la interfaz no confirma el resultado remoto

- **Severidad:** Media-baja.
- **Confianza:** Alta; el defecto original y su corrección se verificaron en código y CI.
- **Estado:** CORREGIDO EN CÓDIGO EN PR #192; pendiente de despliegue y prueba runtime contra Auth.
- **Evidencia:** la versión original borraba el estado local y lanzaba `/auth/v1/logout` sin esperar su resultado. La corrección centraliza la llamada en `supabase.signOut()`, inicia la revocación con el token activo, limpia la sesión local inmediatamente, espera el resultado remoto y comunica éxito o falta de confirmación. La solicitud tiene un límite de 10 segundos mediante `AbortController`.
- **Validación:** CI #780 pasó en PostgreSQL 16 y 17.6 para el HEAD `0962ba6102ce341ef323d3c7a886d8ef82cbe000`; la batería automatizada comprueba el endpoint, token, no-cache, credenciales omitidas, señal de aborto y contrato de interfaz. No es prueba de runtime real contra Auth.
- **Impacto residual:** si la red falla o expira el plazo, la sesión local queda cerrada y se informa de que la revocación remota no pudo confirmarse. No se declara revocación del servidor en ese caso.
- **Acción pendiente:** probar en entorno aislado con cuenta sintética y verificar la revocación de refresh token/JWT. No usar la cuenta personal ni desplegar sin autorización.

### F-05 — Cabeceras de transporte

- **Severidad:** Baja / pendiente de verificación de despliegue.
- **Confianza:** Alta sobre el archivo, no sobre el servidor desplegado.
- **Evidencia:** `frontend/_headers` contiene CSP, Referrer-Policy, nosniff, protección anti-frame, Permissions-Policy, COOP y CORP; no contiene HSTS.
- **Acción:** comprobar primero las cabeceras efectivas del dominio HTTPS y después decidir si procede añadir HSTS. No asumir que el archivo refleja por sí solo la respuesta del despliegue.

### F-06 — El Centro de Operaciones privado sigue siendo un entorno sintético

- **Severidad:** Informativo / brecha funcional.
- **Confianza:** Alta; comprobado en HTML y JavaScript.
- **Evidencia:** la pantalla se identifica como entorno privado de pruebas y filtra operaciones, pertenencias y solicitudes a organizaciones sintéticas. La función SQL `create_operation_draft` está disponible en el backend, pero el JavaScript de esta pantalla no la invoca.
- **Impacto:** no debe presentarse esta interfaz como gestión de operaciones reales de clientes ni como flujo productivo de creación de operaciones.
- **Acción:** diseñar la conexión real solo después de cerrar la reconciliación de permisos y seguridad.

### F-07 — Endurecimientos de idempotencia y concurrencia aún ausentes del remoto

- **Severidad:** Media.
- **Confianza:** Alta sobre la diferencia de versiones; impacto potencial no explotado en esta revisión.
- **Estado:** Las versiones endurecidas están en PR #192, pero las migraciones correspondientes no figuran en el historial remoto.
- **Evidencia:** las definiciones remotas de `create_operation_draft`, `accept_operation_invitation`, `transition_operation`, `revoke_organization_l3_authorization` y `release_inventory_reservation` son anteriores a las versiones de PR #192. Las migraciones `20261115010000`, `20261115020000` y `20261115040000` añaden vinculación de claves de petición al payload/actor/versión, serialización y comprobaciones de autorización tras esperas de bloqueo. La batería de tres empresas contiene pruebas negativas específicas para reutilización de claves, aceptación por identidad incorrecta, revocación y carreras de concurrencia.
- **Impacto posible:** reintentos concurrentes o claves reutilizadas podrían producir respuestas inconsistentes, aceptar una repetición no equivalente o mantener una autorización que cambió mientras la operación esperaba un bloqueo.
- **Acción:** incorporar estas migraciones a la reconciliación F-01 y validar la cadena completa con una copia/entorno aislado antes de cualquier cambio remoto.

## Controles positivos comprobados

1. Las tablas públicas examinadas tienen RLS habilitado.
2. Las nueve funciones `SECURITY DEFINER` del esquema `public` consultadas no permiten ejecución a `anon` y sí a `authenticated`. En una revisión posterior se identificaron nueve helpers `SECURITY DEFINER` privados con `search_path` no vacío; se documentan en el addendum y están incluidos en el endurecimiento de PR #192.
3. Las vistas `inventory_stock` y `operation_audit_timeline` tienen `security_invoker=true`; la segunda también usa `security_barrier=true`.
4. Las tablas del esquema `private` examinadas no conceden acceso directo a `anon` ni a `authenticated`. RLS sin políticas en esas tablas produce denegación por defecto; no se interpreta como exposición.
5. La clave del navegador es publishable, no una service-role key. El cliente rechaza patrones de claves secretas, fuerza `cache: no-store` y `credentials: omit`, y evita que cabeceras aportadas por el llamador sustituyan la clave o el JWT.
6. En la pantalla privada, access token y refresh token permanecen en memoria; no se encontró `localStorage`. `sessionStorage` se usa para claves de idempotencia, no para guardar credenciales ni el payload completo.
7. No se encontraron `innerHTML`, `document.write`, `eval` ni construcción dinámica de funciones en los archivos frontend seleccionados.
8. La batería SQL de PR #192 incluye denegaciones para identidades/roles incorrectos, revocación, acceso financiero cruzado, confirmaciones, transición de estados, claves de idempotencia y carreras de concurrencia.

## Diferencias entre GitHub y Supabase remoto

La base remota no incluye todavía las migraciones posteriores a `20261114240000_create_three_party_operation_draft` presentes en PR #192, entre ellas:

- `20261115000000_owner_membership_access_hardening.sql`
- `20261115010000_make_l3_authorization_retry_idempotent.sql`
- `20261115020000_harden_operation_rpc_idempotency.sql`
- `20261115040000_harden_l3_revocation_and_reservation_retries.sql`
- endurecimientos posteriores de logística, inventario y visibilidad de columnas financieras.

La base remota contiene datos y no está vacía. No se debe ejecutar una cadena de migraciones sin reconciliar primero historial, esquema, datos, dependencias, orden y plan de recuperación.

## Autenticación, dispositivos y Premium

- La pantalla utiliza autenticación por contraseña y mantiene la sesión en memoria.
- No se ha demostrado MFA obligatorio para responsables, registro de dispositivos, passkeys, panel de sesiones/dispositivos, entitlement Premium validado en servidor ni revocación de credenciales por dispositivo.
- La alta y configuración presencial del dispositivo del cliente queda **aplazada** hasta la fase de estructuración de seguridad de la IA Maestra, según decisión del propietario. No implementar ahora ni conceder control general del sistema operativo.
- El estado Premium, sus automatizaciones y su ROI productivo siguen sin demostración de runtime en esta revisión.

## Límites de esta revisión

- No se ejecutaron escrituras SQL ni cambios de configuración remota.
- No se aplicaron migraciones, no se desplegó, no se fusionó ninguna PR y no se modificó `main`.
- No se hizo una prueba de penetración ni una auditoría exhaustiva de todo el historial Git, todos los secretos, todos los workflows o la configuración completa de Auth.
- No se inspeccionaron contenidos de operaciones, usuarios ni documentos; solo metadatos, definiciones y recuentos agregados necesarios para comprobar que la base no está vacía.
- La revisión de código es estática y parcial. El dictamen permanece **UNRESOLVED** para datos reales hasta cerrar F-01 y validar el resto de controles en un entorno aislado.

## Próximos pasos

1. Reconciliar la cadena de migraciones PR #192 con el esquema remoto y preparar una validación reversible sin escribir en producción.
2. Revisar individualmente todas las RPC privilegiadas y las políticas RLS de cada tabla/columna afectada.
3. Unificar roles y permisos de servidor con el modelo de organización, departamento, recurso y acción.
4. Cerrar el comportamiento de logout, MFA y sesiones privilegiadas.
5. Verificar las cabeceras HTTPS efectivas.
6. Mantener la alta de dispositivos y su integración con IA Maestra aplazadas hasta esa fase de arquitectura.


## Addendum — revisión posterior y limpieza verificada (18-11-2026)

Este addendum actualiza los hechos que cambiaron después de la revisión inicial. Las secciones anteriores conservan el contexto histórico de la primera inspección; cuando haya diferencias, prevalece este addendum para el estado actual.

### Estado actual de repositorio y CI

- PR #192 sigue abierta y sin fusionar, HEAD `0962ba6102ce341ef323d3c7a886d8ef82cbe000`.
- CI #727 de PR #192 terminó `success` en PostgreSQL 16 y 17.6 efímero para la versión anterior del trabajo.
- CI #780 de PR #192 terminó `success` en PostgreSQL 16 y 17.6 para el HEAD actual, incluyendo la batería automatizada, la cadena de migraciones y las pruebas de inventario. No se ejecutó contra Supabase remoto.
- PR #194 sigue abierta, en borrador y sin fusionar. HEAD documental actual: `15e94029c842b7babf269314675e9f5f3957970a`.
- CI #770 terminó `success` para un HEAD documental anterior y CI #785 terminó `success` para el HEAD actual, ambos en PostgreSQL 16 y 17.6.

### Estado de datos después de la limpieza

- Se eliminaron y verificaron las 6 organizaciones sintéticas, 3 operaciones y sus dependencias asociadas.
- La cuenta secundaria identificada como Pepitogrillo se eliminó después, con autorización expresa y comprobación de dependencias. Verificación posterior: cuenta Auth 0, identidad 0, sesiones 0 y refresh tokens 0.
- Queda una única cuenta Auth preservada. No se modificó. No se afirma aquí su titularidad a partir del mero recuento.
- No se verificó backup restaurable ni PITR. No se ha creado branch de Supabase.
- El proyecto no tiene organizaciones ni operaciones sintéticas restantes; conserva el registro privado de la limpieza y una cuenta Auth.

### Hallazgos remotos adicionales confirmados

**F-08 — Columnas financieras heredadas y escrituras directas de empresa/membresía**

- `authenticated` conserva SELECT sobre `public.operations.amount_cents` y `public.operations.currency`.
- `authenticated` conserva INSERT y UPDATE sobre `public.organization_members` y `public.organizations`.
- Las políticas RLS están activadas en las tablas base públicas comprobadas y no se observaron grants de lectura/escritura a `anon`. Sin embargo, estos privilegios de `authenticated` deben limitarse según el flujo autorizado.
- Los privilegios por defecto de `postgres` en `public` también están abiertos para objetos futuros: nuevas funciones heredan EXECUTE para `anon`/`authenticated`; nuevas tablas heredan INSERT/SELECT/UPDATE para `authenticated`; nuevas secuencias heredan USAGE/SELECT/UPDATE. La migración 150000 de PR #192 revoca estos defaults. Los defaults de `storage` son propios de Supabase y quedan fuera del cambio.
- La migración `20261115000000_owner_membership_access_hardening.sql` de PR #192 revoca las columnas financieras heredadas y las escrituras directas sobre organizaciones/pertenencias.
- **Severidad:** Alta antes de datos reales. No hay evidencia de explotación o extracción en esta revisión.

**F-09 — Helpers SECURITY DEFINER privados con search_path no vacío**

- Se identificaron nueve funciones privadas con `search_path` no vacío: `after_confirmation_insert`, `after_incident_change`, `after_participant_acceptance`, `append_operation_audit`, `can_access_operation`, `can_manage_operation`, `enqueue_operation_notice`, `is_org_member` y `validate_evidence_role`.
- Las funciones `can_access_operation` y `can_manage_operation` son especialmente relevantes porque sus autorizaciones presentan la brecha F-01.
- La migración 150000 de PR #192 fija `search_path` vacío en estos helpers y otros helpers financieros. Las nueve RPC `SECURITY DEFINER` del esquema `public` consultadas sí tenían `search_path` vacío; no confundir ambos conjuntos.
- **Severidad:** Media como hardening; revisar dependencias y objetos cualificados antes de aplicar.

**F-10 — Correspondencia de historial de migraciones precisada**

- Se compararon los 32 archivos locales de `supabase/migrations` con las 22 entradas remotas.
- Las 22 entradas remotas encuentran un archivo local por nombre. Doce coinciden también en el prefijo de versión; diez conservan el nombre de archivo pero tienen otra versión remota (`20261114183219` a `20261114184756`).
- Los diez archivos de endurecimiento de PR #192 (`20261115000000` a `20261115100000`, sin archivo 15030000) son los diez archivos locales no presentes en el historial remoto.
- La correspondencia nominal está resuelta; no está demostrada la equivalencia íntegra de todos los efectos SQL locales con el esquema remoto. No ejecutar `db push` ni `migration repair` por esta sola correspondencia.

### Decisión de Auth filtrada

La protección integrada contra contraseñas filtradas permanece desactivada por decisión expresa del usuario para la fase actual sin datos sensibles. Se aplaza hasta la auditoría oficial/preparación para datos reales. No cambiarla ahora; incluir su activación y prueba en el checklist de salida a producción.

### Dictamen actualizado

**UNRESOLVED para datos reales.** F-01, F-08 y F-09 siguen presentes en el esquema remoto. Las correcciones relevantes están en PR #192 y la cadena ha pasado CI efímero, pero no se han aplicado al proyecto Supabase remoto. La correspondencia nominal de migraciones ya está mapeada; falta comparar efectos, verificar backup/restauración y ejecutar pruebas aisladas. No se ha aplicado ninguna migración ni cambiado Auth/RLS/grants en remoto durante esta revisión posterior.
