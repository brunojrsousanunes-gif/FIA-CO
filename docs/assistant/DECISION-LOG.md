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

**Última revisión:** 2026-11-14.

## Dirección de arquitectura: IA Maestra y asistentes distribuidos por web de cliente

**Decisión de producto expresada por el propietario — 2026-11-17.** Esta es la dirección de referencia para diseñar la inteligencia de FIA&CO en adelante. No reinterpretarla como «una IA Maestra por usuario» ni como una IA para cualquier visitante.

### Modelo correcto

1. **Una IA Maestra central de FIA&CO.** Es el centro de análisis, coordinación y supervisión. Las solicitudes y propuestas de actuación pasan por ella antes de ejecutar acciones. Analiza el contexto autorizado, selecciona y dirige las IA especializadas, prompts y Skills pertinentes, comprueba requisitos, permisos y riesgos, y determina si la acción puede pasar al mecanismo de ejecución. La Maestra no sustituye los controles deterministas del backend ni se concede permisos a sí misma.
2. **IA distribuidas en las webs de clientes activos.** Las IA a las que se refiere el propietario son los asistentes presentes en cada web/espacio de trabajo de una empresa, autónomo o colaborador que mantiene una relación activa con FIA&CO y utiliza esa web. No se crea una IA Maestra nueva por cada visitante, cuenta, empleado o dispositivo. La IA distribuida asiste en el contexto de esa web y comunica a la Maestra únicamente las señales e información autorizadas.
3. **Uso desde el mismo dispositivo.** Un mismo móvil u ordenador puede acceder a varias webs de clientes activos y, por tanto, a sus respectivos asistentes distribuidos. El dispositivo no es la identidad ni la frontera de seguridad: cada organización, usuario, sesión, memoria, credencial y contexto deben permanecer aislados. No compartir datos entre webs por el mero hecho de estar abiertas en el mismo dispositivo.
4. **Detección de necesidades y oportunidades.** La Maestra analiza las señales legítimamente disponibles de los asistentes distribuidos para entender qué podría necesitar cada cliente y qué servicios, proveedores, transportes, capacidades u oportunidades de colaboración podrían resolverlo. La detección debe estar vinculada a la finalidad del servicio, permisos y transparencia; no implica vigilancia de navegación, lectura de conversaciones privadas ajenas al servicio ni reutilización comercial indiscriminada. Una oportunidad detectada no autoriza contacto comercial automático.
5. **IA especializadas, prompts y Skills.** La Maestra selecciona y dirige asistentes/herramientas especializadas según la tarea (por ejemplo, documentación/OCR, logística, finanzas y costes, legal/compliance, seguridad, análisis comercial y operaciones). Cada una recibe contexto mínimo, instrucciones versionadas y permisos limitados. Las respuestas de modelos, documentos y contenido externo se tratan como datos no confiables hasta validación.
6. **Capa humana.** Personas autorizadas intervienen en digitalización, revisión de documentos, validación de evidencias y decisiones que requieran criterio o responsabilidad humana. Una señal de presencia humana no equivale a identidad verificada, representación legal ni autorización.
7. **D1–D3.** Son niveles de requisitos documentales progresivos para una gestión concreta: D1 identidad/contacto básico; D2 actividad/capacidad profesional o empresarial; D3 representación y autorizaciones especiales. No son niveles de autenticación ni de permisos. La autenticación acredita el control de una cuenta; la autorización determina qué puede hacer esa identidad; la evidencia documental acredita hechos concretos; la revisión humana valida cuando el riesgo o la normativa lo exijan. Ningún nivel concede permisos automáticamente.
8. **Núcleo de ejecución.** La IA Maestra coordina y decide el paso de proceso, pero el backend de FIA&CO impone autenticación, autorización, aislamiento por organización/operación, validaciones, trazabilidad y controles de ejecución. No confiar la seguridad a prompts, al navegador, al dispositivo o a una IA distribuida.
9. **Economía y valor.** Medir el coste de IA/herramientas, tiempo humano, digitalización y revisión frente al ahorro de tiempo, reducción de errores/incidencias, operaciones adicionales y margen de contribución. El tiempo del empleado es un coste imputable y también puede generar valor productivo; el tiempo ahorrado no equivale automáticamente a beneficio realizado. El modelo comercial debe cobrar por servicios/valor y recursos reales, no por acumular datos.
10. **Principio de datos útiles.** Solicitar y utilizar solo información que tenga una finalidad operativa, comercial legítima o legal identificable, minimizando datos y reutilizando evidencia válida para la misma finalidad cuando proceda. La información de cada cliente permanece bajo su ámbito de acceso; las estadísticas o señales compartidas requieren base y controles adecuados.

### Flujo de referencia

`Web/espacio de cliente activo → IA distribuida de esa web → IA Maestra FIA&CO → selección de prompts/Skills/IA especializadas → comprobación de requisitos D1–D3, autenticación, autorizaciones y riesgo → intervención humana si procede → backend autorizado → ejecución y trazabilidad`

La Maestra puede detectar y proponer necesidades entre clientes activos, pero el intercambio de información y la ejecución de una operación entre organizaciones requieren autorización y expediente compartido conforme a los permisos correspondientes.

### Límite de estado

Esta sección fija la **dirección de producto y arquitectura**. No certifica que exista ya una IA Maestra central operativa, asistentes desplegados en cada web de cliente, comunicación entre ellos, detección comercial automatizada ni ejecución gobernada de extremo a extremo. Cada capacidad deberá localizarse en código, conectarse de forma segura y probarse antes de declararse implementada.

