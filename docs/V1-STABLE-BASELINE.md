# FIA&CO — V1 Stable Baseline

## Declaración

FIA&CO V1 queda declarada como **baseline técnica estable** a partir del commit:

`0a027863d9ce4dee3e12d844be0ada0764a84973`

Rama de recuperación inmutable por convención:

`release/v1-stable-baseline`

## Qué significa estable

La baseline ha superado:
- validación de sintaxis JavaScript;
- contrato público de GitHub Pages;
- batería automatizada MVP/V1;
- V1 Consolidation Scan;
- comprobación de rutas públicas y referencias locales;
- invariantes DEMO_ONLY / SHADOW_ONLY / MOCK.

## Límites

Esta declaración NO habilita:
- fondos reales;
- PII real;
- credenciales productivas;
- enforcement automático sensible;
- proveedores externos productivos;
- prestación directa de servicios financieros regulados.

## Política de cambios

Desde esta baseline:
1. No se añaden bloques estructurales a V1 sin necesidad demostrada.
2. Los cambios se realizan en ramas pequeñas y reversibles.
3. Toda regresión detectada por CI o Consolidation Scan bloquea la fusión.
4. La baseline `release/v1-stable-baseline` no se mueve salvo decisión explícita de recuperación/versionado.
5. El desarrollo posterior se considera V1.1 / preproducción.

## Recuperación

Si una evolución posterior degrada el producto, esta baseline es el punto conocido de recuperación técnica.

## Próxima fase

**V1.1 / PREPRODUCTION**

Objetivos: preparación de infraestructura real, due diligence de proveedores, hardening, observabilidad, privacidad/legal, pilotos y sustitución progresiva de mocks mediante adapters, manteniendo Production Gate cerrado hasta autorización específica.