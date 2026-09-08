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
- Contratos versionados: resumen de términos, hash coincidente, aceptación bilateral y copia duradera.
- Registro de solicitudes de derechos RGPD con verificación no biométrica, revisión humana y bloqueo ante conservación legítima.
- Aviso y acción DSA con localización, motivación, decisión humana y vía de reclamación.
- Trazabilidad de comerciantes sin guardar el documento fuente en el frontend.
- Manifiesto de evidencias privadas con lista de formatos, límite, hash, antimalware, metadatos y retención.
- Gate DAC7 que impide declarar hasta validar alcance y completar diligencia del vendedor.
- Gate de accesibilidad con evidencias obligatorias y sin fingir una certificación.
- Exclusión de DNI/NIE/NIF, IBAN, tarjetas y secretos del historial de búsqueda, analítica y contexto de IA.
- Continuidad de `legalReadyForPilot=false` hasta revisión externa y validación de jurisdicción.

## Pendiente de infraestructura productiva

- API autenticada, base de datos cifrada, gestión de claves y separación por organización.
- Ejecución real y auditable de borrado, incluida la política sobre copias de seguridad.
- Portal de ejercicio de derechos y canal operativo de reclamaciones.
- Almacenamiento privado real con enlaces temporales y análisis antimalware.
- PSP elegido: tokenización, webhooks firmados, conciliación y gestión de reembolsos.
- Generación y entrega real de contratos en soporte duradero.
- Presentación DAC7, únicamente si la clasificación fiscal confirma aplicabilidad.
- Pruebas de accesibilidad y seguridad de extremo a extremo.
- Textos finales con la identidad legal, domicilio y contacto del prestador.

## Regla de activación

Ninguna capacidad productiva se activa desde la interfaz. El servidor deberá validar el gate, existir evidencia verificable de cada control y completarse la revisión jurídica externa del alcance concreto.
