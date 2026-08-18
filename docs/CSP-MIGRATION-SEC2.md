# FIA&CO — CSP Migration SEC-2

Objetivo: llevar todo el frontend a `script-src 'self'` sin romper la demo actual.

## Política objetivo
`default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`

## Estado
- `identity.html` ya usa CSP estricta y script externo.
- Las páginas restantes deben migrarse de forma progresiva: extraer scripts inline a `frontend/js/`, eliminar handlers inline, sustituir sinks HTML por DOM seguro y después añadir CSP por página.
- GitHub Pages no permite depender de headers de aplicación propios; mientras siga siendo hosting estático, la CSP se expresa mediante `<meta http-equiv="Content-Security-Policy">` por documento. En infraestructura futura debe preferirse header HTTP.

## Gate SEC-2
No se permite introducir:
- `eval(` o `new Function`;
- `document.write`;
- URLs `javascript:`;
- `insertAdjacentHTML` / `outerHTML` en código nuevo;
- secretos con patrones obvios en frontend/tests/docs;
- nuevas capacidades de enforcement o proveedores reales.

`innerHTML` existente se considera deuda a migrar y no una API aprobada para código nuevo. La migración completa se hará por páginas para evitar regresiones de UX.
