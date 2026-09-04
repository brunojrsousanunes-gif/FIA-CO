# FIA&CO — FIA Recover Operating Model v1

Estado: `DESIGN_AUTHORIZED` — autorización del fundador para trabajar los bloques A–N.

## 0. Tesis

FIA Recover es la vía inicial de ingresos recurrentes y bajo mantenimiento para financiar progresivamente FIA&CO.

Principio económico: **IA por defecto, reglas deterministas para control, humano por excepción**.

Principio de producto: no vender “IA” como fin; vender resultados medibles: oportunidades recuperadas, presupuestos reactivados, documentación completada, tiempo administrativo reducido y cobros acelerados.

Principio de escalado: `manual -> asistido por IA -> plantilla -> módulo -> SaaS -> red`.

Principio de seguridad: ninguna acción crítica, legal, financiera o irreversible se ejecuta únicamente por una recomendación generativa. El motor determinista, los permisos y las aprobaciones humanas gobiernan el flujo.

---

## A — Estrategia FIA Recover

### Primer segmento a validar
Prioridad inicial: empresas B2B o de servicios con ticket medio suficiente para que recuperar una sola oportunidad justifique varios meses de cuota.

Orden de discovery recomendado:
1. maquinaria agrícola/profesional y distribuidores;
2. talleres/servicios técnicos;
3. construcción, reformas e instaladores;
4. transporte/logística;
5. otros sectores solo si muestran mejor evidencia comercial.

### Propuesta inicial
> FIA vigila las oportunidades, presupuestos, documentos y cobros que podrían quedar olvidados y avisa o actúa dentro de reglas aprobadas.

### No prometer
- incremento garantizado de ventas;
- recuperación garantizada de deuda;
- asesoramiento jurídico/financiero automatizado;
- acciones irreversibles sin aprobación cuando exista riesgo;
- cumplimiento regulatorio “automático”.

---

## B — Modelo económico

### Hipótesis inicial de pricing a validar
- Implantación simple: 150–500 €.
- Implantación compleja/integraciones: presupuesto específico.
- Cuota Recover Solo: 79–149 €/mes.
- Recover Pro: 149–299 €/mes.
- Recover Ops: 299–599+ €/mes cuando incluya expedientes/integraciones avanzadas.

No publicar estas cifras como definitivas antes de pilotos.

### Unit economics obligatorios por cliente
Registrar:
- MRR/ingreso cobrado;
- coste de modelos IA;
- ejecuciones de workflow;
- mensajería/telefonía;
- almacenamiento;
- integraciones externas;
- minutos humanos de soporte;
- minutos de implantación amortizados;
- incidencias;
- margen de contribución.

### Guardrails de coste
- objetivo inicial: coste tecnológico variable <= 15% del MRR;
- coste total variable, incluido soporte humano, <= 35% del MRR antes de escalar;
- no mantener automatizaciones crónicamente deficitarias sin aprendizaje estratégico explícito;
- usar el modelo de IA más barato que alcance la calidad exigida.

---

## C — FIA Quote Recovery MVP

### Objetivo
Detectar un presupuesto enviado, programar seguimiento y cerrar el ciclo cuando exista respuesta o decisión humana.

### Estados v1
`DRAFT -> ACTIVE -> WAITING -> RESPONSE_RECEIVED -> HUMAN_REVIEW | WON | LOST | EXPIRED | CANCELLED`

### Acciones seguras automatizables
- registrar presupuesto;
- calcular próxima revisión;
- preparar borrador de seguimiento;
- clasificar respuesta como `INTERESTED`, `QUESTION`, `DECLINED`, `UNKNOWN`;
- crear alerta/tarea;
- cerrar automáticamente solo por condiciones deterministas explícitas (p. ej. expiración configurada), nunca inferir una venta.

### Requieren aprobación configurable
- enviar mensaje comercial cuando la base jurídica/consentimiento no esté clara;
- cambios de precio/descuento;
- afirmaciones contractuales;
- compromisos de entrega;
- negociación no preautorizada.

