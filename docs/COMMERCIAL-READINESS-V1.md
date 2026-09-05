# FIA&CO — Commercial Readiness v1

Estado: `PRECOMMERCIAL / FOUNDING_DEMONSTRATOR_PENDING`.

Este documento define cómo presentar FIA antes de promoción abierta. La estrategia actual es B2B local, con varias puertas de entrada reutilizando un único núcleo de seguridad, operaciones, permisos, auditoría y medición.

## 1. Propuesta comercial actual

### Cliente inicial

Empresas B2B pequeñas y medianas con alguno de estos problemas:

- presupuestos que se quedan sin seguimiento;
- operaciones importantes difíciles de coordinar;
- documentación que genera esperas, llamadas o errores;
- colaboración frecuente con talleres, transporte, renting, proveedores u otros partners;
- exceso de trabajo manual alrededor de procesos repetitivos.

Sectores iniciales de exploración:

- maquinaria profesional/agrícola;
- talleres, recambios y servicio técnico;
- instaladores, reformas y servicios B2B;
- transporte/logística;
- renting/financiación como partner cuando aparezca dentro de una operación real.

No depender de un único sector ni de una única puerta de entrada.

## 2. Arquitectura comercial: Seguridad -> Utilidad -> Maximización

Principio:

> **Más seguridad verificada permite más acceso autorizado; más acceso autorizado permite más utilidad; la utilidad medida permite maximizar progresivamente el proceso.**

Cada propuesta debe responder:

1. qué riesgo se controla;
2. qué capacidad concreta se desbloquea;
3. qué métrica demostrará que esa capacidad merece ampliarse.

No vender seguridad como un producto separado ni maximización como una promesa genérica.

Fuente: `docs/FIA-SECURITY-UTILITY-MAXIMIZATION-V1.md`.

## 3. Puertas de entrada

FIA mantiene un núcleo común y varias formas de demostrar valor.

### A. Trust Transaction

Gancho:

> probar una operación aislada y ver cada permiso, evento y evidencia sin conectar toda la empresa.

Valor a medir:

- trazabilidad;
- tiempo de coordinación;
- incidencias;
- accesos y revocaciones;
- carga administrativa.

### B. Quote Recovery

Gancho:

> evitar que presupuestos u oportunidades queden olvidados.

Valor a medir:

- presupuestos seguidos;
- tiempo a seguimiento;
- respuestas;
- oportunidades recuperadas;
- valor `CONFIRMED / ASSISTED / ESTIMATED`;
- horas administrativas.

### C. Document Flow

Gancho:

> saber qué documento falta, quién debe aportarlo y qué bloquea una operación.

Valor a medir:

- documentos pendientes;
- tiempo de ciclo;
- errores/reenvíos;
- llamadas/emails;
- horas administrativas.

No productizar todavía este módulo sin evidencia de piloto.

### D. Partner Coordination

Gancho:

> coordinar dos empresas sin compartir toda la información de ninguna de ellas.

Valor a medir:

- llamadas/emails evitados;
- esperas;
- incidencias;
- tiempo de handoff;
- reutilización del flujo con partners recurrentes.

Requiere nivel `L3_SHARED`; no forma parte de la primera operación real.

## 4. FIA Trust Levels

### L0_DEMO

- datos sintéticos;
- sin credenciales;
- sin integraciones;
- sin acciones reales.

Objetivo: comprender el proceso y seleccionar un problema medible.

### L1_ISOLATED

- una empresa;
- una operación;
- datos mínimos;
- auditoría;
- sin intercambio interempresa.

Objetivo: demostrar utilidad real con riesgo limitado.

### L2_VERIFIED

- identidad/autenticación reforzada;
- secretos/minimización/retención;
- integraciones oficiales aprobadas;
- automatización interna segura.

Objetivo: optimizar tareas que L1 ya demostró valiosas.

### L3_SHARED

- aislamiento interempresa probado;
- partner verificado;
- finalidad, campos, caducidad y revocación;
- acceso `DENY` por defecto.

Objetivo: coordinar dos organizaciones con información mínima.

### L4_ADVANCED

- revisión jurídica/técnica reforzada;
- flujos personales específicos;
- subencargados documentados;
- datos críticos fuera del intercambio interempresa.

Objetivo: orquestar procesos de mayor complejidad solo con evidencia y controles suficientes.

## 5. Frontera financiera permanente

FIA mantiene modelo `NON_CUSTODIAL` en todos los niveles.

> **FIA no recibe, custodia ni mueve fondos. Los pagos reales se ejecutan mediante un proveedor de servicios de pago o entidad financiera legalmente habilitada.**

FIA no debe afirmar que los fondos del cliente están depositados en el Banco de España.

La política fuente de verdad es `config/financial-boundary.v1.json`.

## 6. Precio: hipótesis de Founding Demonstrator

No publicar aún una tarifa general.

Hipótesis de trabajo para primeros demostradores B2B:

