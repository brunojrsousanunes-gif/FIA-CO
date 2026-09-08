# FIA&CO — Campaña adversarial sintética v1

Estado: `SYNTHETIC_ONLY / ZERO_COST / NO_EXTERNAL_ACTIONS`.

La campaña combina errores para evitar resultados artificialmente perfectos. Cada escenario contiene un primer intento de recuperación fallido y un segundo intento que debe aportar evidencias concretas.

## Escenarios

- Presión operativa: evento duplicado, versión antigua y timeout del PSP ficticio.
- Presión de seguridad y privacidad: acceso indebido, dato delicado en entrada pública y decisión impropia de IA.
- Presión sobre evidencias: hash incorrecto y malware ficticio.

También se modifica o elimina deliberadamente una copia del historial y se altera un manifiesto de evidencia. El resultado correcto es detectar las tres manipulaciones y mantener bloqueada cualquier recuperación sin evidencia.

## Documentación pendiente

La gravedad depende de la fase:

- desarrollo sintético: baja; se utiliza un marcador ficticio;
- prepiloto controlado: alta; el prepiloto queda bloqueado;
- activación productiva: crítica; la producción queda bloqueada.

No se inventan ni recuperan datos personales para completar documentación.

## Interpretación

`PASS_SYNTHETIC_ONLY` permite continuar ensayos internos. No certifica seguridad productiva, cumplimiento legal, funcionamiento del PSP, mercado ni rentabilidad.
