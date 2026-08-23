# FIA&CO — External Outreach Ready v1

Estado: listo para iniciar contacto externo cuando se autorice expresamente el envío en nombre de FIA&CO.

## 1. PSP / marketplace shortlist

### Stripe Connect — prioridad A
Encaje: marketplace/plataforma, onboarding y KYC integrados, split/transferencias, conciliación y posibilidad de monetizar pagos. Pricing público consultado en agosto de 2026: si Stripe gestiona las tarifas de las cuentas conectadas, la plataforma puede evitar cargos adicionales por cuenta/transferencia; si FIA&CO controla las tarifas, Stripe publica 2 EUR por cuenta activa/mes y 0,25% + 0,10 EUR por transferencia, además de Payments. Tarjeta estándar europea publicada: 1,5% + 0,25 EUR.

Fuente oficial: https://stripe.com/es/connect/pricing

Decisión: solicitar propuesta comercial para modelo donde el principal no erosione el margen FIA&CO y estudiar cargos directos/cuentas conectadas antes que asumir processing completo.

### Adyen for Platforms — prioridad B
Encaje: onboarding/verificación, split payments, comisión de marketplace, payouts y conciliación. La documentación oficial permite separar venta, comisión y fees entre balance accounts. Requiere integración, credenciales y webhooks; debe revisarse responsabilidad sobre liable balance account.

Fuentes oficiales:
- https://docs.adyen.com/marketplaces/
- https://docs.adyen.com/marketplaces/split-transactions/

Decisión: solicitar pricing/volumen mínimo y condiciones de entrada; no implementar producción hasta comparar economics contra Stripe.

## 2. Financiación shortlist

### ENISA — prioridad A no dilutiva
Préstamo participativo actualmente publicado entre 25.000 y 1.500.000 EUR, sin garantías reales/personales, plazo general hasta 7 años y carencia de principal hasta 2 años. Requisito crítico: fondos propios al menos iguales al préstamo solicitado, sociedad legalmente constituida en España y plan de negocio sólido. Sector financiero está excluido, por lo que debe validarse que FIA&CO se presente y opere como plataforma tecnológica/operativa y que su actividad concreta sea elegible antes de solicitar.

Fuente oficial: https://www.enisa.es/servicios/financiacion/startups-y-pymes/

### Capital riesgo / angels — prioridad posterior a evidencia B2B
Objetivo: fondos early-stage con tesis en plataformas, B2B SaaS, marketplaces, fintech-enabling o vertical software. No iniciar ronda formal hasta disponer de 5–10 conversaciones B2B y 2+ señales de interés en piloto.

Samaipata es un ejemplo de fondo cuya tesis pública incluye plataformas digitales, network effects y modelos B2B SaaS/plataforma.
Fuente: https://www.samaipata.vc/post/cheat-sheet-3-key-metrics-to-track-for-b2b-saas-platforms

## 3. Mensaje para PSP

Asunto: FIA&CO — evaluación de infraestructura para marketplace B2B

Hola,

estamos evaluando infraestructura de pagos para FIA&CO, una plataforma tecnológica que coordina compraventas B2B con trazabilidad, controles operativos y un modelo de comisión por operación. En esta fase no custodiamos fondos directamente.

Buscamos entender el encaje de vuestra solución para onboarding/KYC de cuentas conectadas, split de fondos/comisión de plataforma, conciliación, reembolsos/disputas y costes para operaciones desde importes bajos hasta operaciones de mayor valor.

Nos interesa especialmente evitar que la plataforma tenga que absorber un coste porcentual sobre todo el principal cuando su ingreso es una comisión acotada. Agradeceríamos orientación sobre arquitectura recomendada, pricing, mínimos de volumen y requisitos de onboarding para una empresa española en fase precomercial/piloto.

Gracias.

## 4. Mensaje para ciberseguridad

Asunto: FIA&CO — solicitud de alcance orientativo SOC/MDR + pentest

Hola,

FIA&CO está preparando una plataforma transaccional B2B en fase precomercial. Buscamos una estimación orientativa para un paquete inicial que incluya monitorización/SOC-MDR, EDR o equivalente, gestión de vulnerabilidades, respuesta a incidentes y pentest previo a producción.

El objetivo es dimensionar presupuesto y controles antes de procesar datos o transacciones reales. Agradeceríamos rangos de precio, alcance, tiempos y requisitos previos, sin compromiso de contratación en esta fase.

Gracias.

## 5. Mensaje discovery B2B

Asunto: consulta breve sobre compraventas de activos profesionales

Hola,

estamos validando FIA&CO, una herramienta para ordenar compraventas de activos profesionales mediante requisitos, evidencias, incidencias y próximos pasos trazables. Estamos entrevistando empresas de transporte, maquinaria y construcción para entender cómo gestionan hoy estas operaciones.

No es una llamada comercial de venta inmediata. Nos ayudaría una conversación breve sobre frecuencia de operaciones, documentación, puntos de bloqueo, confianza entre partes y qué tendría que aportar una solución para que mereciera un piloto.

## 6. Cuello de botella actual

La preparación interna está completada hasta el punto de outreach. Para avanzar a evidencia real se necesita una autorización explícita adicional para ENVIAR comunicaciones externas en nombre de FIA&CO y definir la identidad de salida (nombre/rol y cuenta de correo). La autorización de investigación/preparación no implica aceptar contratos, tarifas, deuda, inversión ni compromisos.
