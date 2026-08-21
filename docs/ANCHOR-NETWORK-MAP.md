# FIA&CO — Anchor → Network Map

> Documento comercial de trabajo. Las empresas citadas son candidatos investigados, no clientes, partners ni acuerdos existentes.

## Regla estratégica

No modificar el núcleo de FIA&CO para conseguir una empresa concreta. Buscar el punto donde las capacidades existentes aportan valor transversal y utilizar adapters/configuración para interoperar con los sistemas de cada participante.

**ANCHOR → NETWORK:** priorizar empresas ancla cuyo uso de FIA&CO cree valor para clientes, proveedores, transportistas, talleres, financiadores u otros miembros de su red. La adhesión debe surgir de utilidad e interoperabilidad, nunca de lock-in artificial.

## Caso inicial — Recambios / transporte

**Frain → Transportes SM → taller**

Gancho: expediente transversal pedido → preparación → recogida → porte → nota/POD → entrega → incidencia/devolución → cierre.

Valor ancla: trazabilidad normalizada aunque intervengan distintos operadores.
Valor transportista: menos carga documental y consultas; puede mantener su sistema actual.
Valor receptor: visibilidad y evidencia de entrega/incidencia.

Piloto recomendado: pocos eventos, una relación concreta y métricas de horas administrativas/errores evitados.

## Vertical prioritario — Compraventa de vehículos

La investigación local muestra procesos recurrentes que encajan con FIA&CO: tasación/compra, revisión o certificación, financiación, documentación/transferencia, garantía/postventa y entrega física o a domicilio. Algunos operadores de Lugo publicitan además compra 100% online, pago inmediato, stocks amplios y entrega nacional.

### Ganchos FIA&CO

1. **Expediente único del vehículo**
   - entrada/tasación → documentación → revisión → reacondicionamiento → publicación → reserva → financiación → venta → transferencia → entrega → garantía.
   - FIA&CO no sustituye DMS/ERP; normaliza evidencias, estados y excepciones entre sistemas.

2. **Compra/tasación con checklist documental**
   - detectar automáticamente documentación o verificaciones pendientes antes de aprobar la entrada del vehículo.
   - objetivo: reducir esperas, búsquedas y errores administrativos.

3. **Venta financiada — seguimiento de expediente**
   - solicitud → documentos → estado financiador → condición pendiente → aprobación/rechazo recibido → preparación de entrega.
   - FIA&CO no concede crédito ni decide solvencia; coordina el workflow y deja la decisión al financiador/humano autorizado.

4. **Transferencia y entrega sin olvidos**
   - checklist por excepción para documentación, pago, cambio de titularidad, preparación, transporte y recepción.
   - panel diario: solo operaciones que requieren intervención.

5. **Garantía/postventa trazable**
   - venta → incidencia → evidencia → taller/proveedor → reparación/resolución → cierre.
   - gancho especialmente útil cuando intervienen terceros.

6. **Transporte nacional del vehículo**
   - compraventa → operador logístico → comprador.
   - mismo patrón Anchor → Network: el compraventa exige/solicita eventos normalizados y el transportista puede interoperar mediante adapter sin sustituir su software.

7. **Conciliación económica**
   - reserva/entrada/pago/financiación/abono → movimiento → expediente.
   - automatizar coincidencias y elevar únicamente discrepancias, sujeto a proveedor bancario autorizado y Production Gate.

8. **Stock bloqueado por excepción**
   - identificar vehículos que no pueden avanzar por documento, revisión, financiación, transferencia, transporte o incidencia pendiente.
   - KPI: días de inmovilización evitables y tiempo administrativo por unidad.

## Candidatos locales observados

### Movity (Lugo)
Se presenta con más de 200 vehículos, compra online, tasación/compra de vehículos, financiación, revisión de más de 200 puntos, garantía y entrega gratuita en península.

**Gancho prioritario:** expediente compra-online → financiación → documentación → preparación → transporte → entrega; además, coordinación de tasaciones/vehículos tomados a cambio.

### Sibuscascoche Lugo
Publicita más de 1.000 vehículos en stock, tasación, compra con pago inmediato, gestión de trámites, financiación y entrega/recogida nacional.

**Gancho prioritario:** orquestación multi-sede/multi-operación y gestión por excepción de documentación, entrega y transporte.

### Muralla Motor (Lugo)
Publicita certificación de kilometraje/no siniestralidad, verificación CARFAX, financiación, garantía, entrega y postventa.

**Gancho prioritario:** expediente de evidencias del vehículo + garantía/postventa + financiación/entrega, sin duplicar sus sistemas de certificación.

### FF Cars (Monforte de Lemos)
Publicita tasación/compra, financiación, revisión, garantía y gestión documental.

**Gancho prioritario:** automatización administrativa de tasación → compra → documentación → financiación → entrega/postventa.

### Autos Masma (Lugo)
Publicita compra/venta, pago inmediato, tasación y garantía.

**Gancho prioritario:** checklist/evidencia de adquisición y venta + conciliación/estado económico por excepción.

## Estrategia de captación de compraventas

No vender “otro software de concesionario”. Vender **reducción de carga entre sistemas y terceros**.

Pregunta de diagnóstico central:

> Desde que entra un coche hasta que se entrega y queda documental/económicamente cerrado, ¿cuántas personas, programas y terceros intervienen, y qué parte se comprueba manualmente?

Buscar cuatro dolores:
- operaciones paradas por documentación;
- seguimiento manual de financiación/transferencia;
- coordinación con transporte/taller/garantía;
- conciliación y excepciones administrativas.

### Gancho de red

El mejor cliente ancla no es necesariamente el compraventa más grande, sino el que trabaja con suficientes terceros como para que una sola adopción conecte varios nodos:

**Compraventa → financiador/banco → gestoría → taller → garantía → transportista → comprador.**

FIA&CO debe permitir que cada tercero aporte/reciba únicamente los eventos necesarios, con evidencia, permisos y trazabilidad.

## Scoring comercial (100)
- 25: tamaño/calidad de red B2B.
- 20: operaciones repetitivas.
- 20: evidencias/documentación entre organizaciones.
- 15: pagos/facturación asociados.
- 10: facilidad técnica de integración.
- 10: accesibilidad comercial/piloto.

## Métricas de piloto
- minutos administrativos por operación/unidad;
- porcentaje de expedientes completos sin revisión manual;
- excepciones detectadas;
- tiempo medio de cierre;
- días de stock bloqueado por causas administrativas;
- incidencias documentales;
- conciliaciones automáticas vs. manuales;
- horas de soporte/seguimiento;
- conversión del piloto a pago.

## Límites éticos y de producto
- sin lock-in artificial;
- exportabilidad de datos;
- no decisiones laborales/crediticias sensibles automáticas;
- no sustituir sistemas verticales que ya funcionan salvo necesidad demostrada;
- automatizar lo normal y elevar excepciones al humano;
- cada nueva función transversal puede entrar al producto; lo específico de un cliente debe permanecer en adapter/configuración.

## Próximos pasos
1. Mapear Frain → SM → taller con información real del fundador.
2. Seleccionar 2–3 compraventas accesibles para entrevistas de diagnóstico.
3. No construir funciones nuevas antes de entrevistas.
4. Convertir problemas confirmados en Pilot Requirements + KPI + ROI.
5. Incorporar solo evidencia real al Investor Pack.