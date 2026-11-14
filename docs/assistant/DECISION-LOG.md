# FIA&CO — notas técnicas de continuidad para la IA

Este archivo **no es un registro para el propietario ni un acta de reuniones**. Es una ayuda interna y mínima para que una IA que retome el repositorio no repita errores ni contradiga límites ya establecidos.

Solo conservar aquí reglas duraderas que afecten a seguridad, integridad de datos, arquitectura o continuidad. No registrar conversaciones, preferencias pasajeras ni decisiones rutinarias. Si una regla ya está clara en la Skill principal, enlazarla y evitar duplicarla.

## Límites que no se deben perder

1. **Producción y datos remotos:** no fusionar a `main`, desplegar, aplicar migraciones a Supabase remoto ni modificar datos productivos sin autorización específica.
2. **Conservación de activos:** no eliminar contratos de compraventa, documentos legales, modelos comerciales, estrategias ni funciones con posible valor futuro por no estar en el MVP. Aplazar no significa borrar.
3. **Demos frente a producto real:** una demo, simulación, configuración o prueba local no demuestra que exista una capacidad productiva ni que esté desplegada.
4. **Alcance financiero:** FIA&CO coordina operaciones; no presentarla como prestamista, custodio o garante. El diseño financiero actual de #185 se basa en la organización titular de la operación; no afirmar que hay tres contabilidades independientes.
5. **Ramas y PR:** #185 es una línea de integración, no producción. Verificar siempre rama, SHA, PR y CI actuales antes de continuar; los SHA de este archivo no sustituyen la comprobación viva.
6. **Evidencia:** no declarar completado un trabajo por crear archivos o commits. Comprobar pruebas, resultado y alcance real.

## Referencias fuente

- Reglas generales: `skills/fia-co-project/SKILL.md`.
- Reglas operativas: `skills/fia-co-project/references/operating-rules.md`.
- Seguridad: `skills/fia-co-security-review/SKILL.md`.
- Estado y siguiente trabajo: `PROJECT-HANDOFF.md` y `WORK-REGISTER.md`.

## Mantenimiento

Actualizar este archivo únicamente si aparece una regla duradera nueva o cambia una de las anteriores. No añadir entradas por cada tarea. Si una regla deja de aplicar, corregirla con evidencia y fecha; no acumular versiones contradictorias.

**Última revisión:** 2026-11-14.
