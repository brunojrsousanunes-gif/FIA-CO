# FIA&CO — Incorporación progresiva de participantes V1

**Estado:** especificación de producto y arquitectura; pendiente de implementación y validación técnica.  
**Ámbito:** personas físicas, autónomos, empresas, empleados, representantes, proveedores, transportistas, colaboradores y organismos cuando exista una integración adecuada.

## 1. Regla principal

**FIA&CO solicita a cada participante únicamente la información necesaria para la acción, servicio o capacidad que esté intentando utilizar, y la solicita en ese momento.**

No se exige completar un expediente general para crear una cuenta ni se recopilan datos anticipadamente para posibles usos futuros.

Cada solicitud de datos debe explicar, en lenguaje sencillo:
- qué dato se necesita;
- para qué acción o servicio;
- por qué es necesario y si es obligatorio u opcional;
- quién podrá verlo;
- durante cuánto tiempo se conservará o qué regla de conservación se aplica;
- qué alternativa existe si el participante no desea facilitarlo, cuando la haya.

Si un dato no es necesario para el paso actual, no se solicita.

## 2. Secuencia de incorporación

### A. Crear una cuenta
Recoger solo lo necesario para crear y proteger la cuenta:
- método de autenticación;
- identificador de contacto verificado cuando el método lo requiera;
- nombre visible o identificador mínimo de perfil.

No exigir de entrada CIF/NIF, domicilio, documentos, datos bancarios, información de empleados ni cuestionarios empresariales. La cuenta personal no obliga a crear una empresa.

### B. Aceptar o prestar el primer servicio
Solicitar los datos concretos que exija ese servicio: por ejemplo, dirección de entrega si hay transporte, datos fiscales si una obligación real de facturación lo requiere, o datos de contacto operativo si hacen falta para coordinarlo.

La aceptación del servicio no autoriza usos ajenos a su finalidad ni concede permisos generales sobre el perfil o la empresa.

### C. Actuar en nombre de una empresa u organización
Separar tres hechos:
1. identidad de la persona;
2. existencia/identidad de la organización;
3. autorización de esa persona para actuar en su nombre y con un alcance determinado.

La invitación de una empresa permite iniciar la vinculación, pero no demuestra por sí sola representación legal ni concede permisos ilimitados. Para tareas ordinarias puede bastar la aprobación de un administrador autorizado de la organización. Para actos de mayor riesgo se exige evidencia proporcional (por ejemplo, mandato, poder o verificación adecuada), revisada antes de habilitar esa capacidad.

Los permisos se asignan por persona, organización, operación y función; no se heredan automáticamente de una relación distinta.

### D. Acceder a capacidades o niveles superiores
Solicitar datos y autorizaciones adicionales solo cuando una capacidad concreta los necesite. Antes de desbloquearla, FIA&CO debe comprobar:
- finalidad y necesidad del dato;
- nivel de seguridad aplicable;
- autorización del titular/organización correspondiente;
- permisos del usuario;
- controles de acceso, trazabilidad y conservación.

Un nivel superior no concede acceso automático a toda la información. Los permisos y las autorizaciones siguen siendo granulares.

## 3. Identidad, perfil y relaciones

Mantener una identidad personal única por usuario, con relaciones separadas y múltiples:
- actividad por cuenta propia;
- pertenencia o colaboración con una o varias organizaciones;
- representación autorizada;
- participación limitada en operaciones concretas.

No crear cuentas distintas para cada profesión o empresa si una sola identidad puede representar esas relaciones de forma segura.

El perfil personal, el espacio de cada organización y los expedientes de operación son ámbitos de información separados. La información empresarial se gestiona en el espacio de la organización; la información personal se trata según su finalidad y los derechos de la persona. La asignación de acceso no debe confundirse con la titularidad jurídica de los datos ni con la determinación legal de quién es responsable del tratamiento.

## 4. Cuestionarios adaptativos

El cuestionario inicial será breve y contextual. Las preguntas se activan según el servicio o capacidad seleccionados, no por una lista fija para todos.

Ejemplos:
- transporte: origen/destino, contacto operativo y características necesarias de la carga;
- proveedor: categorías de servicio, cobertura y datos de contacto pertinentes;
- empresa con equipo: personas que necesitan acceso y funciones;
- representación: alcance de la autorización y evidencia necesaria según el riesgo;
- integración avanzada: sistema implicado, finalidad, permisos técnicos y responsable.

