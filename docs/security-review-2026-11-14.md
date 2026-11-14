# FIA&CO — revisión de seguridad de demo/prepiloto

## Alcance
Revisión estática y pruebas de contrato sobre código propio, configuración y documentación. Esta revisión no accede a cuentas de clientes, no utiliza datos reales y no cambia secretos, permisos de proveedores, base de datos remota ni producción.

## Resultado
La rama de integración mantiene el modo `DEMO_ONLY`. El estado del runtime desplegado no queda certificado por la presencia de código o configuración en el repositorio.

## Cambios integrados
- El módulo heredado `frontend/js/unified-app.js`, excluido de la lista pública de GitHub Pages, utiliza `sessionStorage` para estado temporal de demostración en lugar de `localStorage`.
- Las pruebas comprueban el almacenamiento limitado a sesión y que el módulo heredado no se incorpora a la app pública simplificada.
- La configuración identifica expresamente su alcance como política de demo/prepiloto, no como atestación del entorno desplegado.
- Las reglas prohíben usar almacenamiento del navegador como autorización o registro oficial de operaciones reales.
- La batería MVP incluye una prueba automática de alineación de seguridad.

## Pendiente antes de un piloto real
1. Confirmar qué migraciones están aplicadas al proyecto Supabase activo, sin modificarlas.
2. Probar permisos y denegaciones con tres cuentas y organizaciones sintéticas, incluidas peticiones directas a la API.
3. Verificar separación de entornos, secretos de runtime y permisos de Cloudflare, GitHub y Supabase.
4. Verificar auditoría persistente, idempotencia, límites de frecuencia, recuperación de sesiones y copias de seguridad/restauración.
5. Obtener revisión jurídica y de privacidad antes de tratar datos reales.

## Límites
No se ha fusionado la rama, desplegado la aplicación, habilitado dinero real, habilitado PII real ni certificado la seguridad de producción. El registro en memoria es una utilidad de pruebas/demo y no el sistema de auditoría de producción.
