# FIA&CO — Founding Demonstrators v1

Estado: `PILOT_PREP`.

## Objetivo

Los primeros 3 proyectos de FIA Recover no son clientes ordinarios. Son **FIA Founding Demonstrators**: implantaciones controladas cuyo objetivo es validar valor económico real y producir evidencia comercial reutilizable para vender a los siguientes clientes.

La prioridad es obtener evidencia creíble, no fabricar testimonios ni maximizar facturación inicial.

## 1. Principios

1. No aceptar un demostrador si no puede medirse un baseline razonable.
2. No prometer resultados garantizados.
3. No usar nombre, logo, imágenes, capturas identificables ni testimonios sin autorización expresa.
4. Un descuento promocional nunca compra ni condiciona una valoración positiva.
5. Separar siempre `CONFIRMED`, `ASSISTED` y `ESTIMATED`.
6. No publicar PII ni datos comerciales sensibles innecesarios.
7. Toda cifra promocional debe poder rastrearse a una fuente o método de cálculo documentado.
8. **Los resultados detallados no se publican en abierto.** Se muestran únicamente a prospectos identificados/autorizados y a clientes FIA autenticados, tanto en web privada como en app.
9. La web pública puede mostrar mensajes generales, sectores cubiertos o rangos agregados no sensibles, pero no Proof Packs completos ni cifras identificables de clientes.

## 2. Perfiles objetivo de los 3 primeros demostradores

Prioridad recomendada:

### Demonstrator A — Construcción / instaladores / reformas
- volumen suficiente de presupuestos;
- ticket medio relevante;
- seguimiento manual o irregular;
- capacidad de medir presupuesto -> respuesta -> cierre.

### Demonstrator B — Taller / servicio técnico
- alto volumen de contactos;
- citas/presupuestos/avisos recurrentes;
- oportunidad clara de recuperar leads o seguimientos olvidados.

### Demonstrator C — Maquinaria profesional / agrícola
- menor volumen pero alto valor por oportunidad;
- procesos comerciales/documentales visibles;
- potencial de enlazar más adelante FIA Recover con FIA Ops y FIA Transactions.

La selección final depende de evidencia real, no de cumplir exactamente esos tres sectores.

## 3. Scorecard de selección

Puntuar 0–2 cada criterio. Priorizar candidatos con >= 14/20.

| Criterio | 0 | 1 | 2 |
|---|---|---|---|
| Volumen de oportunidades | bajo | medio | alto |
| Ticket/valor cliente | bajo | medio | alto |
| Problema reconocido | no | parcial | explícito |
| Baseline disponible | no | incompleto | suficiente |
| Acceso a decisor | difícil | indirecto | directo |
| Integración viable | compleja | posible | sencilla |
| Disposición a piloto | baja | dudosa | clara |
| Disposición a medir | baja | parcial | alta |
| Potencial de caso comercial | bajo | medio | alto |
| Reutilización para otros clientes | baja | media | alta |

No aceptar un candidato por debajo de 10/20 salvo motivo estratégico documentado.

## 4. Intercambio de valor

FIA puede ofrecer condiciones de lanzamiento especiales a cambio de:
- acceso razonable a datos operativos necesarios para medir el piloto;
- tiempo de discovery y revisión;
- feedback estructurado;
- autorización independiente para reutilizar métricas/caso dentro del entorno comercial restringido, si el cliente acepta.

No exigir testimonio positivo.

### Niveles de visibilidad

**GATED_IDENTIFIED**
- visible solo a prospectos autorizados y clientes FIA autenticados;
- puede incluir nombre comercial, logo, sector/ubicación, métricas aprobadas y testimonio opcional;
- requiere autorización expresa.

**GATED_ANONYMIZED**
- visible solo a prospectos autorizados y clientes FIA autenticados;
- sector, tamaño/rango aproximado, zona amplia y métricas;
- sin nombre ni elementos identificables.

**CLIENT_ONLY**
- visible únicamente para clientes FIA autenticados y equipo FIA autorizado.

