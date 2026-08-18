# FIA&CO — B2 low-risk architecture

Estado: `B2-R_IMPLEMENTED_IN_DEMO`. Autorizado únicamente en **shadow mode read-only**. No existe enforcement.

## Objetivo
Reducir el riesgo del motor de riesgo/escalado humano desacoplando por completo la evaluación del flujo operativo. La primera versión funciona en **shadow mode**: observa, evalúa y explica, pero no puede bloquear, pausar, autorizar ni alterar una operación.

## Principios de seguridad
- Solo datos sintéticos/demo en esta fase.
- Motor **read-only** respecto al estado de la operación.
- Salida limitada a recomendaciones: `OBSERVE_ONLY`, `SUGGEST_REVIEW`, `SUGGEST_BLOCK`.
- Ninguna salida cambia el workflow automáticamente.
- Toda decisión crítica sigue requiriendo acción explícita del usuario/humano.
- Umbrales y reglas viven en configuración versionada, nunca hardcodeados en UI.
- Si falta configuración, debe fallar en modo seguro sin ejecutar ninguna acción.
- Si hay error, timeout o dato incompleto, no se ejecuta ninguna acción sobre la operación.
- Sin llamadas a PSP/KYC/antifraude reales en B2-R.

## Implementación v0

`Operation snapshot -> Normalizer -> Policy evaluator (pure function) -> Explanation -> Shadow recommendation`

Archivo: `frontend/js/shadow-risk-engine.js`.

### Operation snapshot
Copia minimizada del estado demo. El evaluador clona/normaliza los datos y no recibe funciones de escritura.

### Normalizer
Convierte el snapshot a campos permitidos y descarta propiedades no utilizadas por la política.

### Policy evaluator
Función determinista. Entrada: snapshot + policy version. Salida: recomendación + motivos + policy version. No conoce APIs, DOM, pagos ni persistencia.

### Shadow recommendation
Resultados permitidos:
- `OBSERVE_ONLY`
- `SUGGEST_REVIEW`
- `SUGGEST_BLOCK`

Toda respuesta incluye `enforcement=false` y `writeCapabilities=[]`.

## Separación de permisos
El motor de evaluación no expone métodos `block`, `pause`, `authorize` o `write`. Un futuro `enforcement-adapter` será un módulo distinto, inexistente en esta fase y sujeto a autorización independiente.

## Pruebas de seguridad
`tests/shadow-risk-engine.test.js` verifica como mínimo:
- modo `SHADOW_READ_ONLY`;
- conjunto cerrado de resultados permitidos;
- ausencia de mutación del snapshot de entrada;
- ausencia de capacidades de escritura;
- ausencia de métodos de enforcement;
- escenarios de observación, sugerencia de revisión y sugerencia de bloqueo.

## Gate para pasar de shadow a enforcement
No considerar una fase de bloqueo real hasta cumplir todos estos puntos:
1. tests unitarios ampliados y casos límite;
2. dataset sintético de validación y revisión manual de falsos positivos;
3. política versionada y rollback;
4. auditoría legible y reproducible;
5. matriz de responsabilidades y revisión jurídica;
6. mecanismo de override humano;
7. feature flag de enforcement separada y apagada por defecto;
8. autorización explícita adicional.

## Resultado
B2-R queda implementado como observabilidad/recomendación sin capacidad técnica de interferir en el flujo operativo. Cualquier transición a enforcement se considera un bloque de riesgo distinto y requiere nueva autorización.