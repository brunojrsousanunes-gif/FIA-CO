# Transporte de animales — condiciones y obligaciones de diseño

**Estado:** PRE_PILOT_DESIGN_ONLY. Este documento traduce requisitos generales de España/UE a controles de producto. No sustituye asesoramiento veterinario/jurídico ni habilita transporte real por sí mismo.

## Base normativa de referencia
- Reglamento (CE) n.º 1/2005 sobre protección de los animales durante el transporte.
- Real Decreto 990/2022, de 29 de noviembre, sobre normas de sanidad y protección animal durante el transporte en España.

Antes de un piloto real deben revisarse cambios normativos, especie, distancia, duración, finalidad económica y comunidad autónoma competente.

## Condiciones obligatorias del flujo
1. **Aptitud para el transporte.** No iniciar el servicio si el animal no es apto para el viaje previsto. El flujo debe requerir declaración/validación del operador responsable y permitir bloqueo manual cuando exista duda.
2. **Minimizar duración y sufrimiento.** Ruta, paradas y manejo deben planificarse para reducir duración, estrés, lesiones y sufrimiento.
3. **Medio adecuado.** El vehículo/contenedor debe figurar como autorizado cuando corresponda y ser adecuado a especie, tamaño, ventilación, seguridad, limpieza y acceso.
4. **Carga/descarga segura.** Registrar puntos de carga/descarga y confirmar que los medios utilizados son adecuados y no causan lesiones o sufrimiento innecesario.
5. **Personal formado.** Conductor/cuidador debe disponer de formación o certificado de competencia cuando sea exigible.
6. **Transportista autorizado.** El flujo debe exigir número/estado de autorización del transportista cuando la actividad entre en el régimen aplicable.
7. **Documentación acompañante.** Debe poder adjuntarse/verificarse: autorización del transportista, autorización del medio, origen/propietario o titular, salida, destino, horarios previstos y demás documentación sanitaria/identificación aplicable.
8. **Registro de actividad.** Diseñar trazabilidad cronológica por medio de transporte/contenedor y operación, con conservación configurable según obligación legal aplicable.
9. **Plan de contingencia.** Antes de iniciar, debe existir un plan aplicable a avería, retraso grave, accidente, enfermedad/lesión, temperatura fuera de rango, imposibilidad de entrega o cualquier situación que comprometa bienestar.
10. **Supervisión durante el viaje.** Checkpoints manuales o futuros sensores deben registrar estado, incidencias y actuaciones; cualquier alerta crítica requiere revisión humana.

## Clasificación operativa
El sistema deberá preguntar, como mínimo:
- especie/grupo animal;
- número de animales;
- origen y destino;
- distancia y duración prevista;
- finalidad económica/no económica;
- tipo de transportista y autorización;
- vehículo/contenedor y autorización;
- conductor/cuidador y formación;
- documentación sanitaria/identificación;
- necesidades de agua/alimento/descanso/temperatura/ventilación según especie y viaje;
- contacto responsable y plan de contingencia.

## Gates de seguridad y bienestar
La operación debe quedar en `REVIEW_REQUIRED` o `BLOCKED_DEMO` si falta cualquiera de estos elementos críticos:
- aptitud del animal no confirmada;
- autorización exigible del transportista o medio ausente;
- conductor/cuidador sin formación exigible;
- plan de contingencia ausente;
- documentación mínima incompleta;
- condiciones ambientales/espacio/ventilación sin validar para la especie;
- viaje largo sin requisitos específicos validados;
- incidencia grave de bienestar abierta.

## Viajes y especies especiales
Los límites de duración, descanso, agua/alimento, densidad, separación, temperatura, edad/estado fisiológico y requisitos del medio dependen de la especie y del tipo de viaje. FIA&CO **no debe codificar un único umbral universal**. Estos parámetros se cargarán desde perfiles normativos versionados y revisados profesionalmente antes de uso real.

## Responsabilidades dentro de FIA&CO
- **Transportista:** autorizaciones, medio adecuado, aptitud, documentación, personal competente y contingencia.
- **Organizador/operador de salida:** planificación, datos correctos, disponibilidad de documentación y coordinación.
- **Conductor/cuidador:** manejo, controles durante el viaje, registro de incidencias y actuación conforme al plan.
- **FIA&CO:** orquestar checklist, trazabilidad, evidencias y alertas; no certificar aptitud veterinaria ni sustituir a autoridad, veterinario o profesional competente.

## Datos y privacidad
Evitar PII innecesaria. Para piloto/demo usar identificadores sintéticos. En producción, almacenar solo los datos legalmente necesarios y aplicar retención, control de acceso y audit trail.

## Activación real
No activar transporte real de animales hasta que:
1. el perfil de especie/viaje esté validado;
2. se confirme normativa/jurisdicción aplicable;
3. exista revisión veterinaria/jurídica cuando proceda;
4. se validen autorizaciones/documentación del operador real;
5. SEC, LEGAL y PILOT gates estén satisfechos.
