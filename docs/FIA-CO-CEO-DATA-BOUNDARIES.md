# FIA&CO — límites de información y permisos del CEO

**Estado:** auditoría de solo lectura y diseño previo.  
**Fecha:** 2026-11-14.  
**Rama de trabajo:** `test/company-head-data-boundaries`.

## Regla funcional acordada

El jefe de la empresa es el CEO. El CEO puede acceder a todos los módulos y a toda la información empresarial de su propia organización, incluida la información comercial, económica y confidencial. No puede consultar información sensible que pertenezca a otras empresas por el mero hecho de participar en un expediente.

El gerente de zona puede autorizar L3 cuando su cargo esté verificado. Esa facultad no le concede automáticamente el acceso general del CEO.

L3 permite colaborar en un expediente; **no es un permiso general para consultar todos los datos confidenciales de los socios**.

## Hechos comprobados en la auditoría de solo lectura

- Las 18 tablas públicas revisadas tienen RLS activado. También lo tiene `private.organization_security_profiles`.
- Las tablas consultadas aparecen sin filas. La auditoría no encontró buckets ni políticas en el esquema `storage`.
- Los roles actuales de pertenencia a una empresa son `member`, `manager` y `admin`. No existe todavía un rol de pertenencia `company_head`.
- `private.can_access_operation` permite leer una operación a cualquier miembro activo de cualquiera de las organizaciones participantes.
- La política de lectura de `operations` permite leer la fila completa. Entre sus columnas visibles están `margin_floor_cents`, `calculated_margin_cents` y `margin_status`.
- Las políticas de lectura de `operation_cost_items` y `operation_audit_events` también usan el acceso general al expediente. Por tanto, cualquier participante puede consultar sus filas.
- `private.can_manage_operation` está ligado a la cuenta que creó la operación; no concede administración por ser jefe de una organización participante.
- `private.is_inventory_manager` reconoce `manager` y `admin`, pero no existe una regla específica para el jefe.
- La aplicación tiene una jerarquía de capacidades `OWNER/ADMIN/OPERATOR/VIEWER`, pero no está demostrada una correspondencia segura entre esos nombres y los cargos reales de `organization_members`.
- La política de datos clasifica información comercial confidencial, pero la clasificación por sí sola no identifica a qué empresa pertenece cada dato ni sustituye una autorización por recurso.

## Auditoría ampliada de operaciones y trazabilidad

- `operation_participants`, `operation_confirmations` y `operation_notifications` también son legibles por los participantes autorizados del expediente. Su contenido debe revisarse campo por campo para distinguir datos operativos compartidos de datos internos.
- `operation_audit_events` expone a los participantes `event_data` completo, además del actor, tipo de evento y hashes. Como el JSON puede contener detalles variables, no es seguro asumir que todo su contenido sea apto para todas las empresas.
- `operation_cost_items` tiene `created_by`, pero no una organización propietaria explícita. El creador no es una forma fiable de determinar la propiedad: una misma persona podría pertenecer a varias empresas.
- `operation_incidents` permite a los participantes leer descripciones y notas de resolución. Debe distinguirse la incidencia compartida que afecta a la operación de las notas internas de una empresa.
- `private.can_manage_operation` se basa en `operations.created_by`; no concede control al CEO de una empresa participante. No se debe sustituir por una regla que permita al CEO de una empresa gestionar datos de todas las partes.

- La pertenencia de empresa tiene una restricción que solo admite `member`, `manager` y `admin`; el rol `ceo` aún no existe en esa tabla.
- La única función revisada que usa directamente `member_role` es `private.is_inventory_manager`, que actualmente solo admite `manager` y `admin`. El CEO deberá añadirse de forma explícita, no hacerse pasar por `admin`.
- `private.can_manage_operation` sigue dependiendo de `operations.created_by`. No debe ampliarse para que el CEO de una empresa pueda gestionar los datos internos de las otras partes.
- Las políticas de participantes, confirmaciones, evidencias, incidencias, presupuestos logísticos, notificaciones y auditoría permiten lectura a participantes del expediente. Campos como `event_data`, `metadata`, `storage_path`, `description`, `resolution_note` y `message` necesitan clasificación y alcance explícitos antes de considerarlos compartibles.
- `organization_members` no ofrece una política de alta/modificación directa al usuario autenticado; el rol CEO debe asignarse mediante un proceso administrativo confiable, nunca mediante `user_metadata` ni un campo editable por el propio usuario.
- No se encontraron buckets ni políticas de Storage en la auditoría actual. Por tanto, la protección efectiva de archivos todavía no está validada y debe revisarse cuando se habilite el almacenamiento.

## Riesgo detectado

