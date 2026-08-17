# FIA&CO — Commercial Readiness v1

Estado: precomercialización. Este documento convierte la preparación comercial en un sistema operativo verificable antes de promoción abierta.

## 1. Propuesta comercial

### Cliente inicial
Particulares y, en una fase posterior, profesionales que necesitan coordinar una compraventa de un activo con evidencias, hitos, incidencias y trazabilidad entre las partes.

### Promesa
FIA&CO organiza el proceso de una operación entre partes para que cada paso, evidencia, bloqueo y autorización quede visible y trazable.

### Qué hace
- estructura la operación y sus estados;
- recoge evidencias y requisitos mínimos;
- detecta incidencias que impiden avanzar;
- evita instrucciones duplicadas en el motor demo;
- ofrece una experiencia compartida para las partes.

### Qué no debe prometer todavía
- custodia de dinero;
- ejecución o intermediación regulada de pagos;
- garantías financieras;
- verificación legal definitiva de identidad, titularidad o documentación;
- operación con datos reales hasta completar los controles de producción.

## 2. Pricing y unit economics

### Tarifa de introducción
Hipótesis comercial para pilotos y lanzamiento, sujeta a validación jurídica, fiscal y de unit economics:

- hasta 2.999 €: 2,9% del valor, mínimo 0,99 € y máximo 19,90 €;
- desde 3.000 €: la operación pasa a modalidad **FIA&CO Plus / Alto Valor**, con controles adicionales y tarifa específica.

### FIA&CO Plus / Alto Valor
Objetivo: monetizar el trabajo y riesgo operativo adicional sin perder el posicionamiento de precio bajo.

Hipótesis inicial:

- 3.000–4.999 €: 0,95%, mínimo 24,90 €, máximo 39,90 €;
- 5.000–9.999 €: 0,75%, mínimo 39,90 €, máximo 59,90 €;
- 10.000–24.999 €: 0,55%, mínimo 59,90 €, máximo 99,90 €;
- 25.000 € o más: 0,35%, mínimo 99,90 €, con tope promocional inicial de 199,90 €.

Los porcentajes decrecen con el valor para evitar que la comisión crezca desproporcionadamente. Estos precios son hipótesis de penetración, no tarifas definitivas.

### Controles adicionales para Alto Valor
La modalidad Plus debe exigir, cuando sea legal y técnicamente aplicable:

- verificación reforzada de identidad de las partes mediante proveedor adecuado;
- comprobación reforzada de evidencias/documentación del expediente;
- revisión de coherencia entre titularidad declarada, activo y contraparte cuando proceda;
- doble confirmación en hitos críticos;
- revisión humana antes de liberar cualquier instrucción crítica;
- registro de auditoría reforzado;
- detección y bloqueo de duplicidades/anomalías;
- canal de soporte prioritario durante la operación;
- checklist específico según categoría del activo;
- escalado obligatorio de incidencias de identidad, titularidad, fraude o documentación.

“Garantía adicional” significa controles y asistencia adicionales; no debe comercializarse como garantía financiera, seguro, custodia o garantía de buen fin salvo que exista cobertura contractual/regulatoria específica.

### Benchmark y regla competitiva
La tarifa no debe publicitarse genéricamente como “más barata que todo el mercado”. Como referencias públicas actuales, Vinted indica una tasa de protección que suele ser 5% + 0,70 €, mientras Milanuncios Express publica 7% + 0,10 €, mínimo 1,70 € y máximo 30 €, pero sus servicios, límites y categorías no son equivalentes a FIA&CO. Por ello, toda comparación comercial deberá hacerse sobre servicios comparables y actualizarse antes de campaña.

Milanuncios Express publica actualmente un máximo de valor de artículo de 2.400 €, por lo que el tramo FIA&CO desde 3.000 € debe tratarse como una propuesta de alto valor distinta y no como comparación directa.

### Unit economics
Antes de activar precios reales registrar por operación: ingreso, minutos de soporte, coste de PSP/proveedores, KYC/verificación, revisión humana, incidencias, fraude/reembolsos y margen bruto. No escalar adquisición pagada hasta demostrar margen de contribución positivo.

## 3. Funnel

`LEAD -> QUALIFIED -> OPPORTUNITY -> PROPOSAL -> ONBOARDING -> ACTIVE_OPERATION -> CLOSED -> REPEAT/REFERRAL`

Criterios mínimos:

- LEAD: contacto y consentimiento de seguimiento.
- QUALIFIED: caso de uso, partes, activo y necesidad compatibles.
- OPPORTUNITY: intención y horizonte temporal identificados.
- PROPOSAL: alcance, precio y exclusiones comunicados.
- ONBOARDING: datos/documentos mínimos solicitados y términos aceptados cuando proceda.
- ACTIVE_OPERATION: expediente creado y responsable asignado.
- CLOSED: operación cerrada/cancelada con motivo registrado.

Todo lead debe tener estado, responsable, fecha de última acción y siguiente acción.

## 4. Onboarding

