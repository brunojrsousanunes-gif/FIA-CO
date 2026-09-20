# Excepciones de seguridad del piloto sintético

Estado: **en pruebas**. Alcance: cuentas, empresas, importes y operaciones exclusivamente sintéticos.

## Protección de contraseñas filtradas

El proyecto usa el plan gratuito de Supabase. La comprobación contra contraseñas filtradas es una función de pago y no se activa durante el piloto sin una decisión expresa de coste.

Controles compensatorios:

- alta con contraseña única y aleatoria de 16 caracteres como mínimo;
- prohibición de reutilizar contraseñas o compartirlas por chat;
- sesión privada mantenida solo en memoria;
- confirmación de correo y aprobación empresarial separadas;
- datos personales, documentos y pagos reales prohibidos.

Esta compensación no convierte el piloto en apto para datos reales.

## RPC SECURITY DEFINER expuestas a authenticated

Las siguientes funciones son puntos de entrada intencionados para cuentas autenticadas:

- `accept_operation_invitation`;
- `transition_operation`;
- `create_synthetic_part_recovery`.

No se concede ejecución a `anon` ni a `PUBLIC`. Las funciones mantienen `search_path` fijo, obtienen el actor mediante `auth.uid()`, validan empresa/rol/estado y registran o vinculan evidencia de auditoría. El aviso del asesor de Supabase se acepta solo para este piloto sintético y debe revisarse de nuevo antes de usar datos reales.

## Pruebas negativas obligatorias con tres identidades

| Caso | Resultado esperado |
|---|---|
| Petición sin sesión | `AUTH_REQUIRED` o acceso denegado |
| Comprador intenta transición de transportista | `TRANSITION_NOT_ALLOWED` |
| Usuario de otra empresa consulta el expediente | cero filas o acceso denegado |
| Segunda cuenta intenta asumir un rol ya vinculado | `ROLE_ALREADY_BOUND` |
| Versión antigua intenta cambiar el estado | `VERSION_CONFLICT` |
| Repetición del mismo `request_key` | sin evento de auditoría duplicado |
| Recuperación sobre operación no sintética o no bloqueada | operación rechazada |
| Cierre y recarga de pestaña | sesión eliminada |

La evidencia del piloto debe registrar fecha, identidad sintética, rol, acción, respuesta y evento de auditoría, sin contraseñas ni tokens.
