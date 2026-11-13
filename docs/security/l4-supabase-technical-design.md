# FIA&CO — Diseño técnico L4 sobre Supabase

**Estado:** diseño técnico previo a migración; no ejecutado.  
**Versión:** l4-supabase-design.v1  
**Rama:** design/l4-authorization-model  
**Objetivo:** encajar autorizaciones L4 en el esquema real sin duplicar identidades, roles, participantes, confirmaciones ni auditoría operativa.

## 1. Hallazgos verificados en el proyecto Supabase

Proyecto inspeccionado en modo lectura. El esquema ya contiene:

- `organizations`: empresa y estado.
- `organization_members`: relación usuario/empresa, roles actuales `member / manager / admin`, estados `invited / active / suspended / revoked`.
- `organization_verifications`: estado y evidencia de verificación empresarial.
- `organization_provider_qualifications`: cualificaciones de proveedor.
- `operation_participants`: empresa y rol seller/buyer/carrier por operación, con aceptación.
- `operation_confirmations`: confirmaciones funcionales por usuario y rol.
- `operation_audit_events`: trazabilidad por operación.
- `profiles.platform_role`: rol de plataforma `member / operator / admin`; no debe confundirse con el rol empresarial.

Las tablas públicas existentes tienen RLS habilitado. Las funciones `private.is_org_member`, `private.can_access_operation`, `private.can_manage_operation` y `private.has_operation_role` son SECURITY DEFINER y conceden EXECUTE a authenticated; cualquier integración nueva debe revisar el alcance y no ampliar su acceso indirectamente.

La consulta de catálogo no encontró tablas llamadas `access_grants`, `access_grant_approvals`, `organization_trust_profiles` ni `authorization_audit_events` en public/private. Por tanto, el almacenamiento específico de autorizaciones L4 todavía no existe en la base consultada.

## 2. Decisiones de integración

### Reutilizar, no duplicar

- Identidad: `auth.users` y `profiles`.
- Membresía y rol interno: `organization_members`.
- Verificación legal/empresarial: `organization_verifications`.
- Cualificación de proveedor: `organization_provider_qualifications`.
- Participación seller/buyer/carrier: `operation_participants`.
- Aceptación/confirmación de negocio: `operation_confirmations`.
- Eventos propios de una operación: `operation_audit_events`.

No crear tablas nuevas de usuarios, empresas, roles operativos, invitaciones ni confirmaciones.

### Separar lo que hoy no existe

Se necesita persistir tres piezas nuevas:

1. Estado de confianza L0–L4 por organización, con evidencia y vigencia.
2. Grants de privilegios acotados, concedidos por una empresa a un usuario propio o a un destinatario de otra empresa.
3. Auditoría de autorizaciones, incluida la actividad que no pertenece a una operación concreta.

Las aprobaciones se guardan como eventos/filas del ciclo de vida del grant; no como permisos independientes que puedan sobrevivir al grant.

## Gobierno técnico de la titularidad de FIA&CO

La titularidad de la plataforma debe estar separada de los permisos de las organizaciones clientes. Diseño mínimo antes de implementar:

- Mantener un registro privado de autoridad de plataforma, separado de `profiles.platform_role` y de `organization_members`. No convertir el rol global `admin` en prueba de propiedad.
- Guardar referencias internas a la identidad verificada, método/fecha/estado de verificación y evidencia protegida; no guardar DNI, domicilio, firma ni copias documentales en tablas públicas, perfiles, repositorios, logs ni prompts.
- No crear almacenamiento de documentos personales hasta definir necesidad legal, base jurídica, canal de recepción, responsables, acceso, retención y borrado.
- Modelar delegaciones como registros explícitos con capacidad permitida, destinatario, alcance, entorno, vencimiento, revocación y actor que las concede. Denegar delegaciones abiertas o transferibles.
- Las funciones de plataforma no implican permisos sobre datos de clientes. El soporte técnico debe operar con metadatos o datos sintéticos; cualquier acceso excepcional a contenido exige autorización separada, necesidad documentada y auditoría.
- Reservar los cambios de titularidad, privilegios de gobierno, controles globales y acceso excepcional al propietario, con doble control para acciones críticas cuando sea viable.
- Diseñar recuperación con revalidación privada y notificación por canal independiente; nunca permitir que una sesión o administrador delegado cambie por sí solo al titular.
- No exponer endpoints genéricos para consultar o modificar el registro de titularidad. Usar RPCs específicas, validación de servidor, mínimo privilegio y auditoría sin datos personales.

Este modelo no determina por sí solo qué datos identificativos exige la ley ni sustituye asesoramiento jurídico. La recogida de datos se aplaza hasta que exista una necesidad concreta y un canal seguro.