La frontera actual protege varias tablas por pertenencia a una organización, pero el expediente compartido abre la lectura de algunas tablas completas a todas las empresas participantes. Esto incluye márgenes internos y partidas de costes. Por ello, el modelo actual no demuestra todavía la regla de que una empresa no pueda consultar la información sensible interna de otra.

No se debe corregir ampliando o reduciendo indiscriminadamente `can_access_operation`: esa función protege el acceso al expediente compartido y no debe convertirse en un permiso para administrar datos internos de todas las partes.

## Modelo objetivo

1. **Propiedad clara:** cada dato empresarial interno debe tener una organización propietaria explícita. No inferirla solo de `created_by`, porque una persona puede pertenecer a más de una organización.
2. **CEO:** máxima autoridad ejecutiva de la empresa, con cargo y vinculación verificados, y acceso completo a los datos y módulos de su organización. Su acceso no le permite suplantar al usuario que aceptó un papel operativo de vendedor, comprador o transportista.
3. **Gerente de zona:** puede autorizar L3 tras verificar su cargo y ámbito. No recibe acceso general a los datos internos de las empresas por esa autorización.
4. **Expediente compartido:** solo contiene los campos necesarios para la operación y expresamente compartidos: estado, aceptación, entrega, recepción y los importes/ofertas que formen parte de la propuesta aceptada.
5. **Datos confidenciales de cada empresa:** márgenes internos, costes propios, notas internas, documentación de verificación y demás información no compartida quedan restringidos a su organización.
6. **Compartición excepcional:** un dato confidencial de otra empresa solo se comparte mediante autorización específica del propietario, con destinatario, finalidad, alcance, caducidad y revocación. La participación L3 no sustituye este permiso.
7. **Denegación por defecto:** si no se puede determinar de forma fiable la organización propietaria o el alcance de una autorización, no se muestra el dato.
8. **Separación de responsabilidades:** el jefe puede supervisar y delegar dentro de su empresa; las transiciones que corresponden al usuario aceptante de un papel siguen vinculadas a esa identidad y a sus confirmaciones.


### Decisión técnica antes de migrar

No aplicar todavía un cambio general de RLS ni una ampliación de `can_access_operation`. La solución requiere primero identificar el propietario organizativo de cada dato y separar el expediente compartido de los datos internos. Para los campos financieros y de auditoría, la opción segura es mover la información interna a tablas protegidas por `organization_id` y ofrecer a los socios una salida compartida explícita y limitada. No basta con ocultar campos en la interfaz: la protección debe aplicarse en PostgreSQL.

## Secuencia de implementación

### Fase 1 — inventario de propiedad
Clasificar cada tabla y campo como dato interno de una organización, dato personal, dato compartido del expediente o dato público. Añadir propiedad explícita donde falte y documentar las excepciones.

### Fase 2 — separación de información financiera
Separar los márgenes y costes internos de los campos compartidos de `operations`. Evitar que las empresas participantes reciban columnas internas mediante una lectura de fila completa. Mantener una vista o respuesta compartida con los campos autorizados.

### Fase 3 — permisos del CEO
Incorporar el rol interno `ceo` a la pertenencia de empresa y a las comprobaciones de servidor. Permitirle acceder a los datos de su organización, incluidos inventario, equipo, operaciones, documentos y seguridad, sin ampliar el acceso a organizaciones ajenas.

### Fase 4 — permisos explícitos entre empresas
Crear concesiones de acceso por dato/recurso, organización destinataria, finalidad, caducidad y revocación. Separar estas concesiones de la autorización L3 de colaboración.

### Fase 5 — pruebas negativas y positivas
Probar con tres empresas y, como mínimo, jefe, gerente de zona, operador y miembro ordinario:
- el CEO lee y administra los datos internos de su empresa;
- el CEO no lee márgenes, costes ni documentación confidencial de otra empresa;
- un gerente de zona puede autorizar L3, pero no obtiene acceso general por ello;
- los participantes solo ven los campos compartidos del expediente;
- un permiso explícito abre únicamente el dato, destinatario y finalidad autorizados;
- la caducidad o revocación cierra ese acceso;
- ningún jefe suplanta la aceptación o confirmación de otro participante.

## Límites de esta fase

- Esta auditoría fue de solo lectura. No se modificó la base de datos conectada ni se desplegó nada.
- No se debe aplicar una migración a producción hasta completar las fases, adaptar las consultas de la aplicación y superar las pruebas RLS.
- La migración L3 y el piloto de tres empresas ya tienen su propia PR y CI; este trabajo de límites de información se mantiene separado para no mezclar cambios de autorización con cambios de propiedad de datos.
