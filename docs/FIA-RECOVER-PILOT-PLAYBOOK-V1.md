# FIA&CO — FIA Recover Pilot Playbook v1

Estado: `PILOT_PREP`.

Objetivo: validar FIA Recover con 3 empresas reales minimizando coste, riesgo y desarrollo específico, y convertir cada primer piloto válido en un **caso demostrador comercial reutilizable** para reducir la fricción de venta de los siguientes clientes.

## 0. Programa FIA Founding Demonstrators

Los 3 primeros proyectos no se tratarán como clientes ordinarios. Serán **FIA Founding Demonstrators**: implantaciones seleccionadas para producir simultáneamente evidencia de producto, evidencia económica y material comercial verificable.

### Condiciones mínimas de selección
El piloto debe permitir:
- medir un baseline antes de activar FIA;
- medir resultados durante y después del piloto;
- identificar al menos una métrica económica relevante;
- documentar el proceso anterior y el nuevo;
- registrar coste técnico y tiempo humano FIA;
- obtener autorización expresa sobre qué resultados pueden utilizarse en materiales comerciales.

No aceptar como demostrador un negocio donde no podamos medir el resultado o donde el caso sea tan específico que no pueda ayudar a vender a empresas similares.

### Evidencia comercial que debe dejar cada demostrador
Al finalizar, preparar un **FIA Proof Pack** con:
- problema inicial en una frase;
- diagrama simple `ANTES -> FIA -> DESPUÉS`;
- periodo de medición;
- volumen procesado;
- seguimientos realizados;
- respuestas recuperadas;
- oportunidades confirmadas;
- valor económico confirmado cuando sea atribuible;
- ahorro de tiempo estimado y método de cálculo;
- coste mensual de FIA;
- ROI o ratio valor/coste cuando pueda calcularse de forma defendible;
- capturas o visualizaciones sin PII;
- testimonio del cliente solo si lo aprueba explícitamente;
- aprendizajes y límites del caso.

### Uso de nombre, logo y testimonio
El derecho a usar comercialmente un caso debe quedar separado de la prestación del servicio.

Por defecto, FIA puede preparar un caso **anonimizado** con métricas agregadas si existe base contractual y no se revela información identificable.

Para publicar nombre comercial, logotipo, citas, fotografías, vídeos o testimonio identificable, exigir autorización expresa y documentada del cliente.

Nunca publicar datos personales, información comercial sensible, importes individualizados confidenciales ni información de clientes finales sin base y autorización adecuadas.

### Regla de claims
No utilizar expresiones como "FIA aumenta las ventas un X%" basadas en un único piloto.

La forma correcta será contextual:
> "En este piloto, durante X días y bajo estas condiciones, FIA ayudó a recuperar Y oportunidades confirmadas / Z € atribuibles / N horas estimadas."

Separar siempre:
- `CONFIRMED`: resultado confirmado por el cliente y razonablemente atribuible;
- `ASSISTED`: FIA intervino, pero no puede afirmarse causalidad exclusiva;
- `ESTIMATED`: ahorro o valor calculado mediante hipótesis documentadas.

### Incentivo del programa fundador
Los demostradores pueden recibir precio promocional, setup reducido o un periodo limitado con condiciones especiales a cambio de colaborar en la medición y feedback. El descuento no compra un testimonio positivo ni obliga al cliente a recomendar FIA.

Hipótesis inicial a validar:
- setup demostrador: 0–99 €;
- cuota piloto: 79–129 €/mes;
- condiciones promocionales limitadas al periodo pactado;
- precio posterior comunicado antes de iniciar el piloto.

No regalar indefinidamente el servicio: necesitamos comprobar también disposición real a pagar.

## 1. Oferta piloto

Producto inicial: **FIA Quote Recovery**.

Promesa operativa:
> FIA vigila presupuestos enviados para que ninguno quede olvidado: programa seguimiento, prepara mensajes, clasifica respuestas y avisa cuando requiere intervención humana.

No prometer aumento garantizado de ventas.

### Precio de prueba
Dos opciones para test A/B, sin publicarlas como tarifa definitiva:
- Opción A: 199 € implantación + 79 €/mes.
- Opción B: 0–99 € implantación + 129 €/mes con permanencia mínima del piloto pactada.
- Programa Founding Demonstrator: puede aplicar condiciones promocionales específicas de la sección 0 cuando el cliente cumpla los requisitos de medición y caso demostrador.

Elegir una sola opción por cliente; registrar objeciones y disposición a pagar.

## 2. Cliente ideal

Priorizar empresas que cumplan al menos 4:
- 5+ presupuestos/semana;
- ticket medio > 500 € o alto valor de cliente recurrente;
- seguimiento manual/inconsistente;
- correo o CRM accesible mediante integración permitida;
- dueño/responsable comercial accesible;
- pérdida reconocida por falta de seguimiento;
- disposición a pilotar 30 días;
- capacidad de comparar baseline vs resultado.

Para Founding Demonstrators, añadir:
- proceso suficientemente repetible para servir de ejemplo a empresas del mismo vertical;
- voluntad de colaborar en medición y retrospectiva;
- posibilidad de producir material comercial anonimizado o identificado según consentimiento.

Sectores iniciales:
1. maquinaria agrícola/profesional;
2. talleres/servicios técnicos;
3. construcción/reformas/instaladores;
4. transporte/logística.

## 3. Discovery de 15 minutos