## 3. Modelo lógico propuesto

### Separación de titularidad de plataforma y autoridad de empresas

La titularidad de FIA&CO (gobierno del producto/plataforma) y la autoridad de cada organización cliente son ámbitos distintos.

- No se debe reutilizar el usuario propietario de FIA&CO como OWNER de las empresas clientes.
- La autoridad de una empresa cliente debe acreditarse con su propia evidencia de representación o delegación.
- Los datos personales del propietario de FIA&CO no se guardarán en tablas públicas ni en campos visibles de perfiles de empresa.
- Si la operación exige conservar evidencia de titularidad/representación, se almacenará en un repositorio privado con acceso mínimo, referencia interna, finalidad, fecha de verificación, vencimiento y auditoría de consulta. La evidencia documental no se copiará a logs ni a prompts de IA.
- No se debe crear una tabla con DNI, domicilio o documentos personales solo por conveniencia técnica. Antes se determinarán la obligación, la base jurídica, el canal seguro y el plazo de conservación.
- La interfaz pública y los expedientes compartidos mostrarán, como máximo, un estado de autoridad verificada y los datos de contacto empresariales que la organización haya autorizado divulgar.


### A. `private.organization_trust_profiles`

Una fila vigente por empresa, versionada mediante historial append-only o snapshots inmutables.

Campos lógicos:
- `organization_id` PK/FK a organizations.
- `trust_level` enum controlado: L0_DEMO, L1_ISOLATED, L2_VERIFIED, L3_SHARED, L4_ADVANCED.
- `policy_version` (ej. trust-security-levels.v1).
- `status`: pending, active, suspended, expired.
- `verified_checks` JSONB limitado a claves de política conocidas; no aceptar checks enviados libremente por cliente como prueba.
- `approved_by`, `approved_at`, `valid_from`, `expires_at`.
- `created_at`, `updated_at`.

Reglas:
- La empresa no puede elevar su propio nivel.
- El cliente puede solicitar evaluación, no escribir un nivel verificado.
- El cambio de nivel no crea ni amplía grants.
- L4 exige evidencia de los requisitos L1, L2 y L3 además de los específicos L4; no se permite saltar niveles.
- Si una verificación expira o se suspende, las decisiones de acceso que dependan de ella pasan a DENY.

### B. `private.access_grants`

Un registro por concesión concreta.

Campos lógicos:
- `id` UUID PK.
- `grantor_organization_id` FK organizations: organización que controla y concede el acceso.
- `recipient_organization_id` FK organizations nullable: destinatario externo; NULL significa uso interno.
- `subject_user_id` FK auth.users nullable: usuario concreto. Si se permite delegación a grupo, se añadirá más adelante como modelo separado; v1 no usa comodines.
- `operation_id` FK operations nullable: alcance a operación concreta; NULL solo para recursos organizativos internos expresamente permitidos.
- `resource_type`, `resource_id`: recurso tipado; lista blanca en servidor.
- `privilege_code`: código de catálogo L4 validado contra política versionada.
- `data_fields` TEXT[]: lista blanca de campos, nunca patrón comodín.
- `purpose_code`, `purpose_description`.
- `status`: pending, active, suspended, revoked, expired.
- `requested_by`, `approved_by`, `approved_at`.
- `valid_from`, `expires_at`.
- `revoked_by`, `revoked_at`, `revocation_reason`.
- `policy_version`, `created_at`, `updated_at`.

Restricciones:
- `expires_at > valid_from`; sin grants perpetuos para datos personales o accesos externos.
- Si `recipient_organization_id` no es NULL, debe ser distinta de `grantor_organization_id`.
- Para acceso interempresarial, `operation_id` es obligatorio en v1 y ambas empresas deben ser participantes ACCEPTED de esa operación.
- `subject_user_id` debe ser miembro ACTIVE de la empresa destinataria (o de la otorgante si es grant interno).
- El solicitante no puede autoaprobar grants de datos personales, exportación o acciones externas sensibles.
- El registro de un grant no puede editarse para cambiar destinatario, finalidad, recurso, campos o privilegio después de aprobarse. Un cambio crea un grant nuevo; el anterior se revoca.
- Los grants revocados no se reactivan; se solicita uno nuevo.
- El estado EXPIRED debe derivarse de la hora de servidor y no depender de un job puntual para denegar el acceso.

### C. `private.authorization_audit_events`

Auditoría de autorizaciones a nivel empresa y de grants sin operación.

