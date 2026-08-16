# FIA&CO — Demo multiusuario endurecida

Esta rama prepara una demostración P2P con dos clientes sin fondos reales. No es todavía un servicio financiero de producción.

## Controles ya incorporados

- Sesiones Bearer temporales; no se publican credenciales en endpoints ni frontend.
- Secretos de Cliente A/B solo por variables de entorno.
- Comparación temporal segura de secretos.
- Allowlist estricta de `Origin` y CORS limitado al origen autorizado.
- Rate limiting básico por IP.
- Límite de cuerpo y validación server-side.
- Autorización: solo el destinatario puede aceptar/rechazar.
- Idempotencia de estado: una operación decidida no puede ejecutarse otra vez.
- Cabeceras de seguridad y respuestas `no-store`.
- Persistencia opcional con escritura serializada, fichero temporal y renombrado atómico.
- Fichero persistente creado con permisos `0600`.
- Auditoría de sesiones y cambios de operación.

## Requisitos antes de conectar dos móviles por Internet

1. Desplegar el backend en un entorno separado de GitHub Pages y accesible únicamente por HTTPS gestionado por la plataforma.
2. Guardar `FIA_DEMO_SECRET_A` y `FIA_DEMO_SECRET_B` en el gestor de secretos del proveedor, nunca en Git ni en el frontend.
3. Definir `FIA_DEMO_ALLOWED_ORIGINS` con el origen exacto de la demo.
4. Definir `FIA_DEMO_STATE_FILE` sobre almacenamiento persistente privado si se usa el store de fichero.
5. Ejecutar una sola instancia del backend con este store. Para varias instancias, sustituirlo por una base de datos transaccional con bloqueo/aislamiento adecuados.
6. Mantener datos exclusivamente ficticios: sin IBAN reales, claves privadas, biometría, tarjetas o fondos.
7. Rotar secretos tras cada demostración promocional y revisar el registro de auditoría.
8. Limitar el acceso de la demo a testers autorizados hasta completar revisión de seguridad.

## Límite de esta implementación

El store atómico mejora la recuperación tras reinicios y serializa mutaciones dentro de un único proceso. No sustituye una base de datos ACID en un despliegue de varias réplicas. Para producción futura deberán existir base de datos transaccional, gestión profesional de identidad, monitorización, copias de seguridad, gestión de claves, controles antifraude y revisión regulatoria específica.
