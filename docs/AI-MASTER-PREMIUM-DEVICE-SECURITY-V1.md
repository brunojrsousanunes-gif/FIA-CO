# FIA&CO — acceso Premium seguro desde dispositivos de responsables V1

**Estado:** diseño técnico propuesto; no implementado ni conectado a dispositivos reales.  
**Objetivo:** permitir que gerentes y responsables de organizaciones con derecho Premium accedan a las funciones autorizadas de FIA&CO y soliciten análisis de la IA Maestra desde dispositivos confiables, con comunicaciones cifradas, identidad individual, permisos verificables y revocación.

## 1. Principios no negociables

1. El usuario es la identidad; el dispositivo es un factor/contexto de seguridad, nunca la identidad ni la autorización.
2. Premium habilita el producto contratado, no concede por sí solo facultades empresariales ni acceso a datos de otras organizaciones.
3. Cada operación se autoriza en servidor según persona, organización activa, recurso, acción, finalidad, vigencia y estado.
4. La IA Maestra no tiene acceso administrativo directo a los dispositivos, sesiones, Supabase ni bases de datos.
5. No existe canal automático IA-a-IA entre asistentes de espacios empresariales y la Maestra. La remisión requiere revisión e inicio expreso por personal FIA&CO autorizado.
6. La denegación es el comportamiento por defecto. Un fallo de autenticación, política, conectividad o verificación no debe abrir el acceso.
7. No se exige biometría como condición general. Se admiten passkeys y verificación local del autenticador según las capacidades del dispositivo y la elección/configuración del usuario.

## 2. Componentes de la arquitectura

- **Aplicación FIA&CO:** interfaz móvil/web del espacio empresarial y de la herramienta Premium.
- **Proveedor de identidad:** autentica la cuenta individual y emite sesiones de corta duración. La autorización empresarial no se basa en datos editables por el usuario.
- **Registro de dispositivos confiables:** vincula una credencial criptográfica pública con una persona, una organización/uso permitido y un estado revocable. No convierte al dispositivo en una identidad empresarial.
- **Servicio de autorización:** comprueba en servidor pertenencia, autoridad verificada, permisos concretos, nivel de seguridad aplicable y derecho Premium vigente.
- **Pasarela de operaciones:** recibe solicitudes del dispositivo, valida parámetros y permisos, aplica límites/idempotencia y deriva solo operaciones permitidas.
- **Pasarela humana de IA Maestra:** recibe únicamente paquetes de información seleccionados y autorizados por personal FIA&CO; la Maestra responde al circuito interno, no al asistente empresarial por un canal IA-a-IA.
- **Auditoría y alertas:** registra eventos de seguridad y decisiones relevantes sin almacenar secretos ni contenido sensible innecesario.

## 3. Vínculo criptográfico del dispositivo

### Alta de dispositivo

1. El usuario inicia sesión con su identidad FIA&CO.
2. El sistema comprueba que la cuenta está activa, que la organización está seleccionada y que la persona tiene derecho a solicitar el alta.
3. El dispositivo crea o utiliza una credencial resistente al phishing (preferentemente passkey/WebAuthn). La clave privada permanece en el autenticador/dispositivo; FIA&CO registra únicamente la clave pública y metadatos mínimos.
4. El servidor asocia la credencial al usuario y registra el dispositivo como pendiente o activo según el proceso de verificación.
5. Se notifica al usuario y queda disponible la revocación desde otro dispositivo o canal de recuperación.

No almacenar IMEI, número de serie, huellas invasivas ni identificadores publicitarios para identificar al usuario. Un identificador aleatorio de registro puede ayudar a gestionar el dispositivo, pero no sustituye la prueba criptográfica.

### Capacidades reales por tipo de cliente