Campos lógicos:
- `id` BIGINT identity.
- `grant_id` UUID nullable.
- `organization_id` UUID.
- `operation_id` UUID nullable.
- `actor_id` UUID nullable para eventos automáticos del sistema.
- `event_type` lista cerrada: grant.requested, grant.approved, grant.denied, grant.activated, grant.suspended, grant.revoked, grant.expired, grant.access.allowed, grant.access.denied.
- `event_data` JSONB minimizado, sin valores de datos personales ni secretos.
- `request_id` UUID idempotente.
- `created_at` timestamp del servidor.
- `previous_hash`, `event_hash` si se adopta encadenado de hashes tras definir una implementación transaccional segura.

No sustituye `operation_audit_events`: los eventos que afectan a una operación deben poder correlacionarse con la auditoría operativa existente. No almacenar el contenido consultado ni el documento compartido en el log.

## 4. Matriz de roles real y compatibilidad

La base actual NO contiene OWNER, ADMIN, OPERATOR, VIEWER como roles de empresa. Contiene:
- `admin`: administración de empresa.
- `manager`: gestión limitada de empresa.
- `member`: miembro.

La interfaz contiene OWNER, ADMIN, OPERATOR y VIEWER, pero ese modelo no debe trasladarse literalmente a SQL hasta definir una migración de roles independiente.

Mapeo provisional seguro:
- OWNER: no existe como rol persistido; requiere decisión explícita de modelo y proceso de transferencia de propiedad.
- ADMIN: candidato a mapear a `organization_members.member_role='admin'`, sujeto a auditoría de acciones actuales.
- OPERATOR: candidato a `member` con permisos operativos por RPC y rol de participante; no equivale a admin.
- VIEWER: no existe aún como rol persistido; introducirlo solo si la matriz de producto lo necesita.
- `manager`: rol existente sin equivalente explícito en la matriz de interfaz; no eliminar ni reasignar hasta revisar sus usos.

Ningún rol de empresa debe poder elevar `profiles.platform_role`. El rol global de plataforma es un ámbito distinto.

## 5. Decisión de autorización en servidor

Propuesta de función privada central:

`private.authorize_access(target_grant_id uuid, target_resource_type text, target_resource_id uuid, target_privilege text, target_fields text[], target_purpose text) returns boolean`

Debe comprobar dentro de una única transacción:
1. `auth.uid()` no es NULL.
2. Grant ACTIVE y dentro de su ventana temporal según `statement_timestamp()`.
3. Usuario coincide exactamente con `subject_user_id`.
4. Usuario tiene membresía ACTIVE en la organización correspondiente.
5. Organización otorgante ACTIVE y con nivel L4 vigente si el código exige L4.
6. Nivel del destinatario suficiente cuando la acción exige confianza también en el receptor.
7. Si es interempresarial: empresa destinataria y otorgante son participantes ACCEPTED de la misma operación.
8. Recurso y operación coinciden exactamente con el grant.
9. Privilegio, campos y finalidad coinciden exactamente; no hay expansión por prefijos o comodines.
10. Política de datos y aprobaciones humanas requeridas están satisfechas.
11. Ningún límite permanente está vulnerado.

Ante NULL, error, timeout, versión desconocida o dato contradictorio: DENY. La función no debe devolver detalles sensibles que permitan enumerar recursos.

No conceder EXECUTE directamente a authenticated a una función genérica que permita consultar grants arbitrarios. La función se consumirá desde RPCs específicas o políticas RLS con argumentos derivados del registro que se está leyendo.

## 6. RLS y privilegios SQL

- Tablas nuevas dentro de schema `private`, sin exposición por PostgREST.
- RLS activado y FORCE ROW LEVEL SECURITY evaluado para tablas privadas según propietario/funciones.
- REVOKE ALL de PUBLIC, anon y authenticated sobre tablas nuevas.
- Ningún INSERT/UPDATE/DELETE directo desde cliente.
- RPCs específicas con SECURITY DEFINER solo si es imprescindible, `SET search_path` fijo, nombres cualificados, validación explícita de `auth.uid()`, REVOKE EXECUTE de PUBLIC/anon y grants mínimos.
- Evitar que la función de autorización sea una vía para enumerar si existe un grant.
- No añadir EXECUTE a funciones SECURITY DEFINER actuales sin revisar primero sus ACL y rutas de llamada.
- RLS de documentos/storage debe comprobar grant en el servidor; enlaces firmados de corta duración y revocación efectiva deben diseñarse antes de habilitar descargas.

## 7. Riesgos que deben resolverse antes de SQL

