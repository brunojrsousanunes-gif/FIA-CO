# LEGAL-2A — Matriz jurídica funcional por caso de uso

**Estado:** diseño pre-piloto; no constituye asesoramiento jurídico ni activa operación real. La jurisdicción, normativa y jurisprudencia se validarán en LEGAL-2B y mediante revisión profesional antes de piloto real.

## Criterios
- **REQUISITO**: control que el diseño debe contemplar antes del caso de uso real.
- **RECOMENDACIÓN**: buena práctica que mejora trazabilidad, claridad o reducción de riesgo.
- **REVISIÓN PROFESIONAL**: requiere validación jurídica/compliance por jurisdicción.
- **AUTOMATIZABLE**: puede asistirse técnicamente con reglas versionadas y trazables.
- **BLOQUEADO**: no debe activarse con la arquitectura/demo actual.

| Caso de uso | Requisitos funcionales/jurídicos de diseño | Evidencias/consentimiento | Rol y límite FIA&CO | Automatización permitida ahora | Revisión antes de real |
|---|---|---|---|---|---|
| **L2A-1 Compraventa** | Identificar partes/objeto/condiciones; aceptación inequívoca; estados y cambios trazables; mecanismo de incidencia | Condiciones aceptadas, timestamps, evidencias de cumplimiento y registro de cambios | Orquestar y documentar; no afirmar por sí solo titularidad, cumplimiento legal o resolución definitiva | Preparar checklist, detectar faltantes y sugerir revisión | Contratación, consumo/B2B, fiscalidad, responsabilidad y jurisdicción |
| **L2A-2 Transporte/logística** | Definir remitente, transportista, destinatario, hitos, entrega, excepciones, daños/retrasos | Prueba de recogida/entrega, reservas, fotos/documentos minimizados y cadena temporal | Registrar hitos/evidencias; no determinar automáticamente culpa o indemnización | Detectar discrepancias y solicitar evidencia | Régimen de transporte aplicable, límites de responsabilidad, seguros y prueba |
| **L2A-3 Marketplace/intermediación** | Mostrar claramente quién contrata con quién, condiciones y rol de plataforma; separar intermediación de prestación principal | Aceptación de términos, identidad/rol de partes, historial de operación | Intermediario/orquestador según modelo; evitar apariencia de vendedor, banco, custodio o árbitro cuando no lo sea | Matching/checklists/recomendaciones no vinculantes | Calificación jurídica del modelo, consumo, servicios digitales, fiscalidad y responsabilidad |
| **L2A-4 Custodia vs no custodia** | Arquitectura **no custodial por defecto**; segregación conceptual y técnica; ningún saldo real en beta | Trazabilidad de instrucciones y confirmaciones del proveedor futuro | No recibir/controlar fondos ni claves salvo bloque regulatorio futuro específico | Simulación y preparación de instrucciones | Cualquier custodia, salvaguarda, pagos, criptoactivos o control de fondos queda **BLOQUEADO** hasta análisis/licencias/proveedor adecuados |
| **L2A-5 Evidencias/trazabilidad** | Minimización, finalidad, integridad, control de acceso, retención definida, exportabilidad y audit trail | Consentimiento/base aplicable según dato; hash/timestamp/metadatos cuando proceda | Conservar/organizar evidencia según política; no prometer admisibilidad universal | Hash, timestamps, clasificación, detección de faltantes | Protección de datos, retención, firma/servicios de confianza y valor probatorio por jurisdicción |
| **L2A-6 Incidencias/conciliación** | Derecho a exponer posición, aportar evidencia, conocer estado y obtener cierre documentado; escalado humano | Registro de alegaciones, evidencias, comunicaciones y decisión | Facilitar conciliación/revisión; no sustituir tribunal, árbitro o autoridad salvo marco específico futuro | Resumir expediente, comparar condiciones/evidencias, sugerir revisión | ADR/ODR, consumo, arbitraje/mediación y lenguaje de decisiones |
| **L2A-7 Identidad/KYC/KYB** | Minimización y proporcionalidad; proveedor desacoplado; separar verificación de identidad de decisión de negocio | Consentimientos/avisos y resultado mínimo necesario; evitar almacenar biometría/documentos completos por defecto | Consumir resultado/atributos mínimos; no fingir certificación propia | Orquestación sandbox y flags de revisión | AML/KYC/KYB solo donde sea legalmente exigible/aplicable; biometría y transferencias internacionales requieren análisis específico |
| **L2A-8 Agente Premium** | Explicabilidad, trazabilidad, límites, human-in-the-loop, separación recomendación/ejecución | Registrar versión de política, inputs minimizados, recomendación y acción humana posterior | Asistente de análisis; actualmente **shadow/read-only**, sin ejecutar, bloquear ni modificar operaciones | Explicar riesgos, detectar inconsistencias, `SUGGEST_REVIEW` | Cualquier ejecución autónoma, scoring con efecto significativo o decisión vinculante queda **BLOQUEADA** hasta LEGAL/SEC gates específicos |

## L2A-9 — Matriz consolidada de decisión

| Capacidad | Clasificación actual |
|---|---|
| Estructurar condiciones y checklists | AUTOMATIZABLE + RECOMENDACIÓN |
| Registrar estados, timestamps y audit trail demo | AUTOMATIZABLE + REQUISITO de diseño |
| Detectar evidencia ausente/inconsistente | AUTOMATIZABLE |
| Recomendar revisión humana | AUTOMATIZABLE |
| Determinar definitivamente responsabilidad jurídica | REVISIÓN PROFESIONAL / BLOQUEADO para automatización vinculante |
| Declarar evidencia universalmente admisible | BLOQUEADO |
| Ejecutar/mover/custodiar dinero real | BLOQUEADO hasta bloque regulatorio/productivo específico |
| Capturar PII/biometría real | BLOQUEADO hasta base jurídica, proveedor y controles específicos |
| Resolver controversias con efecto jurídico vinculante | BLOQUEADO salvo marco jurídico futuro validado |
| Agente Premium ejecutando o haciendo enforcement | BLOQUEADO; mantener shadow/read-only |
| Conectar proveedor productivo | BLOQUEADO por gate R7 + SEC-4 + revisión jurídica |

## Derechos y obligaciones transversales a preservar en el diseño
1. Información clara sobre rol de FIA&CO y límites del servicio.
2. Posibilidad de revisar condiciones antes de confirmar.
3. Registro trazable de aceptación, cambios, estados y evidencias.
4. Minimización de datos y acceso por necesidad.
5. Mecanismo de incidencia, contradicción y revisión humana.
6. Explicación de recomendaciones automatizadas relevantes.
7. Separación entre recomendación técnica y decisión jurídica/vinculante.
8. Portabilidad de proveedores sin alterar derechos de las partes.

## Gate de salida LEGAL-2A
LEGAL-2A se considera completo cuando los ocho casos están clasificados y las capacidades sensibles permanecen bloqueadas. **No implica `LEGAL_READY_FOR_PILOT`**. Para eso siguen pendientes LEGAL-2B (jurisdicción/fuentes), LEGAL-2C (arquitectura jurídica versionada) y LEGAL-2D (validación pre-piloto y revisión profesional).
