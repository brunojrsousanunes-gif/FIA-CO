# Proyecto SM Port Automation

## Idea simple

**SM sigue trabajando como ahora.**

Los repartidores continúan escribiendo sus notas de portes en su sistema actual. FIA&CO trabaja por detrás y convierte esas notas en información clara para la oficina.

No queremos añadir otra app, otro login ni otro procedimiento al trabajador durante el piloto.

## Flujo

`Nota del repartidor`
→ `FIA&CO la interpreta`
→ `La oficina recibe solo el resultado`

La oficina ve únicamente tres estados:

- 🟢 **CORRECTO** — no hay que hacer nada.
- 🟡 **REVISAR** — falta información o documentación.
- 🔴 **INCIDENCIA** — requiere intervención.

## Ejemplo

Nota actual:

`Entregado 4 bultos, recoge almacén, falta firma.`

FIA&CO muestra:

**Porte:** SM-28472  
**Estado:** 🟡 REVISAR  
**Bultos:** 4  
**Receptor:** almacén  
**Pendiente:** firma  
**Acción sugerida:** verificar documentación

La nota original se conserva como evidencia.

## Qué gana SM

- menos tiempo leyendo notas una por una;
- menos búsquedas manuales;
- incidencias separadas de portes normales;
- información más fácil de consultar;
- histórico estructurado de portes;
- posibilidad futura de reducir notas libres si SM lo considera útil;
- sin cambiar inicialmente la app, web, VPN o sistema logístico.

## Qué NO hace FIA&CO

- no puntúa trabajadores;
- no toma decisiones laborales;
- no modifica rutas;
- no sustituye el sistema logístico;
- no accede a cuentas bancarias en este piloto;
- no cierra automáticamente una incidencia dudosa.

## Piloto más fácil posible

1. SM entrega una muestra autorizada de **100 notas históricas**.
2. FIA&CO las procesa fuera de producción.
3. Comparamos el resultado con la revisión manual de SM.
4. Solo si demuestra ahorro y precisión se propone una integración.

No se toca la operativa real durante esta fase.

## Qué medimos

Solo cinco métricas:

1. notas interpretadas correctamente;
2. portes normales que no necesitan revisión;
3. excepciones detectadas correctamente;
4. errores críticos;
5. minutos de oficina ahorrados por cada 100 portes.

## Gate de continuación

El proyecto solo avanza si:

- SM considera útil el resultado;
- no se ocultan incidencias;
- el ahorro de oficina es medible;
- la precisión es suficiente;
- la integración no complica el trabajo de repartidores u oficina.

## Fase 2, solo si funciona

Si el piloto tiene ROI:

`Sistema SM`
→ `Adapter FIA&CO`
→ `CORRECTO / REVISAR / INCIDENCIA`
→ `Panel simple de oficina`

Más adelante, y únicamente si SM lo desea, las notas repetitivas podrían sustituirse progresivamente por campos estructurados. La nota libre quedaría para casos excepcionales.

## Principio de diseño

**Automatizar sin obligar a SM a cambiar su forma de trabajar antes de demostrar valor.**

## Estado

`DESIGN_ONLY / PILOT_CANDIDATE`

No existe integración productiva con SM ni autorización para tratar datos reales.