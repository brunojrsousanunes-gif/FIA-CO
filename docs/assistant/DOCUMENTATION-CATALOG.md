# FIA&CO — catálogo documental

**Uso:** índice de materias y criterio para elegir fuentes. Para el inventario detallado de documentos, código, configuración y pruebas, consulta el [mapa maestro del proyecto](PROJECT-MAP.md).

## Jerarquía de fuentes

La fuente adecuada depende de lo que se intenta demostrar:

1. **Entorno real:** estado observado del despliegue y servicios, con fecha y evidencia.
2. **Pruebas:** resultado del commit exacto y entorno donde se ejecutaron.
3. **Código y configuración:** rama y SHA inspeccionados.
4. **Especificación vigente:** documento que define el requisito o contrato.
5. **Histórico:** contexto de decisiones anteriores, no prueba del estado actual.
6. **Propuesta:** intención pendiente, no implementación.

No confundir: pantalla con capacidad operativa; JSON con función activa; CI con despliegue; simulación con piloto real; migración escrita con migración aplicada.

## Navegación por área

| Área | Fuente de entrada |
|---|---|
| Estado actual y continuidad entre IAs | [PROJECT-HANDOFF.md](PROJECT-HANDOFF.md) |
| Mapa de todas las áreas y rutas | [PROJECT-MAP.md](PROJECT-MAP.md) |
| Reglas maestras de FIA&CO | [Skill de proyecto](../../skills/fia-co-project/SKILL.md) |
| Reglas operativas | [operating-rules.md](../../skills/fia-co-project/references/operating-rules.md) |
| Seguridad y revisión de código | [Skill de seguridad](../../skills/fia-co-security-review/SKILL.md) |
| Arquitectura y publicación | [Límites de arquitectura](../FIA-CO-ARCHITECTURE-BOUNDARIES.md) |
| Legal y contratos | [docs/legal/](../legal/) |
| Operación y piloto | [Playbook](../PILOT-PLAYBOOK.md), [docs/pilot/](../pilot/) |
| Transporte | [docs/transport/](../transport/) |
| Finanzas y precios | [Modelo financiero](../FINANCIAL-MODEL-36M.md), [precios](../PRICING-PILOT-VALIDATION.md) |
| Comercial e inversión | [Kit comercial](../COMMERCIAL-KIT.md), [índice del data room](../DATA-ROOM-INDEX.md) |

## Clasificación de la información

- **NÚCLEO ACTUAL:** requisito, implementación o prueba necesaria hoy.
- **VALOR FUTURO:** contrato, plantilla, estrategia, vertical o capacidad que puede ser útil después.
- **HISTÓRICO:** conserva el origen de una decisión o versión.
- **PROPUESTA:** pendiente de aprobación o implementación.
- **PENDIENTE DE VALIDAR:** requiere investigación.
- **DUPLICADO CANDIDATO:** solapamiento por comparar; no eliminar.
- **OBSOLETO CONFIRMADO:** solo después de demostrar que no se usa ni conserva valor legal, comercial, funcional o histórico.

La ausencia de uso en el MVP no convierte un archivo en obsoleto. En especial, conservar contratos de compraventa y documentación jurídica.

## Reglas de mantenimiento

1. Añadir al mapa los documentos que definan requisitos, decisiones técnicas, seguridad, contratos o evidencia relevante.
2. Evitar duplicar reglas: mantener una fuente y enlazarla.
3. Indicar fecha, estado, alcance y evidencias en documentos nuevos.
4. No mover o renombrar archivos sin revisar enlaces, imports, tests, workflows y referencias.
5. No borrar documentos por antigüedad o porque una función esté aplazada.
6. Actualizar el traspaso cuando cambie el estado técnico; el mapa solo cuando cambie la estructura o las relaciones.

## Nota interna de decisiones

El registro [DECISION-LOG.md](DECISION-LOG.md) es una ayuda técnica opcional para que un asistente recuerde límites y decisiones que evitan errores. No es un acta para el usuario, no requiere mantenimiento por su parte y solo se usa cuando una decisión duradera afecta al trabajo futuro.
