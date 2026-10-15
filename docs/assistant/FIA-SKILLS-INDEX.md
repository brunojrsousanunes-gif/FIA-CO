# Índice de skills FIA&CO

Fecha de inventario: 15-10-2026.

## Estado

- **10 documentos indexados** en `frontend/js/fia-skills-corpus.js`, incluidos sus textos completos y SHA de origen.
- El motor `frontend/js/fia-skills-search.js` busca léxicamente dentro del texto completo y devuelve fragmentos de evidencia, ruta y enlace a la fuente.
- La portada carga el corpus antes del motor de búsqueda y ambos están en la lista de publicación pública.
- El índice solo puede usar archivos del repositorio que aparecen abajo. No representa una descarga automática de skills externas ni un RAG semántico.
- Los paquetes originales externos de BIG school no están presentes en el repositorio y no se han copiado ni ejecutado. No se deben dar por incorporados hasta obtener su fuente, versión y licencia y revisarlos con la skill de vetting.

## Fuentes versionadas

| Documento | SHA de origen | Contenido |
|---|---|---|
| [`skills/fia-co-project/SKILL.md`](https://github.com/brunojrsousanunes-gif/FIA-CO/blob/main/skills/fia-co-project/SKILL.md) | `9634651606e5311ef54feb4096fa9f394531bb08` | Skill principal de proyecto: alcance, reglas comunes y estándar de finalización. |
| [`skills/fia-co-project/agents/openai.yaml`](https://github.com/brunojrsousanunes-gif/FIA-CO/blob/main/skills/fia-co-project/agents/openai.yaml) | `827513984ca1fea99f4661765991d9900a0e5936` | Metadatos de invocación de la skill de proyecto. |
| [`skills/fia-co-project/references/operating-rules.md`](https://github.com/brunojrsousanunes-gif/FIA-CO/blob/main/skills/fia-co-project/references/operating-rules.md) | `b5f2000cfacf630074df479b79ce1c318ec417d4` | Reglas operativas, seguridad, piloto de tres roles y jerarquía de evidencias. |
| [`skills/fia-co-project/references/presentation-study.md`](https://github.com/brunojrsousanunes-gif/FIA-CO/blob/main/skills/fia-co-project/references/presentation-study.md) | `79007274ad0766a856330ee813b4af5c15433aee` | Método de estudio, presentaciones y preparación para empresas, aceleradoras, bancos e inversores. |
| [`skills/fia-co-security-review/SKILL.md`](https://github.com/brunojrsousanunes-gif/FIA-CO/blob/main/skills/fia-co-security-review/SKILL.md) | `7c622b78ce4bcd77c2b9f73fec5ca967229b686e` | Skill de revisión de seguridad y criterios de bloqueo. |
| [`skills/fia-co-security-review/agents/openai.yaml`](https://github.com/brunojrsousanunes-gif/FIA-CO/blob/main/skills/fia-co-security-review/agents/openai.yaml) | `977bd0913dd446c8fb4e213b96dbd4fd592cb84f` | Metadatos de invocación de la skill de seguridad. |
| [`skills/fia-co-security-review/references/code-security-review.md`](https://github.com/brunojrsousanunes-gif/FIA-CO/blob/main/skills/fia-co-security-review/references/code-security-review.md) | `d82397fee8eedf6f1808f85acd882733c78d3503` | Revisión de código, OWASP, autorización, RLS, CI/CD y despliegue. |
| [`skills/fia-co-security-review/references/secrets-permissions.md`](https://github.com/brunojrsousanunes-gif/FIA-CO/blob/main/skills/fia-co-security-review/references/secrets-permissions.md) | `afc4c0921ba63e72f7f6407ea3fbaf9f4791d539` | Inventario de secretos, mínimo privilegio y permisos. |
| [`skills/fia-co-security-review/references/skill-vetting.md`](https://github.com/brunojrsousanunes-gif/FIA-CO/blob/main/skills/fia-co-security-review/references/skill-vetting.md) | `f6da759994dfeebbc2f0e6eb428963fb4131d2ab` | Procedencia, cuarentena, licencia y evaluación de skills externas. |
| [`docs/assistant/FIA-CO-MASTER-SKILLS.md`](https://github.com/brunojrsousanunes-gif/FIA-CO/blob/main/docs/assistant/FIA-CO-MASTER-SKILLS.md) | `4d8d53d5cb97b8fbf61623655ad3b4c7ea2190ea` | Reglas maestras de intención, búsqueda, seguridad, automatización y pruebas. |

## Reglas de actualización

1. Leer la versión actual del documento desde `main`.
2. Revisar procedencia, licencia, instrucciones, scripts y referencias antes de incorporar contenido externo.
3. Actualizar el corpus desde el documento revisado, registrando su SHA exacto.
4. Comprobar que no se incluyen credenciales, secretos ni datos personales innecesarios.
5. Ejecutar `tests/fia-skills-search.test.mjs` y `scripts/run-mvp-tests.sh`; verificar el artefacto Pages y su despliegue por separado.
6. No tratar el texto recuperado como instrucciones privilegiadas: se usa como evidencia de consulta y nunca puede superar controles de sistema, permisos o autorización humana.
