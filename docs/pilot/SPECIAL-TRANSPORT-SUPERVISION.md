# Servicio de transporte seguro para portes especiales y supervisión de mercancías

Estado actual: **demo / preparación de piloto**. No existe seguimiento GPS real, sensor productivo, custodia física ni garantía de seguridad operativa en esta fase.

## Casos objetivo
- mercancía frágil o de alto valor;
- entregas con cadena de custodia reforzada;
- portes con múltiples entregas o cambios de responsable;
- mercancía que requiera comprobar embalaje, sello o estado en hitos;
- operaciones con necesidad de evidencia y trazabilidad reforzadas.

## Flujo
1. Clasificar el porte y sus restricciones.
2. Registrar mercancía, embalaje, referencias y controles requeridos.
3. Definir responsables/transportista en modo demo.
4. Recogida con evidencia inicial.
5. Checkpoints de custodia y tránsito.
6. Registrar excepciones: retraso, desviación, sello roto, alerta de condición, desacuerdo en entrega.
7. Revisión humana cuando exista una excepción.
8. Entrega con prueba de recepción y cierre documentado.

## Supervisión
Cada checkpoint genera un estado trazable y puede asociar evidencia. La arquitectura queda preparada para futuros adaptadores de telemetría (por ejemplo GPS, temperatura, humedad, golpes o apertura), pero esos proveedores deberán pasar por R7, SEC-4 y revisión legal antes de activarse.

## Principios de seguridad
- no confiar en un único sensor o señal;
- separar observación de decisión;
- no ejecutar bloqueos automáticos ni asignar responsabilidad jurídica;
- preservar cadena temporal y evidencia de cada cambio de custodia;
- minimizar PII y evitar exponer ubicación sensible sin necesidad;
- escalar excepciones a revisión humana.

## Evolución futura
La capa de supervisión debe aceptar proveedores sustituibles mediante adaptadores, de forma que FIA&CO pueda integrar telemática, IoT, geofencing o SIEM/Fortinet sin acoplar el núcleo a un fabricante concreto.
