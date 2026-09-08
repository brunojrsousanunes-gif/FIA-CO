# FIA&CO — Identidad sin biometría

## Decisión

FIA&CO elimina la biometría de su alcance funcional. No captura, infiere, almacena ni compara huellas, rostros, voces o plantillas biométricas.

## Motivo

En el alcance actual no se ha acreditado un beneficio necesario y proporcionado que compense el riesgo jurídico, de seguridad y de suplantación. La biometría tampoco es necesaria para mantener la frontera no custodial ni para que un proveedor de pagos aplique sus propios mecanismos de autenticación.

## Arquitectura admitida

- Autenticación de cuenta mediante mecanismos no biométricos.
- Passkeys o autenticación del dispositivo cuando FIA reciba únicamente una prueba criptográfica y nunca datos biométricos.
- Verificación documental mediante proveedor revisado, recibiendo FIA solo el resultado mínimo autorizado.
- Autenticación reforzada y pagos dentro del entorno del PSP autorizado.
- Método alternativo de recuperación con revisión humana.

## Límites permanentes

- `BIOMETRICS=false`.
- FIA no solicita muestras faciales o de voz.
- FIA no almacena plantillas biométricas.
- FIA no usa interacción, escritura o movimiento como biometría conductual.
- Ningún proveedor puede reutilizar datos de identidad para publicidad o entrenamiento por cuenta de FIA.
- La reintroducción de biometría requiere una decisión nueva, EIPD previa, necesidad demostrada y revisión jurídica externa.