---

## D — FIA Lead Recovery

Entradas admitidas progresivamente:
- formulario web;
- email;
- llamada perdida mediante proveedor autorizado;
- mensajería integrada mediante APIs/consentimiento aplicables.

Flujo:
`LEAD_RECEIVED -> QUALIFIED/UNQUALIFIED -> CONTACT_PENDING -> CONTACTED -> RESPONSE -> OPPORTUNITY/CLOSED`

Medir:
- tiempo hasta primera respuesta;
- % leads contactados;
- % recuperados;
- % que pasan a oportunidad;
- valor estimado asociado cuando exista base objetiva.

---

## E — FIA Payment Recovery

Objetivo: recordatorio y seguimiento operativo de facturas, no recobro coercitivo ni asesoría jurídica.

Flujo:
`INVOICE_OPEN -> DUE_SOON -> DUE -> OVERDUE -> PROMISE_TO_PAY -> PAID | ESCALATED | CLOSED`

Automatizable:
- recordatorios cordiales previamente aprobados;
- registro de compromiso de pago;
- recordatorio de compromiso;
- escalado a humano.

No automatizar sin revisión:
- amenazas de acciones legales;
- cálculo jurídico de intereses/penalizaciones no configuradas y validadas;
- acuerdos de quita;
- reportes a ficheros de solvencia;
- acciones judiciales.

---

## F — FIA Document Recovery

Objetivo: saber qué documentación existe, qué falta y qué contiene, manteniendo trazabilidad.

Pipeline:
`RECEIVED -> CLASSIFIED -> EXTRACTED -> VALIDATED -> MISSING_ITEMS -> REQUESTED -> COMPLETE | REVIEW_REQUIRED`

IA puede:
- clasificar documento;
- extraer campos;
- comparar campos;
- señalar inconsistencias;
- redactar solicitud de faltantes.

El sistema debe almacenar procedencia, fecha, versión y nivel de confianza; la IA no “certifica” autenticidad legal.

---

## G — FIA AI Router

Objetivo: maximizar margen y fiabilidad.

Orden de resolución:
1. regla determinista;
2. parser/regex/heurística;
3. modelo pequeño/barato;
4. modelo avanzado;
5. humano.

Factores de routing:
- riesgo;
- longitud/contexto;
- idioma;
- necesidad de razonamiento;
- coste máximo permitido;
- latencia;
- sensibilidad de datos;
- confianza de salida.

Toda ruta debe registrar `method`, `model/provider` cuando aplique, coste estimado, versión de prompt/policy y resultado.

---

## H — FIA Outcome Engine

Objetivo: demostrar ROI y construir aprendizaje propietario.

Métricas por cliente:
- leads recibidos/recuperados;
- presupuestos seguidos;
- respuestas obtenidas;
- oportunidades reabiertas;
- ventas atribuidas solo cuando exista evidencia;
- facturas pagadas tras seguimiento (correlación, no causalidad automática);
- horas estimadas ahorradas;
- tiempo medio de respuesta;
- tiempo de ciclo;
- coste FIA;
- coste operativo;
- margen FIA.

Regla de atribución: no afirmar causalidad económica sin señal verificable. Distinguir `influenced`, `assisted`, `confirmed`.

---

## I — Seguridad y confianza

### Clases de acción
- `AUTO_SAFE`: lectura, clasificación, resumen, scheduling interno.
- `AUTO_WITH_POLICY`: comunicación preaprobada dentro de límites.
- `HUMAN_APPROVAL`: precio, contrato, riesgo, excepciones, mensajes sensibles.
- `PROHIBITED`: fondos/custodia, decisiones reguladas o acciones no autorizadas.

