# FIA&CO — FIA Recover Block Status

Última actualización: 2026-09-04.

Leyenda: `DESIGNED`, `FOUNDATION_IMPLEMENTED`, `PILOT_PENDING`, `VALIDATION_PENDING`, `LATER`.

| Bloque | Estado | Evidencia / siguiente gate |
|---|---|---|
| A Estrategia | DESIGNED | Operating Model v1; validar segmento en 3 pilotos |
| B Modelo económico | DESIGNED | Guardrails + hipótesis pricing; validar willingness-to-pay y margen |
| C Quote Recovery MVP | FOUNDATION_IMPLEMENTED | Motor determinista + test contractual; faltan adaptadores reales/UI |
| D Lead Recovery | PILOT_PENDING | No desarrollar hasta evidencia de necesidad |
| E Payment Recovery | LATER | Requiere validación adicional y controles de comunicación |
| F Document Recovery | PILOT_PENDING | Diseñado; activar si aparece como cuello de botella |
| G AI Router | DESIGNED | Routing conceptual; falta implementación y telemetría de coste |
| H Outcome Engine | DESIGNED | Métricas/atribución definidas; falta persistencia/dashboard |
| I Seguridad/confianza | FOUNDATION_IMPLEMENTED | Policy v1 safe; externalActionsEnabled=false |
| J Integración FIA&CO | FOUNDATION_IMPLEMENTED | Recover vive en `core/`; falta adapter a Operation Engine |
| K Primer piloto | PILOT_PENDING | Playbook listo; objetivo 3 empresas |
| L Productización | VALIDATION_PENDING | Gate: patrón repetido >=3 clientes + ROI |
| M Red FIA | LATER | No iniciar antes de densidad de clientes/procesos |
| N Escalado AI-first | DESIGNED | Medir MRR/horas humanas; automatizar soporte/onboarding después de pilotos |

## Regla de avance

No marcar un bloque como `VALIDATED` por completar código. La validación requiere evidencia externa o técnica acorde al bloque.

## Artefactos actuales

- `docs/FIA-RECOVER-OPERATING-MODEL-V1.md`
- `docs/FIA-RECOVER-PILOT-PLAYBOOK-V1.md`
- `config/recover-policy.v1.json`
- `core/recover/recover-engine.mjs`
- `tests/recover-engine.test.mjs`

## Próximo orden recomendado

1. ejecutar test contractual Recover;
2. construir adapter de almacenamiento demo/sintético;
3. crear vista demo mínima de Quote Recovery;
4. preparar formulario de baseline/discovery;
5. conseguir piloto 1;
6. medir durante shadow mode;
7. decidir si activar comunicación limitada;
8. repetir con pilotos 2 y 3;
9. revisar economics;
10. decidir siguiente módulo por evidencia.
