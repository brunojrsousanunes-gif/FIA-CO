# FIA&CO — Agente de Transacción Premium

Estado: diseño de producto y arquitectura. No habilitado para operaciones con dinero real.

## Modelo comercial provisional
Hasta disponer de datos reales de costes, FIA&CO debe soportar un modelo **híbrido** sin fijar todavía importes definitivos:
- suscripción Premium para acceso continuado al agente y funciones reforzadas;
- componente por operación únicamente cuando el servicio genere costes variables o intervención adicional;
- Enterprise mediante condiciones específicas.

Este modelo es una hipótesis y no autoriza cobros. Debe validarse con unit economics, fiscalidad, PSP/proveedores y revisión jurídica.

## Escalado humano por defecto
El agente debe poder pausar y elevar una operación a revisión humana cuando ocurra cualquiera de estas condiciones:
- importe superior al umbral configurado para el mercado/caso de uso;
- identidad, documentación o evidencias incompletas/inconsistentes;
- señales de fraude, anomalía, duplicidad o comportamiento no esperado;
- disputa entre las partes;
- cambio de datos críticos después de una aceptación;
- requisito legal/regulatorio o política interna que exija revisión;
- baja confianza del sistema o imposibilidad de explicar una decisión crítica.

Los umbrales monetarios no se hardcodean: serán configuración versionada por territorio, producto y nivel de riesgo.

## Acciones permitidas
El agente puede orientar, comprobar reglas, recopilar evidencias, solicitar confirmaciones, recomendar una pausa, bloquear pasos dentro de FIA&CO conforme a políticas explícitas y elevar a una persona.

## Límites
El agente no debe:
- custodiar fondos;
- ejecutar funciones reservadas a PSP/bancos/proveedores regulados sin integración autorizada;
- sustituir asesoramiento jurídico;
- prometer ausencia de fraude o garantizar una operación;
- tomar decisiones irreversibles de alto impacto sin los controles humanos/políticas exigidos.

## Auditoría
Cada acción crítica debe generar trazabilidad suficiente: operación, regla/política aplicada, momento, resultado, actor (sistema/persona), evidencia referenciada y motivo de escalado, minimizando PII.

## Gates antes de comercialización
`PREMIUM_AGENT_READY` solo podrá activarse cuando estén validados:
1. pricing y unit economics;
2. costes variables de PSP/KYC/proveedores y soporte;
3. tratamiento fiscal/IVA;
4. responsabilidades contractuales y revisión jurídica;
5. matriz de riesgo y umbrales de escalado;
6. proceso y SLA de revisión humana;
7. auditoría, privacidad y retención de evidencias;
8. pruebas técnicas y de seguridad.

Hasta entonces: `PREMIUM_AGENT_READY=false`.