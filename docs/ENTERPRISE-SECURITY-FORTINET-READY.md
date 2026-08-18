# FIA&CO — Enterprise Security / Fortinet-ready

Estado: arquitectura futura. No implica compra, despliegue ni dependencia actual de Fortinet.

## Objetivo
Mantener FIA&CO preparado para incorporar una plataforma de seguridad empresarial (incluido Fortinet) cuando exista backend real, datos reales, backoffice privado y servicios de producción, sin acoplar el código de aplicación a un fabricante concreto.

## Principio de diseño
La aplicación debe expresar requisitos de seguridad mediante interfaces y controles neutrales al proveedor. La infraestructura podrá implementar esos controles con Fortinet u otra solución equivalente sin reescribir el dominio de FIA&CO.

## Producto futuro: Agente de Transacción Premium
La seguridad empresarial podrá formar parte de una suscripción FIA&CO Premium como soporte tecnológico del **Agente de Transacción Premium**. El cliente contrata el servicio FIA&CO; Fortinet u otros proveedores permanecen como componentes de infraestructura y no como responsables de la operación.

El agente podrá:
- acompañar la operación de principio a fin;
- comprobar hitos, reglas y evidencias;
- detectar anomalías, duplicidades y señales de riesgo;
- exigir doble confirmación en acciones sensibles;
- bloquear o pausar pasos cuando falte un requisito obligatorio;
- elevar casos a revisión humana según importe, riesgo, anomalías o documentación;
- mantener trazabilidad reforzada y un historial explicable de decisiones;
- ofrecer soporte prioritario asociado al nivel Premium.

El agente no debe custodiar fondos, sustituir al banco/PSP, realizar KYC regulado por sí mismo, emitir asesoramiento jurídico ni presentarse como garantía financiera. Cuando una función requiera un proveedor o profesional regulado, FIA&CO debe integrarlo o escalar el caso.

### Niveles previstos
- **Estándar:** flujo base, reglas, evidencias y trazabilidad ordinaria.
- **Premium:** Agente de Transacción, controles reforzados, escalado por riesgo y soporte prioritario.
- **Enterprise:** capacidades Premium más políticas corporativas, integración Zero Trust, SIEM, controles de infraestructura y requisitos organizativos específicos.

La comercialización de Premium queda sujeta a validación de pricing, responsabilidades, unit economics y marco jurídico.

## Capas previstas

### 1. Perímetro y aplicaciones web
- reverse proxy / WAF delante de servicios públicos;
- TLS y gestión de certificados;
- protección frente a abuso, bots y patrones web maliciosos;
- rate limiting y reglas específicas para endpoints críticos.

Posible implementación futura: FortiWeb y/o capacidades compatibles de FortiGate, según arquitectura definitiva.

### 2. Segmentación de red
Separar como mínimo frontend público, API/backend, servicios internos, bases de datos, backoffice/administración y observabilidad/seguridad. El tráfico entre zonas debe permitirse explícitamente bajo mínimo privilegio.

Posible implementación futura: FortiGate.

### 3. Acceso administrativo / Zero Trust
- no exponer paneles administrativos directamente a Internet cuando pueda evitarse;
- identidad fuerte y MFA;
- acceso condicionado por rol, dispositivo y contexto cuando proceda;
- VPN/ZTNA para administración y servicios privados.

Posible implementación futura: FortiClient, FortiSASE y/o ZTNA integrado con FortiGate, según necesidades.

### 4. Logs, SIEM y respuesta
La aplicación debe emitir eventos estructurados y exportables sin depender de un formato propietario. Incluir eventos de autenticación, autorización, acciones críticas, cambios administrativos, bloqueos, anomalías y errores de seguridad, evitando secretos y PII innecesaria.

Posible destino futuro: FortiAnalyzer/FortiSIEM o plataforma equivalente.

### 5. Secretos y certificados
- secretos fuera del repositorio;
- rotación y revocación;
- separación por entorno;
- identidades de servicio de mínimo privilegio;
- automatización de certificados cuando sea viable.

### 6. Alta disponibilidad y continuidad
En producción real definir redundancia de componentes críticos, backups y restauración probada, recuperación ante desastre, monitorización y alertas, y objetivos RTO/RPO según criticidad.

## Contratos técnicos que FIA&CO debe conservar
- cabeceras y origen del cliente tratados de forma segura detrás de proxies confiables;
- configuración externa de endpoints y políticas, no hardcodeada;
- autenticación/autorización independiente del firewall;
- logs estructurados exportables;
- health checks para servicios;
- separación clara de entornos demo/staging/producción;
- infraestructura como código cuando se cree la plataforma de producción;
- ninguna lógica de negocio dependiente de APIs propietarias de Fortinet salvo adaptadores aislados y justificados.

## Fases
### Ahora — demo / GitHub Pages
No desplegar Fortinet solo para la demo estática. Mantener estos requisitos documentados y evitar decisiones que impidan una futura capa perimetral.

### Backend inicial
Introducir red privada, gestión de secretos, autenticación robusta, logs centralizados y separación de servicios. Diseñar puntos de inserción para WAF/firewall y acceso administrativo seguro.

### Producción con datos reales
Antes del GO, realizar threat modeling, revisión de arquitectura, hardening, WAF, segmentación, controles administrativos, monitorización, backups, respuesta a incidentes y pruebas de seguridad.

### Escala / Premium / Enterprise
Implementar el Agente de Transacción mediante servicios desacoplados y políticas configurables. Evaluar Fortinet frente a requisitos reales de volumen, disponibilidad, territorios, cumplimiento, coste y operación. Seleccionar componentes solo donde aporten una función verificable.

## Gates
`FORTINET_READY` significa que FIA&CO puede desplegarse detrás de controles Fortinet sin reescribir la aplicación. No significa que Fortinet esté instalado ni que por sí solo garantice seguridad o cumplimiento.

`PREMIUM_AGENT_READY` requiere, antes de activación comercial, pricing validado, responsabilidades delimitadas, escalado humano definido, proveedores regulados identificados cuando proceda, auditoría de decisiones y revisión jurídica/técnica.

La selección y configuración final debe realizarse sobre la infraestructura real y tras revisión técnica de seguridad.