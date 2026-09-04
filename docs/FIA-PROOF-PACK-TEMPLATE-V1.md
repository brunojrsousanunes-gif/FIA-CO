# FIA&CO — FIA Proof Pack Template v1

Estado: `TEMPLATE_READY`.

Objetivo: convertir un Founding Demonstrator en una prueba comercial breve, verificable y reutilizable dentro de un entorno de acceso restringido.

## 1. Metadatos de acceso

- Proof Pack ID: [id]
- Cliente/caso: [nombre o descriptor anonimizado]
- Nivel de visibilidad: `GATED_IDENTIFIED | GATED_ANONYMIZED | CLIENT_ONLY | PRIVATE`
- Autorización registrada: [sí/no + referencia]
- Fecha de revisión de permisos: [fecha]
- Expiración/revalidación si aplica: [fecha]

**Regla:** este documento no se publica en abierto. Solo puede mostrarse a prospectos autorizados, clientes autenticados o equipo FIA con permisos según el nivel anterior.

## 2. Resumen ejecutivo

Problema principal: [frase]

Periodo medido: [fecha inicio] — [fecha fin]

Resultado principal:
- `CONFIRMED`: [€ / métrica]
- `ASSISTED`: [€ / métrica]
- `ESTIMATED`: [€ / horas]

Coste FIA durante el periodo: [€]

Ratio valor/coste: [x]

## 3. Antes de FIA

- Oportunidades/presupuestos al mes: [n]
- Valor agregado observado: [€]
- % con seguimiento: [%]
- Tiempo medio al primer seguimiento: [h/días]
- Horas humanas/mes dedicadas: [h]
- Principal cuello de botella: [texto]

### Evidencia baseline

Fuente(s): [CRM, correo, hoja de cálculo, declaración validada, otra]

Notas/metodología: [texto]

## 4. Qué implantó FIA

- Flujo activado: [Quote Recovery / Lead Recovery / otro]
- Integraciones: [texto]
- Acciones automáticas autorizadas: [texto]
- Acciones con aprobación humana: [texto]
- Duración del piloto: [días]

## 5. Resultados

### CONFIRMED
Resultados confirmados por el cliente y razonablemente atribuibles al flujo FIA.

- [métrica]: [valor]
- [métrica]: [valor]

### ASSISTED
Resultados donde FIA intervino de forma relevante sin reclamar causalidad exclusiva.

- [métrica]: [valor]

### ESTIMATED
Estimaciones basadas en una metodología documentada.

- Horas ahorradas estimadas: [h]
- Coste/hora utilizado: [€]
- Ahorro estimado: [€]

## 6. Economía de la implantación

- Coste IA: [€]
- Coste workflows/infraestructura: [€]
- Minutos humanos FIA: [min]
- Coste total variable FIA: [€]
- Ingreso FIA: [€]
- Margen de contribución: [€ / %]

## 7. Qué cambió operativamente

Antes:
- [punto]
- [punto]

Después:
- [punto]
- [punto]

## 8. Testimonio opcional

Solo incluir si existe autorización expresa y nunca como condición del descuento/promoción.

> [texto aprobado por el cliente]

## 9. Condiciones de reutilización

El Proof Pack debe indicar expresamente:
- si puede mostrarse a prospectos nuevos;
- si puede mostrarse a clientes FIA;
- si puede mostrarse en web privada;
- si puede mostrarse en app;
- si puede incluir nombre/logo;
- si debe permanecer anonimizado;
- fecha de revisión/revocación de permiso.

## 10. Log de acceso esperado

Cuando exista implementación técnica, registrar como mínimo:
- viewerId;
- viewerRole;
- organizationId cuando aplique;
- proofPackId;
- timestamp;
- accessDecision;
- accessReason/policyVersion.

No registrar más datos de los necesarios.
