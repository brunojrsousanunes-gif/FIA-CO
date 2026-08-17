# FIA&CO — Siguientes pasos: pricing + audio

## Pricing #9

Estado actual: `PRICING_HYPOTHESIS_ONLY`.

Hecho:
- hipótesis Base y Plus documentadas;
- landing alineada con la hipótesis comercial vigente;
- plantilla de unit economics y criterios de aceptación preparados.

Pendiente externo:
- costes reales de PSP/payout/KYC/antifraude;
- coste interno de soporte;
- datos de 3–5 pilotos controlados;
- revisión fiscal;
- revisión jurídica/regulatoria.

## Audio

Estado actual: `AUDIO_ASSET_PENDING`.

Hecho:
- pista optimizada preparada fuera del repositorio;
- política UX/accesibilidad definida;
- ruta prevista: `frontend/assets/audio/FIA-CO-background-v1.mp3`.

Pendiente:
- incorporar el MP3 binario al repositorio;
- implementar el controlador play/pausa + mute;
- validar móvil/escritorio y accesibilidad;
- revisión visual antes de merge.

## Orden recomendado

1. Incorporar el MP3 en la rama.
2. Implementar controles de audio.
3. Verificar visualmente y con pruebas.
4. Abrir/revisar PR.
5. Mantener pricing en hipótesis hasta recibir inputs reales.
