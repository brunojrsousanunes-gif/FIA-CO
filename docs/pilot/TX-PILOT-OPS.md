# TX-PILOT-OPS

Estado: **DEMO_LOCAL_ONLY**. Este bloque prepara la operativa de piloto para compraventa y transporte, pero no inicia transporte, pagos ni captura datos reales.

## Flujo operador/conductor
1. Crear operación demo desde `tx-advanced.html`.
2. Abrir `tx-operator.html`.
3. Registrar recogida demo.
4. Registrar tránsito demo.
5. Añadir prueba de entrega `POD_DEMO` o abrir incidencia.
6. Si existe incidencia, el estado pasa a `REVIEW_REQUIRED` y exige revisión humana.

## Persistencia
Las operaciones se guardan únicamente en `localStorage` del navegador, con un máximo de 25 registros demo. No hay backend, sincronización multiusuario ni proveedor externo en esta fase.

## Métricas piloto
- operaciones creadas;
- activas;
- completadas;
- con incidencia;
- checkpoints por operación;
- evidencias demo por operación.

Estas métricas son de usabilidad y proceso; no prueban ahorro económico, cumplimiento regulatorio ni rendimiento productivo.

## Plantillas prioritarias
- venta con envío;
- entrega B2B;
- mercancía recurrente;
- porte especial;
- transporte animal preparado, sin uso real.

## Gates
Dinero real, PII real, GPS/sensores reales, proveedores productivos y transporte real permanecen desactivados. Cualquier cambio de ese alcance requiere gates SEC/LEGAL/R y autorización separada.
