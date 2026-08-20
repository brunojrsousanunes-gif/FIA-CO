# SEC-4 — Seguridad pre-piloto

Estado: DESIGN_ONLY / DEMO_ONLY. Este bloque prepara controles; no activa usuarios, PII, dinero, proveedores ni enforcement productivos.

## SEC-4A — Autenticación
- Contrato `IdentityProvider` desacoplado de UI y proveedor.
- Métodos previstos: Passkeys/WebAuthn como preferente, MFA de recuperación y OIDC empresarial.
- Sesiones: expiración, rotación, revocación, step-up para acciones sensibles y reautenticación.
- Ningún secreto, assertion WebAuthn ni token se persiste en localStorage.
- Beta actual continúa sin autenticación real.

## SEC-4B — Secretos y entornos
Entornos separados: `dev`, `beta`, `pilot`, `production`. Credenciales distintas por entorno y mínimo privilegio. Secretos solo desde un secrets manager/variables protegidas del runtime; nunca en frontend, repositorio, logs, fixtures o artefactos. Rotación documentada y revocación de emergencia. Producción no hereda credenciales de pilot.

## SEC-4C — Rate limiting y antiabuso
El futuro API gateway debe aplicar límites por identidad + IP/ASN + operación, con ventanas y burst control. Endpoints de login/recuperación, creación de operaciones, evidencias, incidencias y agente requieren límites específicos. Respuesta 429 sin filtrar existencia de cuentas. Detección de replay, idempotency keys y backoff. Los umbrales serán configurables por entorno; este bloque no activa bloqueo real.

## SEC-4D — Logging / SIEM readiness
Eventos JSON normalizados: `event_id`, `correlation_id`, `timestamp`, `environment`, `actor_pseudonym`, `action`, `resource_type`, `outcome`, `severity`, `policy_version`. Prohibido registrar contraseñas, tokens, biometría, documentos completos, datos bancarios o payloads de evidencias. Preparado para exportación futura a SIEM/Fortinet mediante adaptador; actualmente sin exportación externa.

## SEC-4E — Backup y recuperación
- Datos productivos futuros: backup cifrado, segregado y probado.
- Objetivos iniciales de diseño (no SLA contractual): RPO <= 24 h y RTO <= 8 h para piloto; revisar antes de producción.
- Restore test periódico y registro de resultado.
- Copias no deben mezclar entornos ni prolongar retención de PII sin base jurídica.
- Runbook: declarar incidente, congelar escrituras si procede, seleccionar punto, restaurar, validar integridad, reabrir y documentar.

## SEC-4F — Threat model / pentest readiness
Activos: identidad, sesión, operación, evidencias, decisiones, agente Premium, adaptadores de proveedor, logs y supply chain.
Amenazas prioritarias: account takeover, replay, IDOR/BOLA, inyección, XSS, CSRF según arquitectura futura, SSRF en conectores, carga maliciosa de evidencias, exfiltración, prompt/tool injection del agente, escalada de privilegios, manipulación de decisiones, dependencia comprometida y secretos expuestos.
Controles: deny-by-default, validación server-side, autorización por recurso, CSP, aislamiento de proveedores, firma/hash de eventos relevantes, human-in-the-loop para decisiones sensibles y rollback.
Pentest externo antes de producción real, con alcance y reglas de engagement aprobados.

## SEC-4G — Gate pre-piloto
No se declara PILOT_READY si:
1. existe riesgo crítico/alto abierto sin aceptación formal;
2. hay secretos o tokens en frontend/repositorio;
3. se activa dinero real, PII real, proveedor productivo o enforcement;
4. Premium deja de ser shadow/read-only antes de su gate específico;
5. faltan threat model, restore plan o contrato de logging;
6. la batería de seguridad/CI falla.

## SEC-4H — Integración
Solo merge con CI verde. El despliegue resultante sigue siendo beta demostrativa. Activar autenticación, PII, dinero, proveedores o enforcement requerirá un bloque separado y autorización explícita.
