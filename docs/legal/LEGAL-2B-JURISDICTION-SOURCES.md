# LEGAL-2B — Jurisdicción, fuentes y vigencia

Estado: PRE_PILOT_RESEARCH. No constituye asesoramiento jurídico ni `LEGAL_READY_FOR_PILOT`.

## L2B-1 — Jurisdicción inicial objetivo
Hipótesis de diseño inicial: **España + marco de la Unión Europea**, exclusivamente para organizar investigación, requisitos y arquitectura. No determina por sí sola ley aplicable, competencia judicial ni posibilidad de ofrecer cada servicio. Expansión a otro país requiere perfil jurídico separado.

## L2B-2/3 — Inventario inicial y fuentes oficiales
Usar siempre publicación oficial y registrar identificador, versión/fecha consultada y ámbito. Inventario inicial que debe validarse por profesional antes de producción:
- LSSI-CE, Ley 34/2002 — contratación electrónica/servicios de sociedad de la información. Fuente oficial BOE, ELI `es/l/2002/07/11/34`.
- TRLGDCU, Real Decreto Legislativo 1/2007 — consumidores y usuarios cuando el caso sea B2C. Fuente oficial BOE, ELI `es/rdlg/2007/11/16/1`.
- Reglamento (UE) 2016/679 (RGPD) + normativa española complementaria — datos personales.
- Reglamento (UE) 910/2014 (eIDAS), y marco europeo posterior aplicable — identificación/firma/servicios de confianza cuando proceda.
- Reglamento (UE) 2022/2065 (DSA) — analizar aplicabilidad al modelo de intermediación/plataforma.
- Reglamento (UE) 2024/1689 (AI Act) — analizar obligaciones por rol y caso de uso del Agente Premium.
- Normativa sectorial de pagos, AML/KYC, transporte, criptoactivos, ADR/ODR y fiscalidad: **scope profesional obligatorio antes de activar el caso correspondiente**.

El inventario es un mapa de investigación, no una conclusión de aplicabilidad.

## L2B-4 — Jurisprudencia
La jurisprudencia vive en un registro separado de `norm`, `internal_policy` y `recommendation`. Cada entrada futura requiere tribunal, jurisdicción, identificador oficial, fecha, hechos relevantes, cuestión jurídica, estado de revisión y fecha de última comprobación. **Nunca se convierte automáticamente en enforcement ni en una regla vinculante de producto.**

## L2B-5 — Vigencia/versionado
Cada fuente debe guardar `source_id`, `official_uri`, `jurisdiction`, `effective_from`, `checked_at`, `status` y `review_due`. Una modificación normativa no sobrescribe silenciosamente la versión usada en una decisión histórica. Revisión ordinaria trimestral en piloto y extraordinaria ante cambio normativo/material.

## L2B-6 — Revisión profesional obligatoria
Antes de piloto real: calificación del rol de FIA&CO; contratación B2B/B2C; protección de datos; pagos/custodia; KYC/AML; transporte; marketplace/DSA; IA/decisiones automatizadas; firma/evidencia; ADR/ODR; fiscalidad; términos, responsabilidad, seguros y expansión territorial.

## Gate LEGAL-2B
`jurisdictionValidated=false` y `externalLegalReviewCompleted=false` hasta dictamen/revisión profesional documentada. Las fuentes oficiales ayudan a diseñar; no sustituyen esa validación.
