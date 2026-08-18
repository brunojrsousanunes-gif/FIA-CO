# FIA&CO — Validación de pricing piloto

Estado: preparación completa para validación; no autoriza cobro real.

## Hipótesis a validar

### Base
- 2,9% del valor de operación.
- mínimo 0,99 €.
- máximo 19,90 €.
- aplicable como hipótesis piloto/promocional hasta 2.999 €.

### Plus / Alto Valor
- 3.000–4.999 €: 0,95%, mínimo 24,90 €, máximo 39,90 €.
- 5.000–9.999 €: 0,75%, mínimo 39,90 €, máximo 59,90 €.
- 10.000–24.999 €: 0,55%, mínimo 59,90 €, máximo 99,90 €.
- 25.000 € o más: 0,35%, mínimo 99,90 €, tope promocional inicial 199,90 €.

## Inputs externos obligatorios

No sustituir estos valores por estimaciones inventadas. Deben documentarse con fuente, fecha y responsable.

| Input | Unidad | Fuente requerida | Estado |
|---|---:|---|---|
| Coste PSP por cobro | € + % | oferta/contrato proveedor | pendiente |
| Coste transferencia/payout | € + % | oferta/contrato proveedor | pendiente |
| Coste KYC/KYB | €/verificación | oferta/contrato proveedor | pendiente |
| Coste antifraude | €/operación o % | oferta/contrato proveedor | pendiente |
| Coste soporte humano | €/min o €/h | coste interno validado | pendiente |
| Minutos soporte Base | min/op | pilotos medidos | pendiente |
| Minutos soporte Plus | min/op | pilotos medidos | pendiente |
| Coste incidencias/reembolsos | €/op | pilotos/proveedor | pendiente |
| IVA/impuestos aplicables | regla fiscal | asesoría fiscal | pendiente |
| Encaje regulatorio y contractual | decisión | asesoría jurídica | pendiente |

## Fórmula mínima de unit economics

Para cada cohorte y tramo de valor:

`ingreso_neto = tarifa_cobrada - impuestos_indirectos_repercutidos_si_aplican`

`coste_variable = PSP + payout + KYC + antifraude + soporte_humano + incidencias + otros_costes_por_operacion`

`margen_contribucion = ingreso_neto - coste_variable`

`margen_contribucion_pct = margen_contribucion / ingreso_neto`

No utilizar CAC para declarar una operación rentable; CAC se evalúa después del margen de contribución operativo.

## Escenarios de prueba

Validar al menos estos tickets representativos:

- 20 €
- 50 €
- 100 €
- 250 €
- 500 €
- 1.000 €
- 2.000 €
- 2.999 €
- 3.000 €
- 5.000 €
- 10.000 €
- 25.000 €

Para cada uno registrar tarifa, impuestos, coste variable, margen en euros, margen porcentual y sensibilidad ante una incidencia.

## Criterios de aceptación

El pricing deja de ser solo hipótesis cuando:

1. los costes de proveedores se basan en ofertas o contratos reales;
2. el tratamiento fiscal ha sido revisado por asesoría competente;
3. el modelo contractual/regulatorio ha sido validado para el alcance real;
4. existen datos de 3–5 pilotos controlados sobre soporte, incidencias y disposición a pagar;
5. ninguna cohorte prevista para lanzamiento presenta margen de contribución negativo bajo el escenario base;
6. existe un escenario de estrés documentado para incidencias/reembolsos;
7. el founder aprueba explícitamente la tarifa de lanzamiento tras revisar los resultados.

## Resultado permitido

Hasta cumplir todos los criterios anteriores, el estado debe permanecer `PRICING_HYPOTHESIS_ONLY`.

El máximo resultado automático permitido por esta validación es `READY_FOR_FOUNDER_PRICING_DECISION`; nunca activa cobros ni producción por sí solo.
