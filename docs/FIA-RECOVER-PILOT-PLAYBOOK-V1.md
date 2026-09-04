# FIA&CO — FIA Recover Pilot Playbook v1

Estado: `PILOT_PREP`.

Objetivo: validar FIA Recover con 3 empresas reales minimizando coste, riesgo y desarrollo específico.

## 1. Oferta piloto

Producto inicial: **FIA Quote Recovery**.

Promesa operativa:
> FIA vigila presupuestos enviados para que ninguno quede olvidado: programa seguimiento, prepara mensajes, clasifica respuestas y avisa cuando requiere intervención humana.

No prometer aumento garantizado de ventas.

### Precio de prueba
Dos opciones para test A/B, sin publicarlas como tarifa definitiva:
- Opción A: 199 € implantación + 79 €/mes.
- Opción B: 0–99 € implantación + 129 €/mes con permanencia mínima del piloto pactada.

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
- mecanismo de desactivación inmediata.

## 6. Fases del piloto

### Semana 0 — Setup
- discovery;
- baseline;
- alcance y precio;
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
- margen de contribución.

## 8. Criterios GO / ITERATE / STOP

### GO
- 2 de 3 clientes quieren continuar pagando;
- margen de contribución positivo;
- >= 60% del flujo reutilizable;
- intervención humana sostenible;
- sin incidentes graves de privacidad/seguridad;
- cliente percibe ROI o ahorro claro.

### ITERATE
- valor percibido alto pero soporte excesivo;
- precio aceptado pero integración frágil;
- alta reutilización con mensajes/clasificación mejorables.

### STOP / Pivot
- nadie paga después de prueba;
- automatización exige trabajo manual casi constante;
- valor económico no demostrable;
- riesgos legales/operativos superan beneficio;
- cada cliente requiere una solución esencialmente distinta.

## 9. Métrica norte del piloto

`valor confirmado o ahorro medible para el cliente / coste total mensual de FIA`

Métrica interna complementaria:
`MRR / horas humanas FIA`.

## 10. Regla de productización

No construir portal complejo antes de validar 3 clientes.

Cuando el mismo patrón aparezca en >= 3 clientes:
1. congelar el patrón;
2. convertir variables en configuración;
3. añadir test contractual;
4. instrumentar coste y outcome;
5. documentar onboarding;
6. convertirlo en módulo reutilizable.

## 11. Próximo módulo tras Quote Recovery

Solo después de evidencia:
- Lead Recovery si el problema dominante son consultas perdidas;
- Document Recovery si el cuello de botella son expedientes;
- Payment Recovery si el principal dolor es cobro/vencimientos.

La prioridad la decide evidencia de clientes, no preferencia interna.
