# FIA&CO — Primer Founding Demonstrator de FIA Recover v1

Estado: `EXECUTION_READY_AFTER_CI`.

## Objetivo

Conseguir el primer cliente demostrador de **FIA Quote Recovery** sin convertir FIA en una consultora a medida ni asumir gasto técnico relevante antes de tener una empresa comprometida.

El primer proyecto debe producir simultáneamente:

1. evidencia de que existe un problema real;
2. evidencia de que FIA puede mejorar el proceso;
3. una medición económica creíble;
4. aprendizaje reutilizable para los siguientes clientes;
5. un Proof Pack restringido que pueda mostrarse a prospectos/clientes autorizados;
6. información real sobre coste humano y tecnológico de operar FIA.

No se considera éxito únicamente que una empresa acepte una prueba.

---

## 1. Orden de búsqueda inicial

Prioridad práctica para el primer demostrador en Lugo/Galicia:

1. instaladores, reformas y construcción;
2. talleres y servicios técnicos;
3. maquinaria profesional/agrícola;
4. transporte/logística;
5. otro B2B con presupuestos frecuentes y ticket relevante.

La prioridad real la decide el score del candidato, no el sector por sí solo.

### Señales fuertes

- al menos 5 presupuestos por semana o volumen equivalente;
- ticket medio > 500 EUR o alto valor de cliente recurrente;
- seguimiento manual, irregular o inexistente;
- dueño/responsable comercial accesible;
- correo/CRM/proceso identificable;
- capacidad de reconstruir un baseline de 30 días;
- disposición a revisar resultados al finalizar;
- aceptación de un caso comercial restringido, al menos anonimizado.

Usar el scorecard de `docs/FIA-FOUNDING-DEMONSTRATORS-V1.md`.

**Gate recomendado:** >= 14/20 para Founding Demonstrator.

---

## 2. Oferta del primer demostrador

No vender “una plataforma de IA”.

Propuesta:

> FIA vigila los presupuestos que se quedan sin seguimiento, prepara el siguiente contacto y mide qué oportunidades y tiempo se recuperan. Durante el piloto ninguna decisión comercial final se deja a la IA.

### Alcance

Un solo flujo: **Quote Recovery**.

No incluir de inicio:

- recepción de voz IA;
- cobros/deuda;
- WhatsApp/SMS si no son imprescindibles;
- múltiples CRMs;
- desarrollos especiales;
- pagos, custodia o servicios financieros;
- automatizaciones no relacionadas con el objetivo medido.

### Precio de trabajo

Mantener las hipótesis del playbook:

- opción A: 199 EUR implantación + 79 EUR/mes;
- opción B: 0–99 EUR implantación + 129 EUR/mes con periodo piloto pactado.

No presentar ambas como tarifa pública. Elegir una por conversación y registrar objeción/disposición a pagar.

El precio especial se justifica por condición de Founding Demonstrator y no compra un testimonio positivo.

---

## 3. Regla de gasto: cliente antes que infraestructura

Antes de empresa seleccionada y alcance aceptado:

- usar solo el cockpit sintético `frontend/recover-demo.html`;
- no contratar telefonía, SMS, voz IA o infraestructura específica;
- no activar acciones externas;
- no usar PII real;
- no construir integración a medida.

Después de compromiso del piloto:

1. identificar exactamente el canal/sistema mínimo;
2. calcular coste variable esperado;
3. verificar que cabe en los ratios de `config/recover-policy.v1.json`;
4. activar únicamente el proveedor imprescindible;
5. registrar coste real desde el primer uso.

Objetivo: cada coste nuevo debe estar vinculado a un piloto real o a un patrón ya validado.

---

## 4. Fase 0 — Discovery y baseline

Duración objetivo: una reunión corta + acceso a métricas agregadas necesarias.

Recoger:

- presupuestos enviados en 30 días;
- cuántos recibieron seguimiento;
- valor agregado aproximado;
- tiempo medio al primer seguimiento;
- horas humanas dedicadas;
- respuestas posteriores al seguimiento;
- ventas confirmadas que el cliente pueda relacionar con seguimiento;
- herramientas/canales actuales;
- casos que FIA nunca debe contestar automáticamente.

No copiar PII a GitHub.

### Resultado de la fase

Un baseline aceptado por ambas partes y guardado en un entorno adecuado cuando exista producción.

Si no existe baseline razonable, no es un buen Founding Demonstrator.

---

## 5. Fase 1 — Shadow mode

FIA observa el proceso y simula:

- detección del presupuesto;
- siguiente acción;
- clasificación de respuesta;
- borrador de seguimiento;
- métricas internas.

**No se envía nada automáticamente.**

Objetivos:

- medir falsos positivos;
- verificar cuándo empieza realmente un presupuesto;
- validar intervalos;
- validar plantillas;
- detectar excepciones;
- estimar carga humana FIA.

El `externalActionsEnabled` permanece `false`.

---

## 6. Fase 2 — Approval mode

Solo tras superar shadow mode y completar controles de datos/contrato aplicables.

FIA prepara la acción; una persona autorizada decide si procede.

