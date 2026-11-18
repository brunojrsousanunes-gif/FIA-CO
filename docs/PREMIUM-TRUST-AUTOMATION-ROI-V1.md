# FIA&CO — Servicio Premium: confianza, automatización y retorno V1

**Estado:** diseño de producto y medición; no implementado, no comercializable todavía y sin precios aprobados.
**Propósito:** que una empresa pueda comprobar qué protección recibe, qué trabajo automatiza FIA&CO y qué beneficio económico obtiene, con evidencias comprensibles y sin promesas comerciales no demostradas.

## 1. Propuesta de valor

Premium debe ofrecer un servicio empresarial asistido y medible, no solo acceso a una IA:
1. **Control y seguridad:** acceso individual, dispositivos gestionables, permisos por empresa y operación, trazabilidad, revocación y revisión humana cuando corresponda.
2. **Automatización útil:** reducción de tareas repetitivas de coordinación, seguimiento, preparación documental, avisos, recopilación de confirmaciones y detección de excepciones.
3. **Visibilidad operativa:** panel claro de operaciones, tareas pendientes, bloqueos, incidencias, responsables y decisiones.
4. **Rentabilidad demostrable:** comparación entre la situación inicial y los resultados medidos, incluyendo el coste completo del servicio y de la intervención humana.

No vender IA que lo hace todo, seguridad absoluta, cero fraude ni ahorros garantizados. Comercializar capacidades concretas, límites explícitos y resultados medidos.

## 2. Experiencia que debe ver el cliente

El espacio Premium debe reunir en una sola vista:

### A. Estado de seguridad
- Quién tiene acceso a la organización y con qué función.
- Permisos relevantes y fecha/actor de concesión o revocación.
- Dispositivos y credenciales registrados, último uso y estado.
- Sesiones activas y mecanismo de cierre/revocación.
- Alertas de actividad anómala y acciones recomendadas.
- Historial de accesos y operaciones sensibles.
- Controles activos, pendientes o no disponibles.

Mostrar solo datos que el sistema pueda demostrar. No mostrar una insignia «seguro» genérica si no existe una comprobación real detrás.

### B. Centro de automatización
Cada automatización debe explicar qué tarea resuelve, qué evento la inicia, qué datos mínimos utiliza, qué acciones puede realizar, qué no puede hacer, qué permisos requiere, si necesita aprobación humana, cómo pausarla/cancelarla, y su resultado, errores y responsable.

Estados visibles: Propuesta, Pendiente de aprobación, Activa, En pausa, Completada, Requiere revisión y Fallida. No ocultar fallos ni presentar un borrador como una acción ejecutada.

### C. Panel de rentabilidad
- Tiempo manual antes y después.
- Coste laboral estimado y método de cálculo.
- Coste de herramientas, IA, integraciones y soporte.
- Operaciones completadas y coste por operación.
- Incidencias, errores y retrabajo.
- Tiempo de ciclo y retrasos.
- Margen adicional solo cuando exista evidencia de ingresos y costes atribuibles.
- Ahorro confirmado separado de capacidad liberada y beneficio potencial.

El cliente debe poder consultar el periodo, la fuente y la fórmula de cada indicador.

## 3. Catálogo inicial de automatizaciones candidatas

Son propuestas para priorizar y validar, no funcionalidades que se afirmen ya disponibles.

| Proceso | Automatización propuesta | Límite y control |
|---|---|---|
| Entrada de solicitudes | Clasificar y crear borrador de expediente | No aceptar contratos ni comprometer a la empresa |
| Preparación documental | Detectar campos faltantes y ordenar documentos | No certificar autenticidad ni representación legal |
| Coordinación | Proponer responsables, tareas y fechas | Asignación final según permisos |
| Seguimiento | Avisos de hitos, vencimientos y falta de confirmación | No enviar mensajes externos sin regla y autorización |
| Logística | Recopilar ofertas y comparar variables homogéneas | No reservar ni contratar transportista sin aprobación |
| Incidencias | Clasificar, resumir evidencias y sugerir próximos pasos | Disputas y decisiones de responsabilidad a revisión humana |
| Cierre | Preparar lista de comprobación y borrador de cierre | Cierre efectivo según confirmaciones y permisos |
| Dirección | Resumen de actividad, bloqueos y métricas | Datos limitados a la organización y al permiso del gerente |