1. **Identidad del otorgante:** definir quién representa legalmente a la empresa y cómo se verifica la facultad de autorizar datos personales.
2. **OWNER ausente en DB:** no inventar propietario implícito ni convertir el primer admin automáticamente en owner.
3. **Ámbito de datos personales:** definir campos exactos y bases jurídicas por flujo; el catálogo L4 no es una autorización jurídica genérica.
4. **Auditoría:** el log actual está ligado a operaciones; se necesita registro separado para grants organizativos.
5. **Storage:** la tabla `operation_evidence` referencia paths y hashes; hay que revisar políticas Storage y emisión de URLs antes de conceder DOC.READ/SHARE.
6. **Funciones SECURITY DEFINER:** el Security Advisor ya ha advertido de funciones ejecutables por authenticated; no ampliar la superficie.
7. **RLS de grants:** un fallo de política no debe permitir que el usuario se apruebe permisos ni vea grants de otras empresas.
8. **Estado de empresa y participante:** la aceptación de participante no equivale a verificación jurídica de la empresa; ambas comprobaciones son independientes.

## 8. Orden de implementación previsto

- Fase 1: aprobar modelo de roles y autoridad de firma/representación; revisar políticas Storage y ACL.
- Fase 2: migración solo para tablas privadas de trust profile, grants y auditoría; restricciones, índices y triggers inmutables.
- Fase 3: funciones RPC específicas para solicitar/aprobar/revocar grants y función central de autorización.
- Fase 4: conectar un solo caso de uso no destructivo (p. ej. lectura de un campo no crítico) con pruebas aisladas.
- Fase 5: probar denegaciones, expiración, revocación en sesión activa, cross-tenant, autoaprobación, manipulación de campos y concurrencia.
- Fase 6: revisión de seguridad, advisors y aprobación explícita antes de cualquier migración de producción.

## 9. Pruebas mínimas del modelo

- Empresa L3 no puede usar privilege L4.
- L4 sin grant activo no concede nada.
- Grant expirado/revocado/suspendido deniega inmediatamente.
- Usuario no destinatario no puede usar un grant válido de otro usuario.
- Miembro invitado/suspendido/revocado no puede usar grants.
- Empresa no participante ACCEPTED no puede recibir datos de la operación.
- Receptor no verificado cuando el flujo lo exige: DENY.
- Cambio de finalidad, campos o recurso no puede reutilizar el grant.
- Solicitante no puede aprobar su propia solicitud sensible.
- Nivel o grant modificado desde el cliente: escritura denegada.
- Usuario no puede leer ni enumerar grants de otras organizaciones.
- Ningún grant puede habilitar datos críticos, secretos, custodia de fondos o movimiento de dinero.
- La revocación bloquea nuevos accesos aunque el usuario mantenga sesión abierta.
- La auditoría no permite UPDATE/DELETE desde roles de aplicación.


## 11. Especificación previa a migración: titularidad y delegaciones

Esta sección es un plano de diseño. **No es SQL ejecutable ni autoriza cambios en Supabase.**

### 11.1 Registro privado de titularidad

Entidad propuesta: `private.platform_governance`, con una única fila activa (restricción de singleton).

Campos mínimos:
- `id`: clave fija/singleton.
- `owner_user_id`: referencia a `auth.users.id`; es dato personal seudonimizado y debe permanecer en esquema privado, sin lectura directa desde clientes.
- `owner_reference`: identificador interno opaco para vincular la evidencia externa; no contiene DNI, nombre, domicilio ni documento.
- `verification_status`: `pending | verified | suspended`.
- `verified_at`, `verified_by`: fecha y actor de verificación.
- `policy_version`, `created_at`, `updated_at`.

Reglas:
- No insertar automáticamente al primer usuario ni inferir titularidad de `profiles.platform_role='admin'`.
- El alta inicial requiere un procedimiento de bootstrap controlado, documentado y verificado por una persona autorizada; no debe existir una RPC pública para reclamar la propiedad.
- No almacenar copias de documentos personales en esta tabla ni en Storage por defecto.
- Si la identidad deja de estar verificada o existe disputa, bloquear las acciones reservadas; mantener solo el proceso de recuperación/revisión.
- No permitir UPDATE/DELETE directo desde `anon` o `authenticated`.

### 11.2 Delegaciones

Entidad propuesta: `private.platform_delegations`.

Campos mínimos:
- `id`, `delegate_user_id`, `capability`, `scope`, `environment`.
- `granted_by`, `granted_at`, `starts_at`, `expires_at`, `revoked_at`, `revoked_by`.
- `reason`, `status`, `created_at`.

