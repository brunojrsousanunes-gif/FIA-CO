# FIA&CO — notas técnicas de continuidad para la IA

Este archivo **no es un registro para el propietario ni un acta de reuniones**. Es una ayuda interna y mínima para que una IA que retome el repositorio no repita errores ni contradiga límites ya establecidos.

Solo conservar aquí reglas duraderas que afecten a seguridad, integridad de datos, arquitectura o continuidad. No registrar conversaciones, preferencias pasajeras ni decisiones rutinarias. Si una regla ya está clara en la Skill principal, enlazarla y evitar duplicarla.

## Límites que no se deben perder

1. **Producción y datos remotos:** no fusionar a `main`, desplegar, aplicar migraciones a Supabase remoto ni modificar datos productivos sin autorización específica.
2. **Conservación de activos:** no eliminar contratos de compraventa, documentos legales, modelos comerciales, estrategias ni funciones con posible valor futuro por no estar en el MVP. Aplazar no significa borrar.
3. **Demos frente a producto real:** una demo, simulación, configuración o prueba local no demuestra que exista una capacidad productiva ni que esté desplegada.
4. **Alcance financiero:** FIA&CO coordina operaciones; no presentarla como prestamista, custodio o garante. El diseño financiero actual de #185 se basa en la organización titular de la operación; no afirmar que hay tres contabilidades independientes.
5. **Ramas y PR:** #185 es una línea de integración, no producción. Verificar siempre rama, SHA, PR y CI actuales antes de continuar; los SHA de este archivo no sustituyen la comprobación viva.
6. **Evidencia:** no declarar completado un trabajo por crear archivos o commits. Comprobar pruebas, resultado y alcance real.

## Referencias fuente

- Reglas generales: `skills/fia-co-project/SKILL.md`.
- Reglas operativas: `skills/fia-co-project/references/operating-rules.md`.
- Seguridad: `skills/fia-co-security-review/SKILL.md`.
- Estado y siguiente trabajo: `PROJECT-HANDOFF.md` y `WORK-REGISTER.md`.

## Mantenimiento

Actualizar este archivo únicamente si aparece una regla duradera nueva o cambia una de las anteriores. No añadir entradas por cada tarea. Si una regla deja de aplicar, corregirla con evidencia y fecha; no acumular versiones contradictorias.

**Última revisión:** 2026-11-18.

## Dirección de arquitectura: IA Maestra, asistentes FIA&CO y frontera humana

**Dirección de producto expresada por el propietario y corregida el 2026-11-18.** Esta definición sustituye cualquier descripción anterior que permita comunicación directa entre asistentes distribuidos y la IA Maestra.

### Modelo correcto

1. **Una IA Maestra central de FIA&CO.** Es el centro de análisis, coordinación y supervisión. Recibe información únicamente cuando una persona de FIA&CO, identificada y autorizada, revisa el caso y decide iniciar expresamente el envío mediante una interfaz interna controlada. La Maestra no sustituye los controles deterministas del backend ni se concede permisos a sí misma.
2. **Asistencia dentro de los espacios FIA&CO.** Las empresas, autónomos y colaboradores realizan sus gestiones en sus respectivos espacios de trabajo dentro de la web de FIA&CO. El asistente disponible en ese espacio ayuda dentro del contexto y permisos de esa organización. No se presupone una IA externa de cualquier web ni una IA independiente por visitante, empleado o dispositivo.
3. **Prohibición de comunicación IA-a-IA con la Maestra.** Ningún asistente de un espacio empresarial puede enviar información directamente a la Maestra ni recibir de ella respuestas o instrucciones por un canal automático. El asistente puede preparar información y crear una tarea interna para revisión humana, pero el contenido no se transmite a la Maestra.
4. **Circuito humano obligatorio.** El personal FIA&CO recibe la tarea, comprueba identidad, permisos, finalidad y documentación aplicable, selecciona la información mínima autorizada y decide si la remite a la Maestra. La Maestra devuelve el análisis al circuito interno de personal FIA&CO. El personal gestiona la relación con el cliente y las reuniones; la Maestra no contacta ni concierta reuniones directamente.
5. **Seguridad de la transmisión.** El envío humano se realiza mediante una interfaz interna controlada, no mediante copia indiscriminada de documentos. Debe validar permisos en servidor, limitar campos y documentos, proteger la transmisión, registrar quién revisó y envió, y permitir rechazo o revocación según corresponda.
6. **Asistentes y tareas de bajo riesgo.** El asistente de cada espacio puede ayudar a identificar necesidades, recopilar y ordenar información, preparar borradores y proponer automatizaciones. Solo podrá ejecutar tareas de bajo riesgo previamente autorizadas mediante el backend. No puede ampliar permisos, autorizar representación, realizar acciones sensibles ni iniciar comunicaciones comerciales externas por su cuenta.
7. **Espacios empresariales y móvil.** Cada organización tiene un espacio de trabajo independiente. Una persona puede acceder a varias organizaciones con una identidad propia, cambiando de contexto sin mezclar datos ni permisos. El responsable máximo, una vez verificada su autoridad, puede gestionar la actividad de su empresa desde el móvil dentro de sus facultades. Departamentos y cargos no conceden acceso implícito.
8. **Separación de conceptos.** Identidad, pertenencia, cargo, permiso, nivel de seguridad L0–L4, requisito documental D1–D3 y aprobación humana son controles distintos. Ningún nivel concede permisos automáticamente. El dispositivo no es identidad ni frontera de seguridad.
9. **Núcleo de ejecución.** El backend de FIA&CO impone autenticación, autorización, aislamiento por organización/operación, validaciones, trazabilidad y controles de ejecución. No confiar la seguridad a prompts, navegador, dispositivo o modelo de IA.
10. **Datos y economía.** Solicitar y utilizar solo información necesaria para una finalidad operativa, comercial legítima o legal. Medir coste de IA/herramientas, tiempo humano y revisión frente al ahorro, reducción de errores, operaciones adicionales y margen de contribución. No confundir tiempo ahorrado con beneficio realizado.

### Flujo de referencia

`Espacio de trabajo FIA&CO → asistente del espacio → preparación del caso/tarea interna → revisión por personal FIA&CO identificado → selección y autorización humana del envío → interfaz interna segura → IA Maestra → resultado al personal FIA&CO → comunicación y gestión humana con el cliente`

No existe un canal directo IA-a-IA entre los asistentes de los espacios y la Maestra. Una oportunidad detectada no autoriza contacto comercial automático ni intercambio de datos entre organizaciones.

### Límite de estado

Esta sección fija la **dirección de producto y arquitectura**. No certifica que exista ya una IA Maestra central operativa, asistentes desplegados en cada espacio, una pasarela humana implementada ni ejecución gobernada de extremo a extremo. Cada capacidad deberá localizarse en código, conectarse de forma segura y probarse antes de declararse implementada.

