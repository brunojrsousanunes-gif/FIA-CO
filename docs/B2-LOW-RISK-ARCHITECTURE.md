# FIA&CO — B2 low-risk architecture

Estado: diseño previo. B2 no está autorizado para ejecución todavía.

## Objetivo
Reducir el riesgo del futuro motor de riesgo/escalado humano desacoplando por completo la evaluación del flujo operativo. La primera versión debe funcionar en **shadow mode**: observa, evalúa y explica, pero no puede bloquear, pausar, autorizar ni alterar una operación.

## Principios de seguridad
- Solo datos sintéticos/demo en esta fase.
- Motor **read-only** respecto al estado de la operación.
- Salida limitada a recomendaciones: `OBSERVE_ONLY`, `SUGGEST_REVIEW`, `SUGGEST_BLOCK`.
- Ninguna salida cambia el workflow automáticamente.
- Toda decisión crítica sigue requiriendo acción explícita del usuario/humano.
- Umbrales y reglas viven en configuración versionada, nunca hardcodeados en UI.
- Si falta configuración, falla en modo seguro: `OBSERVE_ONLY`.
- Si hay error, timeout o dato incompleto, no se ejecuta ninguna acción sobre la operación.
- Sin llamadas a PSP/KYC/antifraude reales en B2 v0.

## Arquitectura propuesta

`Operation snapshot -> Normalizer -> Policy evaluator (pure function) -> Explanation -> Shadow recommendation -> Audit event`

### Operation snapshot
Copia inmutable y minimizada del estado demo. No entrega al evaluador objetos mutables ni funciones de escritura.

### Normalizer
Convierte el snapshot a campos permitidos y elimina datos no necesarios.

### Policy evaluator
Función pura y determinista. Entrada: snapshot + policy version. Salida: recomendación + motivos + policy version. No conoce APIs, DOM, pagos ni persistencia.

### Explanation
Transforma códigos de regla a mensajes comprensibles. Nunca ejecuta acciones.

### Shadow recommendation
Solo se muestra en un panel de diagnóstico/demo. Estados iniciales:
- `OBSERVE_ONLY`
- `SUGGEST_REVIEW`
- `SUGGEST_BLOCK`

### Audit event
Registra qué política se evaluó, qué recomendó y por qué, sin modificar el expediente.

## Separación de permisos
El motor de evaluación no recibe ninguna capacidad de escritura. Un futuro `enforcement-adapter` sería un módulo distinto, deshabilitado por defecto y sujeto a una autorización independiente.

## Gate para pasar de shadow a enforcement
No considerar una fase de bloqueo real hasta cumplir todos estos puntos:
1. tests unitarios de reglas y casos límite;
2. dataset sintético de validación y revisión manual de falsos positivos;
3. política versionada y rollback;
4. auditoría legible y reproducible;
5. matriz de responsabilidades y revisión jurídica;
6. mecanismo de override humano;
7. feature flag de enforcement separada y apagada por defecto;
8. autorización explícita adicional.

## Resultado
Con esta separación, B2 v0 puede implementarse como observabilidad/recomendación sin poder interferir en el flujo. El riesgo operativo baja porque no existe ruta técnica desde el evaluador a una acción irreversible.