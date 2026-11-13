# FIA&CO — Modelo de autorizaciones L4

**Estado:** propuesta técnica para revisión; no habilita permisos en producción.  
**Versión:** l4-authorization-model.v1  
**Ámbito:** aplicación FIA&CO y futura aplicación en Supabase.

## 1. Principios no negociables

1. El nivel L4 habilita la posibilidad de solicitar flujos avanzados; no concede por sí solo acceso a datos ni acciones.
2. Una autorización siempre está limitada por usuario, empresa, operación/recurso, acción, finalidad y vigencia.
3. Se exige simultáneamente: nivel/capacidad suficiente + identidad autenticada + pertenencia y estado aceptado + rol funcional + autorización vigente + política de datos + consentimiento/confirmación humana cuando corresponda.
4. La denegación es el resultado por defecto ante ausencia, contradicción, caducidad o fallo de cualquier comprobación.
5. Las decisiones de autorización se validan en servidor/base de datos. Ocultar controles en la interfaz nunca cuenta como seguridad.
6. No se almacenan credenciales, secretos ni documentos críticos en prompts de IA.
7. FIA&CO no recibe, custodia ni mueve fondos. L4 no altera esta frontera.
8. Los datos críticos no se comparten entre organizaciones en ningún nivel.

## 2. Separación de conceptos

### Titularidad de FIA&CO y privacidad

- La titularidad del proyecto/plataforma FIA&CO corresponde a su propietario, cuya identidad y autoridad se gestionarán de forma privada cuando exista una necesidad legal u operativa justificada.
- El nombre, DNI/NIE, domicilio, firma y documentos del propietario no se publicarán en la web, interfaz pública, perfiles visibles para otras empresas, repositorio ni documentación técnica abierta.
- No se incluirán datos identificativos personales en código, commits, issues, logs generales, prompts de IA ni metadatos públicos.
- Si una obligación legal exige identificar al titular o representante, los datos se recogerán por un canal privado y seguro, solo en la medida necesaria, con finalidad, acceso y conservación limitados.
- La titularidad de FIA&CO es distinta del rol OWNER de cada empresa cliente. El propietario de la plataforma no se convierte por ello en propietario ni administrador de las organizaciones usuarias.
- Para cada empresa cliente, la autoridad que puede aprobar divulgaciones de sus datos deberá acreditarse separadamente; no se presume por ser administrador técnico ni por ser propietario de FIA&CO.
- El propietario de FIA&CO conserva el control de gobierno de la plataforma. Puede delegar tareas administrativas concretas, con alcance, duración y revocación definidos, pero la delegación no transfiere titularidad ni permite al delegado ampliar sus propios privilegios.
- La identidad del titular no se expondrá a otras empresas por defecto. Cuando una contraparte necesite verificar la autoridad de una empresa, se mostrará únicamente el estado de verificación y la información mínima legalmente exigible.


- **Nivel de confianza de empresa:** L0–L4; refleja controles verificados.
- **Rol de usuario:** OWNER, ADMIN, OPERATOR o VIEWER dentro de una empresa.
- **Rol en operación compartida:** SELLER, CARRIER o BUYER; define responsabilidades dentro de un expediente concreto.
- **Grant/autorización:** concesión concreta, limitada y revocable.
- **Confirmación de negocio:** aceptación explícita de una acción de operación; no equivale a conceder permisos generales.

Ninguno de estos conceptos sustituye a los demás.

## 3. Catálogo inicial de privilegios L4

