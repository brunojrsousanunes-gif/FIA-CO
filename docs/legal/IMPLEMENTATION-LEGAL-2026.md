# FIA&CO — Arquitectura de cumplimiento 2026

Estado: **PREPRODUCTION_BLOCKED**. Esta arquitectura implementa límites técnicos verificables; no certifica cumplimiento ni sustituye la validación profesional del servicio real.

## Separación estructural

1. La web pública y la demo no reciben dinero, PII real, documentos ni evidencias.
2. La futura aplicación privada debe acceder a datos únicamente mediante una API autenticada.
3. Los datos operativos, fiscales, evidencias y eventos de auditoría deben permanecer separados.
4. Los pagos reales se ejecutan exclusivamente en un PSP legalmente habilitado.
5. La IA permanece en modo `shadow-read-only` y no crea efectos jurídicos vinculantes.
6. La biometría queda fuera del producto.

## Controles implementados

- Gate central de capacidades productivas cerrado por defecto.
- Fronteras permanentes contra custodia de fondos, biometría y decisiones jurídicas automatizadas.
- Clasificación obligatoria P2P, B2C, C2B o B2B antes de elegir contrato.
- Verificación de comerciantes y de representantes antes de contratar.
- Exclusión de DNI/NIE/NIF, IBAN, tarjetas y secretos del historial de búsqueda, analítica y contexto de IA.
- Continuidad de `legalReadyForPilot=false` hasta revisión externa y validación de jurisdicción.

## Controles pendientes de infraestructura productiva

- Ejecución real de borrado y propagación a copias de seguridad.
- Portal de derechos RGPD y registro de consentimientos.
- Almacenamiento privado de evidencias con análisis antimalware y acceso temporal.
- Integración PSP con tokenización, webhooks firmados y conciliación.
- Flujo DSA de aviso, retirada, motivación y reclamación.
- Expediente DAC7, cuando la clasificación fiscal confirme aplicabilidad.
- Contratos versionados y justificantes en soporte duradero.
- Pruebas de accesibilidad y seguridad de extremo a extremo.

## Regla de activación

Ninguna capacidad productiva se activa desde la interfaz. Requiere que el servidor valide el gate, exista evidencia verificable de cada control y se complete revisión jurídica externa del alcance concreto.
