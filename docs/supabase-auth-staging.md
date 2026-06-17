# DataSeed Portal — Supabase Auth Staging

Estado: rama `supabase-auth-staging`, sin push a `main`.

## Objetivo

Conectar el login del portal DataSeed a Supabase Auth y preparar tablas mínimas para crear usuarios en ambiente de prueba.

## Archivos principales

- `login.html`: login/registro con Email + Password y botón Google.
- `dashboard.html`: ruta protegida por sesión Supabase.
- `js/supabase-config.js`: placeholder de configuración pública staging.
- `js/supabase-config.example.js`: plantilla segura.
- `js/supabase-auth.js`: integración Supabase Auth real.
- `supabase/migrations/20260604_staging_auth.sql`: tablas, trigger `profiles` y RLS.

## Configuración en Supabase

1. Supabase Dashboard → Authentication → Providers.
2. Activar Email/Password para staging.
3. Opcional después: activar Google.
4. Authentication → URL Configuration:
   - Site URL: URL del preview/staging.
   - Redirect URLs: agregar `https://<preview>/dashboard.html` y dominio real cuando aplique.
5. Project Settings → API:
   - Copiar Project URL.
   - Copiar anon public key.
6. Reemplazar en `js/supabase-config.js`:

```js
window.DS_SUPABASE_CONFIG = {
  url: "https://PROJECT_REF.supabase.co",
  anonKey: "SUPABASE_ANON_PUBLIC_KEY"
};
```

La anon key es pública por diseño. No usar nunca `service_role` en frontend.

## Base de datos

Ejecutar en Supabase SQL Editor:

```sql
-- contenido de supabase/migrations/20260604_staging_auth.sql
```

Esto crea:

- `profiles`
- `organizations`
- `user_organizations`
- `reports`
- trigger automático desde `auth.users` hacia `profiles`
- RLS para limitar lectura por usuario/organización

## Prueba mínima

1. Abrir `login.html` en preview.
2. Abrir panel Email/Password.
3. Crear usuario con correo permitido por `allowedEmailDomains`.
4. Confirmar correo si Supabase tiene confirmación activa.
5. Ingresar con el usuario.
6. Verificar que `dashboard.html` muestre email/nombre.
7. Abrir `dashboard.html` sin sesión: debe redirigir a `login.html`.
8. Cerrar sesión: debe volver a login.

## Pendientes antes de producción

- Definir dominio final permitido y Redirect URLs definitivas.
- Decidir si staging permite solo `dataseed.cl` o también correos de prueba.
- Agregar Google OAuth solo después de validar Email/Password.
- Revisar RLS con seguridad antes de datos reales de clientes.
- Aplicar regla de rollback antes de cualquier push a `main`.
