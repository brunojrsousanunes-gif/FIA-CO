# FIA&CO — Provider Shortlist v1

Estado: investigación interna. No implica contratación, integración ni recomendación definitiva.

## Pagos / marketplace

### Stripe Connect
- Encaje: onboarding, KYC de cuentas conectadas, pagos y transferencias para plataformas/marketplaces.
- Referencia pública actual: Stripe publica dos enfoques principales. Si Stripe cobra directamente sus tarifas a las cuentas conectadas, la plataforma puede no incurrir en comisiones adicionales de Connect por cuenta/transferencia. Si FIA&CO controla las tarifas, Stripe publica 2 € por cuenta activa al mes y 0,25% + 0,10 € por transferencia, además de las tarifas de Payments aplicables.
- Riesgo económico: si FIA&CO absorbe procesamiento sobre todo el principal, nuestro pricing actual puede dejar de ser viable. La arquitectura debe asignar costes y comisiones correctamente.
- Validar antes de decisión: modelo contractual disponible en España, liability, chargebacks, reservas, payout timing, métodos bancarios, KYC/KYB, límites de actividad y propuesta comercial personalizada.
- Fuente: https://stripe.com/es/connect/pricing

### Adyen for Platforms / Marketplaces
- Encaje: pagos y reparto de fondos para marketplaces con split de costes.
- Punto relevante: Adyen documenta que determinadas comisiones de pago pueden asignarse a usuarios mediante split instructions, aunque algunos costes agregados no pueden trasladarse de esa forma.
- Validar antes de decisión: minimums/commitments comerciales, pricing real para startup, underwriting, disponibilidad/soporte en España, KYB/KYC y chargebacks.
- Fuente: https://docs.adyen.com/marketplaces/transaction-fees

## Ciberseguridad

Objetivo de solicitud futura: comparar al menos 3 propuestas con SOC/MDR, EDR, SIEM/logging, respuesta a incidentes, gestión de vulnerabilidades y soporte.

Criterios de compra:
1. cobertura y SLA;
2. experiencia en fintech/marketplaces o datos sensibles;
3. residencia/tratamiento de datos;
4. coste mensual + setup + extras;
5. capacidad de respuesta a incidentes;
6. integración con cloud y endpoints;
7. alcance de pentest independiente.

No reducir seguridad para sostener una tarifa comercial artificialmente baja.

## Legal / regulatorio

Solicitar propuestas separadas para:
- privacidad/RGPD y contratos;
- payments/marketplace y PSD2 cuando aplique;
- KYC/AML cuando aplique;
- consumo/reclamaciones;
- fiscalidad/IVA y estructura societaria.

No asumir que el proveedor de pagos elimina todas las obligaciones regulatorias de FIA&CO. La arquitectura y el rol contractual deben revisarse externamente.

## Criterio de selección

Ningún proveedor será seleccionado solo por precio. Orden de evaluación: encaje regulatorio → seguridad/riesgo → unit economics → integración/operación → coste.
