# FIA&CO — Especificación de control de audio

## Objetivo

Integrar música ambiente opcional sin interferir con las acciones principales de la interfaz.

## Controles

- Play/pausa: botón circular principal, centrado horizontalmente en la zona inferior útil.
- Mute: botón secundario inmediatamente al lado.
- Iconos: `▶` / `❚❚` y `🔊` / `🔇`.
- Área táctil mínima recomendada: 44 × 44 px.
- Foco de teclado visible.
- `aria-label` dinámico según estado.

## Comportamiento

- No autoplay sonoro.
- El primer play requiere gesto explícito del usuario.
- El mute se persiste localmente.
- Al ocultar la página, el audio se pausa.
- Al volver a mostrarla, no se reanuda automáticamente salvo que la política final lo autorice de forma explícita y siempre respetando mute.
- Si el recurso de audio falta o falla, ocultar/desactivar el control sin afectar al resto de la app.

## Posicionamiento

En `app-beta.html`, situar el grupo por encima de la navegación inferior y suficientemente separado del botón central de nueva operación. En escritorio/landing, centrarlo cerca del borde inferior con margen seguro.

## Activo

`frontend/assets/audio/FIA-CO-background-v1.mp3`

Estado hasta incorporar el binario: `AUDIO_ASSET_PENDING`.