**PRIVATE**
- uso exclusivo interno para validar producto/economics;
- no se utiliza comercialmente.

No existe un nivel de Proof Pack público abierto por defecto.

## 5. Canales de acceso a resultados

### Web pública
Puede mostrar:
- propuesta de valor;
- sectores;
- metodología;
- ejemplos sintéticos;
- indicadores agregados no sensibles aprobados.

No puede mostrar:
- Proof Packs completos;
- cifras identificables de un cliente;
- capturas internas;
- datos comerciales sensibles.

### Web privada / portal comercial
Puede mostrar Proof Packs a:
- prospectos registrados/autorizados;
- usuarios con rol comercial válido;
- clientes autenticados.

Debe registrar al menos:
- quién accedió;
- qué caso visualizó;
- fecha/hora;
- nivel de permiso.

### App FIA
Los clientes autenticados pueden acceder a una biblioteca de casos según permisos, sector y visibilidad concedida. Un cliente nunca obtiene acceso a datos privados de otro cliente fuera del Proof Pack autorizado.

## 6. Evidencia mínima antes/después

### Baseline
- oportunidades o presupuestos/30 días;
- valor agregado si está disponible;
- % con seguimiento;
- tiempo medio al primer seguimiento;
- respuestas posteriores al seguimiento;
- cierres atribuibles conocidos;
- horas humanas dedicadas;
- herramientas y canales usados.

### Durante el piloto
- oportunidades vigiladas;
- seguimientos preparados;
- seguimientos ejecutados;
- respuestas recibidas;
- interesados;
- revisiones humanas;
- errores/falsos positivos;
- coste IA/workflow;
- minutos humanos FIA.

### Resultado
- valor `CONFIRMED`;
- valor `ASSISTED`;
- ahorro `ESTIMATED`;
- horas ahorradas;
- coste del piloto;
- ratio valor/coste;
- intención de continuar pagando.

## 7. Definiciones de atribución

### CONFIRMED
Resultado confirmado por el cliente y razonablemente atribuible al flujo FIA.

Ejemplo: presupuesto sin respuesta -> seguimiento FIA -> cliente responde -> venta registrada por la empresa.

### ASSISTED
FIA intervino de forma relevante, pero no se afirma causalidad exclusiva.

Ejemplo: FIA recordó un seguimiento y el comercial cerró posteriormente tras varias interacciones adicionales.

### ESTIMATED
Valor o ahorro calculado mediante hipótesis documentada.

Ejemplo: horas administrativas evitadas multiplicadas por un coste/hora acordado para estimación.

Nunca mezclar las tres categorías en una única cifra sin desglose.

## 8. Criterios para considerar el demostrador comercialmente útil

Un caso puede generar FIA Proof Pack si cumple al menos 4:
- baseline suficiente;
- resultado medible;
- flujo reutilizable;
- cliente percibe valor;
- coste operativo sostenible;
- una métrica económica clara;
- autorización `GATED_IDENTIFIED`, `GATED_ANONYMIZED` o `CLIENT_ONLY`;
- narrativa comprensible en menos de 60 segundos.

## 9. Cierre del piloto

Reunión final obligatoria:
1. revisar cifras con el cliente;
2. separar CONFIRMED / ASSISTED / ESTIMATED;
3. corregir cualquier dato discutible;
4. registrar intención de seguir pagando;
5. elegir nivel de visibilidad;
6. solicitar testimonio solo después de revisar resultados, sin presión;
7. generar Proof Pack si procede;
8. registrar permisos de acceso y fecha de expiración/revisión cuando aplique.

## 10. Regla estratégica

Los primeros 3 proyectos deben optimizar tres activos simultáneos:

`INGRESO INICIAL + APRENDIZAJE DE PRODUCTO + PRUEBA COMERCIAL RESTRINGIDA`

Un piloto que factura pero no deja aprendizaje ni evidencia tiene menos valor estratégico que un demostrador bien medido.
