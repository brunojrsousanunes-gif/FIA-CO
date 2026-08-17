# FIA&CO — Audio UX readiness

Estado: preparado para integración; pendiente de incorporar el binario de audio al repositorio.

## Principios

- Sin autoplay con sonido.
- La reproducción empieza solo tras una acción explícita del usuario.
- Control principal visible e intuitivo: play/pausa centrado en la zona inferior útil, sin tapar navegación ni CTA principales.
- Control de mute adyacente y con área táctil suficiente.
- Preferencia de mute persistida localmente en el navegador.
- Pausa automática al ocultar la pestaña o abandonar la página; no reanudar con sonido sin respetar la preferencia del usuario.
- Etiquetas accesibles (`aria-label`) y estado perceptible sin depender solo del icono.
- El audio es ambiente y nunca debe competir con avisos, confirmaciones, contenido legal o feedback crítico.

## Activo previsto

Ruta de integración prevista:

`frontend/assets/audio/FIA-CO-background-v1.mp3`

El original se conserva fuera del flujo web como máster. La versión web será la optimizada para reproducción de fondo.

## Gate de activo

No activar el reproductor en producción hasta que:

1. el archivo exista en la ruta prevista;
2. la autorización/licencia para uso y modificación esté documentada;
3. se verifique reproducción en móvil y escritorio;
4. el control play/pausa y mute funcione con teclado y táctil;
5. la ausencia o error del audio falle de forma silenciosa, sin romper la interfaz.

## Comportamiento visual

- Botón circular principal con `▶` cuando está detenido y `❚❚` cuando reproduce.
- Botón secundario `🔊` / `🔇` inmediatamente al lado.
- Posición flotante, centrada horizontalmente en móvil y ligeramente por encima de la navegación inferior cuando exista.
- Contraste suficiente y foco visible.

## Resultado permitido

Mientras el MP3 no esté incorporado, el estado permanece `AUDIO_ASSET_PENDING`.

Cuando el binario esté disponible y las comprobaciones pasen, el estado puede avanzar a `AUDIO_READY_FOR_REVIEW`; nunca activa despliegue o merge automáticamente.