- setup promocional: `0–99 EUR` cuando el alcance sea limitado;
- mensualidad piloto: `79–129 EUR/mes`;
- después de validación: estudiar setup `199–499 EUR` y `149–249 EUR/mes` para workflows de recuperación/operación reutilizables;
- FIA Ops de mayor complejidad se valorará después de evidencia real.

El descuento compra colaboración, medición y aprendizaje; no un testimonio positivo.

No escalar adquisición pagada hasta demostrar:

- disposición a pagar;
- margen de contribución positivo;
- soporte humano sostenible;
- reutilización del flujo.

## 7. Funnel inicial

`DISCOVERY -> L0_DEMO -> CANDIDATE_OPERATION -> L1_ISOLATED -> REVIEW -> NEXT_LEVEL_OR_STOP -> PAID_CONTINUATION`

Reglas:

- discovery no solicita datos sensibles;
- L0 usa solo información sintética;
- una operación candidata debe tener problema y métrica claros;
- L1 no salta a integración completa;
- cada aumento de nivel requiere utilidad demostrada y controles adicionales;
- STOP es un resultado válido si no existe valor suficiente.

## 8. Primera reunión

Objetivo:

> conseguir una conversación de 15 minutos con la persona que decide y detectar un problema que pueda medirse.

No abrir con “IA”, “n8n”, “agentes” o una lista de funcionalidades.

Orden recomendado:

1. entender cómo gestionan presupuestos/operaciones/documentación;
2. identificar fricción;
3. enseñar Trust Entry con datos ficticios;
4. relacionar seguridad, utilidad y medición;
5. si existe encaje, proponer una única operación L1;
6. si no existe encaje, no pedir accesos.

## 9. Mensaje comercial de trabajo

No es un eslogan definitivo.

Versión conceptual:

> **FIA aumenta progresivamente la capacidad operativa de una empresa: protege y hace trazable el proceso, después automatiza o conecta aquello que ya puede gestionar con seguridad, y solo amplía donde el resultado demuestra valor.**

Versión corta de reunión:

> **Primero controlamos una operación con el mínimo acceso. Si demuestra utilidad, aumentamos capacidad y automatización sin perder trazabilidad ni seguridad.**

La formulación final debe validarse con objeciones y lenguaje real de los gerentes.

## 10. Métricas obligatorias

### Valor cliente

Según caso:

- oportunidades recuperadas;
- tiempo de seguimiento;
- tiempo de ciclo;
- horas administrativas;
- incidencias;
- llamadas/emails;
- documentos pendientes;
- esperas entre empresas.

### Economía FIA

- ingreso;
- coste IA;
- coste workflow/infraestructura;
- proveedores variables;
- minutos humanos FIA;
- margen de contribución;
- MRR / horas humanas.

### Evidencia

Separar siempre:

- `CONFIRMED`;
- `ASSISTED`;
- `ESTIMATED`.

No publicar porcentajes de optimización o ROI sin metodología y evidencia.

## 11. Producción y seguridad

Antes de datos/usuarios reales:

- separación demo/staging/producción;
- autenticación y autorización por organización/operación;
- tenant isolation;
- secretos fuera del repositorio;
- cifrado cuando aplique;
- mínimo privilegio;
- auditoría;
- backups/restauración si existe persistencia;
- monitorización/alertas;
- gestión de dependencias;
- rate limiting/antiabuso;
- retención/borrado;
- respuesta a incidentes;
- Data Permit;
- kill switch;
- revisión jurídica/privacidad aplicable.

## 12. Kit de venta mínimo

Mantener alineados:

- Trust Entry demo privada con datos ficticios;
- vista Trust Transaction privada;
- pitch conceptual y versión de 15–30 segundos;
- matriz Seguridad / Utilidad / Maximización por nivel;
- FAQ de seguridad/datos;
- explicación `NON_CUSTODIAL`;
- scorecard Founding Demonstrator;
- baseline y plantilla de medición;
- Proof Pack restringido después de resultados válidos;
- registro de objeciones del gerente.

No preparar campañas masivas antes de aprender el lenguaje y objeciones de los primeros decisores.

## 13. Pilotos

Los primeros proyectos son Founding Demonstrators, no clientes ordinarios.

Cada uno debe producir:

`INGRESO INICIAL + APRENDIZAJE + EVIDENCIA COMERCIAL RESTRINGIDA`

Antes de promoción abierta buscar al menos:

- 3 pilotos con evidencia;
- 2 clientes dispuestos a continuar pagando;
- 2 Proof Packs comercialmente útiles y autorizados;
- margen de contribución positivo;
- ausencia de incidentes críticos;
- patrón suficientemente reutilizable.

## Gate de promoción abierta

GO solo cuando:

1. exista al menos una puerta de entrada con valor repetido;
2. el mensaje Seguridad -> Utilidad -> Maximización sea comprendido por decisores reales;
3. pricing tenga evidencia de disposición a pagar;
4. revisión jurídica haya aprobado el alcance real;
5. revisión técnica haya aprobado datos reales;
6. métricas y backoffice permitan detectar fallos;
7. los pilotos produzcan evidencia suficiente;
8. el soporte humano sea sostenible.

Hasta entonces, promoción limitada a discovery y pilotos controlados.