| Código | Privilegio | Alcance permitido | Límite obligatorio |
|---|---|---|---|
| L4.DATA.PERSONAL.READ | Consultar datos personales | Campos expresamente autorizados de un expediente | Finalidad, mínimo de campos y destinatario |
| L4.DATA.PERSONAL.SHARE | Compartir datos personales | Campos concretos con empresa destinataria identificada | Revisión jurídica/seguridad y autorización de origen |
| L4.DATA.PERSONAL.EXPORT | Exportar datos personales | Exportación puntual y justificada | Permiso separado; registro y controles de descarga |
| L4.DOC.READ | Consultar documentos | Documento o categoría autorizada | Acceso por expediente y empresa |
| L4.DOC.ATTACH | Adjuntar documentos | Expediente autorizado | Tipo, finalidad, clasificación y retención |
| L4.DOC.SHARE | Compartir documentos | Destinatario y documento concretos | No compartir automáticamente anexos relacionados |
| L4.INTEGRATION.READ | Consultar metadatos de proveedor | Integración previamente aprobada | Solo campos y endpoints permitidos |
| L4.INTEGRATION.ACTION | Solicitar acción externa | Acción incluida en política del proveedor | Confirmación humana específica antes de ejecutar |
| L4.AUTOMATION.PROPOSE | Preparar o proponer automatizaciones | Expedientes y campos autorizados | La IA no aprueba ni ejecuta decisiones sensibles |
| L4.DELEGATION.MANAGE | Administrar delegaciones | Usuarios de la propia empresa | No puede delegar más permisos de los que posee |
| L4.AUDIT.READ | Consultar trazabilidad | Eventos visibles para su empresa/rol | No permite alterar ni borrar el registro |
| L4.ACCESS.SUSPEND | Suspender un grant | Grant bajo su ámbito de administración | Motivo obligatorio; no elimina el historial |

Los códigos son identificadores de diseño, no permisos ya existentes.

## 4. Matriz orientativa por rol interno

| Privilegio | OWNER | ADMIN | OPERATOR | VIEWER |
|---|---:|---:|---:|---:|
| Consultar datos personales autorizados | Sí, con grant | Sí, con grant | Solo si se delega | No por defecto |
| Autorizar compartir datos de su empresa | Sí | Solo delegación expresa | No | No |
| Exportar datos personales | Grant específico + doble control si procede | No por defecto | No | No |
| Consultar/adjuntar documentos | Según grant | Según grant | Según grant | Lectura limitada |
| Compartir documentos externamente | Sí, grant específico | Solo delegación expresa | No | No |
| Administrar integraciones | Sí | Delegable y acotado | No | No |
| Ejecutar acción externa sensible | Confirmación específica | Confirmación específica si delegado | No por defecto | No |
| Proponer automatizaciones | Sí | Sí | Sí, dentro de su operación | No por defecto |
| Delegar privilegios | Sí, sin superar su alcance | Solo si OWNER lo delega | No | No |
| Consultar auditoría | Sí | Sí, ámbito delegado | Eventos propios/operación | No por defecto |
| Suspender autorizaciones | Sí | Solo grants delegados | No | No |

**Regla:** la tabla no concede derechos automáticamente. Cada celda afirmativa sigue necesitando grant y comprobación de contexto. Los roles SELLER/CARRIER/BUYER se evalúan aparte y no heredan permisos de OWNER/ADMIN.

## 5. Autorización entre empresas

Para un flujo que involucre vendedor, transportista y comprador:

1. Cada empresa debe estar verificada y participar en estado ACCEPTED.
2. La empresa que controla los datos autoriza la divulgación de los campos concretos.
3. La empresa receptora y sus usuarios deben estar identificados.
4. El expediente debe tener finalidad documentada y permitida.
5. Los datos personales requieren revisión jurídica y de seguridad del flujo concreto antes de activarse.
6. El transportista solo recibe los datos necesarios para la recogida/entrega; no obtiene por ello acceso a datos comerciales internos del comprador o vendedor.
7. La aceptación de una empresa en un expediente no equivale a aceptar futuras operaciones ni otros expedientes.
8. Una autorización de una empresa no puede conceder acceso a datos controlados por otra.

Los datos comerciales confidenciales y los datos personales deben tener permisos separados. Los datos críticos, credenciales y secretos quedan excluidos del intercambio interempresarial.

## 6. Ciclo de vida de un grant

Estados permitidos:

- PENDING: solicitado, todavía no utilizable.
- ACTIVE: aprobado y dentro de vigencia.
- SUSPENDED: bloqueado temporalmente.
- REVOKED: revocado; no puede reactivarse editando el mismo registro.
- EXPIRED: caducado automáticamente.

Campos mínimos propuestos:

- id inmutable
- organization_id que concede
- recipient_organization_id, si hay destinatario externo
- subject_user_id o grupo interno autorizado
- resource_type y resource_id
- privilege_code
- data_fields permitidos
- purpose_code y purpose_description
- legal_review_reference cuando aplique
- approved_by y approved_at
- valid_from y expires_at
- status, revoked_by, revoked_at y revocation_reason
- created_at y versión de política

