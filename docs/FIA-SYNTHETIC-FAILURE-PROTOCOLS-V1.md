# FIA&CO — Protocolos de fallos sintéticos v1

Estado: `INTERNAL / SYNTHETIC_ONLY / NO_EXTERNAL_ACTIONS`.

## Objetivo

Provocar errores ficticios para comprobar que FIA detecta el problema, bloquea únicamente lo necesario, conserva trazabilidad y exige una prueba de recuperación antes de cerrar el ensayo.

## Fallos ensayados

1. Falta documentación del responsable.
2. Llega dos veces el mismo evento.
3. Se intenta guardar una versión antigua.
4. Se intenta saltar un estado de la operación.
5. La huella digital de una evidencia no coincide.
6. Un usuario intenta acceder sin permiso.
7. El proveedor de pago simulado no responde.
8. Un archivo ficticio contiene malware.
9. Se introducen datos delicados en una entrada pública.
10. La IA intenta decidir algo que corresponde a una persona.

## Protocolo común

Cada ensayo debe registrar:

- cómo se detectó;
- qué quedó bloqueado;
- quién debe revisarlo;
- cómo se recupera;
- evidencia de que la recuperación pasó la prueba.

El ensayo no se considera cerrado hasta aportar `DETECTION_RECORDED`, `CONTAINMENT_VERIFIED` y `RECOVERY_TEST_PASSED`.

## Documentación pendiente de Bruno

Dentro de la simulación, la falta de un domicilio, correo, dominio u otro documento real no provoca un fallo del desarrollo. Se utiliza un marcador sintético claramente identificado y el requisito queda en un registro de pendientes.

Reglas:

- no inventar valores;
- no reutilizar información privada de otras fuentes;
- no pedir datos antes de que sean necesarios;
- agrupar las peticiones para evitar interrupciones;
- bloquear únicamente la activación real que dependa del dato;
- permitir que las simulaciones seguras sigan funcionando.

Ningún protocolo envía mensajes, notificaciones jurídicas, instrucciones financieras o archivos fuera del entorno sintético.
