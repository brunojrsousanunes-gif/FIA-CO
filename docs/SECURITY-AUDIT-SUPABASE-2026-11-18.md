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
- **Estado:** Pendiente de decisión y configuración.
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
- **Confianza:** Alta; comprobado en el código revisado.
- **Evidencia:** la interfaz borra el estado local y lanza `/auth/v1/logout` sin esperar su resultado; los errores de red se descartan.
- **Impacto:** el usuario ve la sesión cerrada localmente, pero la interfaz no confirma que el servidor haya revocado la sesión/refresh token.
- **Acción:** mejorar el flujo para confirmar la revocación remota y definir el comportamiento ante fallo. Verificar además la duración de JWT y los controles de sesión para acciones sensibles.

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
2. Las funciones RPC `SECURITY DEFINER` identificadas no permiten ejecución a `anon`; las nueve señaladas por el asesor están limitadas a `authenticated`. Su uso exige revisar sus controles internos y mantenerlas con privilegio mínimo.
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
