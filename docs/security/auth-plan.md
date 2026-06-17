# Plan de autenticación DataSeed

## Estado: v2 Production Ready (rama `feat/supabase-auth-production`)

## Decisión arquitectónica

**Supabase Auth** como proveedor de autenticación, con JWT + Row Level Security para autorización granular.

## Roles de usuario

| Rol | Tipo | Acceso |
|-----|------|--------|
| `admin` | Trabajador DataSeed | Acceso total: todos los reportes, organizaciones, auditoría |
| `team` | Trabajador DataSeed | Acceso a reportes de sus organizaciones asignadas |
| `client` | Cliente externo | Acceso solo a reportes de su propia organización |

## Archivos implementados

| Archivo | Propósito |
|---------|-----------|
| `login.html` | Login/registro con email/password + Google OAuth |
| `dashboard.html` | Panel protegido por sesión |
| `js/supabase-auth.js` | Integración Supabase Auth v2 (rate limiting, errores, sesiones) |
| `js/auth-ui.js` | UI: tabs, validación, fuerza de contraseña |
| `js/supabase-config.js` | Configuración (gitignore — no subir al repo) |
| `js/supabase-config.example.js` | Plantilla segura para desarrollo |
| `css/brand.css` | Estilos del portal de auth |
| `supabase/migrations/20260717_production_auth_v2.sql` | Schema completo con RLS |
| `docs/security/supabase-auth-production-guide.md` | Guía paso a paso de configuración |

## Seguridad implementada

- **RLS** habilitado en todas las tablas con policies restrictivas
- **Security definer functions** con `search_path = ''` (previene inyección)
- **Índices** en todas las columnas usadas por RLS (performance)
- **Rate limiting** client-side (5 intentos → 5 min lockout)
- **Content Security Policy** headers en login.html y dashboard.html
- **X-Frame-Options: DENY** (previene clickjacking)
- **Audit log** para trazabilidad de registro y cambios de perfil
- **Auto-onboarding**: trigger crea organización + asigna owner al registrarse
- **PKCE flow** activo por defecto (SDK Supabase)
- **Timeout** en requests (15s) para evitar colgados
- **Manejo de sesión expirada** con redirect automático

## Pendientes para producción

1. Crear proyecto en supabase.com
2. Ejecutar migración SQL
3. Configurar Authentication → Providers (Email + Google)
4. Configurar URL Configuration + Redirect URLs
5. Configurar Rate Limits
6. Configurar CORS
7. Copiar Project URL + anon key a `js/supabase-config.js`
8. Crear primer usuario admin
9. Probar flujo completo

Ver guía detallada en `docs/security/supabase-auth-production-guide.md`.