- **Navegador/PWA:** HTTPS, WebAuthn/passkeys y políticas de sesión. Web Crypto puede ayudar a proteger operaciones criptográficas, pero una PWA no puede prometer que toda clave local sea hardware-backed ni que el navegador esté libre de malware.
- **Aplicación nativa Android/iOS (posible fase posterior):** puede usar almacenes de claves protegidos por hardware cuando el dispositivo lo soporte, con comprobación de disponibilidad. La atestación de dispositivo solo se incorporará si existe una necesidad demostrada, una política de privacidad clara y compatibilidad suficiente.
- **Equipo interno/servicio a servicio:** certificados y autenticación mutua (mTLS) pueden proteger conexiones entre servicios controlados por FIA&CO. No se utilizarán como sustituto de la identidad y autorización del gerente en el móvil.

No bloquear automáticamente dispositivos por no disponer de hardware de seguridad avanzado: aplicar niveles de capacidad y restringir acciones de alto riesgo cuando no se alcance el requisito, ofreciendo una alternativa segura de verificación.

## 4. Cifrado y protección del transporte

- Todo acceso externo utilizará HTTPS con TLS 1.3 cuando sea compatible, configuración moderna y validación normal de certificados. No se aceptarán certificados inválidos ni degradaciones inseguras.
- HSTS se aplicará en los dominios web controlados cuando la configuración de despliegue esté verificada.
- Las conexiones internas entre servicios usarán TLS; mTLS se reservará para servicios que puedan gestionar correctamente certificados, identidad de carga de trabajo, rotación y revocación.
- Las claves privadas y secretos de servicio permanecerán en el almacén seguro del servidor/entorno; nunca en el frontend, repositorio, prompt o dispositivo del cliente.
- El cifrado en tránsito no sustituye el control de acceso. Los datos almacenados se protegerán mediante los controles de cifrado y gestión de claves de la infraestructura elegida; cualquier cifrado adicional a nivel de aplicación deberá definir quién puede descifrar y cómo se recupera el acceso.
- No prometer cifrado de extremo a extremo si el servidor o la Maestra necesitan procesar el contenido en claro. En ese caso, se documentará el límite: transporte cifrado y acceso interno restringido, con minimización y auditoría.

## 5. Sesiones, continuidad y revocación

- Sesiones breves y renovables, con expiración e invalidación controladas por servidor.
- Reautenticación reforzada para cambios de permisos, exportaciones, administración de usuarios y otras acciones de alto impacto.
- Vincular las operaciones sensibles a una sesión vigente y a una confirmación explícita del usuario; evitar autorizaciones reutilizables o genéricas.
- Revocación por usuario, credencial, dispositivo, organización o derecho Premium, según el alcance aplicable.
- Ante pérdida/robo, el usuario o soporte autorizado podrá revocar el dispositivo; la revocación deberá invalidar sesiones y bloquear nuevas operaciones.
- Un cambio de organización, cargo, pertenencia o permiso debe volver a comprobarse en servidor y no depender de que el cliente actualice su interfaz.
- Detectar patrones anómalos y limitar intentos, sin usar la geolocalización como prueba de identidad.

## 6. Qué puede hacer el responsable desde su dispositivo

La interfaz mostrará únicamente acciones autorizadas. La matriz definitiva se reconciliará con el modelo de permisos existente antes de crear estructuras nuevas.

| Área | Ejemplos de acciones | Control adicional |
|---|---|---|
| Actividad | Consultar panel, tareas, operaciones y alertas de su empresa | Permiso de lectura y aislamiento por organización |
| Equipo | Consultar trabajadores/equipos y asignar tareas | Permiso administrativo específico |
| Operaciones | Crear borradores, asignar responsables, actualizar estados permitidos | Validación de estado, pertenencia e idempotencia |
| Aprobaciones | Aprobar solicitudes dentro de sus facultades | Reautenticación y evidencia cuando proceda |
| Finanzas operativas | Consultar importes o márgenes autorizados | Permisos de campo/acción; no inferirlos del cargo |
| Documentos | Consultar o aportar documentos necesarios | Acceso mínimo, protección de descarga y registro |
| Seguridad | Consultar dispositivos, sesiones y revocar accesos propios o delegados | Confirmación reforzada; doble control para funciones críticas |
| IA Maestra | Solicitar análisis mediante el circuito interno humano | Revisión y selección humana antes de enviar datos |

