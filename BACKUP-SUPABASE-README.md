# FIA&CO — respaldo cifrado de Supabase

Este flujo está aislado en la rama **backup/supabase-encrypted-2026-11-15**. No se ejecuta desde main, no modifica la base de datos y no contiene operaciones de escritura sobre Supabase.

## Preparación única en GitHub

En el repositorio, abre **Settings → Secrets and variables → Actions → New repository secret** y crea:

1. **SUPABASE_DB_URL**: cadena de conexión PostgreSQL de Supabase. Preferir la conexión directa si está habilitada; si la red/IPv6 no lo permite, usar el Session Pooler y copiar la cadena completa desde **Supabase Dashboard → Connect**. No usar la anon key ni la service-role key.
2. **BACKUP_PASSPHRASE**: frase aleatoria larga y exclusiva para cifrar el archivo. Guárdala fuera de GitHub, en un gestor de contraseñas o soporte seguro. No la envíes por chat ni la guardes en el repositorio.

La conexión PostgreSQL debe tener permisos suficientes para leer el esquema y los datos. No se necesita SUPABASE_ACCESS_TOKEN, service_role ni permisos de escritura en Supabase.

## Ejecución

El workflow se activa al hacer push a esta rama aislada. El primer intento puede quedar fallido si los secretos todavía no existen. Después de guardarlos, abre **Actions → Encrypted Supabase backup → el intento fallido → Re-run all jobs**.

El flujo genera:
- roles PostgreSQL;
- esquema y datos de la aplicación;
- esquema e historial de migraciones supabase_migrations;
- filas de auth.users y auth.identities (exportadas de forma específica);
- manifiesto SHA-256.

Después crea un archivo cifrado AES-256 con GPG, comprueba que puede descifrarse y que el archivo recuperado coincide byte por byte, elimina los archivos temporales sin cifrar y publica únicamente el archivo cifrado y su checksum. El artefacto se elimina automáticamente tras un día; descárgalo y conserva una copia cifrada fuera de GitHub.

## Límites importantes

- Este respaldo es una copia de la base PostgreSQL, no una clonación completa de toda la configuración de la plataforma Supabase.
- No incluye secretos de Vault, claves API/JWT, configuración de proveedores OAuth, SMTP, dominios, DNS, funciones Edge ni objetos de Storage. En la auditoría anterior Storage y Edge Functions aparecían vacíos, pero debe revalidarse antes de afirmar que siguen así.
- El CLI filtra esquemas internos gestionados por Supabase. Se incluyen expresamente los datos de usuarios e identidades, pero no se exporta la implementación interna completa de Auth. Las personalizaciones propias en auth/storage deben inventariarse y respaldarse por separado antes de declarar una recuperación integral.
- La verificación de este workflow comprueba cifrado, descifrado, integridad del archivo y presencia de los ficheros; no demuestra todavía una restauración real. No restaurar sobre producción.
- El repositorio es público: el artefacto de Actions es accesible a lectores del repositorio, por lo que el contenido se cifra antes de subirlo. La frase de cifrado nunca debe estar en el repositorio.

## Restauración

No ejecutar una restauración hasta preparar un proyecto destino aislado y revisar las dependencias Supabase, extensiones, roles y privilegios. Primero descifrar el archivo con la frase guardada por el propietario, verificar el checksum y revisar el contenido SQL. Una restauración real debe ensayarse en un proyecto separado y nunca sobre producción sin autorización expresa.
