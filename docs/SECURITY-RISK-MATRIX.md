# FIA&CO — Security Risk Matrix

Estado: demo / preproducción. Esta matriz no autoriza dinero real, PII real, proveedores externos ni enforcement productivo.

| ID | Riesgo | Severidad | Probabilidad actual | Mitigación actual | Gate antes de producción | Estado |
|---|---|---|---|---|---|---|
| SEC-AUTH-01 | IDOR/BOLA o actor suplantado | Alta | Baja en demo | actor derivado de sesión, filtrado por recurso, tests cruzados | revisión externa + RBAC/ABAC real | Mitigado en demo |
| SEC-TXN-01 | Doble ejecución / replay | Alta | Baja | idempotency key, estado terminal, transacción serializada | idempotencia distribuida + DB transaccional | Mitigado en demo |
| SEC-TXN-02 | Ruptura de invariantes de saldo/estado | Crítica | Baja | conservación de saldo, transiciones controladas, rollback del store | ledger/DB con constraints + reconciliación | Mitigado en demo |
| SEC-AUD-01 | Modificación silenciosa de auditoría | Alta | Media | secuencia, eventId y hash encadenado; fallo cerrado al cargar | almacenamiento append-only/WORM + SIEM | Parcial |
| SEC-XSS-01 | XSS / script inyectado | Alta | Media | DOM seguro, gate de sinks, CSP en páginas críticas | CSP global por headers + revisión externa | Parcial |
| SEC-SESSION-01 | Replay/secuestro de sesión | Alta | Baja en demo | token aleatorio, TTL, rotación, revocación al relogin, no-store | cookies/tokens productivos, MFA, device/context controls | Parcial |
| SEC-SUPPLY-01 | Dependencia/action comprometida | Alta | Baja | GitHub Actions fijadas por SHA, permisos explícitos, gate CI | SCA/SBOM/renovación controlada | Parcial |
| SEC-DOS-01 | Agotamiento de API/estado | Media | Media | body limits, rate limit, límites de mapas/estado | WAF/rate limiting distribuido/autoscaling | Parcial |
| SEC-PROVIDER-01 | Proveedor externo comprometido | Alta | N/A | adaptadores MOCK_ONLY, sin secretos reales | allowlists, mTLS/OAuth, timeouts, circuit breaker, contract tests | Bloqueado |
| SEC-AGENT-01 | Agente Premium ejecuta enforcement indebido | Crítica | Muy baja | shadow/read-only, enforcement=false, writeCapabilities=[] | autorización separada + control humano + auditabilidad | Bloqueado |
| SEC-PRIV-01 | PII/biometría real en demo/logs | Crítica | Baja | política de no PII real y demos simuladas | DPIA/RGPD, minimización, retención y contratos | Bloqueado |

## Reglas de gobierno

- Hallazgos críticos/altos bloquean producción hasta resolución o aceptación formal documentada.
- Cada nueva integración real debe añadir riesgos específicos y owner operativo.
- La severidad se revisa cuando cambie la exposición (hosting público, backend real, PSP/KYC, clientes o dinero real).
- `PREMIUM_AGENT_READY=false` y los gates de producción siguen siendo bloqueantes.
- Fortinet-ready describe compatibilidad de arquitectura, no sustituye threat modeling, pentest ni controles de aplicación.

## Prioridad siguiente

1. Terminar CSP global sin scripts inline.
2. Diseñar autorización productiva por roles/recursos antes de backoffice real.
3. Migrar auditoría a almacenamiento append-only/SIEM cuando exista backend persistente.
4. Incorporar SCA/SBOM cuando aparezca un gestor de dependencias productivo.
5. Pentest/revisión externa antes de cualquier piloto con información real.
