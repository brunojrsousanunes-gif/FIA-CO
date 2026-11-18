# FIA&CO — Espacios empresariales y gestión móvil V1

**Estado:** especificación funcional y arquitectónica; pendiente de reconciliación técnica e implementación.  
**Objetivo:** permitir que cada empresa gestione su actividad desde su espacio FIA&CO, con capacidades amplias desde móvil y permisos controlados por persona, organización, área y acción.

## 1. Principio del producto

FIA&CO debe funcionar como un espacio de gestión profesional y empresarial, no como una simple pantalla para consultar operaciones.

Una persona autorizada debe poder realizar desde un teléfono las gestiones que hoy suelen repartirse entre llamadas, correos, documentos, desplazamientos y aplicaciones diferentes, siempre dentro de sus facultades.

La plataforma debe poder incorporar nuevas actividades, servicios y procesos sin reconstruir su estructura cada vez.

## 2. Espacio propio de cada empresa

Cada organización tendrá un espacio de trabajo independiente dentro de FIA&CO. Ese espacio será el contexto principal para sus:

- datos y documentación empresarial;
- trabajadores, responsables y colaboradores;
- departamentos, equipos y áreas;
- operaciones, expedientes, solicitudes e incidencias;
- proveedores y relaciones autorizadas;
- herramientas, automatizaciones e historial;
- configuración y permisos de la organización.

La información de una empresa no se comparte con otra por el mero hecho de colaborar en una operación. La colaboración interempresarial se limita a los datos y acciones expresamente autorizados para cada expediente.

## 3. Identidad y relaciones

- Cada persona tendrá una identidad de acceso propia.
- Una misma persona podrá estar autorizada en varias organizaciones.
- La pertenencia, representación y participación en operaciones son relaciones distintas.
- Cambiar de espacio empresarial debe cambiar también el contexto de datos y permisos.
- No se crean cuentas duplicadas por trabajar con varias empresas.
- FIA&CO no incorpora gestiones personales ajenas a la actividad profesional o empresarial.

El dispositivo móvil u ordenador nunca será la identidad ni la frontera de seguridad.

## 4. Organización interna flexible

Cada empresa podrá configurar sus departamentos, equipos, responsables y colaboradores según su actividad.

Los departamentos sirven para organizar el trabajo. No conceden acceso automáticamente: cada permiso debe estar asignado y comprobado.

El modelo no debe limitarse a una lista cerrada de cargos. Debe admitir funciones y responsabilidades nuevas sin rediseñar la base.

### Responsable máximo de la empresa

La persona que tenga la máxima autoridad empresarial verificada y asignada podrá gestionar desde el móvil la actividad de su organización dentro de sus facultades:

- consultar la actividad empresarial;
- administrar usuarios, equipos y departamentos;
- asignar y revocar permisos;
- crear, supervisar y distribuir gestiones;
- autorizar solicitudes y operaciones;
- consultar documentación, incidencias y resultados;
- gestionar herramientas y automatizaciones disponibles.

Esta capacidad no permite acceder a datos privados de otras organizaciones ni elimina controles legales, verificaciones o aprobaciones especiales.

## 5. Permisos configurables

Los cargos son referencias organizativas, no la autorización final. El permiso efectivo debe estar definido por:

- persona;
- organización;
- área o departamento, cuando proceda;
- recurso o expediente;
- acción concreta;
- finalidad;
- vigencia;
- responsable que lo concede;
- estado de aprobación, suspensión o revocación.

Las acciones podrán diferenciar, como mínimo, consulta, creación, modificación, asignación, aprobación, administración, exportación y gestión de usuarios.

La denegación será el comportamiento predeterminado. Los cambios de permisos se comprobarán en el servidor y quedarán registrados.

Las acciones de riesgo elevado podrán requerir autenticación reforzada, evidencia documental, revisión humana o doble aprobación según el caso.

## 6. Diferencias que deben mantenerse

No mezclar estos conceptos:

- **Identidad:** quién ha iniciado sesión.
- **Pertenencia:** a qué organización pertenece o con cuál colabora.
- **Cargo o función:** qué responsabilidad organizativa tiene.
- **Permiso:** qué acción concreta puede realizar.
- **Nivel de seguridad L0–L4:** qué capacidades y clases de información pueden habilitarse tras superar controles.
- **Requisito documental D1–D3:** qué evidencia necesita una gestión concreta.
- **Aprobación humana:** quién revisó y autorizó una actuación determinada.

Subir de nivel no concede automáticamente todos los permisos. D1–D3 no son niveles de acceso ni autenticación.

## 7. Gestión desde móvil

La experiencia debe ser móvil primero y mantener las mismas reglas de seguridad que la versión de escritorio.

Las funciones se mostrarán según las autorizaciones de cada persona. Entre las capacidades que el producto debe poder incorporar están:

- crear y seguir operaciones y expedientes;
- solicitar y comparar presupuestos;
- coordinar compras, ventas, transportes y entregas;
- gestionar incidencias y documentación;
- asignar tareas y responsables;
- revisar y aprobar solicitudes;
- consultar costes, resultados y métricas;
- gestionar colaboradores y proveedores;
- configurar automatizaciones permitidas;
- consultar el historial de actuaciones.

La lista es una capacidad objetivo, no una afirmación de que todas esas funciones estén actualmente implementadas.

