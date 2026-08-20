# LEGAL-2C — Arquitectura jurídica versionada

## L2C-1 — Modelo de reglas
Toda regla tiene `rule_id`, `kind`, `version`, jurisdicción/perfil, vigencia, estado y fuente cuando corresponda. Tipos separados: **norm**, **case_law**, **internal_policy**, **recommendation**.

## L2C-2 — Trazabilidad
Toda recomendación jurídica/técnica futura debe poder reconstruir qué versiones de reglas y fuentes influyeron, mediante `decision_correlation_id`. Las decisiones históricas conservan la versión aplicada aunque cambie la regla después.

## L2C-3 — Separación semántica
Una norma no se presenta como política interna; una política interna no se presenta como obligación legal; jurisprudencia no se presenta como regla universal; una recomendación no se presenta como decisión vinculante.

## L2C-4 — Human-in-the-loop
Obligatorio para resultado sensible, efecto jurídico vinculante, conflicto relevante, excepción de política y cualquier futura capacidad de enforcement del Agente Premium.

## L2C-5 — Rollback
Las reglas son versionadas, no sobrescritas. Rollback exige motivo, actor/revisor, evento de auditoría y conservación de la versión sustituida. Debe ser posible reproducir el resultado histórico.

## L2C-6 — Gate anti-enforcement
Mientras `legalReadyForPilot=false`:
- `automatedLegalEnforcementEnabled=false`;
- `caseLawDirectEnforcementEnabled=false`;
- Premium permanece `shadow-read-only`;
- no se activa dinero real ni PII real;
- ninguna jurisprudencia puede por sí sola bloquear, ejecutar, resolver o modificar una operación.

El paso a cualquier efecto vinculante requiere LEGAL-2D, revisión profesional, gates SEC/proveedor aplicables y autorización explícita independiente.
