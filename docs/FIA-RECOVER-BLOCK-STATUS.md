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
| I Seguridad/confianza | FOUNDATION_IMPLEMENTED | Recover policy safe + Proof Pack access policy; web pública sin Proof Packs completos |
| J Integración FIA&CO | FOUNDATION_IMPLEMENTED | Recover vive en `core/`; falta adapter a Operation Engine |
| K Primer piloto | PILOT_PENDING | Ejecutar 3 FIA Founding Demonstrators y producir >=2 Proof Packs útiles |
| L Productización | VALIDATION_PENDING | Gate: patrón repetido >=3 clientes + ROI |
| M Red FIA | LATER | No iniciar antes de densidad de clientes/procesos |
| N Escalado AI-first | DESIGNED | Medir MRR/horas humanas; automatizar soporte/onboarding después de pilotos |

## Regla de avance

No marcar un bloque como `VALIDATED` por completar código. La validación requiere evidencia externa o técnica acorde al bloque.

## Founding Demonstrators

Los primeros 3 proyectos se seleccionan como casos demostradores medibles, no como clientes ordinarios. Cada caso busca tres activos:

`INGRESO INICIAL + APRENDIZAJE DE PRODUCTO + PRUEBA COMERCIAL RESTRINGIDA`

Los resultados se separan en `CONFIRMED`, `ASSISTED` y `ESTIMATED`.

## Regla de visibilidad comercial

- Los FIA Proof Packs completos no son públicos por defecto.
- La web pública solo puede mostrar propuesta, metodología, ejemplos sintéticos e indicadores agregados aprobados.
- Casos reales: web privada/app para prospectos autorizados, clientes autenticados o personal FIA según rol y autorización del cliente origen.
- `GATED_IDENTIFIED` exige autorización expresa para información identificable.
- `GATED_ANONYMIZED` exige autorización de reutilización del caso.
- `CLIENT_ONLY` excluye a prospectos.
- `PRIVATE` queda restringido al equipo FIA autorizado.
- Los accesos deben generar evento auditable con decisión y versión de política.

## Artefactos actuales

- `docs/FIA-RECOVER-OPERATING-MODEL-V1.md`
- `docs/FIA-RECOVER-PILOT-PLAYBOOK-V1.md`
- `docs/FIA-FOUNDING-DEMONSTRATORS-V1.md`
- `docs/FIA-PROOF-PACK-TEMPLATE-V1.md`
- `config/recover-policy.v1.json`
- `config/proof-pack-visibility.v1.json`
- `core/recover/recover-engine.mjs`
- `core/proof/proof-pack-access.mjs`
- `tests/recover-engine.test.mjs`
- `tests/proof-pack-access.test.mjs`

## Próximo orden recomendado

1. ejecutar tests contractuales Recover + Proof Pack access;
2. construir adapter de almacenamiento demo/sintético;
3. crear vista demo mínima de Quote Recovery;
4. crear vista privada mínima de biblioteca Proof Pack;
5. preparar formulario de baseline/discovery;
6. conseguir Founding Demonstrator 1;
7. medir durante shadow mode;
8. decidir si activar comunicación limitada;
9. repetir con demostradores 2 y 3;
10. revisar economics y Proof Packs;
11. decidir siguiente módulo por evidencia.
