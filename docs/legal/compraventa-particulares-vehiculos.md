# FIA&CO — Base jurídica: compraventa entre particulares y vehículos

> Documento de diseño jurídico-técnico. No sustituye asesoramiento jurídico individualizado. Antes de activar operaciones reales deberá revisarse la normativa vigente y la configuración fiscal/territorial aplicable.

## 1. Caso de uso

FIA&CO contemplará como casos de uso:

- compraventa de bienes entre particulares;
- compraventa de vehículos usados entre particulares;
- generación y conservación de evidencias del acuerdo, pago, entrega y cierre;
- trazabilidad del estado de la operación.

La plataforma no tratará un límite de efectivo como límite máximo del precio del contrato. Precio de compraventa y límites del medio de pago son conceptos distintos.

## 2. Base civil

Código Civil español, arts. 1445 y siguientes:

- art. 1445: la compraventa vincula la entrega de una cosa determinada con el pago de un precio cierto;
- art. 1449: el precio no puede quedar al arbitrio de uno solo de los contratantes;
- art. 1450: la venta queda perfeccionada y resulta obligatoria cuando existe acuerdo sobre cosa y precio, aunque todavía no se hayan entregado.

Consecuencia para el modelo: FIA&CO debe registrar de forma inequívoca objeto, precio, partes, consentimiento y momento de aceptación, separando después los estados de pago y entrega.

Fuente oficial: BOE, Código Civil consolidado.

## 3. Vehículos usados entre particulares

Según la DGT, el flujo deberá contemplar como mínimo:

1. identificación de comprador, vendedor y vehículo;
2. precio de compra;
3. fecha y hora de firma;
4. contrato firmado por comprador y vendedor;
5. justificación del ITP (pago, exención o no sujeción, según corresponda);
6. cambio de titularidad ante la DGT dentro de los 30 días posteriores a la firma;
7. controles/avisos sobre situación administrativa del vehículo y documentación necesaria.

FIA&CO podrá modelar el recorrido: contrato → evidencia de pago → entrega → fiscalidad/documentación → cambio de titularidad → cierre.

Fuente oficial: DGT, Comprar un vehículo de segunda mano (actualización 30/04/2026).

## 4. Límite de pagos en efectivo

El art. 7 de la Ley 7/2012, en su redacción vigente tras la Ley 11/2021, impide pagar en efectivo operaciones de importe igual o superior a 1.000 EUR cuando alguna de las partes actúa como empresario o profesional. Existe el supuesto especial de 10.000 EUR para determinado pagador persona física sin domicilio fiscal en España que no actúe como empresario o profesional.

La regla suma pagos u operaciones fraccionadas a efectos del límite, por lo que FIA&CO no permitirá utilizar fraccionamientos para eludir el control.

Cuando ninguno de los intervinientes actúe como empresario o profesional, este límite específico del art. 7 no debe convertirse en un falso límite general del precio de una compraventa entre particulares.

En operaciones sujetas a la prohibición de efectivo, el modelo deberá conservar/permitir asociar justificantes de medios de pago distintos del efectivo durante el periodo legal aplicable.

Fuentes oficiales: BOE, Ley 7/2012 art. 7; Ley 11/2021 art. 18.

## 5. Reglas que pasan al modelo FIA&CO

El motor de operaciones deberá distinguir:

- tipo de operación: vehículo / otro bien;
- naturaleza de cada parte: particular / empresario-profesional;
- precio total pactado;
- método o métodos de pago;
- importe acumulado de pagos relacionados;
- estado del contrato: borrador / aceptado / firmado;
- estado del pago: pendiente / acreditado / rechazado / incidencias;
- estado de entrega;
- obligaciones documentales y fiscales asociadas;
- para vehículos: estado de transferencia de titularidad y plazo de 30 días.

Los límites jurídicos no se codificarán como números permanentes dispersos por la aplicación. Se implementarán como reglas versionadas y configurables para poder actualizarlas cuando cambie la legislación.

## 6. Controles preventivos

Antes de permitir una operación real, FIA&CO deberá:

- determinar si interviene empresario/profesional;
- aplicar la regla de efectivo vigente y detectar fraccionamiento relacionado;
- bloquear o derivar a revisión cualquier combinación incompatible con la regla aplicable;
- mantener trazabilidad de aceptación, modificaciones y evidencias;
- no afirmar automáticamente que una operación es legal únicamente porque supera validaciones técnicas;
- exigir revisión jurídica adicional para supuestos excepcionales, internacionales o de riesgo.

## 7. Integración con el Paso 2

Este caso de uso amplía el MVP del Paso 2 sin convertir todavía la demo en un servicio transaccional real. El frontend deberá poder representar:

- Compraventa entre particulares;
- Compraventa de vehículo;
- datos esenciales del contrato;
- método de pago previsto;
- checklist documental;
- estado simulado de la operación.

En la demo, cualquier pago, firma o transferencia registral seguirá siendo SIMULADO hasta que backend, identidad, firma/evidencia, cumplimiento, fiscalidad y proveedores reales hayan sido validados.

## 8. Criterio de seguridad

La base jurídica se utilizará como conjunto de reglas y controles, no como garantía automática de legalidad. Las normas deberán conservar referencia, versión y fecha de revisión para permitir auditoría y actualización.