Preguntas:
1. ¿Cuántos presupuestos enviáis por semana/mes?
2. ¿Quién hace seguimiento y cuándo?
3. ¿Cuántos creéis que quedan sin segundo contacto?
4. ¿Cuál es el ticket medio?
5. ¿Dónde se registran hoy?
6. ¿Qué mensajes de seguimiento consideráis apropiados?
7. ¿Qué casos nunca debería responder FIA sin preguntar?
8. ¿Qué resultado haría que 79–149 €/mes fuese obviamente rentable?
9. ¿Podemos medir un antes/después durante el piloto?
10. Si el caso funciona, ¿autorizaríais un caso de estudio anonimizado? ¿Y uno identificado si acordamos previamente el contenido?

## 4. Baseline obligatorio

Registrar antes del piloto, sin PII innecesaria:
- presupuestos enviados/30 días;
- valor agregado de presupuestos;
- % con seguimiento manual;
- tiempo medio a primer seguimiento;
- respuestas obtenidas después del seguimiento;
- ventas confirmadas procedentes de presupuestos seguidos, si el cliente puede atribuirlas;
- horas/mes dedicadas al seguimiento;
- software/canales actuales.

Para el Proof Pack, conservar además el método exacto de cálculo de cada métrica para poder reproducirla y defenderla comercialmente.

## 5. Configuración mínima

Por cliente:
- Organization ID;
- canal origen;
- definición de “presupuesto enviado”;
- máximo de intentos;
- intervalos autorizados;
- horario permitido;
- plantillas aprobadas;
- casos que requieren revisión humana;
- usuarios autorizados;
- política de retención;
- mecanismo de desactivación inmediata;
- alcance del consentimiento de uso comercial del caso: `NONE`, `ANONYMIZED`, `IDENTIFIED`.

## 6. Fases del piloto

### Semana 0 — Setup
- discovery;
- baseline;
- alcance y precio;
- definir objetivo demostrable;
- acordar por escrito el alcance de uso del caso;
- validación de tratamiento de datos/contratos aplicables;
- configuración;
- pruebas con datos sintéticos o ejemplos controlados.

### Semana 1 — Shadow
FIA detecta y propone, pero no envía.
Medir falsos positivos, clasificación y utilidad de borradores.

### Semana 2 — Approval mode
FIA prepara; humano aprueba cada contacto.
Medir tiempo ahorrado y errores.

### Semanas 3–4 — Limited automation
Solo activar envíos preaprobados si:
- policy v1 lo permite;
- cliente lo autoriza;
- el flujo demostró suficiente precisión;
- existe rollback/desactivación.

### Cierre — Proof Review
- validar resultados con el cliente;
- clasificar cada métrica como `CONFIRMED`, `ASSISTED` o `ESTIMATED`;
- preparar FIA Proof Pack;
- obtener aprobación final del contenido identificable antes de publicar;
- solicitar testimonio opcional sin condicionarlo al descuento;
- registrar si el cliente continúa pagando a precio pactado.

## 7. Dashboard mínimo

Por periodo:
- presupuestos vigilados;
- seguimientos programados;
- seguimientos ejecutados;
- respuestas recibidas;
- interesados;
- preguntas;
- rechazados;
- revisión humana;
- oportunidades confirmadas;
- valor confirmado `WON`;
- valor `ASSISTED` separado de `CONFIRMED`;
- horas estimadas ahorradas;
- coste IA/workflow;
- minutos humanos FIA;
- MRR;
- margen de contribución;
- ratio `valor confirmado / coste FIA` cuando tenga sentido;
- estado del Proof Pack: `DRAFT`, `CLIENT_REVIEW`, `APPROVED`, `ANONYMIZED_ONLY`, `NOT_PUBLISHABLE`.

## 8. Criterios GO / ITERATE / STOP

### GO
- 2 de 3 clientes quieren continuar pagando;
- margen de contribución positivo;
- >= 60% del flujo reutilizable;
- intervención humana sostenible;
- sin incidentes graves de privacidad/seguridad;
- cliente percibe ROI o ahorro claro;
- al menos 2 pilotos producen Proof Packs comercialmente útiles, aunque sean anonimizados.

### ITERATE
- valor percibido alto pero soporte excesivo;
- precio aceptado pero integración frágil;
- alta reutilización con mensajes/clasificación mejorables;
- resultado positivo pero evidencia comercial insuficiente.

### STOP / Pivot
- nadie paga después de prueba;
- automatización exige trabajo manual casi constante;
- valor económico no demostrable;
- riesgos legales/operativos superan beneficio;
- cada cliente requiere una solución esencialmente distinta;
- los casos no pueden producir evidencia suficientemente sólida para apoyar ventas posteriores.

## 9. Métrica norte del piloto

`valor confirmado o ahorro medible para el cliente / coste total mensual de FIA`

Métrica interna complementaria:
`MRR / horas humanas FIA`.

Métrica comercial complementaria:
`% de nuevos prospectos que avanzan tras ver un FIA Proof Pack`.

## 10. Regla de productización

No construir portal complejo antes de validar 3 clientes.

Cuando el mismo patrón aparezca en >= 3 clientes:
1. congelar el patrón;
2. convertir variables en configuración;
3. añadir test contractual;
4. instrumentar coste y outcome;
5. documentar onboarding;
6. convertirlo en módulo reutilizable;
7. crear versión demostrable reutilizable con datos ficticios basada en el patrón validado.

## 11. Próximo módulo tras Quote Recovery

Solo después de evidencia:
- Lead Recovery si el problema dominante son consultas perdidas;
- Document Recovery si el cuello de botella son expedientes;
- Payment Recovery si el principal dolor es cobro/vencimientos.

La prioridad la decide evidencia de clientes, no preferencia interna.