La disponibilidad Premium se comprobará en servidor mediante el derecho contractual vigente. El cliente no podrá activar funciones cambiando variables, parámetros o código del navegador.

## 7. Operaciones que no se delegan a la IA

La IA puede explicar, resumir, detectar incoherencias y preparar propuestas. No puede por sí sola:

- conceder o elevar permisos;
- validar representación legal;
- aceptar contratos o comprometer a una empresa;
- aprobar pagos, transferencias o cambios financieros;
- exportar expedientes sensibles;
- invitar usuarios con privilegios;
- revocar controles de seguridad;
- enviar información a otros clientes u organizaciones;
- iniciar contacto comercial externo.

Toda ejecución de una operación real pasa por el backend y por la autorización humana exigida. La IA no puede fabricar la aprobación ni alterar su registro.

## 8. Modelo de amenazas y pruebas obligatorias

Antes de activar el acceso Premium con datos reales, probar con identidades, organizaciones y dispositivos ficticios:

1. Usuario autenticado sin Premium: denegación de funciones Premium.
2. Premium activo sin pertenencia/permiso empresarial: denegación de recursos de la empresa.
3. Gerente autorizado en empresa A que cambia a empresa B: nuevo contexto y nueva autorización; ningún dato de A se filtra a B.
4. Dispositivo no registrado: acceso limitado al alta; no se ejecutan operaciones sensibles.
5. Passkey revocada o dispositivo perdido: sesión invalidada y operación denegada.
6. Sesión caducada, token repetido o revocado: denegación.
7. Petición manipulada desde el navegador: servidor vuelve a comprobar todos los permisos.
8. Solicitud desde red interceptada o certificado inválido: conexión rechazada.
9. Intento de reutilizar aprobación o repetir una operación: idempotencia y detección de replay.
10. Miembro de otra organización o usuario suspendido: denegación incluso con URL/ID conocido.
11. Asistente empresarial que intenta llamar directamente a la Maestra: no existe ruta ni credencial para hacerlo.
12. Personal FIA&CO sin autorización de revisión/envío: no puede transmitir el paquete a la Maestra.
13. Exportación o cambio de permisos desde móvil: reautenticación, autorización específica y evento de auditoría.
14. Revocación de Premium: la siguiente comprobación del servidor bloquea las funciones contratadas, sin borrar el historial legítimo.

## 9. Datos y auditoría mínimos

Registrar, con identificadores opacos y retención definida:

- usuario y organización en contexto;
- identificador aleatorio del registro de dispositivo/credencial;
- evento de autenticación y resultado;
- permiso evaluado y resultado;
- acción solicitada, recurso y finalidad;
- fecha/hora del servidor;
- reautenticación/aprobación requerida y resultado;
- revocación, motivo categorizado y actor autorizado;
- identificador de correlación de la solicitud.

No registrar contraseñas, tokens completos, claves privadas, códigos de recuperación ni documentos íntegros en logs. Los eventos críticos serán de servidor y no editables por el cliente.

## 10. Dependencias de la arquitectura existente

Antes de implementar:

1. Reconciliar `profiles`, `organizations`, `organization_members`, roles, Trust, sesiones, autorizaciones y auditoría existentes.
2. Identificar cómo se representa actualmente el derecho Premium y cómo se revoca.
3. Revisar Auth, expiración/revocación de sesiones, RLS, funciones privilegiadas y políticas de acceso.
4. Confirmar si existe ya un registro de dispositivos o credenciales para no duplicarlo.
5. Definir la pasarela interna de la Maestra y la identidad de servicio, separada de la identidad de los usuarios.
6. Seleccionar tecnología y capacidades reales de la aplicación móvil/web antes de prometer almacenamiento hardware-backed.
7. Revisar privacidad, retención, información al usuario y base jurídica del tratamiento de telemetría/seguridad.

