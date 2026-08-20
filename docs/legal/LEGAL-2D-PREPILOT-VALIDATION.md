# LEGAL-2D — Validación jurídica pre-piloto

Estado: **PREPARED_NOT_VALIDATED**. Este documento prepara la revisión; no afirma que FIA&CO haya recibido asesoramiento jurídico externo ni autoriza operación real.

## Checklist por caso de uso
Antes de piloto real, revisar para compraventa, transporte/logística, marketplace/intermediación, custodia/no custodia, evidencias, incidencias/conciliación, identidad KYC/KYB y Agente Premium:
1. Partes, rol de FIA&CO y relación contractual claramente descritos.
2. Jurisdicción/ley aplicable validadas por profesional para el escenario concreto.
3. Información y consentimiento necesarios definidos.
4. Datos personales minimizados, finalidad/retención/acceso definidos.
5. Evidencias y audit trail definidos sin prometer admisibilidad universal.
6. Incidencia, contradicción, revisión humana y escalado disponibles.
7. Proveedor productivo, si existe, supera R7/SEC-4 y revisión contractual/regulatoria.
8. Cualquier automatización con efecto significativo mantiene human-in-the-loop.

## Riesgos abiertos
| Riesgo | Severidad pre-validación | Tratamiento |
|---|---|---|
| Ley/jurisdicción aplicable no validada para cliente/caso real | ALTA | Revisión profesional antes de piloto real |
| Calificación regulatoria de pagos/custodia/intermediación | ALTA | Mantener no-custodial y dinero real bloqueado hasta dictamen/arquitectura adecuada |
| KYC/KYB, biometría y PII real | ALTA | Bloqueado hasta necesidad/base jurídica/proveedor/controles validados |
| Valor probatorio/retención de evidencias | MEDIA | Validar por jurisdicción y política de conservación |
| Consumo/B2B y términos contractuales | MEDIA | Adaptar términos al perfil del piloto y revisión profesional |
| Agente Premium con efectos vinculantes | ALTA | Mantener shadow/read-only y sin enforcement |

## Bloqueantes de piloto real
`LEGAL_READY_FOR_PILOT` debe permanecer **false** mientras exista cualquiera de estos puntos:
- revisión jurídica externa no completada para el alcance real del piloto;
- jurisdicción/ley aplicable sin validar;
- riesgos jurídicos ALTOS abiertos sin tratamiento/aceptación profesional documentada;
- dinero/custodia real, PII/biometría real, proveedor productivo o enforcement activados fuera de sus gates;
- términos/avisos/consentimientos del caso piloto no revisados;
- ausencia de mecanismo humano de incidencia/escalado.

## Paquete para abogado externo
Entregar, como mínimo:
- LEGAL-2A matriz funcional;
- LEGAL-2B fuentes/jurisdicción de investigación;
- LEGAL-2C arquitectura de políticas versionadas;
- arquitectura R de proveedores y SEC-4;
- flujos de usuario del piloto y roles de las partes;
- términos/avisos/consentimientos propuestos;
- mapa de datos y retención;
- lista de proveedores que se pretendan activar;
- threat model y límites del Agente Premium;
- registro de riesgos de este documento.

Solicitar respuesta explícita sobre: ley/jurisdicción aplicable, calificación del rol de FIA&CO, contratación/consumo, pagos/custodia, privacidad/identidad, evidencias, resolución de incidencias, responsabilidad, términos y límites de automatización.

## Gate LEGAL_READY_FOR_PILOT
El gate solo puede cambiar a `true` cuando exista evidencia documentada de revisión profesional externa para el alcance concreto, no queden riesgos ALTOS sin tratamiento aceptado y los gates SEC/R correspondientes estén satisfechos. La aprobación técnica interna por sí sola **no** satisface este gate.

## Prueba real
La prueba real deberá organizarse de forma separada y controlada por el responsable del proyecto junto con el primer inversor o entidad colaboradora cuando proceda. Preparar el software no equivale a autorizar esa prueba ni a activar dinero, PII o proveedores reales.
