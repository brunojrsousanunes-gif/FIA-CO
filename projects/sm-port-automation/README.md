# Proyecto SM Port Automation

## Objetivo

Crear, sobre el núcleo de FIA&CO, una automatización B2B para transformar las notas utilizadas en la documentación de portes en información estructurada, verificable y gestionable por excepciones.

Este proyecto **no sustituye la app móvil, la web, la VPN ni el sistema logístico de SM**. Se diseña como capa complementaria mediante adapter.

## Información de partida

Hipótesis facilitadas por conocimiento operativo del cliente potencial:
- SM dispone de web y aplicación móvil para trabajadores.
- La app opera con acceso protegido/VPN.
- La documentación de entregas/verificaciones todavía utiliza notas.
- La oficina concentra parte de la gestión en 2–3 personas.
- Existen asalariados y autónomos.
- No se pretende automatizar decisiones laborales ni puntuar personas.

Toda hipótesis deberá validarse con SM antes de una integración real.

## Problema

Las notas de portes contienen contexto útil pero son poco estructuradas. Esto puede obligar a oficina a leer, interpretar, clasificar, buscar documentación o detectar manualmente excepciones.

## Propuesta

Pipeline:

`SM App / exportación autorizada`
→ `SM Adapter`
→ `Document Intake`
→ `Extraction & Normalization`
→ `Rules`
→ `Evidence`
→ `Exception Queue`
→ `Office Review`

La nota original se conserva como evidencia. FIA&CO genera una representación estructurada.

## Ejemplo

Entrada:

`Entregado 4 bultos, recoge almacén, falta firma.`

Salida estructurada:

- estado: `DELIVERED_WITH_EXCEPTION`
- bultos: `4`
- receptor: `WAREHOUSE`
- firma: `PENDING`
- requiere_revision: `true`
- motivo: `SIGNATURE_MISSING`

## Estados iniciales

- `NORMAL`
- `DOCUMENT_PENDING`
- `RECIPIENT_ABSENT`
- `REJECTED`
- `DAMAGED`
- `ADDRESS_ISSUE`
- `QUANTITY_MISMATCH`
- `DELAY`
- `OTHER_EXCEPTION`

## Regla humana

FIA&CO puede clasificar, estructurar y recomendar. No toma decisiones sensibles sobre empleados o autónomos.

La puntuación, si se utiliza, se aplica a la **completitud/confianza documental del porte**, nunca a la persona.

## MVP / Piloto

Primera fase recomendada:
- 100–500 notas históricas;
- datos minimizados y autorizados;
- ejecución fuera de producción;
- sin modificar la app SM;
- sin acceso a cuentas bancarias;
- sin decisiones automáticas de negocio.

## KPIs

- % de notas estructuradas correctamente;
- precisión por campo;
- % de portes que podrían cerrarse sin revisión;
- % de portes correctamente enviados a excepción;
- falsos positivos;
- falsos negativos críticos;
- minutos de oficina por 100 portes antes/después;
- tiempo medio de resolución de excepciones.

## Gates

No avanzar a producción si:
- la precisión no es suficiente;
- existe riesgo de ocultar incidencias;
- el ahorro administrativo es irrelevante;
- la integración interfiere con la operativa de SM;
- no existe autorización contractual/técnica para los datos.

## Arquitectura

El proyecto reutiliza principios FIA&CO:
- adapters sustituibles;
- fail-safe;
- evidencias trazables;
- auditoría;
- configuración versionada;
- humano en decisiones críticas;
- sin lock-in artificial;
- exportabilidad del dato.

## Evolución posible

Solo si el piloto demuestra ROI:
1. ingestión automática desde la app/sistema SM;
2. campos estructurados en origen;
3. nota libre solo para excepciones;
4. panel de excepciones de oficina;
5. expedientes de portes;
6. integración opcional con facturación/conciliación en una fase separada.

## Estado

`DESIGN_ONLY / PILOT_CANDIDATE`

No existe integración productiva con SM ni autorización para tratar sus datos reales.