Las acciones sensibles no deben depender de que el usuario esté usando un móvil u ordenador: se aplican las mismas autorizaciones y verificaciones.

## 8. IA dentro de los espacios FIA&CO y frontera humana

### Asistente del espacio empresarial

La asistencia de IA se presta dentro de la propia web/espacio FIA&CO de la empresa activa. No se presupone una IA externa de cualquier web ni una IA independiente por visitante o dispositivo.

Dentro de los permisos de ese espacio, el asistente podrá ayudar a:

- identificar necesidades;
- recopilar la información necesaria para una gestión;
- ordenar datos y documentos;
- explicar procesos;
- preparar borradores y propuestas;
- detectar tareas repetitivas y posibles automatizaciones;
- realizar tareas de bajo riesgo previamente autorizadas mediante el backend.

El asistente no puede concederse permisos, verificar por sí solo una representación legal ni ampliar el acceso a datos.

### Prohibición de comunicación directa con la IA Maestra

**Ninguna IA de un espacio empresarial transmite información directamente a la IA Maestra, ni recibe de ella instrucciones o respuestas por un canal automático IA-a-IA.**

Cuando una gestión pueda requerir análisis central:

1. El asistente prepara el expediente o resumen dentro del espacio FIA&CO.
2. Se crea una tarea interna para revisión humana, sin enviar el contenido a la Maestra.
3. Una persona de FIA&CO, identificada y autorizada, revisa la información y los documentos.
4. Esa persona decide qué datos son pertinentes, necesarios y están autorizados para el análisis.
5. La persona inicia expresamente el envío a la IA Maestra mediante una interfaz interna controlada.
6. La Maestra analiza el contenido recibido y devuelve su resultado al circuito interno de personal FIA&CO.
7. El personal gestiona la comunicación con el cliente y, si procede, organiza una reunión presencial.

La transmisión humana no debe consistir en copiar documentos sensibles indiscriminadamente. Debe utilizar una interfaz segura, con selección de información, comprobación de permisos, trazabilidad y posibilidad de rechazar el envío.

La IA Maestra no contacta directamente con clientes, no concierta reuniones por su cuenta y no puede saltarse la revisión humana.

## 9. Arquitectura de datos y ejecución

El servidor propio de FIA&CO alojará la información central y los servicios de negocio.

La IA Maestra podrá ejecutarse localmente en el equipo dedicado y utilizar únicamente los datos o expedientes que el personal haya autorizado mediante el circuito humano.

La IA no tendrá acceso administrativo directo ni ilimitado a la base de datos. El backend seguirá siendo la autoridad para:

- autenticar identidades;
- comprobar pertenencias y permisos;
- aislar organizaciones y expedientes;
- validar las acciones;
- aplicar aprobaciones;
- registrar auditoría;
- revocar accesos.

## 10. Reutilizar la estructura existente

Esta especificación no ordena crear tablas nuevas.

Antes de diseñar migraciones se deben revisar y reutilizar, cuando sean adecuadas, las estructuras existentes de organizaciones, miembros, operaciones, participantes, niveles Trust, autorizaciones, evidencias y auditoría.

No duplicar tablas o sistemas de roles que ya existan. Primero reconciliar las relaciones y permisos actuales, detectar huecos y preparar un cambio mínimo y reversible.

## 11. Valor económico

Cada función debe justificarse por el valor que aporta a FIA&CO y al cliente.

Medir, cuando existan datos fiables:

- tiempo administrativo ahorrado;
- coste de gestión por operación;
- tareas repetidas eliminadas;
- errores e incidencias evitados;
- tiempo de resolución;
- oportunidades comerciales generadas;
- coste de IA y herramientas;
- tiempo de intervención humana;
- margen de contribución.

No presentar estimaciones como ahorros o beneficios ya conseguidos.

## 12. Criterios de aceptación antes de datos reales

1. Una persona puede acceder desde móvil a los espacios empresariales para los que está autorizada.
2. Una persona vinculada a varias empresas no mezcla sus datos ni permisos.
3. El responsable máximo gestiona su organización desde móvil sin obtener acceso a otras organizaciones.
4. Los departamentos no conceden acceso implícito.
5. Los permisos se comprueban en servidor y pueden revocarse.
6. Los niveles L0–L4 y requisitos D1–D3 conservan sus significados separados.
7. El asistente de una web FIA&CO no tiene canal directo con la IA Maestra.
8. Solo una persona FIA&CO identificada y autorizada puede iniciar el envío de información a la Maestra.
9. La Maestra no puede contactar directamente con clientes ni concederse permisos.
10. Las pruebas positivas y negativas demuestran aislamiento entre empresas, usuarios, expedientes y funciones.
11. El circuito humano registra revisión, decisión, datos enviados y resultado.
12. Las pruebas utilizan exclusivamente organizaciones, personas y documentos ficticios.

## 13. Estado y siguiente paso

Esta especificación recoge la dirección funcional acordada. No está implementada ni certifica el estado de producción.

Siguiente paso técnico: comparar este modelo con el esquema, las migraciones y las funciones ya presentes en las PR #192 y #194; identificar qué se puede reutilizar, qué falta y qué conflictos de permisos existen. Solo después se propondrán cambios de base de datos y pruebas.
