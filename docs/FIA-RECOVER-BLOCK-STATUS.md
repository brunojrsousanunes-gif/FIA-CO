# FIA&CO — FIA Recover Block Status

Última actualización: 2026-09-04.

Leyenda: `DESIGNED`, `FOUNDATION_IMPLEMENTED`, `PILOT_PENDING`, `VALIDATION_PENDING`, `LATER`.

| Bloque | Estado | Evidencia / siguiente gate |
|---|---|---|
| A Estrategia | DESIGNED | Operating Model v1; validar segmento en 3 pilotos |
| B Modelo económico | FOUNDATION_IMPLEMENTED | Guardrails + baseline/outcome metrics; falta validar willingness-to-pay y margen real |
| C Quote Recovery MVP | FOUNDATION_IMPLEMENTED | Motor determinista endurecido + cockpit sintético; adaptadores reales permanecen apagados |
| D Lead Recovery | PILOT_PENDING | No desarrollar hasta evidencia de necesidad |
| E Payment Recovery | LATER | Requiere validación adicional y controles de comunicación |
| F Document Recovery | PILOT_PENDING | Diseñado; activar si aparece como cuello de botella |
| G AI Router | DESIGNED | Routing conceptual; no es necesario para el primer shadow pilot |
| H Outcome Engine | FOUNDATION_IMPLEMENTED | Baseline, atribución y economics deterministas; persistencia real/dashboard productivo pendientes |
| I Seguridad/confianza | FOUNDATION_IMPLEMENTED | Policy safe + external action gate + Proof Pack access; web pública sin Proof Packs completos |
| J Integración FIA&CO | FOUNDATION_IMPLEMENTED | Recover vive en `core/`; integración transaccional completa no es requisito del primer piloto |
| K Primer piloto | PILOT_PENDING | Gate técnico: CI verde; después buscar Founding Demonstrator 1 |
| L Productización | VALIDATION_PENDING | Gate: patrón repetido >=3 clientes + ROI |
| M Red FIA | LATER | No iniciar antes de densidad de clientes/procesos |
| N Escalado AI-first | DESIGNED | Medir MRR/horas humanas; automatizar soporte/onboarding después de pilotos |

## Regla de avance

No marcar un bloque como `VALIDATED` por completar código. La validación requiere evidencia externa o técnica acorde al bloque.

## Founding Demonstrators

Los primeros 3 proyectos se seleccionan como casos demostradores medibles, no como clientes ordinarios. Cada caso busca tres activos:

`INGRESO INICIAL + APRENDIZAJE DE PRODUCTO + PRUEBA COMERCIAL RESTRINGIDA`

Los resultados se separan en `CONFIRMED`, `ASSISTED` y `ESTIMATED`.

Un candidato puede estar listo para un piloto controlado y no ser adecuado como Founding Demonstrator. El gate `core/recover/recover-pilot-readiness.mjs` distingue ambos estados.

## Regla de visibilidad comercial

- Los FIA Proof Packs completos no son públicos por defecto.
- La web pública solo puede mostrar propuesta, metodología, ejemplos sintéticos e indicadores agregados aprobados.
- Casos reales: web privada/app para prospectos autorizados, clientes autenticados o personal FIA según rol y autorización del cliente origen.
- `GATED_IDENTIFIED` exige autorización expresa para información identificable.
- `GATED_ANONYMIZED` exige autorización de reutilización del caso.
- `CLIENT_ONLY` excluye a prospectos.
- `PRIVATE` queda restringido al equipo FIA autorizado.
- Los accesos deben generar evento auditable con decisión y versión de política.

## Seguridad del primer demostrador

- `externalActionsEnabled=false` durante la preparación/shadow.
- `core/recover/recover-action-gate.mjs` falla cerrado ante política ausente, kill switch, permisos/datos insuficientes, horario no autorizado o plantilla sin aprobar.
- La primera acción externa futura requiere aprobación humana según política.
- Una venta no puede cerrarse automáticamente por clasificación IA.
- La atribución de resultados queda limitada a `CONFIRMED`, `ASSISTED` o `ESTIMATED`.
- Los seguimientos no pueden programarse en el pasado.

## Artefactos actuales

- `docs/FIA-RECOVER-OPERATING-MODEL-V1.md`
- `docs/FIA-RECOVER-PILOT-PLAYBOOK-V1.md`
- `docs/FIA-FOUNDING-DEMONSTRATORS-V1.md`
- `docs/FIA-PROOF-PACK-TEMPLATE-V1.md`
- `docs/FIA-RECOVER-FIRST-DEMONSTRATOR-V1.md`
- `config/recover-policy.v1.json`
- `config/proof-pack-visibility.v1.json`
- `core/recover/recover-engine.mjs`
- `core/recover/recover-outcomes.mjs`
- `core/recover/recover-action-gate.mjs`
- `core/recover/recover-pilot-readiness.mjs`
- `core/proof/proof-pack-access.mjs`
- `core/proof/proof-pack-viewer-context.mjs`
- `frontend/recover-demo.html` (sintético, fuera del allowlist público)
- `frontend/js/recover-demo.js`
- `tests/recover-engine.test.mjs`
- `tests/recover-outcomes.test.mjs`
- `tests/recover-action-gate.test.mjs`
- `tests/recover-pilot-readiness.test.mjs`
- `tests/recover-demo.test.mjs`
- `tests/proof-pack-access.test.mjs`
- `tests/proof-pack-viewer-context.test.mjs`

## Próximo orden recomendado

1. abrir PR del demonstrator y exigir CI verde;
2. corregir cualquier fallo del battery antes de fusionar;
3. no añadir más módulos especulativos;
4. seleccionar candidatos locales con score >=14/20;
5. mostrar cockpit sintético y ejecutar discovery;
6. elegir Founding Demonstrator 1;
7. fijar baseline y economics proyectados;
8. empezar shadow mode;
9. decidir mediante evidencia si merece pasar a approval mode;
10. producir Proof Pack restringido si existe resultado medible;
11. repetir con demostradores 2 y 3;
12. decidir productización/siguiente módulo por evidencia.
