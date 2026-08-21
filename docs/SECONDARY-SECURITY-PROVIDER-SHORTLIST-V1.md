# FIA&CO — Secondary Security Provider Shortlist V1

Estado: `EVALUATION_ONLY / DEMO_ONLY`

Objetivo: evaluar una segunda empresa de ciberseguridad solo si aporta una mejora de seguridad demostrable frente a operar únicamente con Fortinet.

## Regla principal

`NO DUPLICATION BY DEFAULT`.

La segunda capa solo se activa si supera un gate de eficacia. No se desplegarán dos soluciones equivalentes únicamente por redundancia aparente.

Debe demostrarse al menos uno de estos beneficios:
- detección adicional relevante que el proveedor principal no cubre;
- cobertura independiente de endpoint, cloud o identidad;
- reducción demostrable de puntos ciegos;
- segunda ruta de logs/evidencias útil ante fallo del proveedor principal;
- validación cruzada que reduzca falsos negativos sin aumentar de forma inaceptable los falsos positivos;
- resiliencia operativa real ante indisponibilidad o incidente del proveedor principal.

Si no existe beneficio medible, el segundo proveedor permanece `NOT_ACTIVATED`.

## Arquitectura recomendada

Fortinet se mantiene como candidato fuerte para red, SIEM/correlación, telemetría, threat intelligence y futura orquestación.

El segundo proveedor, si se utiliza, debe complementar y no duplicar innecesariamente.

Arquitectura objetivo:

`FIA&CO Event Normalizer -> Evidence Store neutral -> Fortinet`

Y solo si supera el gate:

`FIA&CO Event Normalizer -> Evidence Store neutral -> Fortinet + security-secondary`

## Gate de eficacia antes de coexistencia

Estado inicial: `SECONDARY_VENDOR_DISABLED`.

Para pasar a evaluación técnica controlada deben cumplirse:
1. caso de uso concreto definido;
2. brecha de cobertura identificada;
3. PoC o sandbox disponible;
4. compatibilidad técnica documentada;
5. plan de rollback;
6. medición antes/después;
7. aprobación del Founder.

Para activar coexistencia deben medirse:
- detecciones únicas útiles;
- falsos positivos adicionales;
- falsos negativos conocidos;
- latencia de detección;
- consumo de CPU/memoria si hay agentes;
- impacto en red;
- coste operativo y de licencias;
- carga humana de triage;
- tiempo de respuesta;
- disponibilidad de exportación de evidencias.

Resultado permitido:
- `EFFECTIVE_COMPLEMENT` -> puede continuar el proceso de aprobación;
- `REDUNDANT` -> no activar;
- `NEGATIVE_INTERFERENCE` -> no activar;
- `INSUFFICIENT_EVIDENCE` -> mantener desactivado.

## Precaución sobre endpoints

Por defecto no se instalarán dos motores EDR/preventivos activos con capacidades solapadas en todos los endpoints.

Solo se permitirá coexistencia si:
- ambos fabricantes documentan compatibilidad o la PoC la demuestra;
- no hay degradación significativa;
- no se crean carreras de cuarentena/remediación;
- existe una política clara de autoridad de respuesta.

Preferencia: separar capas en lugar de duplicarlas.

Ejemplo:
- Fortinet: red + SIEM + telemetría;
- proveedor secundario: endpoint/XDR o cloud/identity;
- FIA&CO: correlación y evidencia neutral.

## Shortlist técnica

### SentinelOne
Rol potencial: `SECONDARY_ENDPOINT_XDR`.

Puntos a evaluar:
- independencia de detección frente a Fortinet;
- endpoint/XDR;
- cloud/identity si aplica;
- APIs y exportación;
- convivencia real con la arquitectura FIA&CO;
- coste y PoC.

Estado: `EVIDENCE_PENDING`.

### CrowdStrike
Rol potencial: `SECONDARY_ENDPOINT_XDR_PREMIUM`.

Puntos a evaluar:
- EDR/XDR;
- threat intelligence;
- ingestión/exportación;
- detección independiente;
- coste total y posible solapamiento.

Estado: `EVIDENCE_PENDING`.

### Microsoft Defender XDR + Sentinel
Rol potencial: `SECONDARY_IDENTITY_CLOUD_SECURITY` si FIA&CO adopta Microsoft 365/Azure/Entra de forma relevante.

Puntos a evaluar:
- ventaja económica por licencias existentes;
- endpoint/identity/email/cloud;
- conectores multivendor;
- riesgo de concentración excesiva en Microsoft.

Estado: `CONDITIONAL_CANDIDATE`.

### Palo Alto Cortex XDR
Rol potencial: `SECONDARY_CLOUD_XDR`.

Puntos a evaluar:
- cloud/API/XDR;
- integración con fuentes externas;
- posible solapamiento con Fortinet;
- coste y complejidad.

Estado: `ALTERNATE_CANDIDATE`.

## Decisión de arquitectura

La seguridad se diseña por cobertura, no por número de proveedores.

Puede ser más seguro:
- un Fortinet bien configurado + Evidence Store neutral + buenas prácticas,
que
- dos suites completas mal integradas.

La segunda empresa solo entra cuando mejora métricas de seguridad o resiliencia de manera verificable.

## Respuesta y automatización

Mientras el proyecto permanezca en V1:
- correlación secundaria: `SHADOW_ONLY`;
- respuesta sensible: `HUMAN_APPROVAL_REQUIRED`;
- bloqueo financiero automático: prohibido;
- decisiones de cliente/operación por proveedor externo: prohibidas.

## FOUNDER_ACTION_REQUIRED

Cuando llegue el momento, el Founder deberá:
- aprobar el caso de uso de la segunda capa;
- autorizar una PoC;
- aprobar presupuesto;
- revisar impacto operativo;
- aceptar o rechazar la coexistencia en función de evidencia real.

No se contratará una segunda empresa solo para poder afirmar que existe “doble seguridad”.