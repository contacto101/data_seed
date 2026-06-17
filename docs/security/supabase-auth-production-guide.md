# Guía de configuración Supabase — DataSeed Auth Production

## Paso 1: Crear proyecto en Supabase

1. Ir a https://supabase.com/dashboard → "New Project"
2. Nombre: `dataseed-auth` (o el que prefieras)
3. Database Password: generar una segura y guardarla en un password manager
4. Region: elegir la más cercana a tus usuarios (ej: `sa-east-1` para Chile)
5. Esperar a que el proyecto esté listo (~2 min)

## Paso 2: Ejecutar migración SQL

1. En el dashboard del proyecto → **SQL Editor**
2. Click en **"New Query"**
3. Copiar todo el contenido de `supabase/migrations/20260717_production_auth_v2.sql`
4. Ejecutar (Ctrl+Enter o botón "Run")
5. Verificar que no hay errores en "Results"

Esto crea:
- Tablas: `profiles`, `organizations`, `user_organizations`, `reports`, `audit_log`
- Triggers: auto-crear profile, auditoría, updated_at
- Functions: `is_admin()`, `is_org_member()`, `has_org_role()`, etc.
- RLS habilitado en todas las tables con policies restrictivas

## Paso 3: Configurar Authentication

### 3a. Providers
1. **Authentication → Providers → Email**
   - ✅ Enable Email/Password
   - ✅ Enable Confirm email (recomendado para producción)
   - SMTP: configurar custom SMTP (opcional pero recomendado para producción)

2. **Authentication → Providers → Google** (opcional, para trabajadores)
   - ✅ Enable Google
   - Client ID: crear en Google Cloud Console → APIs & Services → Credentials
   - Client Secret: mismo lugar
   - Redirect URI: `https://PROJECT_REF.supabase.co/auth/v1/callback`

### 3b. URL Configuration
1. **Authentication → URL Configuration**
   - **Site URL**: `https://dataseed.cl` (o tu dominio de producción)
   - **Redirect URLs** (agregar una por línea):
     ```
     https://dataseed.cl/dashboard.html
     https://dataseed.cl/login.html
     http://localhost:3000/dashboard.html
     http://localhost:3000/login.html
     ```
   - ⚠️ NO usar `*` en producción

### 3c. Rate Limits
1. **Authentication → Rate Limits**
   - Email rate limit: 30/hora (default, OK)
   - Token refresh: 150/hora (default, OK)
   - Sign up: 30/hora (default, OK)
   - ✅ Enable "Anonymous sign-ins" → NO (desactivar si no se necesita)

### 3d. Security
1. **Authentication → Security**
   - ✅ Enable RLS (ya lo hicimos en SQL)
   - JWT expiry: 3600 segundos (1 hora, default)
   - ✅ Enable refresh tokens
   - Refresh token rotation: ✅ habilitado (default)

## Paso 4: Obtener credenciales

1. **Project Settings → API**
2. Copiar:
   - **Project URL**: `https://PROJECT_REF.supabase.co`
   - **anon public key**: empieza con `eyJ...`

## Paso 5: Configurar el frontend

1. Copiar `js/supabase-config.example.js` a `js/supabase-config.js`
2. Reemplazar:
   ```js
   window.DS_SUPABASE_CONFIG = {
     url: "https://PROJECT_REF.supabase.co",
     anonKey: "TU_ANON_KEY_AQUI"
   };
   ```
3. Ajustar opciones si es necesario:
   ```js
   window.DS_AUTH_OPTIONS = {
     requireEmailVerification: true,
     allowedEmailDomains: ["dataseed.cl"], // solo trabajadores
     enabledProviders: ["password", "google"]
   };
   ```

## Paso 6: Verificar CORS

1. **Project Settings → API → CORS**
2. Agregar los orígenes permitidos:
   ```
   https://dataseed.cl
   https://www.dataseed.cl
   http://localhost:3000
   ```

## Paso 7: Probar flujo completo

1. Abrir `login.html` en el navegador
2. Ir a la pestaña "Crear acceso"
3. Registrar un usuario de prueba
4. Si email confirmation está activado: revisar bandeja
5. Ingresar con el usuario
6. Verificar que `dashboard.html` muestra el email/nombre
7. Abrir `dashboard.html` sin sesión → debe redirigir a login
8. Cerrar sesión → debe volver a login

## Paso 8: Crear primer admin

Después de registrar tu primer usuario, promoverlo a admin:

```sql
-- En Supabase SQL Editor
update public.profiles set role = 'admin' where email = 'tu@email.com';
```

## Paso 9: Configurar Vercel (si aplica)

Si el frontend está en Vercel, agregar headers de seguridad en `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

## Checklist de seguridad pre-producción

- [ ] Migración SQL ejecutada sin errores
- [ ] RLS habilitado en todas las tablas (verificar con `\dt` y `\d+ tabla`)
- [ ] Policies verificadas (Authentication → Policies)
- [ ] Redirect URLs configuradas (solo dominios propios)
- [ ] Rate limits configurados
- [ ] Email confirmation activado
- [ ] CORS configurado
- [ ] `supabase-config.js` tiene valores reales (no REPLACE_)
- [ ] `supabase-config.js` está en `.gitignore`
- [ ] Anon key es la pública (no service_role)
- [ ] Primer usuario admin creado
- [ ] Flujo completo probado: registro → confirmación → login → dashboard → logout
- [ ] Headers CSP verificados en el navegador (DevTools → Network → Response Headers)
