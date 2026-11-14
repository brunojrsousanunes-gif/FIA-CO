# FIA&CO — catálogo documental

**Propósito:** localizar la fuente adecuada antes de responder, modificar código o tomar decisiones.  
**Regla:** este catálogo orienta; no sustituye la lectura del documento fuente ni la comprobación del código actual.

## 1. Jerarquía de fuentes

Cuando haya contradicciones, aplicar este orden según el tipo de afirmación:

1. **Comportamiento real:** producción y datos remotos observados con autorización y evidencia actual.
2. **Pruebas:** CI, pruebas automatizadas y registros de ejecución del commit exacto.
3. **Código y configuración:** rama/commit que se está revisando.
4. **Documentación técnica vigente:** arquitectura, contratos de interfaces, seguridad y operación.
5. **Decisiones y registros históricos:** explican el motivo y la evolución; no prueban el estado actual.
6. **Planes y propuestas:** describen intención, no implementación.

Una prueba local no demuestra despliegue; una configuración no demuestra que esté activa; un documento no demuestra que una función esté conectada.

## 2. Mapa de áreas

| Área | Ubicación | Uso |
|---|---|---|
| Estado y continuidad entre IAs | `PROJECT-HANDOFF.md` | Estado de ramas, pruebas, límites y siguiente trabajo |
| Notas técnicas mínimas para continuidad de IA | `DECISION-LOG.md` | Solo límites técnicos duraderos que evitan errores al retomar el trabajo |
| Tareas y prioridades | `WORK-REGISTER.md` | Cola de trabajo, dependencias y estado |
| Reglas del proyecto | `../../skills/fia-co-project/SKILL.md` | Instrucciones generales |
| Reglas operativas | `../../skills/fia-co-project/references/operating-rules.md` | Cambios, seguridad, piloto y aceptación |
| Revisión de seguridad | `../../skills/fia-co-security-review/SKILL.md` y `../../skills/fia-co-security-review/references/` | Código, permisos, secretos y evaluación de skills externas |
| Arquitectura y publicación | `../FIA-CO-ARCHITECTURE-BOUNDARIES.md` | Fronteras, integración y límites técnicos |
| Consolidación histórica | `../FIA-CO-CONSOLIDATION-MATRIX.md` | Registro anterior; reconciliar antes de usar como estado actual |
| Legal y contratos | `../legal/` | Documentación jurídica, compraventa y políticas |
| Piloto y operación | `../pilot/`, `../PILOT-PLAYBOOK.md`, `../COMMERCIAL-OPS-V1.md` | Preparación y ejecución del piloto |
| Transporte | `../transport/` | Requisitos y verticales de transporte |
| Seguridad | `../security/`, `../SECURITY-OPERATING-BASELINE.md`, `../SECURITY-RISK-MATRIX.md` | Controles y riesgos |
| Finanzas y precios | `../FINANCIAL-MODEL-36M.md`, `../PRICING-PILOT-VALIDATION.md`, otros documentos financieros en `docs/` | Modelo económico y validación |
| Comercial e inversión | Documentos `COMMERCIAL-*`, `INVESTOR-*`, `FUNDING-*` y `B2B-*` en `docs/` | Estrategia, ventas y financiación |

## 3. Clasificación obligatoria de documentos

Cada documento debe entenderse como una o varias de estas clases:

- **VIGENTE:** fuente operativa actual, revisada contra código/pruebas.
- **HISTÓRICO:** conserva decisiones o contexto de una etapa anterior.
- **VALOR FUTURO:** contrato, modelo, estrategia o capacidad no prioritaria hoy, pero útil potencialmente.
- **PROPUESTA:** diseño pendiente de aprobación o implementación.
- **PENDIENTE DE VALIDAR:** no se conoce suficientemente su estado.
- **DUPLICADO CANDIDATO:** posible solapamiento que exige comparar contenido y referencias.
- **OBSOLETO CONFIRMADO:** solo después de demostrar que no se usa y que no conserva valor legal, comercial, funcional o histórico.

No se clasificará un documento como obsoleto por su antigüedad, nombre, falta de uso inmediato o ausencia en el MVP.

## 4. Reglas para mantener el catálogo

1. Al crear un documento nuevo, añadirlo aquí si contiene una decisión, regla, especificación o evidencia relevante.
2. Un documento debe tener propósito, alcance, estado y fecha de revisión.
3. Evitar copiar el mismo requisito en varios sitios: elegir una fuente y enlazarla.
4. Si se mantiene una copia por razones técnicas, indicar cuál es la fuente y cómo se sincroniza.
5. No renombrar ni mover archivos en bloque: revisar primero enlaces, imports, tests y referencias de PR.
6. Los contratos de compraventa y documentación legal se conservan aunque no estén activos en el piloto.
7. Tras cada cambio relevante, actualizar el traspaso y el registro de trabajo; registrar en decisiones solo acuerdos duraderos.

## 5. Plantilla mínima para documentos nuevos

```markdown
# Título

- Estado: PROPUESTA | VIGENTE | HISTÓRICO | PENDIENTE DE VALIDAR
- Responsable lógico: área o función
- Creado: AAAA-MM-DD
- Revisado: AAAA-MM-DD
- Fuente de verdad relacionada: ruta o enlace

## Propósito
## Alcance y exclusiones
## Contenido / requisitos
## Evidencias y referencias
## Dependencias
## Pendientes
```
