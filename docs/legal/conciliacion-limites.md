# FIA&CO — Reglas jurídicas para conciliación y límites de cuantía

> Documento de diseño jurídico-técnico. No sustituye asesoramiento jurídico individualizado. Antes de activar conciliaciones reales se verificará la normativa vigente y, cuando corresponda, la normativa sectorial o territorial aplicable.

## 1. Principio del modelo

FIA&CO no impondrá un límite económico único a todas las conciliaciones.

Cada modalidad de conciliación se evaluará según su régimen jurídico aplicable y la versión vigente de la norma. El sistema permitirá la cuantía máxima legal de esa modalidad cuando exista un límite expreso. Cuando la ley no establezca un máximo de cuantía, FIA&CO no inventará uno.

La cuantía nunca sustituirá el control sobre la disponibilidad del derecho, la materia, las partes, la competencia del conciliador y los demás requisitos legales.

## 2. Base normativa general

La Ley Orgánica 1/2025 regula los medios adecuados de solución de controversias (MASC) en el ámbito civil y mercantil.

Conforme a su artículo 4, las partes pueden convenir o transigir sobre derechos e intereses disponibles siempre que el acuerdo no sea contrario a la ley, la buena fe ni el orden público. Las materias legalmente indisponibles o excluidas no se admitirán por el mero hecho de que su cuantía sea inferior a un límite.

La conciliación privada se regula específicamente en los artículos 15 y 16. La persona conciliadora debe reunir los requisitos profesionales, de imparcialidad, confidencialidad y secreto profesional establecidos legalmente.

Los acuerdos deberán incorporar los datos y obligaciones exigidos por la normativa y, cuando se pretenda eficacia ejecutiva, seguir la vía legal correspondiente de elevación a escritura pública, homologación judicial u otra forma legalmente prevista.

Fuente principal: BOE, Ley Orgánica 1/2025, arts. 4, 12 a 16.

## 3. Modalidades y cuantía

### 3.1 Conciliación privada

La LO 1/2025 no establece en su regulación general de la conciliación privada un máximo económico único. Por ello, FIA&CO no fijará artificialmente una cifra máxima para esta modalidad.

La admisibilidad dependerá, entre otros factores, de que el derecho o interés sea disponible, de la materia, de las partes y de los requisitos de la persona conciliadora.

### 3.2 Conciliación pública en Oficinas de Justicia en el municipio

El Servicio Público de Justicia informa actualmente de que el personal de las Oficinas de Justicia en el municipio puede llevar a cabo conciliaciones públicas en asuntos inferiores a 10.000 EUR.

FIA&CO tratará este umbral como una regla versionada y sujeta a verificación normativa antes de una operación real. No se reutilizará como límite para otras modalidades de conciliación.

### 3.3 Otras modalidades públicas

La conciliación ante letrados/as de la Administración de Justicia, notarios/as, registradores/as y las modalidades judiciales se evaluarán conforme a su regulación específica. FIA&CO no trasladará automáticamente a estas vías el umbral de las Oficinas de Justicia en el municipio.

## 4. Motor jurídico de FIA&CO

Antes de ofrecer o validar una modalidad de conciliación, el motor deberá determinar como mínimo:

- jurisdicción y normativa aplicable;
- naturaleza de las partes;
- materia del conflicto;
- disponibilidad jurídica del derecho o interés;
- cuantía de la controversia;
- modalidad de conciliación solicitada;
- límite de cuantía aplicable a esa modalidad, si existe;
- requisitos de la persona conciliadora;
- necesidad de asistencia letrada cuando corresponda;
- requisitos de formalización y, en su caso, de eficacia ejecutiva;
- exclusiones, excepciones o necesidad de revisión profesional.

Resultado posible: ADMISIBLE / NO ADMISIBLE / REQUIERE REVISIÓN.

## 5. Regla de máximo legal

La regla funcional será:

`máximo_FIA_CO(modalidad, fecha, jurisdicción) = máximo permitido por la norma vigente para esa modalidad, si existe; sin límite artificial si la norma no establece máximo`.

Si una modificación legislativa reduce o aumenta un límite, FIA&CO deberá poder actualizar la regla sin modificar múltiples componentes de la aplicación.

Toda regla económica deberá guardar al menos: identificador, modalidad, jurisdicción, fuente normativa/oficial, fecha de vigencia, operador (por ejemplo, inferior a), importe cuando exista, estado y fecha de última revisión.

## 6. Seguridad jurídica preventiva

El sistema no deberá:

- afirmar que una conciliación es legal únicamente porque la cuantía esté dentro del límite;
- permitir materias indisponibles o excluidas por el régimen aplicable;
- presentar un límite de una modalidad como si fuera universal;
- dividir artificialmente una controversia para eludir una restricción legal;
- usar reglas jurídicas caducadas sin advertencia o control de versión.

Cuando exista duda normativa, conflicto de reglas, componente internacional, materia especialmente regulada o ausencia de información suficiente, la operación pasará a REQUIERE REVISIÓN.

## 7. Integración en el Paso 2 y siguientes

El MVP podrá mostrar casos de conciliación simulados y seleccionar la modalidad adecuada según materia y cuantía. Ninguna conciliación real, firma con efectos jurídicos, pago o presentación ante autoridad se activará hasta completar backend, identidad, evidencias, seguridad, cumplimiento y validación profesional necesarios.

En los pasos posteriores, estas reglas pasarán a un motor jurídico versionado del backend y a pruebas automáticas que comprueben los límites y exclusiones aplicables.

## 8. Fuentes oficiales de referencia

- BOE: Ley Orgánica 1/2025, de 2 de enero, especialmente arts. 4 y 12-16.
- Servicio Público de Justicia: información oficial sobre conciliación y modalidades públicas.

Las fuentes y cifras deberán verificarse de nuevo antes de la puesta en producción y mantenerse versionadas.