### Auditoría mínima
Cada acción registra:
- organización;
- expediente/lead/presupuesto;
- actor;
- tipo de acción;
- inputs mínimos;
- policy version;
- resultado;
- timestamp;
- aprobación cuando aplique;
- evidencia asociada.

Fail-safe: ante error, timeout, ambigüedad o falta de configuración, no ejecutar la acción externa.

---

## J — Integración con FIA&CO

FIA Recover no debe convertirse en un producto aislado.

Reutilizar:
- identidad organizativa;
- motor de operaciones/estados;
- evidencias;
- auditoría;
- observabilidad;
- política de escalado humano.

Separar:
- motor Recover (seguimientos y recuperación);
- adaptadores externos (email, CRM, mensajería, facturación);
- IA (clasificación/redacción);
- enforcement/acciones.

Objetivo: permitir que un lead recuperado termine convirtiéndose en una `operation` FIA sin duplicar la lógica de trazabilidad.

---

## K — Primer piloto real

### Meta
3 empresas reales antes de productizar en profundidad.

### Perfil ideal
- 5+ presupuestos/leads relevantes por semana;
- ticket medio donde una recuperación tenga valor visible;
- proceso actual informal/manual;
- responsable accesible;
- disposición a medir antes/después.

### Piloto de 30 días
Semana 0: baseline + configuración.
Semanas 1–2: shadow mode/borradores + aprobación humana.
Semanas 3–4: automatización limitada solo donde exista evidencia de seguridad.

### Criterios de éxito
Al menos 3 de 4:
1. cliente percibe ahorro/valor económico;
2. acepta pagar o renovar;
3. intervención humana <= objetivo definido;
4. >= 60% del flujo es reutilizable en otro cliente del mismo sector.

---

## L — Productización

Regla principal:
> Si un patrón aparece en >= 3 clientes y muestra ROI claro, convertirlo en módulo estándar.

Niveles:
1. bespoke;
2. template;
3. configurable module;
4. self-service onboarding;
5. API/partner ecosystem.

Objetivo técnico a medio plazo: 80% configuración estándar / 20% adaptación máxima para clientes normales.

---

## M — Red FIA

No construirla antes de tener clientes y procesos repetidos.

Evolución:
1. FIA automatiza empresa individual;
2. conecta procesos cliente-proveedor;
3. operación compartida con permisos;
4. estándares de intercambio;
5. benchmarks agregados y anonimizados cuando sean jurídicamente viables.

La red debe aportar interoperabilidad, no lock-in artificial. Los datos del cliente deben tener reglas de portabilidad/exportación.

---

## N — Escalado AI-first

Automatizar internamente antes de contratar para trabajo repetitivo:
- prospección asistida;
- preparación de discovery;
- propuestas;
- onboarding;
- QA de workflows;
- soporte L1;
- diagnóstico de errores;
- reporting;
- facturación/seguimiento interno;
- documentación;
- formación.

Humanos se reservan prioritariamente para:
- relación comercial;
- excepciones;
- arquitectura;
- seguridad;
- negociación;
- decisiones críticas;
- alianzas.

### Métrica de escalabilidad
Seguir trimestralmente:
`MRR / horas humanas operativas`.

La empresa mejora estructuralmente cuando este ratio sube sin degradar calidad, retención o seguridad.

---

## Secuencia de ejecución autorizada

### Sprint 0 — Fundación
A, B, I, J, H.

### Sprint 1 — Primer ingreso
C + K.

### Sprint 2 — Expansión del Recover
D + F.

### Sprint 3 — Cash operations
E.

### Sprint 4 — Eficiencia IA
G + N.

### Sprint 5 — Productización
L.

### Sprint 6 — Network moat
M.

## Gates

No avanzar de piloto a promoción abierta sin:
- margen de contribución positivo;
- seguridad y tratamiento de datos revisados;
- 3 pilotos con evidencia;
- pricing contrastado;
- soporte sostenible;
- capacidad de rollback y auditoría;
- ninguna dependencia de una acción crítica puramente generativa.