Capacidades cerradas iniciales (no comodines):
- `support_metadata`: soporte con metadatos mínimos.
- `technical_maintenance_nonprod`: mantenimiento técnico solo en entorno no productivo.
- `security_review_readonly`: lectura de evidencias técnicas de seguridad sin datos de clientes.
- `user_support_limited`: soporte de cuentas sin cambiar titularidad ni privilegios.

No incluir inicialmente capacidades para producción, secretos, exportación de datos, lectura de documentos de clientes, aprobación de divulgación, gestión de fondos ni transferencia de titularidad. Si en el futuro fueran necesarias, requerirán un diseño y aprobación separados.

Restricciones:
- `expires_at` obligatorio y posterior a `starts_at`; sin delegaciones perpetuas.
- Una delegación no puede ser concedida, ampliada ni transferida por el delegado.
- La autoridad que concede debe ser el titular verificado; la revocación invalida el acceso en la siguiente comprobación del servidor.
- `scope` debe ser estructurado y validado contra una lista permitida; no aceptar SQL, expresiones libres ni comodines globales.
- Cada cambio produce un evento de auditoría append-only, sin incluir datos personales ni secretos en el detalle.

### 11.3 Auditoría de gobierno

La auditoría debe registrar: creación, aprobación, rechazo, expiración, revocación, intento denegado, cambio de estado de verificación y uso de una delegación. Campos recomendados: actor, acción, objeto, resultado, fecha de servidor, identificador de solicitud y motivo codificado. No registrar documentos, tokens, secretos ni contenido de clientes.

La inmutabilidad debe reforzarse con permisos SQL y trigger; no basta con ocultar botones en la interfaz. La retención y exportación de auditoría requieren política separada.

### 11.4 Privilegios y exposición

- Mantener las tablas en `private`, esquema no expuesto por Data API; confirmar configuración real de esquemas expuestos antes de la migración.
- Activar RLS como defensa adicional aunque el esquema no esté expuesto.
- Revocar privilegios de tabla y secuencia a `PUBLIC`, `anon` y `authenticated`; no conceder DML directo al cliente.
- Evitar funciones `SECURITY DEFINER`. Preferir `SECURITY INVOKER`; si una operación interna demuestra que necesita elevación, justificarla individualmente, fijar `search_path`, cualificar objetos, comprobar `auth.uid()`, revocar EXECUTE por defecto y concederlo solo al rol estrictamente necesario.
- No reutilizar ni ampliar las funciones actuales `private.is_org_member`, `private.can_access_operation`, `private.can_manage_operation` o `private.has_operation_role` sin revisar su código y ACL completos.
- No devolver el `owner_user_id` a clientes ni incluirlo en respuestas de RPC; devolver solo el resultado mínimo necesario.
- La autorización de plataforma nunca sustituye los controles de organización/operación y no da acceso a expedientes de clientes.

### 11.5 Orden de migración y pruebas

1. Confirmar la configuración de esquemas expuestos, ACL actuales y definición completa de las funciones relacionadas.
2. Crear tablas privadas y restricciones sin grants a clientes; validar singleton, estados y vencimientos.
3. Añadir auditoría append-only y probar que los roles de aplicación no pueden modificarla.
4. Añadir RPCs específicas para consultar la propia capacidad y revocar delegaciones; el alta inicial de titularidad queda fuera de RPC pública.
5. Probar primero en rama/base aislada con usuarios de prueba, nunca con datos reales.
6. Ejecutar advisors y pruebas de regresión; revisar cualquier aviso nuevo antes de avanzar.
7. Solo tras informe de pruebas y autorización explícita independiente, valorar producción.

Pruebas negativas obligatorias:
- usuario anónimo y usuario autenticado no pueden leer ni enumerar el registro de titularidad;
- un administrador de empresa y un `profiles.platform_role='admin'` no adquieren titularidad por ese hecho;
- el primer usuario registrado no puede autoasignarse como propietario;
- delegado no puede conceder, ampliar, transferir ni reactivar una delegación;
- delegación expirada/revocada/suspendida deniega en la siguiente petición;
- capacidad de entorno de pruebas no funciona en producción;
- alcance distinto o comodín no permitido produce DENY;
- nadie obtiene acceso a operaciones, documentos o datos de organizaciones por ser titular de plataforma;
- intentos de UPDATE/DELETE sobre auditoría son rechazados;
- cambio de titularidad sin procedimiento de verificación queda bloqueado.

## 12. Estado y límites de esta entrega

Este documento es diseño, no migración. No crea tablas, no modifica RLS, funciones, Auth, Storage ni datos. No concede privilegios, no modifica producción y no sustituye la revisión jurídica. La PR #175 permanece en borrador hasta resolver las decisiones pendientes.