No solicitar credenciales de correo, ERP, CRM, bancos o APIs mediante formularios. Las integraciones deben utilizar mecanismos oficiales y permisos limitados.

## 5. Avisos de captación comercial acordados

La actividad de invitaciones puede generar una señal interna para el equipo FIA&CO, sin convertirla en una autorización para contactar automáticamente:

- participante no registrado que acumula 4 o 5 invitaciones/notificaciones válidas de organizaciones colaboradoras: crear aviso interno para valorar contacto y ofrecimiento de incorporación;
- organización con potencial de volumen o rentabilidad respaldado por criterios medibles: generar aviso prioritario desde la primera notificación.

Los umbrales y criterios comerciales serán configurables y revisables. Evitar contar reintentos, duplicados, notificaciones fallidas o actividad automatizada como invitaciones válidas. El aviso interno no equivale a consentimiento para marketing ni inicia una visita automáticamente: el contacto se realizará por un canal y con una base jurídica adecuados, respetando preferencias y oposición.

## 6. Modelo mínimo de solicitud de datos

Cada petición de información debe quedar asociada a:
- participante y ámbito (personal, organización u operación);
- servicio/capacidad que la activa;
- campos estrictamente necesarios;
- finalidad y justificación;
- carácter obligatorio/opcional;
- destinatarios y permisos de lectura;
- regla de conservación;
- estado (pendiente, aportado, verificado, rechazado o caducado);
- versión de aviso/autorización aplicable;
- marca temporal y actor que la solicita o valida.

No registrar valores sensibles innecesarios en logs. Registrar eventos de solicitud, validación, acceso, revocación y eliminación según la política aplicable.

## 7. Reglas de seguridad y privacidad

- Denegación por defecto y mínimo privilegio.
- Validación y autorización en servidor; nunca confiar en campos, niveles o roles enviados por el navegador.
- RLS y pruebas de aislamiento entre usuarios, organizaciones y operaciones.
- No utilizar metadatos editables por el usuario como prueba de rol o autorización.
- No exponer datos personales o comerciales de una organización a otra por el mero hecho de compartir una operación.
- Revocación efectiva de relaciones y permisos; conservar solo los registros que deban mantenerse por obligación o defensa de reclamaciones.
- Minimización, limitación de finalidad, transparencia, exactitud y conservación limitada conforme al RGPD y normativa aplicable.
- No activar recogida de datos reales hasta que autenticación, permisos, formularios, retención y revisión legal estén verificados.

## 8. Criterios de aceptación

La implementación se considerará validada cuando las pruebas demuestren que:
1. una persona puede crear cuenta sin aportar datos empresariales;
2. un autónomo puede participar sin crear una organización ficticia;
3. una persona puede relacionarse con varias organizaciones sin mezclar sus permisos;
4. aceptar un servicio solo solicita los campos de ese servicio;
5. no se puede actuar en nombre de una empresa sin la autorización adecuada al riesgo;
6. un nivel superior no desbloquea datos ni acciones no autorizados;
7. los datos personales, empresariales y de operación permanecen separados;
8. un usuario no puede leer ni modificar datos de otro usuario u organización fuera de sus permisos;
9. las solicitudes y autorizaciones quedan auditadas sin registrar valores sensibles innecesarios;
10. los avisos de captación se generan con los umbrales acordados y no envían comunicaciones automáticamente.

## 9. Dependencias y estado

La base actual del proyecto ya contempla identidad, niveles Trust, permisos e información por nivel, así como una matriz de cobertura de formularios. Esta especificación debe integrarse con esas piezas y evitar crear un sistema paralelo.

La auditoría técnica previa detectó que el flujo comercial de invitaciones todavía no estaba implementado y que la autenticación real seguía desactivada en la configuración prepiloto. Por tanto, esta especificación **no declara disponible** el registro real, la invitación comercial, la captación ni el cuestionario dinámico.

Antes de conectar persistencia o habilitar usuarios reales:
- reconciliar el modelo con las tablas y políticas existentes;
- diseñar migraciones incrementales y RLS;
- revisar los permisos por rol, incluida la exposición de importes de operación;
- añadir pruebas automatizadas de acceso permitido y denegado;
- mantener Supabase remoto y producción sin cambios hasta superar las pruebas y recibir autorización específica.

## 10. Principio de experiencia

La experiencia debe sentirse natural: FIA&CO pide un dato cuando ayuda a completar algo que el participante quiere hacer, explica por qué lo necesita y no vuelve a pedirlo si ya está disponible, vigente y autorizado para esa misma finalidad.
