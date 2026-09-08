# FIA&CO — Resistencia operativa sintética v1

Estado: `SYNTHETIC_ONLY / ZERO_COST / NO_EXTERNAL_ACTIONS`.

Esta campaña comprueba:

- dos ediciones simultáneas sin pérdida silenciosa;
- recuperación del último estado válido tras un reinicio;
- rechazo de una copia de seguridad alterada;
- ordenación de eventos retrasados y eliminación de duplicados;
- bloqueo si falta un evento de la secuencia;
- imposibilidad de reabrir una operación cerrada;
- detección de operaciones sin avances;
- escalado de varias incidencias críticas;
- detección de una revisión humana fuera de plazo;
- comparación exacta con una línea base.

La copia de seguridad incorpora una huella SHA-256. Detecta cambios, pero no sustituye cifrado, almacenamiento externo seguro ni una prueba productiva de restauración.

Un resultado `PASS_RESILIENCE` permite continuar ensayos internos. No certifica producción ni demuestra recuperación sobre infraestructura real.
