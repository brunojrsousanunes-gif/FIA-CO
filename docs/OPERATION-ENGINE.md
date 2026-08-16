# Motor de Operaciones FIA&CO v1

## Objetivo
Unificar compraventa, logística, aceptación, incidencias y liberación condicionada bajo una máquina de estados controlada. El navegador muestra la experiencia; en producción la autoridad será exclusivamente el backend.

## Estados
DRAFT → AWAITING_ACCEPTANCE → CONDITIONED → IN_PROGRESS → DELIVERED → ACCEPTED → READY_FOR_RELEASE → RELEASE_REQUESTED → CLOSED.

DISPUTED y CANCELLED bloquean el flujo normal. Las transiciones no declaradas son rechazadas.

## Condiciones mínimas de liberación
- vendedor aceptó;
- repartidor/transportista verificado por una fuente autorizada;
- entrega registrada;
- comprador aceptó cuando corresponda;
- no existe disputa abierta;
- no se emitió previamente una instrucción de liberación.

FIA&CO genera una instrucción lógica. La ejecución de fondos pertenece a un PSP/banco autorizado.

## Evidencia y privacidad
Cada cambio produce un evento con identificador, tipo, actor lógico, fecha y metadatos mínimos. No guardar biometría bruta, documentos de identidad, PAN/CVV, claves privadas, contraseñas bancarias o evidencias logísticas innecesarias. En producción los identificadores deberán ser pseudónimos y el registro tendrá política de retención.

## Seguridad para producción
La implementación JavaScript de esta rama es una especificación ejecutable/demo, no una autoridad transaccional. Antes de dinero o usuarios reales: motor server-side, autenticación fuerte, autorización por rol/tenant, base transaccional, bloqueo/concurrencia, idempotencia, firmas de webhooks, anti-replay, secretos externos, TLS, auditoría resistente a manipulación, backups, recuperación, monitorización y separación demo/staging/producción.

## Protección del proyecto
La UI pública debe exponer solo el comportamiento necesario para demostrar el producto. Las reglas comerciales detalladas, scoring, conectores, políticas antifraude y lógica propietaria futura deberán residir en backend privado. Mantener historial Git, inventario de dependencias/licencias, documentación fechada de arquitectura y control de acceso. Antes de terceros: revisar NDA/contratos, titularidad del código y estrategia de marca/secreto empresarial/registro aplicable en España y UE.

## Pruebas
`node tests/operation-engine.test.js` comprueba transiciones inválidas, condiciones de liberación, no doble liberación, terminalidad e incidencia.