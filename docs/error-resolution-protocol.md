# Protocolo rápido de resolución de errores — FIA&CO

## Objetivo

Procedimiento repetible para detectar, clasificar y resolver errores durante construcción, validación y despliegue de FIA&CO.

Principios:
1. No tocar producción sin necesidad.
2. Verificar primero repositorio, rama y SHA reales.
3. Separar errores de código, CI y despliegue.
4. No corregir un problema creando otro de mayor riesgo.

## Escaneo rápido inicial

- Confirmar repositorio: `brunojrsousanunes-gif/FIA-CO`.
- Confirmar rama objetivo: `main`.
- Confirmar SHA actual de `main`.
- Comprobar cambios recientes inesperados.
- Revisar `.github/workflows/`.
- Revisar tests/CI disponibles.
- Distinguir fallo de código de fallo de acceso/verificación externa.
- Comprobar archivos temporales o accidentales.
- Revisar diferencias entre `main` y ramas de corrección.
- Confirmar que cambios pendientes estén aislados en rama/PR.

## Clasificación y resolución

### Repositorio o referencia
Síntomas: 404, repositorio no encontrado, SHA no localizado, Actions ausentes.

Acción: verificar nombre, owner, rama por defecto y SHA. No diagnosticar CI/Pages hasta confirmar `repositorio + rama + SHA`.

### GitHub Actions / CI
Síntomas: workflow ausente, ejecución vacía, status no disponible, job detenido o test fallido.

Acción: identificar workflow y trigger (`push`, `pull_request`, manual), consultar jobs y localizar el primer step que falla. No interpretar una respuesta vacía como ausencia de ejecución si la consulta tiene limitaciones. No reintentar automáticamente.

Estados: `CI_VERDE`, `CI_FALLIDO`, `CI_NO_OBSERVABLE`, `CI_NO_DISPARADO`.

### GitHub Pages / despliegue
Síntomas: producción no verificable, DNS no resuelve, `deploy-version.txt` inaccesible o SHA publicado desconocido.

Acción: confirmar `pages.yml`, trigger a `main`, concurrencia prevista y cadena `validate → build → deploy → verify`. No confundir fallo DNS local con caída de Pages. No declarar success sin evidencia.

Estados: `DEPLOY_CONFIRMADO`, `DEPLOY_FALLIDO`, `DEPLOY_NO_VERIFICABLE`, `DEPLOY_PENDIENTE`.

### Comprobación externa no fiable
Separar siempre error de red, error de hosting y error de aplicación. Nunca modificar código para solucionar un problema cuya causa pueda ser únicamente de red u observabilidad.

### Operación Git accidental
Si aparece un archivo/cambio accidental: identificar, confirmar que no es válido, revertir/eliminar, verificar árbol final y registrar el incidente. No reescribir historial salvo necesidad crítica.

Prevención: crear rama primero, revisar diff antes de escribir, usar PR borrador y fusionar solo tras validar. No realizar cambios exploratorios directamente en `main`.

### Accesibilidad
Escanear `role="img"` con contenido interactivo, enlaces/botones sin nombre accesible, imágenes sin `alt`, navegación por teclado, jerarquía de headings, landmarks, contraste y focus visible.

### Discrepancia código/producción
Comparar SHA de `main` con SHA publicado en `deploy-version.txt` cuando sea posible.

Resultados: `SHA_MAIN == SHA_PRODUCCION`, `SHA_MAIN != SHA_PRODUCCION`, `SHA_PRODUCCION_DESCONOCIDO`.

### Contenido público no permitido
Revisar allowlist/build de Pages. Confirmar que solo se publican portada, CSS, assets y rutas autorizadas. Que un archivo exista en el repositorio no implica que deba publicarse.

### Visual / responsive
Con CI verde pero UI incorrecta: revisar desktop, móvil, media queries, overflow, imágenes, tipografía, CTA, grids y comparación con diseño aprobado.

### Enlaces
Verificar CTA, navegación, Centro de Operaciones, módulos, Centro jurídico, identidad, pagos, logística, Premium, dashboard y rutas beta. Cada destino debe existir y ser público solo cuando corresponda.

## Orden de resolución

1. Repositorio
2. Rama
3. SHA
4. Diff
5. Sintaxis
6. Tests
7. Build
8. Pages
9. Producción
10. Visual
11. Accesibilidad
12. SEO
13. Contenido

## Severidad

- **P0 Crítico:** datos sensibles, producción inutilizable, contenido interno publicado, seguridad comprometida.
- **P1 Alto:** deploy fallido, navegación principal rota, función principal inutilizable, Pages no construye.
- **P2 Medio:** accesibilidad, responsive, SEO, enlaces secundarios, inconsistencias UI.
- **P3 Bajo:** textos, microajustes, detalles visuales, limpieza técnica.

## Registro de error

- ID: `ERR-XXX`
- Fecha
- SHA
- Rama
- Área
- Severidad
- Síntoma
- Causa probable
- Prueba realizada
- Resultado
- Cambio aplicado
- Nuevo SHA
- CI
- Producción
- Estado final: abierto / resuelto / no verificable

## Escaneo ultrarrápido

Comprobar: repositorio, `main`, SHA, archivos inesperados, PR pendientes, CI, build Pages, producción, portada, móvil, enlaces, contenido interno, accesibilidad, SEO y ausencia de modificaciones accidentales en `main`.

Salida:
- `APTO PARA CONTINUAR`
- `REVISIÓN NECESARIA`
- `CÓDIGO VALIDADO / PRODUCCIÓN NO VERIFICADA`

## Regla operativa activa

`Inspeccionar → clasificar → aislar en rama → modificar → validar → CI → PR → revisar → fusionar → verificar producción.`

Evitar: `probar directamente en main → corregir sobre producción → encadenar cambios sin validar → asumir que Pages está bien sin confirmar el SHA`.

Este protocolo debe actualizarse cuando aparezca una nueva clase de error reproducible o una mejora preventiva demostrada durante el proyecto.