Registrar por cada intento:

- ID del caso;
- plantilla;
- canal;
- aprobación;
- timestamp;
- intento;
- respuesta posterior;
- coste tecnológico;
- minutos humanos FIA.

El motor `core/recover/recover-action-gate.mjs` debe seguir siendo fail-closed.

---

## 7. Fase 3 — Automatización limitada

No forma parte automática de la autorización de este documento.

Solo considerar si:

- shadow y approval mode son fiables;
- existe autorización del cliente;
- tratamiento de datos/proveedores está revisado;
- kill switch está operativo;
- plantillas/horarios están aprobados;
- auditoría funciona;
- el coste variable sigue siendo sostenible;
- una futura versión de política activa explícitamente acciones externas.

Nunca permitir que la IA:

- marque automáticamente una venta como ganada;
- cambie precio/descuento;
- asuma compromiso contractual;
- envíe mensajes sensibles sin revisión;
- interprete un silencio como consentimiento.

---

## 8. Métricas obligatorias

### Valor para el cliente

- presupuestos vigilados;
- % que reciben seguimiento;
- tiempo medio a seguimiento;
- respuestas obtenidas;
- interesados recuperados;
- ventas `CONFIRMED`;
- valor `CONFIRMED`;
- valor `ASSISTED`;
- ahorro `ESTIMATED`, siempre con metodología visible;
- horas administrativas ahorradas.

### Economía FIA

- ingreso de implantación;
- MRR;
- coste de IA;
- coste de workflow/infraestructura;
- otros proveedores variables;
- minutos humanos FIA;
- coste humano interno estimado;
- margen de contribución;
- MRR / horas humanas FIA.

### Producto

- % de flujo reutilizable;
- excepciones por cada 100 casos;
- falsos positivos de detección/clasificación;
- acciones que requieren humano;
- nuevas necesidades que aparecen repetidamente.

---

## 9. Atribución: no inflar resultados

`CONFIRMED`
: cliente confirma el resultado y existe una secuencia razonablemente atribuible a FIA.

`ASSISTED`
: FIA participó de forma relevante, pero existieron otros factores comerciales.

`ESTIMATED`
: cálculo basado en hipótesis documentadas, por ejemplo horas ahorradas x coste/hora acordado.

Nunca sumar las tres categorías y presentarlas como “ventas generadas por FIA”.

---

## 10. Proof Pack

Al cierre:

1. revisar todas las cifras con el cliente;
2. corregir discrepancias;
3. registrar CONFIRMED / ASSISTED / ESTIMATED;
4. registrar coste del piloto;
5. calcular valor/coste;
6. registrar intención de continuar pagando;
7. confirmar permiso de reutilización del caso;
8. generar Proof Pack solo si cumple criterios.

Los Proof Packs reales:

- no se publican en web abierta;
- se muestran solo según `config/proof-pack-visibility.v1.json`;
- usan acceso autenticado para prospectos/clientes;
- respetan el nivel aprobado por el cliente origen;
- generan evento de auditoría de acceso.

---

## 11. GO / ITERATE / STOP del primer demostrador

### GO

Continuar si:

- el cliente percibe valor claro;
- existe resultado económico o ahorro medible;
- el coste variable está dentro de política;
- el soporte humano es sostenible;
- gran parte del flujo puede reutilizarse;
- no existen incidentes graves;
- el cliente considera seguir pagando.

### ITERATE

- ROI percibido pero integración demasiado manual;
- buena respuesta comercial pero demasiadas excepciones;
- cliente paga pero margen insuficiente;
- flujo reutilizable pero mensajes/clasificación requieren mejora.

### STOP / no productizar

- no se puede medir valor;
- el proceso exige intervención humana constante;
- el cliente no pagaría después del descuento;
- cada caso necesita lógica diferente;
- aparecen riesgos de datos/operación desproporcionados;
- automatizar aporta menos que un simple cambio de proceso manual.

---

## 12. Qué hace el fundador en el primer caso

El fundador debe encargarse personalmente de:

- elegir candidato;
- discovery;
- observar proceso real;
- fijar baseline;
- configurar reglas iniciales;
- revisar las excepciones;
- hablar con el cliente al final;
- validar el Proof Pack.

La IA/software debe asumir progresivamente:

- organización de notas;
- detección/clasificación;
- borradores;
- agenda de seguimiento;
- cálculo de métricas;
- resumen de excepciones;
- preparación del informe.

La finalidad del primer cliente no es eliminar el trabajo del fundador, sino descubrir exactamente qué trabajo puede eliminarse en los clientes 2–10.

---

## 13. Gate técnico antes de salir a buscar el primer demostrador

Debe cumplirse:

- CI verde en el PR del demonstrator;
- motor Recover contractualmente testeado;
- métricas/outcomes testeados;
- action gate fail-closed testeado;
- cockpit sintético no incluido en Pages público;
- Proof Pack access tests verdes;
- `externalActionsEnabled=false`;
- ninguna integración real activada.

Después de este gate, el siguiente paso es comercial, no más desarrollo especulativo.
