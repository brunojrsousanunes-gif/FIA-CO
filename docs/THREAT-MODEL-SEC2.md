# FIA&CO — Threat Model SEC-2

Estado: demo/preproducción. No habilita dinero real ni proveedores reales.

## Activos
- identidad y sesión del usuario;
- expedientes/operaciones y su trazabilidad;
- reglas del Agente Premium y recomendaciones shadow;
- configuración de proveedores/adaptadores;
- secretos de demo y futuros secretos de integración;
- integridad de pricing, límites y estados de operación.

## Actores
- usuario legítimo;
- atacante remoto no autenticado;
- usuario autenticado malicioso;
- proveedor externo comprometido o erróneo;
- operador/administrador;
- código frontend manipulado o extensión del navegador;
- fallo operativo o de configuración.

## Trust boundaries
1. navegador ↔ frontend estático;
2. navegador ↔ API demo/futura API productiva;
3. API ↔ almacenamiento;
4. API ↔ PSP/KYC/antifraude/revisión humana;
5. backoffice ↔ servicios internos;
6. CI/CD ↔ artefactos y despliegue.

## Amenazas prioritarias y mitigaciones

### XSS / contenido activo
Riesgo: datos no confiables renderizados como HTML o ejecución de scripts inyectados.
Mitigaciones: textContent/DOM seguro, CSP progresiva, prohibición de eval/document.write/javascript:, tests de regresión y sanitización contextual.

### Secuestro o replay de sesión
Riesgo: reutilización de tokens robados o sesiones antiguas.
Mitigaciones actuales demo: tokens aleatorios, TTL corto, no-store, rotación por nuevo login, revocación de la sesión anterior del mismo actor y logout explícito. Producción requerirá cookies/credenciales seguras o tokens con controles equivalentes, MFA cuando proceda y telemetría.

### Doble ejecución / replay transaccional
Riesgo: creación duplicada por reintentos o automatización.
Mitigaciones: Idempotency-Key, validación de estado antes de aceptar/rechazar y persistencia de la clave en demo.

### Manipulación del cliente
Riesgo: confiar en precio, permisos o estados calculados en frontend.
Mitigación: frontend no es autoridad; backend real debe recalcular precio, autorización, stock, límites, identidad y políticas.

### Abuso de API / agotamiento
Riesgo: cuerpos grandes, rate abuse, crecimiento de mapas/estado.
Mitigaciones: MAX_BODY, rate-limit, barrido y límites de estructuras, límites de operaciones/auditoría y límites de importes.

### Proveedor externo comprometido
Riesgo: respuestas falsas, indisponibilidad, filtración o instrucciones maliciosas.
Mitigación: adaptadores aislados, MOCK_ONLY actual, allowlists, timeout/circuit breaker futuros, validación de esquemas, auditoría y mínimo privilegio.

### Escalada del Agente Premium
Riesgo: que una recomendación pase a enforcement sin control.
Mitigación: shadow/read-only, enforcement=false, writeCapabilities=[], adaptador de enforcement separado y autorización explícita futura.

### Secretos en repositorio/logs
Riesgo: exposición accidental.
Mitigación: variables de entorno, secret scanning en CI, no registrar credenciales y política SECURITY.md.

## Gates previos a producción
- revisión externa/pentest;
- threat model actualizado con infraestructura real;
- autenticación/MFA y autorización por roles;
- gestión de secretos y rotación;
- SIEM/alertas y respuesta a incidentes;
- backups/restauración y DR;
- WAF/rate limiting distribuido;
- validación de proveedores y contratos;
- privacidad y revisión jurídica;
- enforcement Premium separado y aprobado.
