# FIA&CO — revisión y correcciones de seguridad (2026-10-15)

## Alcance y resultado

Revisión estática del repositorio y correcciones acotadas a código propio, reglas internas, configuración y pruebas. No se han consultado cuentas de clientes ni se han usado datos de terceros. No se han cambiado secretos, permisos de proveedores, la base de datos desplegada ni la configuración de producción.

**Resultado:** APPROVE WITH CONSTRAINTS para continuar desarrollo y pruebas con datos sintéticos. NO es una autorización de producción ni una certificación de seguridad.

## Cambios incluidos en esta rama

- El módulo heredado `frontend/js/unified-app.js`, que no está incluido en la lista pública de GitHub Pages, guarda su estado de demostración en `sessionStorage` en vez de `localStorage`. El estado deja de persistir al terminar la sesión del navegador. No se elimina automáticamente el dato legado que pudiera existir en `localStorage`.
- Se actualiza `tests/unified-app.test.js` para exigir almacenamiento limitado a la sesión y mantener la prohibición de cargar este módulo en la app simplificada pública.
- `config/security-prepilot.json` declara explícitamente que es una política base de demo/prepiloto y no una prueba del estado desplegado. La presencia de código de Supabase Auth en el repositorio no se confunde con una verificación independiente del entorno desplegado.
- Las reglas operativas de FIA&CO prohíben usar almacenamiento del navegador como sistema de autorización o registro oficial de operaciones reales.
- Se incorpora una prueba automática de alineación de seguridad al conjunto de pruebas MVP.

## Comprobaciones que quedan pendientes

1. Ejecutar la batería completa de CI en GitHub y corregir cualquier fallo.
2. Confirmar, sin modificar datos, qué migraciones están aplicadas al proyecto Supabase activo.
3. Probar autorización y denegación con tres cuentas y organizaciones sintéticas, incluyendo solicitudes directas a la API y transiciones prohibidas.
4. Confirmar la separación efectiva de entornos, los secretos del runtime y los permisos de Cloudflare/GitHub/Supabase; no se inspeccionaron ni cambiaron secretos.
5. Verificar el registro persistente de auditoría, idempotencia, límites de frecuencia, recuperación de sesiones, copias de seguridad y restauración.
6. Obtener revisión jurídica y de privacidad antes de cualquier piloto con datos reales.

## Fuera de alcance

No se han cambiado los contratos, datos, credenciales ni configuraciones pertenecientes a proveedores o terceros. No se han ejecutado scripts descargados de terceros. No se ha fusionado esta rama ni desplegado la aplicación.

## Criterio para avanzar

Mantener DEMO_ONLY, datos sintéticos y pagos reales deshabilitados hasta que los controles técnicos, la revisión de privacidad/jurídica y la validación del entorno real estén documentados.
