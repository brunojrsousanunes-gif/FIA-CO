# Datos sintéticos maestros FIA&CO — tres empresas

- **Versión:** 1.0.0
- **Estado:** DEFINICIÓN DOCUMENTAL; no cargado en Supabase ni en ningún entorno.
- **Finalidad:** conservar identidades y escenarios reproducibles para pruebas futuras sin mantener registros ficticios en la base operativa.
- **Fuente de datos:** `tests/fixtures/fia-co-three-party-synthetic.v1.json`
- **Naturaleza:** todos los nombres, identidades y operaciones de este paquete son ficticios. No representan clientes, proveedores, transportistas ni actividad comercial real.

## 1. Regla de separación

Este paquete es un catálogo de fixtures, no una fuente de verdad comercial ni un seed de producción.

1. No importar ni ejecutar automáticamente este archivo contra Supabase remoto, producción, Pages ni cuentas Auth.
2. No crear usuarios Auth reales, correos, teléfonos, credenciales ni documentos personales para estas identidades.
3. Los identificadores son claves simbólicas `fixture:...`, no UUID de producción ni identificadores de Auth.
4. Solo convertir estas claves a UUID efímeros dentro de una base de pruebas aislada, al preparar la futura batería de integración.
5. Toda interfaz, informe o captura que use estos datos debe mostrar «DATOS SINTÉTICOS — ENTORNO DE PRUEBAS».
6. No inferir que un escenario está implementado porque exista aquí. Cada capacidad debe verificarse contra código, migraciones y pruebas.
7. Los datos reales se incorporarán posteriormente, aportados por el usuario y validados según finalidad, permisos y minimización.

## 2. Identidades ficticias estables

| Clave | Nombre ficticio | Papel principal | Responsabilidad en el escenario |
|---|---|---|---|
| `fixture:org:seller:recambios-demo` | RECAMBIOS DEMO | Vendedor | Publicar/confirmar artículo, preparar pedido y gestionar incidencias de suministro |
| `fixture:org:buyer:agrotest-norte` | AGROTEST NORTE | Comprador | Solicitar compra, confirmar condiciones y recepción |
| `fixture:org:carrier:transportes-piloto` | TRANSPORTES PILOTO | Transportista | Presentar oferta logística, aceptar servicio y confirmar recogida/entrega |

Los nombres son etiquetas de test reservadas. No comprobar ni sugerir que sean entidades mercantiles existentes.

### Identidades de actor

El JSON define un actor técnico ficticio por organización. Son referencias lógicas para pruebas de autorización, no personas identificables ni cuentas iniciables. No contienen correo, contraseña, teléfono, nombre personal ni secreto.

## 3. Escenarios conservados

- **SYN-001 — Compra de maquinaria:** comprador, vendedor y transportista participan en un expediente común. Verificar invitación/aceptación, aislamiento por organización, cotización, selección, costes, confirmaciones y cierre.
- **SYN-002 — Entrega de recambio:** pedido, preparación, recogida, entrega y posible incidencia. Verificar transiciones autorizadas, evidencia y trazabilidad.
- **SYN-003 — Comparación logística:** dos ofertas ficticias del transportista de prueba en revisiones separadas del escenario. Verificar selección autorizada, idempotencia, cálculo y bloqueo de modificación directa.
- **SYN-004 — Incidencia y resolución:** registrar incidencia, responsables, evidencia, respuesta, resolución y cierre sin borrar el historial.
- **SYN-005 — Revocación y aislamiento:** retirar pertenencia de un actor y comprobar que el creador histórico o una pertenencia en otra organización no conserva acceso.
- **SYN-006 — Reintentos y concurrencia:** repetir solicitudes con la misma clave y payload, y con payload/actor diferentes; comprobar ausencia de duplicados y rechazo de reutilización indebida.

## 4. Contrato de pruebas

Las pruebas futuras deberán incluir, como mínimo:

- Casos positivos para el papel autorizado y negativos para los otros dos papeles.
- Acceso entre organizaciones denegado por defecto.
- Invitación y pertenencia activa requeridas; revocación efectiva.
- Autorización comprobada en servidor/RPC, no solo en la interfaz.
- Idempotencia y concurrencia sin duplicar operaciones, movimientos, eventos o importes.
- Historial de auditoría íntegro y sin mutaciones silenciosas.
- Costes y márgenes calculados según reglas aprobadas; no introducir importes arbitrarios como expectativas de negocio.
- Ningún dato sintético mezclado con datos reales.

Los resultados esperados concretos se definirán contra el contrato vigente del motor y las migraciones aplicadas en el entorno aislado. Este documento no afirma que los tests estén ejecutados ni que la base remota esté preparada.

## 5. Relación con los registros sintéticos que existían en Supabase

Los registros persistentes detectados anteriormente no son la fuente maestra de estos escenarios y no deben utilizarse para validar el comportamiento del producto. Este paquete conserva un modelo mínimo, legible y reproducible; no pretende reproducir identificadores internos, eventos históricos ni relaciones exactas de aquellas filas.

La limpieza de registros antiguos en Supabase es una tarea separada. No se considera realizada por crear este paquete. Antes de cualquier borrado remoto se debe resolver el problema de triggers/auditoría observado y preparar una operación segura, transaccional y verificable.

## 6. Mantenimiento

- Cambios de roles, flujos o reglas: actualizar primero la especificación/código propietario y después el fixture si procede.
- Mantener claves simbólicas estables; no reutilizarlas para representar empresas reales.
- Versionar cambios incompatibles en el nombre del archivo o en `schema_version`.
- Añadir escenarios solo cuando cubran una regla o riesgo identificable.
- No duplicar aquí la lógica de negocio: este paquete aporta datos de prueba; el código y las pruebas definen el comportamiento.

## Estado de verificación

- [x] Identidades ficticias diferenciadas de empresas reales.
- [x] Escenarios de tres partes documentados.
- [x] Separación de Auth y Supabase remoto especificada.
- [ ] Validación automática del esquema JSON.
- [ ] Integración con la batería de PostgreSQL efímera.
- [ ] Pruebas de permisos, revocación, idempotencia y concurrencia ejecutadas con estos fixtures.