**No crear tablas, migraciones, claves, certificados ni integraciones nuevas hasta terminar esta auditoría.**

## 11. Criterios de aceptación

- La conexión externa está cifrada y rechaza certificados inválidos.
- El usuario demuestra control de su credencial; el dispositivo no sustituye su identidad.
- Premium y permisos empresariales se validan en servidor en cada operación relevante.
- La pérdida/revocación de un dispositivo invalida su capacidad de operar.
- Cambiar de organización no mezcla contexto ni datos.
- La Maestra no accede directamente a Supabase ni recibe mensajes de asistentes empresariales.
- Cada envío a la Maestra lo inicia personal FIA&CO identificado y autorizado.
- Las acciones sensibles tienen autorización específica, reautenticación y trazabilidad.
- Se superan pruebas positivas y negativas con datos sintéticos.
- La interfaz funciona desde móvil sin relajar los controles del escritorio.

## 12. Estado

Este documento es una especificación de arquitectura. No demuestra que existan ya passkeys, dispositivos registrados, mTLS, cifrado de aplicación, acceso Premium móvil ni IA Maestra operativa. La siguiente etapa es auditar el código, Auth, políticas, permisos, sesiones y esquema de las PR activas y de `main`, y después diseñar el cambio mínimo compatible.

## 13. Hallazgos iniciales de código revisado (18-11-2026)

Esta revisión es parcial y está limitada a los archivos leídos en la rama de la PR #192 y a la documentación Premium consultada. No equivale a auditoría completa de Auth, RLS, despliegue ni Supabase remoto.

### Base reutilizable observada

- Existe un módulo de contexto de acceso por roles OWNER, ADMIN, OPERATOR y VIEWER en `core/identity/access-control.mjs`.
- Existe una evaluación de capacidades y techo Trust por rol en `core/identity/hierarchy-security-access.mjs`; el módulo indica que el estado del cliente no eleva el acceso y que la evaluación de producción debe generarse en servidor.
- Las migraciones revisadas aplican controles de pertenencia activa y revocación de autoridad CEO cuando termina la relación o el rol; también endurecen privilegios y funciones SECURITY DEFINER.
- Existe un token firmado para preproducción en `core/identity/preprod-session-token.mjs`, con duración limitada y marca explícita `productionIdentityVerified: false`; sus pruebas cubren firma alterada y expiración.

### Brechas que no se deben confundir con capacidades ya disponibles

- El token anterior es expresamente de preproducción; en el archivo revisado no hay registro de dispositivos, vínculo a clave pública, passkey/WebAuthn ni revocación individual de credenciales.
- El módulo de roles/capacidades revisado es una lógica de aplicación con roles estáticos; no demuestra por sí solo permisos configurables por departamento, dispositivo o tarea en producción.
- En los documentos Premium consultados, `PREMIUM_AGENT_READY=false` y el pricing sigue siendo una hipótesis pendiente de costes, pilotos y revisiones externas.
- En esta lectura inicial no se ha demostrado un derecho Premium validado en servidor, panel de dispositivos, automatizaciones Premium productivas ni medición real de ROI.
- No se ha inspeccionado todavía el estado remoto de Supabase ni se ha probado un inicio de sesión real desde dispositivos.

### Consecuencia de diseño

Reutilizar identidad, pertenencia, jerarquía, Trust, RLS y auditoría existentes donde correspondan. Antes de proponer tablas nuevas, completar la inspección de migraciones, políticas, funciones, Auth, sesiones y consumidores. No reutilizar el token de preproducción como sesión Premium ni tratar el rol OWNER/CEO como sustituto automático del permiso para cada operación.

