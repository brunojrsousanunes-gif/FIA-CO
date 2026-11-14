# FIA&CO — registro de decisiones

Registro de decisiones duraderas. No es un diario de conversación ni sustituye los contratos. Cada entrada distingue decisión confirmada, propuesta y cuestión pendiente.

## D-001 — Proteger producción y datos remotos

- **Estado:** CONFIRMADA.
- **Fecha de referencia:** 2026-11-14.
- **Decisión:** no fusionar a `main`, desplegar a producción, aplicar migraciones a Supabase remoto, borrar ramas o modificar datos productivos sin autorización expresa y específica.
- **Motivo:** minimizar riesgo, preservar estabilidad y mantener control del propietario.
- **Evidencia:** reglas de operación del proyecto y estado de la PR #185.
- **Revisión:** cada vez que cambie el alcance de una autorización.

## D-002 — FIA&CO coordina operaciones; no se presenta como entidad financiera

- **Estado:** CONFIRMADA como límite de producto y comunicación.
- **Fecha de referencia:** 2026-11-14.
- **Decisión:** no afirmar que FIA&CO presta, custodia, mueve o garantiza dinero. Los pagos reales requieren proveedor adecuado, integración y revisión legal verificables.
- **Motivo:** evitar confusión regulatoria y comercial.
- **Evidencia:** `skills/fia-co-project/SKILL.md` y reglas operativas.
- **Revisión:** antes de integrar pagos o cambiar el modelo de negocio.

## D-003 — El expediente conecta tres empresas con permisos diferenciados

- **Estado:** CONFIRMADA como modelo funcional objetivo.
- **Fecha de referencia:** 2026-11-14.
- **Decisión:** conservar el modelo vendedor, transportista y comprador; el flujo de operación incluye acuerdo, seguimiento, entrega, incidencias y cierre, sujeto a confirmaciones y permisos.
- **Motivo:** trazabilidad y coordinación entre partes.
- **Evidencia:** documentación de arquitectura, modelo operativo y pruebas de integración.
- **Límite:** el objetivo de producto no significa que el piloto real esté validado.

## D-004 — La titularidad financiera actual es por organización titular de la operación

- **Estado:** CONFIRMADA como descripción del diseño integrado en #185; alcance limitado.
- **Fecha de referencia:** 2026-11-14.
- **Decisión:** no describirlo como tres contabilidades independientes. La protección actual se basa en la organización titular de la operación.
- **Motivo:** evitar prometer una separación financiera que todavía no existe.
- **Evidencia:** cambios y pruebas de la rama de integración #185.
- **Pendiente:** definir si vendedor, transportista y comprador necesitan libros separados, quién registra cada coste y cómo se concilian.
- **Revisión:** al diseñar la siguiente fase financiera.

## D-005 — Conservar contratos, documentación jurídica y valor comercial futuro

- **Estado:** CONFIRMADA.
- **Fecha de referencia:** 2026-11-14.
- **Decisión:** no borrar contratos de compraventa, plantillas, documentación legal, modelos comerciales, estrategias ni funciones beneficiosas por no estar implementadas en el MVP.
- **Motivo:** conservar valor jurídico, comercial y estratégico.
- **Evidencia:** instrucción expresa del propietario.
- **Regla:** aplazar, clasificar o marcar como futuro no equivale a eliminar.

## D-006 — La integración #185 es una rama de trabajo, no producción

- **Estado:** CONFIRMADA en el corte indicado; verificar antes de cada continuación.
- **Fecha de referencia:** 2026-11-14.
- **Decisión:** continuar la consolidación en `integration/fia-co-verified-snapshot-2026-11-14`, PR #185 en borrador, sin fusionarla automáticamente.
- **Evidencia:** HEAD `cbe7a174360e72608286dab0ebaac849af67369b` antes de añadir los ficheros de organización; #185 abierta, draft; `main` en `63ec6df05fb5a24fa12a83de5989b617bae3a22d`.
- **Actualización:** los ficheros de organización han generado nuevos commits en la misma rama. Consultar `PROJECT-HANDOFF.md` y GitHub para el HEAD actual.
- **Revisión:** antes de cualquier merge, despliegue o cambio de rama.

## D-007 — Demos y módulos heredados no son el sistema de registro productivo

- **Estado:** CONFIRMADA.
- **Fecha de referencia:** 2026-11-14.
- **Decisión:** las demos sintéticas deben estar identificadas; almacenamiento de navegador no es autorización ni registro oficial; logs en memoria no son auditoría persistente.
- **Motivo:** evitar confundir prototipos con capacidades productivas.
- **Evidencia:** `skills/fia-co-project/references/operating-rules.md`, pruebas y revisión de seguridad #185.

## Plantilla para nuevas decisiones

```markdown
## D-XXX — Título breve

- Estado: PROPUESTA | CONFIRMADA | RECHAZADA | SUSTITUIDA
- Fecha:
- Decisión:
- Motivo:
- Evidencia (rutas, commit, prueba o documento):
- Impacto / riesgos:
- Dependencias:
- Pendiente de:
- Sustituye a / sustituida por:
- Fecha de revisión:
```

**Regla:** una IA no puede convertir una sugerencia propia en decisión confirmada. Las decisiones que impliquen coste, producción, privacidad, eliminación o compromisos externos necesitan autorización expresa.
