# FIA&CO — Ciclo completo de operación simulada

Estado: `SYNTHETIC_ONLY / ZERO_COST / NO_REAL_MONEY`.

## Recorrido

1. Creación de la operación ficticia.
2. Acuerdo y aceptación simulada.
3. Seguimiento de la operación.
4. Inyección y recuperación de fallos ficticios.
5. Entrega simulada.
6. Incidencia y revisión, cuando el caso la incluye.
7. Aceptación del comprador ficticio.
8. Instrucción simulada al proveedor de pago.
9. Cierre sin movimiento de dinero.

## Casos

- Operación de 700 € ficticios con incidencia resuelta y fallos de duplicidad, versión antigua, integridad de evidencia y timeout del PSP.
- Operación de 1.250 € ficticios con intentos de acceso indebido, malware, datos delicados y decisión impropia de IA.
- Operación de 300 € ficticios con documentación del responsable pendiente y transición inválida.

Los importes son etiquetas de simulación. No representan fondos recibidos, retenidos, custodiados ni transferidos.

## Criterio de éxito

El ciclo solo finaliza cuando:

- cada error fue detectado;
- la contención fue verificada;
- la recuperación pasó su prueba;
- una disputa quedó cerrada por revisión ficticia;
- la orden al PSP está marcada como simulada;
- el cierre declara `moneyMoved=false`;
- ninguna acción externa fue ejecutada.
