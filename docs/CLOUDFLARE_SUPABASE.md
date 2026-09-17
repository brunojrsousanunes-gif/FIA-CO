# Cloudflare Pages y Supabase en FIA&CO

## Estado implementado

FIA&CO utiliza una URL de proyecto y una clave `sb_publishable_…` en el navegador. Ambas son configuración pública por diseño; la seguridad de los datos depende de Supabase Auth, los permisos SQL y RLS.

La aplicación no carga el SDK desde un CDN. Usa módulos ES propios y la API HTTPS de Supabase, lo que mantiene la política CSP `script-src 'self'` y evita añadir una dependencia externa al navegador.

## Variables para el build de Cloudflare Pages

Configurar en **Settings → Environment variables**:

- `SUPABASE_URL`: URL HTTPS del proyecto.
- `SUPABASE_PUBLISHABLE_KEY`: clave pública que empieza por `sb_publishable_`.

Comando opcional de build para generar la configuración pública:

```sh
node scripts/render-supabase-public-config.mjs
```

Directorio de salida: `frontend`.

Estas variables no se convierten en secretas al usarlas en un sitio estático: su valor termina en el JavaScript descargado por el navegador. Su ventaja es permitir configuraciones diferentes por entorno y evitar ediciones manuales.

## Secretos de servidor

Una clave `sb_secret_…` o la antigua `service_role` solo puede existir en una Cloudflare Pages Function/Worker o en otro backend privado. Nunca debe:

- aparecer en `frontend/`;
- enviarse al navegador;
- incluirse en GitHub;
- utilizarse como sustituto de RLS.

FIA&CO todavía no necesita esa clave para la vista privada actual. Cuando exista una operación administrativa que realmente requiera privilegios elevados, debe implementarse primero el endpoint de servidor, su autorización y su registro de auditoría; solo entonces se añadirá el secreto al entorno de Cloudflare.

## RLS actual

Las tablas expuestas de FIA&CO tienen RLS activado. El rol `anon` no posee acceso a las tablas operativas. Las políticas autenticadas delimitan las filas por usuario, organización, participación y responsabilidad en la operación.

Las funciones RPC de transición, aceptación y recuperación son `SECURITY DEFINER` de forma intencionada y comprueban `auth.uid()`, el rol operativo, el estado y la versión antes de escribir. El Security Advisor las marca para revisión porque son endpoints privilegiados; no se debe ignorar esa advertencia al ampliar sus capacidades.