La automatización debe empezar por tareas repetitivas de bajo riesgo y crecer solo cuando haya resultados, permisos, pruebas y control de errores.

## 4. Niveles de automatización y autorización
- **Nivel A — Asistencia:** explica, resume y prepara borradores; no cambia datos de negocio.
- **Nivel B — Preparación:** recopila datos permitidos y prepara una propuesta para revisión.
- **Nivel C — Ejecución acotada:** el backend ejecuta una tarea reversible y previamente autorizada, con límites e idempotencia.
- **Nivel D — Acción sensible:** exige aprobación humana explícita y, cuando proceda, reautenticación o doble aprobación. La IA no aprueba en nombre de la persona.

Estos niveles clasifican autonomía de tareas; no sustituyen Trust L0–L4, requisitos documentales D1–D3 ni permisos empresariales.

## 5. Medición del retorno de inversión

### Línea base antes de activar una automatización
Medir una muestra suficiente de operaciones comparables: número y tipo de operaciones; minutos por tarea y rol; coste laboral horario cargado definido por el cliente; incidencias, errores, duplicidades y retrabajo; tiempo hasta cierre; costes actuales de software/proveedores; volumen y estacionalidad.

Si no existe una línea base fiable, mostrar «sin datos suficientes», no inventar una mejora.

### Fórmulas transparentes
**Horas liberadas** = (minutos manuales de referencia − minutos manuales posteriores) × volumen / 60.

**Ahorro laboral realizable** = horas realmente eliminadas o reasignadas con reducción de coste × coste laboral horario cargado.

Las horas liberadas no equivalen automáticamente a ahorro de caja: si salario y plantilla no cambian, deben mostrarse como capacidad recuperada, no como dinero ahorrado.

**Beneficio operativo atribuible** = ahorro realizable + costes de incidencias/retrabajo evitados demostrables + margen incremental atribuible.

No contar dos veces el mismo tiempo, incidencia o margen. El margen incremental debe descontar costes variables y no confundirse con facturación.

**Coste total Premium** = cuota + uso IA/integraciones + costes variables + soporte/intervención humana + implantación amortizada + costes internos adicionales.

**ROI neto del periodo** = (beneficio operativo atribuible − coste total Premium) / coste total Premium × 100.

**Periodo de recuperación** = coste inicial de implantación / beneficio neto mensual atribuible, solo si el beneficio neto mensual es positivo y estable.

Cada cálculo debe identificar periodo, muestra, fuente, supuestos, exclusiones y nivel de confianza. Permitir exportar el detalle y corregir datos de origen con trazabilidad.

## 6. Modelo comercial y protección del margen

No fijar precio hasta disponer de datos reales. Evaluar suscripción por organización/espacio, límites de uso incluidos y coste de exceso, automatizaciones con coste variable, implantación/formación, revisión humana especializada y modalidad Enterprise.

La cuota debe cubrir coste tecnológico, soporte, seguridad, mantenimiento y margen sostenible. No subsidiar indefinidamente automatizaciones intensivas ni intervención humana ilimitada.

El cliente debe conocer qué está incluido, qué genera coste adicional, cómo se mide el consumo y cómo puede cancelar o limitar automatizaciones.

## 7. Confianza visible y comunicación comercial

Presentar la seguridad con evidencias verificables: conexión cifrada y configuración comprobada; credenciales y dispositivos registrados; permisos efectivos y aislamiento; fecha de última revisión; historial de acciones sensibles; procedimiento de revocación; incidentes o limitaciones comunicados con claridad.

No utilizar certificaciones, sellos, auditorías externas o garantías que FIA&CO no posea. Diferenciar controles implementados, probados, pendientes y previstos.