Checklist mínima antes de una operación real:

- identificar a las partes y su rol;
- registrar medio de contacto y consentimiento aplicable;
- describir activo/operación y valor orientativo;
- recopilar solo documentación necesaria;
- informar finalidad, conservación y tratamiento de datos;
- aceptar términos vigentes;
- registrar incidencias/conflictos;
- crear expediente con identificador no sensible;
- impedir avance si falta un requisito obligatorio;
- activar automáticamente el checklist Plus si el valor es >= 3.000 €.

No usar documentación real en la demo pública.

## 5. Legal y compliance — gate obligatorio

Los materiales de este repositorio son especificaciones de producto, no asesoramiento jurídico. Antes de cobrar o procesar operaciones reales, asesoría jurídica competente debe validar como mínimo:

- modelo contractual y responsabilidades;
- Términos y Condiciones;
- Política de Privacidad, RGPD y base jurídica;
- conservación, acceso, rectificación y eliminación de datos;
- cookies/analítica cuando proceda;
- facturación e impuestos;
- KYC/AML cuando sea aplicable;
- encaje regulatorio de cualquier flujo de pago, custodia, escrow, wallet o intermediación;
- proveedores y contratos de encargado del tratamiento;
- procedimiento de reclamaciones y consumidores.

**Regla de lanzamiento:** ninguna funcionalidad debe mover/custodiar fondos o presentarse como servicio financiero regulado hasta validación jurídica y técnica específica.

## 6. Producción y seguridad

Gate técnico para datos/usuarios reales:

- separación demo/staging/producción;
- autenticación robusta y autorización por rol/operación;
- secretos fuera del repositorio y rotación;
- cifrado en tránsito y almacenamiento cuando aplique;
- mínimo privilegio;
- logs de auditoría sin secretos ni datos innecesarios;
- idempotencia en acciones críticas;
- backups y restauración probada;
- monitorización y alertas;
- gestión de vulnerabilidades/dependencias;
- rate limiting y protección antiabuso;
- política de retención/borrado;
- plan de respuesta a incidentes;
- revisión de seguridad previa al lanzamiento.

## 7. Backoffice operativo

Vista mínima por expediente:

- ID de operación;
- estado;
- valor y nivel Base/Plus;
- partes/roles (sin exponer más datos de los necesarios);
- responsable interno;
- evidencias requeridas/recibidas;
- incidencias abiertas;
- bloqueos;
- última actividad;
- siguiente acción y fecha objetivo;
- resultado de cierre.

Colas recomendadas: Nuevas, Esperando cliente, Revisión, Alto Valor/Plus, Bloqueadas, Listas para avanzar, Cerradas.

## 8. Métricas

Instrumentar desde el piloto:

- leads por fuente;
- % lead -> qualified;
- % qualified -> proposal;
- % proposal -> onboarding;
- % onboarding -> operación;
- % operación -> cierre;
- tiempo de onboarding;
- tiempo de ciclo de operación;
- incidencias por operación;
- tasa de bloqueo/cancelación;
- ticket medio;
- mix Base/Plus;
- ingreso y coste variable por operación;
- margen de contribución por tramo de valor;
- CAC cuando exista inversión;
- repetición y recomendación.

Evitar analítica con PII innecesaria.

## 9. Kit de venta

Preparar y mantener alineados:

- landing con propuesta y CTA;
- demo guiada con datos ficticios;
- pitch de 30 segundos;
- deck comercial;
- FAQ de confianza/seguridad;
- explicación del proceso;
- pricing cuando esté validado;
- explicación transparente de Plus/Alto Valor y sus controles;
- plantilla de propuesta;
- seguimiento comercial;
- registro de objeciones.

Pitch de trabajo: “FIA&CO convierte una compraventa entre partes en un proceso guiado y trazable: requisitos, evidencias, incidencias y próximos pasos visibles en un mismo flujo.”

## 10. Pilotos

Antes de promoción abierta ejecutar 3–5 pilotos controlados, incluyendo si es viable al menos un caso simulado de Alto Valor. Cada piloto debe tener consentimiento adecuado, alcance definido, responsable y retrospectiva.

Registrar: objeciones, pasos confusos, documentos solicitados, intervenciones manuales, incidencias, tiempo por etapa, disposición a pagar y recomendación.

No considerar un piloto autorización para mover fondos ni para saltarse los gates jurídico/técnico.

## Gate de promoción abierta

GO solo cuando:

1. propuesta y segmento inicial estén definidos;
2. funnel y responsable de seguimiento estén operativos;
3. onboarding tenga checklist y política de datos;
4. pricing Base y Plus haya sido contrastado en pilotos;
5. revisión jurídica haya aprobado el alcance comercial real;
6. revisión técnica haya aprobado el uso de datos reales;
7. métricas y backoffice permitan detectar fallos;
8. 3–5 pilotos hayan producido evidencia suficiente y no queden bloqueadores críticos.

Hasta entonces, promoción limitada a discovery, lista de espera y pilotos explícitamente controlados.