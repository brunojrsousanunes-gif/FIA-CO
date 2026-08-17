# FIA&CO — Commercial Ops v1

## Objetivo
Convertir Commercial Readiness en reglas ejecutables sin activar todavía dinero, clientes ni datos reales.

## Principio económico
La tarifa publicada/ensayada debe ser competitiva frente a servicios comparables, pero ninguna campaña, descuento o segmento se escala si su margen de contribución esperado es negativo.

El motor `frontend/js/pricing.js` es la fuente técnica piloto para cotizaciones Base/Plus. Toda modificación de pricing requiere actualizar pruebas y versión.

## Embudo operativo
Estados mínimos: `LEAD`, `QUALIFIED`, `OPPORTUNITY`, `PROPOSAL`, `ONBOARDING`, `ACTIVE_OPERATION`, `CLOSED`, `REPEAT_REFERRAL`.

Campos obligatorios para una ficha interna: ID no sensible, segmento, fuente, estado, responsable, última acción, siguiente acción, fecha objetivo, valor estimado de operación, nivel Base/Plus, tarifa estimada y motivo de cierre cuando proceda.

## Verticales iniciales B2B
Prioridad de venta directa: transporte (vehículos industriales, remolques y flota usada), maquinaria industrial/agrícola y construcción/equipos. No ampliar verticales hasta obtener señal suficiente de estos segmentos o una razón económica documentada.

## Trabajo del fundador
Durante lanzamiento se permite absorber internamente prospección, ventas, onboarding, soporte L1, seguimiento de cuentas y revisión operativa básica. Para evitar una falsa rentabilidad, el dashboard financiero debe mantener separado:

1. gasto externo de caja;
2. horas/trabajo del fundador (coste sombra);
3. margen antes de remuneración del fundador;
4. margen económico después de valorar su trabajo.

## Guardrail de rentabilidad
Antes de escalar una fuente de adquisición calcular por cohorte:

`contribution = fee - payment_cost - variable_ops - support - security_variable`

Si `contribution < 0`, estado `NO_SCALE`. Si es positivo pero no cubre CAC, también `NO_SCALE`. No compensar pérdidas estructurales con más volumen.

## FIA&CO Plus
Desde 3.000 € se activa Plus con controles reforzados definidos en Commercial Readiness. El mayor precio remunera servicio/revisión, no constituye seguro, custodia ni garantía financiera.

## Datos y producción
Este bloque opera con datos ficticios. Quedan reservados para autorización/gates específicos: clientes y PII reales, contratación, cobros reales, movimiento/custodia de fondos, contacto externo en nombre de FIA&CO y afirmaciones jurídicas/regulatorias definitivas.

## Siguiente gate
Para promoción piloto deben existir: pricing probado, formulario/ficha de funnel, vista de métricas, controles Plus visibles, tests verdes y revisión de que ninguna pantalla sugiera custodia o garantías no disponibles.