El cliente debe poder probar una operación de demostración con datos sintéticos y ver qué hizo el sistema y qué tuvo que aprobar una persona.

## 8. Gobierno de datos y de IA
- La empresa conserva el control de su espacio y de los usuarios que autoriza.
- Cada usuario ve solo información permitida para su organización, tarea y finalidad.
- La IA Maestra no se conecta directamente a los dispositivos ni a la base de datos.
- No hay canal IA-a-IA con asistentes de empresas.
- El envío a la Maestra requiere revisión y selección expresa por personal FIA&CO autorizado.
- No reutilizar documentos o datos de un cliente para otro cliente ni para entrenamiento sin base jurídica, información y autorización aplicables.
- Minimizar los datos enviados a modelos/proveedores; registrar proveedor, finalidad y versión/configuración cuando corresponda.
- La automatización se pausa ante incertidumbre, fallo, discrepancia, permiso revocado o condición fuera de límites.

## 9. Cuadro de métricas para el piloto

| Dimensión | Indicador | Criterio |
|---|---|---|
| Seguridad | Accesos indebidos permitidos | Cero en pruebas negativas |
| Seguridad | Tiempo de revocación | Medido de extremo a extremo |
| Seguridad | Operaciones sensibles sin aprobación exigida | Cero |
| Automatización | Tareas completadas correctamente | Medir por tipo y volumen |
| Automatización | Fallos y ejecuciones duplicadas | Medir; idempotencia en tareas críticas |
| Operación | Tiempo medio por operación | Comparar con línea base equivalente |
| Operación | Incidencias/retrabajo | Comparar con línea base |
| Economía | Coste completo por operación | Incluir IA, soporte y revisión humana |
| Economía | Beneficio atribuible | Solo con fuentes verificables |
| Experiencia | Adopción y tareas completadas por responsables | Medir uso real, no solo altas |

Los umbrales comerciales se fijarán después de medir el piloto; no inventar objetivos de ahorro ni tasas de éxito.

## 10. Fases de entrega
1. **Diagnóstico:** auditar permisos, Auth, dispositivos, automatizaciones y métricas existentes; reutilizar estructuras.
2. **Demostrador sintético:** panel de seguridad, automatización y ROI con datos ficticios, claramente marcado como simulación.
3. **Piloto controlado:** empresa y procesos acotados, acuerdos adecuados, soporte humano, datos minimizados y criterios de salida.
4. **Validación económica:** comparar con línea base, contabilizar todos los costes y comprobar disposición real a pagar.
5. **Comercialización:** solo tras superar seguridad, privacidad, soporte, margen, revisión legal y gates técnicos.

## 11. Criterios de aceptación
- El gerente entiende quién tiene acceso, qué automatizaciones están activas y qué operaciones necesitan aprobación.
- Cada automatización declara alcance, permisos, límites, coste y responsable.
- El cliente puede pausar/revocar automatizaciones y accesos autorizados.
- Los fallos y bloqueos se muestran con causa comprensible y siguiente paso.
- Las métricas muestran fuente, fórmula, periodo y calidad del dato.
- El ROI no cuenta capacidad liberada como ahorro de caja sin justificación.
- El coste incluye inferencia, integraciones, soporte e intervención humana.
- No se afirma ningún beneficio no probado.
- El acceso móvil conserva las mismas reglas de autorización.
- Se respeta el circuito humano obligatorio para la IA Maestra.

## 12. Estado y dependencias

Este documento es diseño. No demuestra paneles, automatizaciones, métricas, ROI ni servicio Premium productivo.

Depende de auditoría de PR #192, PR #194 y main; reconciliación de permisos, membresías, Trust, Auth y sesiones; diseño de pasarela humana de IA Maestra; definición de costes reales; piloto sintético y controlado; revisión legal, privacidad, fiscal y comercial.

No crear tablas, contratar proveedores, activar cobros, habilitar Premium ni desplegar hasta completar los gates y recibir autorización específica.