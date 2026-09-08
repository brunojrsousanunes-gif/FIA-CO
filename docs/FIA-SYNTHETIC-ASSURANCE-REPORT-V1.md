# FIA&CO — Informe automático de simulaciones

Estado: `SYNTHETIC_ONLY / INTERNAL / ZERO_COST`.

Después de ejecutar los ciclos ficticios, FIA crea un informe que responde a cinco preguntas:

1. ¿Finalizaron correctamente todas las operaciones simuladas?
2. ¿Se mantuvieron cerradas las fronteras de dinero, datos y acciones externas?
3. ¿Cada error tenía prevención, contención y recuperación?
4. ¿Se exigió evidencia de cierre?
5. ¿El resultado empeoró respecto al ensayo anterior?

## Resultado permitido

- `PASS_SYNTHETIC_ASSURANCE`: pueden continuar las pruebas ficticias.
- `BLOCK_REGRESSION`: se detiene la regresión hasta corregir y repetir.

Un resultado positivo no significa que FIA esté preparada para producción. Tampoco demuestra cumplimiento legal, demanda comercial, rentabilidad ni funcionamiento de proveedores reales.

El riesgo que siempre permanece declarado es: infraestructura real y procedimientos humanos todavía no probados.

## Ejecución

```bash
node scripts/run-synthetic-operation-assurance.mjs
```

El resultado se imprime como JSON y no se envía a ningún servicio externo.