No se debe aceptar un grant sin vencimiento para datos personales o acceso externo. La duración máxima se fijará por tipo de finalidad en una política posterior, no se deja a elección libre del cliente.

## 7. Reglas de aprobación

- El solicitante no puede aprobar su propia solicitud cuando la acción implique compartir datos personales, exportarlos o habilitar acciones externas sensibles.
- Para compartir datos personales entre empresas: aprobación del responsable autorizado de la empresa que divulga, comprobación de finalidad y revisión jurídica/seguridad del flujo.
- Para exportación: privilegio separado y motivo registrado.
- Para acciones externas: mostrar la acción, proveedor, datos enviados y efecto esperado; exigir confirmación humana justo antes de ejecutarla.
- Cambios de destinatario, finalidad, campos o recurso invalidan la autorización anterior y requieren una nueva.
- Un cambio de nivel de confianza no amplía grants existentes.

## 8. Revocación, caducidad e incidencias

La revocación debe bloquear el acceso en servidor en la siguiente comprobación, sin depender de que el usuario cierre sesión. Los tokens o enlaces de descarga de larga duración no deben permitir eludir una revocación. Ante incidente, se podrá suspender el grant y registrar el motivo; la reactivación requerirá revisión y aprobación nueva.

## 9. Auditoría

Registrar como mínimo: solicitud, aprobación/rechazo, lectura sensible cuando sea viable, divulgación, exportación, acción externa, suspensión, revocación y caducidad.

Cada evento debe identificar actor, empresa, expediente/recurso, privilegio, finalidad, resultado, fecha de servidor y correlación de solicitud. El registro es append-only; los usuarios de negocio no pueden editarlo ni borrarlo. No guardar en auditoría el contenido completo de documentos ni secretos.

## 10. Decisión de acceso

La decisión debe ser DENY salvo que todas las comprobaciones aplicables sean verdaderas:

`ALLOW = authenticated AND accepted_membership AND role_permission AND sufficient_trust_level AND active_grant AND purpose_match AND resource_scope_match AND data_policy_pass AND required_human_approval`

La función de autorización debe ejecutarse en el servidor/base de datos. La interfaz solo refleja el resultado.

## 11. Pruebas obligatorias antes de producción

1. L4 sin grant: denegado.
2. Grant expirado, suspendido o revocado: denegado.
3. Usuario de otra empresa: denegado.
4. Empresa invitada pero no aceptada: denegado.
5. Grant para otro expediente, campo, finalidad o destinatario: denegado.
6. OPERATOR/VIEWER intentando aprobar o delegar: denegado.
7. Solicitante intentando autoaprobar una divulgación sensible: denegado.
8. Cambio de destinatario/finalidad/campos: grant anterior no reutilizable.
9. Revocación mientras hay sesión activa: siguiente acceso denegado.
10. L0–L3 intentando usar privilegios L4: denegado.
11. Intento de compartir datos críticos o credenciales: denegado en todos los niveles.
12. Intento de custodiar o mover fondos mediante FIA&CO: denegado en todos los niveles.
13. Auditoría: los eventos no se pueden modificar ni borrar por usuarios de negocio.
14. Pruebas de concurrencia para evitar que una revocación y una acción simultáneas permitan una ejecución no autorizada.

## 12. Implantación por etapas

- **Etapa A — Diseño:** revisar este catálogo y los roles existentes; cerrar vocabulario y reglas.
- **Etapa B — Modelo de datos:** diseñar tablas privadas de grants, aprobaciones y auditoría, con RLS y restricciones.
- **Etapa C — Motor de autorización:** una única comprobación de servidor reutilizable por RPCs y endpoints.
- **Etapa D — Integración:** conectar operaciones, documentos e integraciones una por una.
- **Etapa E — Verificación:** pruebas negativas/positivas, revisión de privilegios y asesores de seguridad.
- **Etapa F — Activación:** solo tras revisión y autorización expresa; despliegue y migraciones de producción separados.

## 13. Fuera de alcance

Este documento no constituye una evaluación jurídica ni acredita cumplimiento normativo. No activa permisos, no crea tablas, no modifica RLS, no cambia configuración de Auth y no se aplica a la base de datos de producción.
