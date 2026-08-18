# FIA&CO — CSP SEC-3 Status

Objetivo: migrar el frontend estático hacia CSP estricta sin romper GitHub Pages.

## Páginas críticas endurecidas
- `identity.html`: `script-src 'self'`, sin JavaScript inline.
- `production-gate.html`: `script-src 'self'`, UI externalizada a `frontend/js/production-gate-ui.js`, sin JavaScript inline.

## Regla SEC-3
Las páginas críticas de identidad y gate de producción no pueden reintroducir scripts inline ni scripts remotos. El gate automatizado lo comprueba en CI.

## Deuda controlada
El resto del frontend conserva páginas históricas con scripts/estilos inline. No se declara CSP global estricta todavía porque aplicarla de una sola vez podría romper flujos demo. La migración continuará página por página, extrayendo primero scripts y handlers inline y añadiendo después CSP.

## Objetivo de producción
En hosting productivo, preferir CSP mediante header HTTP con al menos: `default-src 'self'`, `script-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` y `frame-ancestors 'none'`, ajustando `connect-src`, `img-src` y demás directivas únicamente a proveedores explícitamente autorizados.
